import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Appointments from './pages/Appointments';
import Admin from './pages/Admin';
import DoctorReport from './pages/DoctorReport';
import DoctorSearch from './pages/DoctorSearch';

/**
 * Main App Component
 * Handles routing and layout structure
 */
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Show Navbar only when authenticated */}
      {isAuthenticated && <Navbar />}
      
      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/appointments" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/appointments" replace /> : <Register />
          } 
        />

        {/* Protected Routes - Require Authentication */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor Search Route - Require Authentication */}
        <Route
          path="/search-doctor"
          element={
            <ProtectedRoute>
              <DoctorSearch />
            </ProtectedRoute>
          }
        />

        {/* Doctor Report Route - Require Authentication */}
        <Route
          path="/doctor-report"
          element={
            <ProtectedRoute>
              <DoctorReport />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Require Admin Role */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* Default Route - Redirect to Appointments */}
        <Route 
          path="/" 
          element={<Navigate to="/appointments" replace />} 
        />

        {/* 404 - Redirect to Appointments */}
        <Route 
          path="*" 
          element={<Navigate to="/appointments" replace />} 
        />
      </Routes>
    </Box>
  );
}

export default App;
