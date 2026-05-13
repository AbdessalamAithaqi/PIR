import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherGamePage } from "./pages/TeacherGamePage";
import { StudentJoinPageWithGuards } from "./pages/StudentJoinPageWithGuards";
import { authLoginUrl, fetchCurrentUser, type AuthRole, type AuthUser } from "./lib/auth";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">Rugby Team Management</h1>
      <div className="flex gap-4">
        <a
          href={authLoginUrl("TEACHER", "/teacher")}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        >
          Teacher sign in
        </a>
        <a
          href={authLoginUrl("STUDENT", "/student")}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
        >
          Student sign in
        </a>
      </div>
    </div>
  );
}

function ProtectedRoute({
  role,
  children,
}: {
  role: AuthRole;
  children: ReactNode;
}) {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((nextUser) => {
        if (active) setUser(nextUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">Checking sign in...</div>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-2 text-sm text-slate-500">Use your INSA account to continue.</p>
          <a
            href={authLoginUrl(role, `${location.pathname}${location.search}`)}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white no-underline transition hover:bg-slate-800"
          >
            Sign in with INSA
          </a>
        </div>
      </main>
    );
  }

  if (role === "TEACHER" && user.role !== "TEACHER") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Teacher access required</h1>
          <p className="mt-2 text-sm text-slate-500">
            You are signed in as {user.name}, but this page is restricted to teachers.
          </p>
        </div>
      </main>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="TEACHER">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/games/:gameId"
          element={
            <ProtectedRoute role="TEACHER">
              <TeacherGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentJoinPageWithGuards />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
