import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { I18nProvider, LanguageSelector, useI18n } from "./i18n";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherGamePage } from "./pages/TeacherGamePage";
import { StudentJoinPageWithGuards } from "./pages/StudentJoinPageWithGuards";

function Home() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
            {t("app.roleSelect")}
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("app.title")}</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RoleLink to="/teacher" role={t("app.teacherRole")} action={t("app.teacherLogin")} />
          <RoleLink to="/student" role={t("app.studentRole")} action={t("app.studentLogin")} />
        </div>
      </section>
    </main>
  );
}

function RoleLink({ to, role, action }: { to: string; role: string; action: string }) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-slate-200 bg-white p-5 text-slate-950 no-underline shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{role}</p>
          <p className="mt-2 text-lg font-semibold">{action}</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-lg font-semibold text-white transition group-hover:bg-slate-800">
          &rarr;
        </span>
      </div>
    </Link>
  );
}

function App() {
  return (
    <I18nProvider>
      <LanguageSelector className="fixed bottom-4 right-4 z-50" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/games/:gameId" element={<TeacherGamePage />} />
          <Route path="/student" element={<StudentJoinPageWithGuards />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
