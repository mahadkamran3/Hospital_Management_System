import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  Skeleton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  EventAvailable as SlotsIcon,
  LocalHospital as DoctorIcon,
  Close as CloseIcon,
  BookOnline as BookIcon,
} from '@mui/icons-material';
import { doctorService, handleApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Doctor Search Page - Search for doctors by ID
 * Features: Search by doctor ID, view detailed doctor information, book appointment
 */
const DoctorSearch = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [openBookDialog, setOpenBookDialog] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!doctorId.trim()) {
      setError('Please enter a Doctor ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setDoctor(null);
      setSearchAttempted(true);
      
      const response = await doctorService.searchById(doctorId.trim());
      
      if (response.data.success) {
        setDoctor(response.data.doctor);
        setSuccess(`Found: Dr. ${response.data.doctor.name}`);
      } else {
        setError(response.data.message || 'Doctor not found');
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message || 'Doctor not found. Please check the ID and try again.');
      console.error('Error searching doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!user) {
      setError('Please log in to book an appointment');
      navigate('/login');
      return;
    }
    
    // Navigate to appointments page with doctor pre-filled
    navigate('/appointments', { state: { doctorName: doctor.name } });
  };

  const getSlotColor = (slots) => {
    if (slots >= 10) return 'success';
    if (slots >= 5) return 'warning';
    return 'error';
  };

  const getSlotStatus = (slots) => {
    if (slots === 0) return 'No slots available';
    if (slots <= 3) return 'Limited slots available';
    if (slots <= 6) return 'Few slots available';
    return 'Many slots available';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Search Doctor
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Enter a Doctor ID to find and view complete details
        </Typography>
      </Box>

      {/* Alerts */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Enter Doctor ID (e.g., 507f1f77bcf86cd799439011)"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !doctorId.trim()}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            Tip: You can find Doctor IDs in the Doctor Report page
          </Typography>
        </form>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No search attempted */}
      {!loading && !searchAttempted && (
        <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <DoctorIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Start Your Search
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enter a Doctor ID in the search box above to find doctor information and availability
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Not Found State */}
      {!loading && searchAttempted && !doctor && (
        <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CloseIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Doctor Not Found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              No doctor found with ID: <strong>{doctorId}</strong>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setDoctorId('');
                setSearchAttempted(false);
              }}
            >
              Try Another Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Doctor Found - Display Details */}
      {!loading && doctor && (
        <Box>
          {/* Main Doctor Card */}
          <Card sx={{ mb: 3, boxShadow: theme.shadows[3] }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Doctor Basic Info */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Dr. {doctor.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={doctor.specialization}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`${doctor.experience} years experience`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={doctor.availableSlots}
                        color={getSlotColor(doctor.availableSlots)}
                        variant="filled"
                        size="small"
                        icon={<SlotsIcon />}
                        sx={{ mb: 1, fontWeight: 600 }}
                      />
                      <Typography variant="caption" display="block" color="textSecondary">
                        {getSlotStatus(doctor.availableSlots)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Doctor Details Grid */}
                  <Grid container spacing={2}>
                    {/* Doctor ID */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5 }}>
                          Doctor ID
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {doctor.doctorId}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Qualification */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <SchoolIcon fontSize="small" /> Qualification
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {doctor.qualification}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Phone */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" /> Contact
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {doctor.phone}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                          {doctor.email || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Consultation Fee */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MoneyIcon fontSize="small" /> Consultation Fee
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                          PKR {doctor.consultationFee}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Experience */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkIcon fontSize="small" /> Experience
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {doctor.experience} years
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Actions */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setDoctorId('');
                    setDoctor(null);
                    setSearchAttempted(false);
                  }}
                >
                  New Search
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BookIcon />}
                  onClick={() => setOpenBookDialog(true)}
                  disabled={doctor.availableSlots === 0}
                >
                  Book Appointment
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Availability Status Card */}
          {doctor.availableSlots > 0 && (
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                  ✓ This doctor has {doctor.availableSlots} available appointment slot{doctor.availableSlots !== 1 ? 's' : ''}. You can book now!
                </Typography>
              </CardContent>
            </Card>
          )}

          {doctor.availableSlots === 0 && (
            <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                  ✗ This doctor has no available appointment slots at the moment
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Book Appointment Dialog */}
      <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Book Appointment with Dr. {doctor?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Proceed to book an appointment with this doctor.
            </Typography>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1, mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Doctor: <strong>Dr. {doctor?.name}</strong>
              </Typography>
              <br />
              <Typography variant="caption" color="textSecondary">
                Specialization: <strong>{doctor?.specialization}</strong>
              </Typography>
              <br />
              <Typography variant="caption" color="textSecondary">
                Consultation Fee: <strong>PKR {doctor?.consultationFee}</strong>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setOpenBookDialog(false);
            handleBookAppointment();
          }}>
            Proceed to Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorSearch;
