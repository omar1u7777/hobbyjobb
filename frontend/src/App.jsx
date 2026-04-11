import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import HobbyLimitBanner from './components/common/HobbyLimitBanner.jsx';
import Spinner from './components/common/Spinner.jsx';

// Student 3 pages
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';

// Student 4 pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import JobListPage from './pages/JobListPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import PostJobPage from './pages/PostJobPage.jsx';
import MyJobsPage from './pages/MyJobsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Placeholder components for pages owned by other students (Student 1 / Student 5)
// These will be replaced by the responsible students when they implement the real pages.
function ComingSoonPage({ name }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--muted)' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'var(--dark)' }}>{name}</h2>
      <p>Den här sidan implementeras av ansvarig student.</p>
    </div>
  );
}

const CheckoutPage        = () => <ComingSoonPage name="Checkout" />;
const PaymentSuccessPage  = () => <ComingSoonPage name="Betalning klar" />;
const ChatPage            = () => <ComingSoonPage name="Chatt" />;
const AdminDashboardPage  = () => <ComingSoonPage name="Admin" />;
const HobbyInfoPage       = () => <ComingSoonPage name="Hobbyinfo" />;
const AboutPage           = () => <ComingSoonPage name="Om oss" />;

/** Guard: redirects to /login if not authenticated */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Guard: redirects to /home if already authenticated */
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

/** Guard: requires admin role */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      {user && <HobbyLimitBanner />}

      <Suspense fallback={<Spinner fullPage />}>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={user ? <Navigate to="/home" replace /> : <LandingPage />}
          />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/hobbyinfo" element={<HobbyInfoPage />} />
          <Route path="/om-oss" element={<AboutPage />} />

          {/* Guest-only */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Private */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/lagg-upp-jobb"
            element={
              <PrivateRoute>
                <PostJobPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/mina-jobb"
            element={
              <PrivateRoute>
                <MyJobsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/profil/:id" element={<ProfilePage />} />
          <Route
            path="/checkout/:jobId"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/betalning-klar"
            element={
              <PrivateRoute>
                <PaymentSuccessPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatt"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatt/:jobId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  );
}