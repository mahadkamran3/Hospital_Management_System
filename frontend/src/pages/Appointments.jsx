import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Snackbar,
  Skeleton,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Fade,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon,
  Close as CloseIcon,
  EventAvailable as ScheduledIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { appointmentService, doctorService, handleApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Departments available in the hospital
 */
const DEPARTMENTS = [
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'General Medicine',
  'Gynecology',
  'Dermatology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Urology',
  'Oncology',
];

/**
 * Time slots for appointments
 */
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

/**
 * Status configuration with colors and icons
 */
const STATUS_CONFIG = {
  scheduled: { color: 'info', icon: ScheduledIcon, label: 'Scheduled' },
  completed: { color: 'success', icon: CompletedIcon, label: 'Completed' },
  cancelled: { color: 'error', icon: CancelledIcon, label: 'Cancelled' },
};

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Appointments Page Component
 * Displays appointments with CRUD operations, filtering, and validation
 */
const Appointments = () => {
  const { isAdmin, user } = useAuth();
  const theme = useTheme();
  
  // State management
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    time: '',
    department: '',
    phone: '',
    status: 'scheduled',
    notes: '',
  });
  
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success',
    duration: 4000 
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  /**
   * Fetch data on component mount
   */
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  /**
   * Fetch appointments from API
   */
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll();
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to load appointments. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch doctors from API
   */
  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAll();
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Don't show error for doctors, just use empty array
    }
  };

  /**
   * Filter appointments based on search and filters
   */
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch = 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || apt.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [appointments, searchQuery, statusFilter, departmentFilter]);

  /**
   * Appointment statistics
   */
  const stats = useMemo(() => ({
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments]);

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity = 'success', duration = 4000) => {
    setSnackbar({ open: true, message, severity, duration });
  };

  /**
   * Close snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};
    
    // Patient name validation
    if (!formData.patientName.trim()) {
      errors.patientName = 'Patient name is required';
    } else if (formData.patientName.length < 2) {
      errors.patientName = 'Patient name must be at least 2 characters';
    } else if (formData.patientName.length > 100) {
      errors.patientName = 'Patient name cannot exceed 100 characters';
    }
    
    // Doctor validation
    if (!formData.doctorName) {
      errors.doctorName = 'Please select a doctor';
    }
    
    // Date validation - must be today or future
    if (!formData.date) {
      errors.date = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Appointment date cannot be in the past. Please select today or a future date.';
      }
    }
    
    // Time validation
    if (!formData.time) {
      errors.time = 'Appointment time is required';
    }
    
    // Department validation
    if (!formData.department) {
      errors.department = 'Please select a department';
    }
    
    // Phone validation - Pakistani format
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^0[0-9]{3}-[0-9]{7}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Please enter a valid Pakistani phone number (e.g., 0300-1234567)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Format phone number as user types
   */
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d-]/g, '');
    
    // Auto-format phone number
    if (value.length === 4 && !value.includes('-')) {
      value = value + '-';
    }
    
    // Limit to correct format length
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
    
    if (formErrors.phone) {
      setFormErrors((prev) => ({
        ...prev,
        phone: '',
      }));
    }
  };

  /**
   * Open dialog for adding new appointment
   */
  const handleAddClick = () => {
    setEditMode(false);
    setSelectedAppointment(null);
    setFormErrors({});
    setFormData({
      patientName: '',
      doctorName: '',
      date: getTodayDate(),
      time: '',
      department: '',
      phone: '',
      status: 'scheduled',
      notes: '',
    });
    setDialogOpen(true);
  };

  /**
   * Open dialog for editing appointment
   */
  const handleEditClick = (appointment) => {
    setEditMode(true);
    setSelectedAppointment(appointment);
    setFormErrors({});
    setFormData({
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
      time: appointment.time,
      department: appointment.department,
      phone: appointment.phone,
      status: appointment.status,
      notes: appointment.notes || '',
    });
    setDialogOpen(true);
  };

  /**
   * Close dialog
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedAppointment(null);
    setFormErrors({});
  };

  /**
   * Submit form for create/update
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      if (editMode && selectedAppointment) {
        // Update existing appointment
        const response = await appointmentService.update(selectedAppointment._id, formData);
        if (response.data.success) {
          showSnackbar(response.data.message || 'Appointment updated successfully');
          fetchAppointments();
        }
      } else {
        // Create new appointment
        const response = await appointmentService.create(formData);
        if (response.data.success) {
          showSnackbar(response.data.message || 'Appointment created successfully');
          fetchAppointments();
        }
      }
      handleDialogClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      const errorInfo = handleApiError(error);
      
      // Show specific error messages
      if (errorInfo.errors && errorInfo.errors.length > 0) {
        const errorMessages = errorInfo.errors.map(e => e.msg).join('. ');
        showSnackbar(errorMessages, 'error', 6000);
      } else {
        showSnackbar(errorInfo.message || 'Failed to save appointment. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteConfirmOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await appointmentService.delete(appointmentToDelete._id);
      if (response.data.success) {
        showSnackbar(response.data.message || 'Appointment deleted successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      const errorInfo = handleApiError(error);
      showSnackbar(errorInfo.message || 'Failed to delete appointment. Please try again.', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    }
  };

  /**
   * Reset filters
   */
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDepartmentFilter('all');
  };

  /**
   * Render status chip
   */
  const renderStatusChip = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
    const Icon = config.icon;
    
    return (
      <Chip
        icon={<Icon sx={{ fontSize: 16 }} />}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  /**
   * Loading skeleton
   */
  const LoadingSkeleton = () => (
    <TableBody>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(7)].map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton animation="wave" height={40} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {isAdmin ? 'All Appointments' : 'My Appointments'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin 
            ? 'View and manage all patient appointments'
            : 'View and manage your scheduled appointments'}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.scheduled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.cancelled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by patient, doctor, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              New Appointment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointments Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box>
                        <MedicalIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No appointments found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchQuery || statusFilter !== 'all' || departmentFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Click "New Appointment" to schedule one'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow
                      key={appointment._id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {appointment.patientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DoctorIcon color="primary" fontSize="small" />
                          <Typography variant="body2">{appointment.doctorName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {formatDate(appointment.date)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon color="action" fontSize="small" />
                          <Typography variant="body2">{appointment.time}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.department} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {renderStatusChip(appointment.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(appointment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(appointment)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        
        {/* Results count */}
        {!loading && filteredAppointments.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              {editMode ? 'Edit Appointment' : 'New Appointment'}
            </Typography>
            <IconButton onClick={handleDialogClose} size="small">
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
                label="Patient Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleFormChange}
                error={!!formErrors.patientName}
                helperText={formErrors.patientName}
                placeholder="Enter patient's full name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  label="Department"
                  onChange={handleFormChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <MedicalIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <FormHelperText>{formErrors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.doctorName}>
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctorName"
                  value={formData.doctorName}
                  label="Doctor"
                  onChange={handleFormChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <DoctorIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {doctors.length > 0 ? (
                    doctors
                      .filter(doc => !formData.department || doc.specialization === formData.department)
                      .map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor.name}>
                          {doctor.name} - {doctor.specialization}
                        </MenuItem>
                      ))
                  ) : (
                    // Fallback doctors if API doesn't return any
                    ['Dr. Sana Malik', 'Dr. Ahmed Hassan', 'Dr. Zainab Tariq', 'Dr. Bilal Ahmed', 'Dr. Ayesha Noor'].map((doc) => (
                      <MenuItem key={doc} value={doc}>{doc}</MenuItem>
                    ))
                  )}
                </Select>
                {formErrors.doctorName && (
                  <FormHelperText>{formErrors.doctorName}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
                error={!!formErrors.date}
                helperText={formErrors.date || 'Must be today or a future date'}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getTodayDate() }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.time}>
                <InputLabel>Time</InputLabel>
                <Select
                  name="time"
                  value={formData.time}
                  label="Time"
                  onChange={handleFormChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <TimeIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {TIME_SLOTS.map((time) => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
                {formErrors.time && (
                  <FormHelperText>{formErrors.time}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone || 'Format: 0300-1234567'}
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
            
            {editMode && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                multiline
                rows={3}
                placeholder="Any additional notes or special requirements..."
              />
            </Grid>
          </Grid>
          
          {/* Date Warning */}
          {formErrors.date && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" />
                <Typography variant="body2">
                  Past dates are not allowed. Please select today's date or a future date.
                </Typography>
              </Box>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the appointment for{' '}
            <strong>{appointmentToDelete?.patientName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add appointment"
        onClick={handleAddClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Appointments;
