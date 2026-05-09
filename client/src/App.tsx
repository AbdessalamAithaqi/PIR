import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherGamePage } from "./pages/TeacherGamePage";
import { StudentJoinPageWithGuards } from "./pages/StudentJoinPageWithGuards";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">Rugby Team Management</h1>
      <div className="flex gap-4">
        <Link 
          to="/teacher" 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        >
          Teacher Login
        </Link>
        <Link 
          to="/student" 
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
        >
          Student Login
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/games/:gameId" element={<TeacherGamePage />} />
        <Route path="/student" element={<StudentJoinPageWithGuards />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
