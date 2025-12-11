import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Container, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/**
 * Admin Route Component
 * Redirects to login if user is not authenticated
 * Shows access denied if user is not admin
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #00695f 0%, #003d33 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" color="white">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="sm">
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 32,
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              🚫 Access Denied
            </Typography>
            <Typography variant="body1" gutterBottom>
              You don't have permission to access the admin dashboard.
              Only administrators can view this page.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/appointments"
              sx={{ mt: 2 }}
            >
              Go to Appointments
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  // Render admin content
  return children;
};

export default AdminRoute;
