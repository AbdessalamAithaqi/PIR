import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { I18nProvider, LanguageSelector, useI18n } from "./i18n";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherGamePage } from "./pages/TeacherGamePage";
import { StudentJoinPageWithGuards } from "./pages/StudentJoinPageWithGuards";

function Home() {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="mb-8 text-4xl font-bold text-blue-900">{t("app.title")}</h1>
      <div className="flex gap-4">
        <Link 
          to="/teacher" 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        >
          {t("app.teacherLogin")}
        </Link>
        <Link 
          to="/student" 
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
        >
          {t("app.studentLogin")}
        </Link>
      </div>
    </div>
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
