import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as DoctorIcon,
  TrendingUp as TrendingUpIcon,
  MedicalServices as MedicalIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  EventAvailable,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { adminService, doctorService, handleApiError } from '../services/api';

/**
 * Department colors for charts
 */
const DEPARTMENT_COLORS = {
  'Cardiology': '#e91e63',
  'Pediatrics': '#9c27b0',
  'Orthopedics': '#673ab7',
  'Neurology': '#3f51b5',
  'General Medicine': '#00bfa5',
  'Gynecology': '#00bcd4',
  'Dermatology': '#009688',
  'ENT': '#4caf50',
  'Ophthalmology': '#8bc34a',
  'Psychiatry': '#ff9800',
  'Urology': '#ff5722',
  'Oncology': '#795548',
};

/**
 * Status colors
 */
const STATUS_COLORS = {
  scheduled: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336',
};

/**
 * Specializations list
 */
const SPECIALIZATIONS = [
  'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine',
  'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'Urology', 'Oncology'
];

/**
 * Admin Dashboard Component
 * Displays comprehensive statistics, charts, and management features
 */
const Admin = () => {
  const theme = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Doctor dialog state
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorFormData, setDoctorFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
  });
  const [doctorFormErrors, setDoctorFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });

  /**
   * Fetch dashboard data on mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch data based on tab
   */
  useEffect(() => {
    if (tabValue === 1) {
      fetchUsers();
    } else if (tabValue === 2) {
      fetchDoctors();
    }
  }, [tabValue]);

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch users list
   */
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminService.getUsers();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Fetch doctors list
   */
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await doctorService.getAllForAdmin();
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to load doctors', 'error');
    } finally {
      setLoadingDoctors(false);
    }
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /**
   * Handle user role update
   */
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.data.success) {
        showSnackbar(`User role updated to ${newRole}`);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to update user role', 'error');
    }
  };

  /**
   * Handle user deletion
   */
  const handleDeleteUser = async () => {
    if (!deleteDialog.item) return;
    
    try {
      const response = await adminService.deleteUser(deleteDialog.item._id);
      if (response.data.success) {
        showSnackbar(response.data.message || 'User deleted successfully');
        fetchUsers();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  /**
   * Open doctor dialog for add/edit
   */
  const openDoctorDialog = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setDoctorFormData({
        name: doctor.name.replace('Dr. ', ''),
        email: doctor.email || '',
        phone: doctor.phone,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience.toString(),
        consultationFee: doctor.consultationFee.toString(),
      });
    } else {
      setEditingDoctor(null);
      setDoctorFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
      });
    }
    setDoctorFormErrors({});
    setDoctorDialogOpen(true);
  };

  /**
   * Validate doctor form
   */
  const validateDoctorForm = () => {
    const errors = {};
    
    if (!doctorFormData.name.trim()) {
      errors.name = 'Doctor name is required';
    }
    
    if (!doctorFormData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^0[0-9]{3}-[0-9]{7}$/.test(doctorFormData.phone)) {
      errors.phone = 'Invalid phone format (e.g., 0300-1234567)';
    }
    
    if (!doctorFormData.specialization) {
      errors.specialization = 'Specialization is required';
    }
    
    if (!doctorFormData.qualification.trim()) {
      errors.qualification = 'Qualification is required';
    }
    
    if (!doctorFormData.experience || isNaN(doctorFormData.experience)) {
      errors.experience = 'Valid experience years required';
    }
    
    if (!doctorFormData.consultationFee || isNaN(doctorFormData.consultationFee)) {
      errors.consultationFee = 'Valid consultation fee required';
    }
    
    setDoctorFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle doctor form submission
   */
  const handleDoctorSubmit = async () => {
    if (!validateDoctorForm()) {
      showSnackbar('Please fix the form errors', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const data = {
        name: `Dr. ${doctorFormData.name}`,
        email: doctorFormData.email || undefined,
        phone: doctorFormData.phone,
        specialization: doctorFormData.specialization,
        qualification: doctorFormData.qualification,
        experience: parseInt(doctorFormData.experience),
        consultationFee: parseInt(doctorFormData.consultationFee),
      };
      
      if (editingDoctor) {
        const response = await doctorService.update(editingDoctor._id, data);
        if (response.data.success) {
          showSnackbar('Doctor updated successfully');
        }
      } else {
        const response = await doctorService.create(data);
        if (response.data.success) {
          showSnackbar('Doctor added successfully');
        }
      }
      
      setDoctorDialogOpen(false);
      fetchDoctors();
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving doctor:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to save doctor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle doctor deletion
   */
  const handleDeleteDoctor = async () => {
    if (!deleteDialog.item) return;
    
    try {
      const response = await doctorService.delete(deleteDialog.item._id);
      if (response.data.success) {
        showSnackbar('Doctor deleted successfully');
        fetchDoctors();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to delete doctor', 'error');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  /**
   * Toggle doctor active status
   */
  const handleToggleDoctorStatus = async (doctorId) => {
    try {
      const response = await doctorService.toggleStatus(doctorId);
      if (response.data.success) {
        showSnackbar(response.data.message);
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to update status', 'error');
    }
  };

  /**
   * Prepare chart data for department distribution
   */
  const getDepartmentChartData = () => {
    if (!dashboardData?.charts?.departmentStats) return [];
    return dashboardData.charts.departmentStats.map(item => ({
      name: item._id,
      value: item.count,
      color: DEPARTMENT_COLORS[item._id] || '#666',
    }));
  };

  /**
   * Prepare chart data for status distribution
   */
  const getStatusChartData = () => {
    if (!dashboardData?.statusBreakdown) return [];
    return [
      { name: 'Scheduled', value: dashboardData.statusBreakdown.scheduled, color: STATUS_COLORS.scheduled },
      { name: 'Completed', value: dashboardData.statusBreakdown.completed, color: STATUS_COLORS.completed },
      { name: 'Cancelled', value: dashboardData.statusBreakdown.cancelled, color: STATUS_COLORS.cancelled },
    ];
  };

  /**
   * Prepare weekly chart data
   */
  const getWeeklyChartData = () => {
    if (!dashboardData?.charts?.weeklyData) return [];
    return dashboardData.charts.weeklyData;
  };

  /**
   * Prepare monthly chart data
   */
  const getMonthlyChartData = () => {
    if (!dashboardData?.charts?.monthlyData) return [];
    return dashboardData.charts.monthlyData;
  };

  /**
   * Custom tooltip for pie charts
   */
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  /**
   * Render statistics cards
   */
  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Total Users */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : dashboardData?.totalUsers || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Users
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                <PeopleIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Appointments */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha('#9c27b0', 0.9)} 0%, ${alpha('#7b1fa2', 0.9)} 100%)`,
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : dashboardData?.totalAppointments || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Appointments
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                <CalendarIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Doctors */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha('#ff9800', 0.9)} 0%, ${alpha('#f57c00', 0.9)} 100%)`,
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : dashboardData?.totalDoctors || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Doctors
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                <DoctorIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Appointments */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha('#4caf50', 0.9)} 0%, ${alpha('#388e3c', 0.9)} 100%)`,
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : dashboardData?.todaysAppointments || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Today's Appointments
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  /**
   * Render charts section
   */
  const renderCharts = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Status Distribution Pie Chart */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Appointment Status
          </Typography>
          <Box sx={{ height: 300 }}>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 4 }} />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={getStatusChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getStatusChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Department Distribution Pie Chart */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            By Department
          </Typography>
          <Box sx={{ height: 300 }}>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 4 }} />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={getDepartmentChartData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name.slice(0, 3)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {getDepartmentChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Weekly Bar Chart */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            This Week
          </Typography>
          <Box sx={{ height: 300 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <ResponsiveContainer>
                <BarChart data={getWeeklyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="day" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Monthly Trend Area Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Monthly Appointments Trend
          </Typography>
          <Box sx={{ height: 300 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={getMonthlyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="month" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.3)}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  /**
   * Render users table
   */
  const renderUsersTable = () => (
    <Paper sx={{ overflow: 'hidden' }}>
      {loadingUsers && <LinearProgress />}
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && !loadingUsers ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: user.role === 'admin' ? 'primary.main' : 'grey.500' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                      label={user.role}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('en-PK')}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.role === 'admin' ? 'Make User' : 'Make Admin'}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      >
                        {user.role === 'admin' ? <PersonIcon /> : <AdminIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, type: 'user', item: user })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  /**
   * Render doctors table
   */
  const renderDoctorsTable = () => (
    <Paper sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Doctor Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDoctorDialog()}
        >
          Add Doctor
        </Button>
      </Box>
      <Divider />
      {loadingDoctors && <LinearProgress />}
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Specialization</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Qualification</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Experience</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fee (PKR)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.length === 0 && !loadingDoctors ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No doctors found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DoctorIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {doctor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doctor.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={doctor.specialization} 
                      size="small" 
                      sx={{ bgcolor: alpha(DEPARTMENT_COLORS[doctor.specialization] || '#666', 0.2) }}
                    />
                  </TableCell>
                  <TableCell>{doctor.qualification}</TableCell>
                  <TableCell>{doctor.experience} years</TableCell>
                  <TableCell>Rs. {doctor.consultationFee?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={doctor.isActive ? 'Active' : 'Inactive'}
                      color={doctor.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openDoctorDialog(doctor)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={doctor.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton
                        size="small"
                        color={doctor.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleDoctorStatus(doctor._id)}
                      >
                        {doctor.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, type: 'doctor', item: doctor })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  /**
   * Render recent appointments
   */
  const renderRecentAppointments = () => (
    <Paper sx={{ mt: 4 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Recent Appointments
        </Typography>
      </Box>
      <Divider />
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : dashboardData?.recentAppointments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No recent appointments</Typography>
                </TableCell>
              </TableRow>
            ) : (
              dashboardData?.recentAppointments?.map((apt) => (
                <TableRow key={apt._id} hover>
                  <TableCell>{apt.patientName}</TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>{new Date(apt.date).toLocaleDateString('en-PK')}</TableCell>
                  <TableCell>
                    <Chip label={apt.department} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={apt.status}
                      size="small"
                      color={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'error' : 'info'}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's an overview of your hospital management system.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<TrendingUpIcon />} label="Overview" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="Users" iconPosition="start" />
          <Tab icon={<DoctorIcon />} label="Doctors" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <>
          {renderCharts()}
          {renderRecentAppointments()}
        </>
      )}

      {tabValue === 1 && renderUsersTable()}

      {tabValue === 2 && renderDoctorsTable()}

      {/* Doctor Add/Edit Dialog */}
      <Dialog
        open={doctorDialogOpen}
        onClose={() => setDoctorDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </Typography>
            <IconButton onClick={() => setDoctorDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Doctor Name"
                value={doctorFormData.name}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                error={!!doctorFormErrors.name}
                helperText={doctorFormErrors.name || 'Dr. will be prefixed automatically'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Dr.</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email (Optional)"
                type="email"
                value={doctorFormData.email}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={doctorFormData.phone}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, phone: e.target.value })}
                error={!!doctorFormErrors.phone}
                helperText={doctorFormErrors.phone || 'Format: 0300-1234567'}
                placeholder="0300-1234567"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!doctorFormErrors.specialization}>
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={doctorFormData.specialization}
                  label="Specialization"
                  onChange={(e) => setDoctorFormData({ ...doctorFormData, specialization: e.target.value })}
                >
                  {SPECIALIZATIONS.map((spec) => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
                {doctorFormErrors.specialization && (
                  <FormHelperText>{doctorFormErrors.specialization}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qualification"
                value={doctorFormData.qualification}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, qualification: e.target.value })}
                error={!!doctorFormErrors.qualification}
                helperText={doctorFormErrors.qualification}
                placeholder="e.g., MBBS, FCPS"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (Years)"
                type="number"
                value={doctorFormData.experience}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, experience: e.target.value })}
                error={!!doctorFormErrors.experience}
                helperText={doctorFormErrors.experience}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee (PKR)"
                type="number"
                value={doctorFormData.consultationFee}
                onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationFee: e.target.value })}
                error={!!doctorFormErrors.consultationFee}
                helperText={doctorFormErrors.consultationFee}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDoctorDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDoctorSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingDoctor ? 'Update' : 'Add Doctor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: '', item: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteDialog.type === 'user' ? 'user' : 'doctor'}{' '}
            <strong>{deleteDialog.item?.name}</strong>?
          </Typography>
          {deleteDialog.type === 'user' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will also delete all appointments created by this user.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', item: null })} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteDialog.type === 'user' ? handleDeleteUser : handleDeleteDoctor}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin;
