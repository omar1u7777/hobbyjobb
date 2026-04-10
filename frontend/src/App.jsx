import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import HobbyLimitBanner from './components/common/HobbyLimitBanner.jsx';
import Spinner from './components/common/Spinner.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import JobListPage from './pages/JobListPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import PostJobPage from './pages/PostJobPage.jsx';
import MyJobsPage from './pages/MyJobsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
function PrivateRoute({ children }) { const { user, loading } = useAuth(); if (loading) return <Spinner fullPage />; if (!user) return <Navigate to="/login" replace />; return children; }
export default function App() {
  const { user } = useAuth();
  return <BrowserRouter><Navbar />{user && <HobbyLimitBanner />}<Routes><Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingPage />} /><Route path="/jobs" element={<JobListPage />} /><Route path="/jobs/:id" element={<JobDetailPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} /><Route path="/lagg-upp-jobb" element={<PrivateRoute><PostJobPage /></PrivateRoute>} /><Route path="/mina-jobb" element={<PrivateRoute><MyJobsPage /></PrivateRoute>} /><Route path="/profil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><Footer /></BrowserRouter>;
}
