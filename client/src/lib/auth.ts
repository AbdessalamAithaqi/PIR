export type AuthRole = "TEACHER" | "STUDENT";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role: AuthRole;
};

export async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to load current user");

  const data = await response.json();
  return data.user as AuthUser;
}

export function authLoginUrl(role: AuthRole, next: string) {
  const params = new URLSearchParams({ role, next });
  return `/api/auth/login?${params.toString()}`;
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
