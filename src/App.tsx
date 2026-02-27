import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { Header } from './components/navigation/Header';
import { MobileNav } from './components/navigation/MobileNav';
import { OnboardingSlides } from './components/onboarding/OnboardingSlides';
import { AuthFlow } from './pages/AuthFlow';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import { ShopKnowledge } from './pages/ShopKnowledge';
import { Settings } from './pages/Settings';
import { TestFlow } from './pages/TestFlow';
import { HealthTest } from './pages/HealthTest';
import { useUiStore } from './store/uiStore';
import LoginSignupPage from './pages/LoginSignUp';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
function AppContent() {
  const { isAuthenticated, onboardingCompleted, completeOnboarding } = useAuthStore();
  const [showTestFlow, setShowTestFlow] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const isMobile = useUiStore(state => state.isMobile);
  const setIsMobile = useUiStore(state => state.setIsMobile);


  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleAuthRedirect = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        navigate(customEvent.detail);
      }
    };

    window.addEventListener('auth-redirect', handleAuthRedirect);
    return () => window.removeEventListener('auth-redirect', handleAuthRedirect);
  }, [navigate]);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      const { setToken, login } = useAuthStore.getState();
      setToken(token);
      // Fetch user data
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            // Convert dateOfBirth to string if it's a Date object
            let dateOfBirth = '';
            if (data.user.dateOfBirth) {
              if (data.user.dateOfBirth instanceof Date) {
                dateOfBirth = data.user.dateOfBirth.toISOString().split('T')[0];
              } else if (typeof data.user.dateOfBirth === 'string') {
                dateOfBirth = data.user.dateOfBirth.split('T')[0];
              }
            }

            login({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone || '',
              dateOfBirth: dateOfBirth,
              gender: data.user.gender || 'male',
              role: data.user.role || 'patient',
              lifestyle: data.user.lifestyle || {
                smoking: false,
                drinking: false,
                exercise: 'moderate',
                sleep: 8
              }
            }, token);

            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Check if profile is complete and navigate accordingly
            if (!data.user.phone || !data.user.dateOfBirth) {
              // Profile incomplete, navigate to complete-profile
              // We use a small timeout to let the state settle, and we'll use a custom event
              // since we are outside the router's context here (or at the root)
              window.dispatchEvent(new CustomEvent('auth-redirect', { detail: '/complete-profile?step=register' }));
            } else {
              // Profile complete, navigate to dashboard
              window.dispatchEvent(new CustomEvent('auth-redirect', { detail: '/dashboard' }));
            }
          }
        })
        .catch(err => {
          console.error('Failed to fetch user:', err);
          // Remove token from URL even on error
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  const handleCompleteOnboarding = () => {
    completeOnboarding();
  };

  const handleTakeTest = () => {
    setShowTestFlow(true);
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <img src='/Square-icon.jpg' />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            BioMatrix
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.7 }}
            className="text-white/80 mt-2"
          >
            Your Health, Our Priority
          </motion.p>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={
              <PublicRoute>
                <LoginSignupPage />
              </PublicRoute>
            } />
            <Route path="/complete-profile" element={
              <PublicRoute>
                <AuthFlow />
              </PublicRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : !onboardingCompleted && location.pathname !== '/complete-profile' ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <OnboardingSlides onComplete={handleCompleteOnboarding} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col"
          >
             
            {!isMobile && location.pathname !== '/complete-profile' && (
              <Header />
            )}

            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
              <Routes location={location} key={location.pathname}>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/shop" element={
                  <ProtectedRoute>
                    <ShopKnowledge />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/health-test" element={
                  <ProtectedRoute>
                    <HealthTest />
                  </ProtectedRoute>
                } />
                <Route path="/complete-profile" element={
                  <ProtectedRoute>
                    <AuthFlow />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>

            {/* Mobile Navigation */}
            {isMobile && (
              <MobileNav
                onTakeTest={handleTakeTest}
              />
            )}

            {/* Test Flow Modal */}
            <AnimatePresence>
              {showTestFlow && (
                <TestFlow onClose={() => setShowTestFlow(false)} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;