import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import express from "express";
import prisma from "../lib/prisma.js";

export type AuthRole = "TEACHER" | "STUDENT";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role: AuthRole;
};

const router = express.Router();
const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "pir_session";
const sessionSecret = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";
const sessionMaxAgeMs = 1000 * 60 * 60 * 8;
const sessions = new Map<string, AuthUser>();

function getAuthMode() {
  return (process.env.AUTH_MODE ?? "demo").toLowerCase();
}

function getCasBaseUrl() {
  return (process.env.CAS_BASE_URL ?? "https://cas.insa-toulouse.fr/cas").replace(/\/$/, "");
}

function teacherIds() {
  return new Set(
    (process.env.TEACHER_IDS ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isSafeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//");
}

function safeNext(next: unknown, fallback = "/student") {
  return isSafeNext(next) ? String(next) : fallback;
}

function appBaseUrl(req: Request) {
  const configured = process.env.APP_BASE_URL ?? process.env.PUBLIC_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const forwardedProto = req.header("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.header("x-forwarded-host")?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = forwardedHost || req.header("host") || "localhost:3000";
  return `${proto}://${host}`;
}

function serviceUrl(req: Request, next: string) {
  const url = new URL("/api/auth/cas/callback", appBaseUrl(req));
  url.searchParams.set("next", safeNext(next));
  return url.toString();
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function encodeSession(sessionId: string) {
  return `${sessionId}.${sign(sessionId)}`;
}

function verifySessionCookie(value: string | undefined) {
  if (!value) return null;
  const [sessionId, signature] = value.split(".");
  if (!sessionId || !signature) return null;

  const expected = sign(sessionId);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  return sessionId;
}

function parseCookies(req: Request) {
  return Object.fromEntries(
    (req.header("cookie") ?? "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf("=");
        if (separator === -1) return [cookie, ""];
        return [cookie.slice(0, separator), decodeURIComponent(cookie.slice(separator + 1))];
      }),
  );
}

function isSecureRequest(req: Request) {
  return req.secure || req.header("x-forwarded-proto")?.split(",")[0]?.trim() === "https";
}

function createSession(req: Request, res: Response, user: AuthUser) {
  const sessionId = randomUUID();
  sessions.set(sessionId, user);
  res.cookie(sessionCookieName, encodeSession(sessionId), {
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: "lax",
    maxAge: sessionMaxAgeMs,
    path: "/",
  });
}

function clearSession(req: Request, res: Response) {
  const sessionId = verifySessionCookie(parseCookies(req)[sessionCookieName]);
  if (sessionId) sessions.delete(sessionId);
  res.clearCookie(sessionCookieName, { path: "/" });
}

export function getAuthenticatedUser(req: Request) {
  const sessionId = verifySessionCookie(parseCookies(req)[sessionCookieName]);
  return sessionId ? sessions.get(sessionId) ?? null : null;
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readXmlTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, "i"));
  return match?.[1] ? decodeXmlEntities(match[1].trim()) : "";
}

function userRole(login: string, email?: string): AuthRole {
  const teachers = teacherIds();
  if (teachers.has(login.toLowerCase())) return "TEACHER";
  if (email && teachers.has(email.toLowerCase())) return "TEACHER";
  return "STUDENT";
}

function parseCasResponse(xml: string): AuthUser {
  const login = readXmlTag(xml, "user");
  if (!login) {
    const reason = readXmlTag(xml, "authenticationFailure") || "CAS authentication failed";
    throw new Error(reason);
  }

  const email = readXmlTag(xml, "mail") || readXmlTag(xml, "email") || undefined;
  const displayName = readXmlTag(xml, "displayName") || readXmlTag(xml, "cn");
  const givenName = readXmlTag(xml, "givenName");
  const surname = readXmlTag(xml, "sn");
  const name = displayName || [givenName, surname].filter(Boolean).join(" ") || login;

  const user: AuthUser = {
    id: login,
    name,
    role: userRole(login, email),
  };

  if (email) user.email = email;
  return user;
}

async function upsertAuthenticatedUser(user: AuthUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      name: user.name,
      role: user.role,
    },
    create: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
}

router.get("/login", async (req, res) => {
  const next = safeNext(req.query.next, "/student");

  if (getAuthMode() !== "cas") {
    const requestedRole = String(req.query.role ?? "").toUpperCase() === "TEACHER" ? "TEACHER" : "STUDENT";
    const user: AuthUser = {
      id: requestedRole === "TEACHER" ? "demo-teacher" : "demo-student",
      name: requestedRole === "TEACHER" ? "Demo Teacher" : "Demo Student",
      role: requestedRole,
    };
    await upsertAuthenticatedUser(user);
    createSession(req, res, user);
    return res.redirect(next);
  }

  const loginUrl = new URL(`${getCasBaseUrl()}/login`);
  loginUrl.searchParams.set("service", serviceUrl(req, next));
  return res.redirect(loginUrl.toString());
});

router.get("/cas/callback", async (req, res) => {
  const ticket = String(req.query.ticket ?? "");
  const next = safeNext(req.query.next, "/student");

  if (!ticket) {
    return res.status(400).json({ error: "Missing CAS ticket" });
  }

  try {
    const validationUrl = new URL(`${getCasBaseUrl()}/serviceValidate`);
    validationUrl.searchParams.set("service", serviceUrl(req, next));
    validationUrl.searchParams.set("ticket", ticket);

    const response = await fetch(validationUrl);
    if (!response.ok) {
      throw new Error(`CAS validation failed with status ${response.status}`);
    }

    const xml = await response.text();
    const user = parseCasResponse(xml);
    await upsertAuthenticatedUser(user);
    createSession(req, res, user);
    return res.redirect(next);
  } catch (error) {
    console.error("CAS login failed:", error);
    return res.status(401).json({ error: "CAS login failed" });
  }
});

router.get("/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ authenticated: false });
  return res.json({ authenticated: true, user });
});

router.post("/logout", (req, res) => {
  clearSession(req, res);
  res.json({ ok: true });
});

export default router;
