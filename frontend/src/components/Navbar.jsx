import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  CalendarMonth as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

/**
 * Navigation Bar Component
 * Responsive navbar with user menu and admin access
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout, isAdmin } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Handle user menu open
   */
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle user menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  /**
   * Handle navigation
   */
  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  /**
   * Check if path is active
   */
  const isActive = (path) => location.pathname === path;

  /**
   * Mobile drawer content
   */
  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HospitalIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            HospitaliaCare
          </Typography>
        </Box>
        <IconButton onClick={() => setMobileOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* User info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography fontWeight={600}>{user?.name}</Typography>
          <Chip
            size="small"
            label={isAdmin ? 'Admin' : 'User'}
            color={isAdmin ? 'secondary' : 'default'}
          />
        </Box>
      </Box>

      <List>
        <ListItem
          button
          onClick={() => handleNavigate('/appointments')}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: isActive('/appointments') ? 'primary.main' : 'transparent',
            color: isActive('/appointments') ? 'white' : 'inherit',
            '&:hover': {
              bgcolor: isActive('/appointments') ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive('/appointments') ? 'white' : 'inherit' }}>
            <CalendarIcon />
          </ListItemIcon>
          <ListItemText primary="Appointments" />
        </ListItem>

        {isAdmin && (
          <ListItem
            button
            onClick={() => handleNavigate('/admin')}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: isActive('/admin') ? 'primary.main' : 'transparent',
              color: isActive('/admin') ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: isActive('/admin') ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ color: isActive('/admin') ? 'white' : 'inherit' }}>
              <AdminIcon />
            </ListItemIcon>
            <ListItemText primary="Admin Dashboard" />
          </ListItem>
        )}

        <Divider sx={{ my: 2 }} />

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'white',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          borderBottom: '1px solid',
          borderColor: 'divider',
        })}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/appointments')}
          >
            <Box
              sx={(theme) => ({
                width: 40,
                height: 40,
                backgroundColor: 'action.selected',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.contrastText,
              })}
            >
              <HospitalIcon />
            </Box>
            {!isMobile && (
              <Typography variant="h6" fontWeight={700}>
                HospitaliaCare
              </Typography>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Button
                color="inherit"
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/appointments')}
                sx={{
                  backgroundColor: isActive('/appointments') ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Appointments
              </Button>
              
              {isAdmin && (
                <Button
                  color="inherit"
                  startIcon={<AdminIcon />}
                  onClick={() => navigate('/admin')}
                  sx={{
                    backgroundColor: isActive('/admin') ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>
          )}

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Chip
                size="small"
                label={isAdmin ? 'Admin' : 'User'}
                sx={{
                  backgroundColor: isAdmin ? 'secondary.main' : 'action.selected',
                  color: isAdmin ? 'secondary.contrastText' : 'text.primary',
                  fontWeight: 500,
                }}
              />
            )}
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  border: '2px solid',
                  borderColor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            
            <Divider />
            
            <MenuItem onClick={() => { handleMenuClose(); navigate('/appointments'); }}>
              <ListItemIcon>
                <CalendarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Appointments</ListItemText>
            </MenuItem>
            
            {isAdmin && (
              <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
                <ListItemIcon>
                  <AdminIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Admin Dashboard</ListItemText>
              </MenuItem>
            )}
            
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: { borderRadius: '0 16px 16px 0' },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
