import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ProblemPage from './pages/ProblemPage';
import ProblemsListPage from './pages/ProblemsListPage';
import MainLayout from './layouts/MainLayout';
import AdminProblemsPage from './pages/AdminProblemsPage';
import AdminTestcasesPage from './pages/AdminTestcasesPage';
import ProblemSubmissionsPage from './pages/ProblemSubmissionsPage';

function App() {
  return (
    <Routes>
      {/* Public auth routes without navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* All main app routes with navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/problems" element={<ProblemsListPage />} />
        <Route path="/problems/:code" element={<ProblemPage />} />
        <Route
          path="/problems/:code/submissions"
          element={<ProblemSubmissionsPage />}
        />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/admin/problems" element={<AdminProblemsPage />} />
        <Route path="/admin/problems/:id/testcases" element={<AdminTestcasesPage />} />
      </Route>
    </Routes>
  );
}

export default App;