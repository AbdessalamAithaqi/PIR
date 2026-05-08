import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { TeacherDashboard } from "./pages/TeacherDashboard";

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

function StudentPlaceholder() {
  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student View</h1>
      <p className="mb-4">This view is not yet implemented.</p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
