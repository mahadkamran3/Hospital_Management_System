import { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  EventAvailable as SlotsIcon,
  FileDownload as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { doctorService, handleApiError } from '../services/api';

/**
 * Doctor Report Page - Display all doctors with their available appointment slots
 * Features: View doctor list with slots, search by doctor ID, sort by specialization
 */
const DoctorReport = () => {
  const theme = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Fetch doctor report on component mount
  useEffect(() => {
    fetchDoctorReport();
  }, []);

  // Update filtered doctors when search or filter changes
  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchId, selectedSpecialization, sortBy]);

   const fetchDoctorReport = async () => {
     try {
       setLoading(true);
       setError(null);
       const response = await doctorService.getReport();
       
       if (response.data.success) {
         setDoctors(response.data.doctors || []);
         setSuccess('Doctor report loaded successfully');
       } else {
         setError(response.data.message || 'Failed to load doctor report');
       }
     } catch (err) {
       const apiError = handleApiError(err);
       
       // Handle authorization error specifically
       if (apiError.status === 403) {
         setError('You are not entitled to do this');
       } else {
         setError(apiError.message || 'Failed to load doctor report');
       }
       
       console.error('Error fetching doctor report:', err);
     } finally {
       setLoading(false);
     }
   };

  const searchByDoctorId = async (doctorId) => {
    if (!doctorId.trim()) {
      setError('Please enter a doctor ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.searchById(doctorId);
      
      if (response.data.success) {
        setDoctors([response.data.doctor]);
        setSuccess(`Found doctor: ${response.data.doctor.name}`);
      } else {
        setError(response.data.message || 'Doctor not found');
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message || 'Doctor not found');
      console.error('Error searching doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    // Filter by specialization
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doc => doc.specialization === selectedSpecialization);
    }

    // Filter by search ID
    if (searchId.trim()) {
      filtered = filtered.filter(doc => doc.doctorId.toLowerCase().includes(searchId.toLowerCase()));
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'specialization':
        filtered.sort((a, b) => a.specialization.localeCompare(b.specialization));
        break;
      case 'slots':
        filtered.sort((a, b) => b.availableSlots - a.availableSlots);
        break;
      case 'experience':
        filtered.sort((a, b) => b.experience - a.experience);
        break;
      default:
        break;
    }

    setFilteredDoctors(filtered);
  };

  const getSlotColor = (slots) => {
    if (slots >= 10) return 'success';
    if (slots >= 5) return 'warning';
    return 'error';
  };

  const getSlotLabel = (slots) => {
    if (slots === 0) return 'Full';
    if (slots <= 3) return 'Limited';
    return 'Available';
  };

  const downloadReport = () => {
    // Generate CSV
    const headers = ['Doctor ID', 'Name', 'Specialization', 'Available Slots', 'Phone', 'Experience', 'Qualification', 'Consultation Fee'];
    const rows = filteredDoctors.map(doc => [
      doc.doctorId,
      doc.name,
      doc.specialization,
      doc.availableSlots,
      doc.phone,
      doc.experience,
      doc.qualification,
      doc.consultationFee
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctor-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const specializations = ['all', ...new Set(doctors.map(doc => doc.specialization))].filter(Boolean);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <DoctorIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Doctor Report
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          View all doctors with their specialization and available appointment slots
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {!loading && doctors.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Doctors
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {filteredDoctors.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Available Slots
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {filteredDoctors.reduce((sum, doc) => sum + doc.availableSlots, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Slots/Doctor
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {(filteredDoctors.reduce((sum, doc) => sum + doc.availableSlots, 0) / (filteredDoctors.length || 1)).toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Experience (yrs)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {(filteredDoctors.reduce((sum, doc) => sum + doc.experience, 0) / (filteredDoctors.length || 1)).toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon /> Search & Filter
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by Doctor ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                endAdornment: searchId && (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => setSearchId('')}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      Clear
                    </Button>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Specialization"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              variant="outlined"
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">All Specializations</option>
              {specializations.filter(s => s !== 'all').map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              variant="outlined"
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="name">Name</option>
              <option value="specialization">Specialization</option>
              <option value="slots">Available Slots</option>
              <option value="experience">Experience</option>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDoctorReport}
              size="small"
            >
              Refresh
            </Button>
            <Tooltip title="Download as CSV">
              <Button
                variant="outlined"
                onClick={downloadReport}
                size="small"
                sx={{ minWidth: 'auto' }}
              >
                <DownloadIcon />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

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

      {/* Loading State */}
      {loading && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableRow>
                <TableCell>Doctor ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell align="center">Available Slots</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Experience</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty State */}
      {!loading && filteredDoctors.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
          <InfoIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchId ? 'Doctor not found' : 'No doctors available'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchId ? `No doctor found with ID: ${searchId}` : 'There are currently no doctors in the system'}
          </Typography>
          {searchId && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSearchId('')}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      )}

      {/* Doctor Report Table */}
      {!loading && filteredDoctors.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Doctor ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <SlotsIcon fontSize="small" /> Available Slots
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Qualification</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Fee (PKR)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDoctors.map((doctor, index) => (
                <TableRow
                  key={doctor.doctorId}
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {doctor.doctorId.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Dr. {doctor.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doctor.specialization}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`${getSlotLabel(doctor.availableSlots)} - ${doctor.availableSlots} slots`}>
                      <Chip
                        label={doctor.availableSlots}
                        color={getSlotColor(doctor.availableSlots)}
                        variant="filled"
                        size="small"
                        sx={{ minWidth: 40, fontWeight: 600 }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                      <PhoneIcon fontSize="small" color="action" />
                      {doctor.phone}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                      <WorkIcon fontSize="small" color="action" />
                      {doctor.experience} yrs
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={doctor.qualification}>
                      <Typography variant="caption" sx={{ display: 'block', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doctor.qualification}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, fontWeight: 500 }}>
                      <MoneyIcon fontSize="small" color="success" />
                      {doctor.consultationFee}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary Footer */}
      {!loading && filteredDoctors.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), textAlign: 'center' }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Showing {filteredDoctors.length} of {doctors.length} doctors
            {selectedSpecialization !== 'all' && ` (${selectedSpecialization})`}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default DoctorReport;
