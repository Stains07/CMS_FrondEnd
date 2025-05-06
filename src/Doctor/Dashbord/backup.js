import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BiChevronLeft, BiChevronRight, BiArrowBack, BiHomeAlt, BiLogOut,
  BiCalendarCheck, BiSearch, BiTime, BiNotepad, BiPulse, BiPlus, 
  BiTestTube, BiBook, BiEnvelope, BiPhone, BiCheck, BiX, BiHourglass
} from 'react-icons/bi';
import axios from 'axios';
import moment from 'moment';
import HospitalImage from './Doc.jpg'; // adjust the path based on where Hospital.jpg is


const DoctorDashboard = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorData, setDoctorData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState({ doctor: true, appointments: true });
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const BASE_URL = 'http://localhost:8000';

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });
      localStorage.setItem('accessToken', response.data.access);
      return response.data.access;
    } catch (err) {
      console.error('Token refresh failed:', err.response?.data || err.message);
      handleLogout();
      return null;
    }
  };

  // Fetch doctor data and appointments
  useEffect(() => {
    const fetchData = async () => {
      let token = localStorage.getItem('accessToken');
      const doctorInfo = JSON.parse(localStorage.getItem('doctorData'));
      const docId = doctorInfo?.doc_id;

      if (!token || !docId) {
        setError('Authentication failed. Please log in again.');
        setLoading({ doctor: false, appointments: false });
        navigate('/doctor/login');
        return;
      }

      try {
        // Fetch doctor details
        let doctorResponse;
        try {
          doctorResponse = await axios.get(`${BASE_URL}/api/api/doctor/${docId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          if (err.response?.status === 401) {
            token = await refreshToken();
            if (token) {
              doctorResponse = await axios.get(`${BASE_URL}/api/api/doctor/${docId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              throw new Error('Authentication failed after token refresh');
            }
          } else {
            throw err;
          }
        }

        if (doctorResponse.data?.status === 'success') {
          setDoctorData(doctorResponse.data.doctor);
          setLoading(prev => ({ ...prev, doctor: false }));
        } else {
          throw new Error(doctorResponse.data?.error || 'Failed to fetch doctor data');
        }

        // Fetch today's appointments
        const today = moment().format('YYYY-MM-DD');
        const appointmentsResponse = await axios.get(
          `${BASE_URL}/api/appointments/${docId}/${today}/`
        );
        
        if (Array.isArray(appointmentsResponse.data)) {
          setAppointments(appointmentsResponse.data);
        } else {
          setAppointments([]);
        }
        setLoading(prev => ({ ...prev, appointments: false }));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch data');
        setLoading({ doctor: false, appointments: false });
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('doctorData');
    navigate('/faculty-login');
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appt =>
    appt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.registration_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get appointment status icon
  const getStatusIcon = (status) => {
    const icons = {
      'Completed': <BiCheck style={{ color: '#4CAF50' }} />,
      'Cancelled': <BiX style={{ color: '#F44336' }} />,
      'In Progress': <BiPulse style={{ color: '#FF9800' }} />,
      'Pending': <BiHourglass style={{ color: '#9E9E9E' }} />,
      'Confirmed': <BiCheck style={{ color: '#2196F3' }} />
    };
    return icons[status] || icons['Pending'];
  };

  // Loading state
  if (loading.doctor || loading.appointments) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>Error: {error}</p>
        <button style={styles.retryButton} onClick={() => window.location.reload()}>
          Try Again
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Background Image */}
      <div style={styles.backgroundImage}></div>
      
      {/* Left Sidebar - Doctor Profile */}
      <div
        ref={sidebarRef}
        style={{
          ...styles.sidebarContainer,
          width: isSidebarOpen ? '280px' : '50px',
          backgroundColor: isSidebarOpen ? 'rgba(244, 237, 237, 0.85)' : 'rgba(208, 231, 252, 0.7)',
        }}
      >
        <button
          style={styles.toggleButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <BiChevronLeft size={24} /> : <BiChevronRight size={24} />}
        </button>

        {isSidebarOpen && (
          <div style={styles.sidebarContent}>
            <div style={styles.hospitalHeader}>
              <h4 style={styles.hospitalTitle}>MediCare Hospital</h4>
              <div style={styles.hospitalDivider}></div>
            </div>
            <div style={styles.doctorProfile}>
              <img
                src={doctorData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData?.doc_name || 'D')}`}
                alt="Doctor"
                style={styles.doctorImage}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData?.doc_name || 'D')}`;
                }}
              />
              <h5 style={styles.doctorName}>Welcome Doctor:{doctorData?.doc_name || 'Unknown Doctor'}</h5>
              <small style={styles.doctorDepartment}>Specialisation: {doctorData?.department_name || 'Department'}</small>
              <small style={styles.doctorId}>ID: DOC{doctorData?.doc_id?.toString().padStart(2, '0') || '00'}</small>
            </div>
            <div style={styles.doctorInfo}>
              <div style={styles.infoItem}>
                <BiTime style={styles.icon} />
                <span>Consultation: {doctorData?.consultation_time || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <BiEnvelope style={styles.icon} />
                <span>{doctorData?.email || 'No email'}</span>
              </div>
              <div style={styles.infoItem}>
                <BiPhone style={styles.icon} />
                <span>{doctorData?.phone_number || 'No phone'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Appointments */}
      {isRightSidebarOpen && (
        <div style={{...styles.rightSidebar, backgroundColor: 'rgba(255, 255, 255, 0.85)'}}>
          <div style={styles.rightSidebarHeader}>
            <h5 style={styles.rightSidebarTitle}>Today's Appointments</h5>
            <button style={styles.closeRightSidebar} onClick={() => setIsRightSidebarOpen(false)}>
              <BiChevronRight size={24} />
            </button>
          </div>
          <p style={styles.dateText}>{moment().format('dddd, MMMM Do YYYY')}</p>
          
          <div style={styles.searchContainer}>
            <BiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.appointmentsList}>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <div 
                  key={index} 
                  style={{ 
                    ...styles.appointmentCard,
                    ...getAppointmentCardStyle(appointment.status)
                  }}
                  onClick={() => setSelectedPatient(appointment)}
                >
                  <div style={styles.appointmentHeader}>
                    <img 
                      src={
                        appointment.patient_image
                          ? `${BASE_URL}${appointment.patient_image}`
                          : `https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=${encodeURIComponent(appointment.patient_name || 'P')}`
                      }
                      alt="Patient" 
                      style={styles.patientThumbnail}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=${encodeURIComponent(appointment.patient_name || 'P')}`;
                      }}
                    />
                    <div style={styles.appointmentHeaderText}>
                      <h5 style={styles.patientName}>{appointment.patient_name}</h5>
                      <span style={styles.registrationId}>ID: {appointment.registration_id}</span>
                    </div>
                    <div style={styles.tokenBadge}>
                      {appointment.token_number}
                    </div>
                  </div>
                  <div style={styles.appointmentDetails}>
                    <div style={styles.appointmentTime}>
                      <BiTime style={styles.icon} />
                      <span>
                        {moment(appointment.appointment_time, 'HH:mm:ss').format('h:mm A')}
                      </span>
                    </div>
                    <div style={styles.appointmentStatus}>
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noAppointments}>
                <p>No appointments found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPatient(null)}>
          <div style={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Patient Details</h3>
              <button style={styles.closeModal} onClick={() => setSelectedPatient(null)}>
                ×
              </button>
            </div>

            <div style={styles.patientDetails}>
              <div style={styles.patientImageContainer}>
                <img 
                  src={
                    selectedPatient.patient_image
                      ? `${BASE_URL}${selectedPatient.patient_image}`
                      : `https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=${encodeURIComponent(selectedPatient.patient_name || 'P')}`
                  }
                  alt="Patient" 
                  style={styles.patientImage}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=${encodeURIComponent(selectedPatient.patient_name || 'P')}`;
                  }}
                />
              </div>
              
              <div style={styles.patientInfo}>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Name:</span>
                  <span>{selectedPatient.patient_name}</span>
                </div>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Registration ID:</span>
                  <span>{selectedPatient.registration_id}</span>
                </div>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Token Number:</span>
                  <span>{selectedPatient.token_number}</span>
                </div>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Time:</span>
                  <span>{moment(selectedPatient.appointment_time, 'HH:mm:ss').format('h:mm A')}</span>
                </div>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Gender:</span>
                  <span>{selectedPatient.patient_gender === 'M' ? 'Male' : 
                        selectedPatient.patient_gender === 'F' ? 'Female' : 'Other'}</span>
                </div>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Blood Group:</span>
                  <span>{selectedPatient.patient_blood_group}</span>
                </div>
                <div style={styles.patientInfoItem}>
                  <span style={styles.infoLabel}>Age:</span>
                  <span>{selectedPatient.patient_age || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style={styles.actionButtonsContainer}>
              <button 
                style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)' }}
                onClick={() => navigate(`/patient-history/${selectedPatient.patient_id}`)}
              >
                <BiNotepad size={16} />
                <span>History</span>
              </button>
              <button 
                style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)' }}
                onClick={() => navigate(`/test-results/${selectedPatient.patient_id}`)}
              >
                <BiPulse size={16} />
                <span>Results</span>
              </button>
              <button 
                style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }}
                onClick={() => navigate(`/prescribe/${selectedPatient.appointment_id}`)}
              >
                <BiPlus size={16} />
                <span>Prescribe</span>
              </button>
              <button 
                style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)' }}
                onClick={() => navigate(`/lab-test/${selectedPatient.appointment_id}`)}
              >
                <BiTestTube size={16} />
                <span>Lab Test</span>
              </button>
              <button 
                style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)' }}
                onClick={() => navigate(`/consultation-notes/${selectedPatient.appointment_id}`)}
              >
                <BiBook size={16} />
                <span>Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ 
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? '280px' : '60px',
        marginRight: isRightSidebarOpen ? '300px' : '0'
      }}>
        <nav style={{...styles.navbar, backgroundColor: 'rgba(255, 255, 255, 0.85)'}}>
          <div style={styles.navbarLeft}>
            <button style={{...styles.navButton, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)' }} onClick={() => navigate(-1)}>
              <BiArrowBack size={18} />
              Back
            </button>
            <button style={{...styles.navButton, background: 'linear-gradient(135deg, #4CAF50 0%,rgb(175, 227, 178) 100%)' }} onClick={() => navigate('/')}>
              <BiHomeAlt size={18} />
              Home
            </button>
          </div>
          <div style={styles.navbarRight}>
            {!isRightSidebarOpen && (
              <button
                style={{...styles.appointmentsButton, background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }}
                onClick={() => setIsRightSidebarOpen(true)}
              >
                <BiCalendarCheck style={styles.buttonIcon} />
                Appointments
              </button>
            )}
            <button style={{...styles.logoutButton, background: 'linear-gradient(135deg, #e74c3c 0%, #ec7063 100%)' }} onClick={handleLogout}>
              <BiLogOut style={styles.buttonIcon} />
              Logout
            </button>
          </div>
        </nav>

        <div style={styles.contentArea}>
          <h3 style={styles.welcomeText}>Welcome, Dr. {doctorData?.doc_name?.split(' ')[0]}</h3>
          <p style={styles.subText}>You have {filteredAppointments.length} appointments today</p>
          
          {/* Statistics Cards */}
          <div style={styles.statsContainer}>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(157, 199, 233, 0.8) 0%, rgba(29, 88, 137, 0.8) 100%)'}}>
              <h4>Total Appointments</h4>
              <p>{appointments.length}</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(201, 230, 202, 0.8) 0%, rgba(30, 108, 34, 0.8) 100%)'}}>
              <h4>Completed</h4>
              <p>{appointments.filter(a => a.status === 'Completed').length}</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(212, 205, 194, 0.8) 0%, rgba(128, 94, 43, 0.8) 100%)'}}>
              <h4>In Progress</h4>
              <p>{appointments.filter(a => a.status === 'In Progress').length}</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(237, 203, 201, 0.8) 0%, rgba(239, 83, 80, 0.8) 100%)'}}>
              <h4>Cancelled</h4>
              <p>{appointments.filter(a => a.status === 'Cancelled').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Get appointment card style based on status
const getAppointmentCardStyle = (status) => {
  const statusStyles = {
    'Completed': { 
      background: 'rgba(188, 233, 199, 0.8)',
      borderLeft: '4px solid #4CAF50'
    },
    'Cancelled': { 
      background: 'rgba(248, 215, 218, 0.8)',
      borderLeft: '4px solid #F44336'
    },
    'In Progress': { 
      background: 'rgba(255, 238, 186, 0.8)',
      borderLeft: '4px solid #FF9800'
    },
    'Pending': { 
      background: 'rgba(226, 227, 229, 0.8)',
      borderLeft: '4px solid #9E9E9E'
    },
    'Confirmed': { 
      background: 'rgba(184, 218, 255, 0.8)',
      borderLeft: '4px solid #2196F3'
    }
  };
  return statusStyles[status] || statusStyles['Pending'];
};

// Styles
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
  },
  backgroundImage: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${HospitalImage})`,

    // backgroundImage: 'url("Hosimg1jpg")',
    // backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: -1,
    filter: 'brightness(0.7)',
    opacity: 0.3,
  },
  sidebarContainer: {
    minHeight: '100vh',
    color: 'black', // Text inside will be darker
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Light transparent white
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    transition: 'width 0.3s ease, background-color 0.3s ease',
    position: 'fixed',
    zIndex: 100,
    backdropFilter: 'blur(8px)', // More blur to separate it from background
  },
  
  toggleButton: {
    position: 'absolute',
    right: '-15px',
    top: '20px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 101,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  sidebarContent: {
    padding: '20px',
    height: '100%',
  },
  hospitalHeader: {
    marginBottom: '20px',
    textAlign: 'center',
    paddingBottom: '15px',
  },
  hospitalTitle: {
    margin: 0,
    fontWeight: '600',
    fontSize: '1.3rem',
    color: '#333', // Darker color
  },
  hospitalDivider: {
    height: '2px',
    background: 'rgba(255,255,255,0.2)',
    marginTop: '10px',
  },
  doctorProfile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '25px',
    textAlign: 'center',
  },
  doctorImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #4ECDC4',
    marginBottom: '15px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  },
  doctorName: {
    margin: '5px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#222', // Darker name
  },
  doctorDepartment: {
    color: '#555', // Medium dark for subtext
    fontSize: '0.85rem',
    marginBottom: '3px',
  },
  doctorId: {
    color: '#777', // Lighter grey
    fontSize: '0.8rem',
  },
  doctorInfo: {
    marginTop: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.6)', // Light background for each item
    fontSize: '0.85rem',
    color: '#333', // Text color dark
  },
  icon: {
    marginRight: '10px',
    fontSize: '18px',
  },
  rightSidebar: {
    opacity:0.8,
    width: '300px',
    minHeight: '100vh',
    boxShadow: '-2px 0 25px rgba(0,0,0,0.05)',
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 99,
    padding: '15px',
    overflowY: 'auto',
    backdropFilter: 'blur(5px)',
    transition: 'background-color 0.3s ease',
  },
  rightSidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  rightSidebarTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '1rem',
    fontWeight: '600',
  },
  closeRightSidebar: {
    background: 'none',
    border: 'none',
    color: '#7f8c8d',
    cursor: 'pointer',
  },
  dateText: {
    color: '#7f8c8d',
    fontSize: '0.8rem',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: '500',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '15px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#95a5a6',
  },
  searchInput: {
    width: '100%',
    padding: '8px 15px 8px 35px',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '20px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontSize: '0.85rem',
    background: 'rgba(255,255,255,0.7)',
  },
  appointmentsList: {
    maxHeight: 'calc(100vh - 180px)',
    overflowY: 'auto',
    paddingRight: '5px',
  },
  appointmentCard: {
    backgroundColor: 'rgba(215, 229, 219, 0.8)',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '12px',
    boxShadow: '0 2px 18px rgba(0,0,0,0.06)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    backdropFilter: 'blur(2px)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
  },
  appointmentHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  patientThumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '10px',
    border: '2px solid white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  appointmentHeaderText: {
    flex: '1',
  },
  patientName: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#2c3e50',
    fontWeight: '600',
  },
  registrationId: {
    fontSize: '0.75rem',
    color: '#7f8c8d',
  },
  tokenBadge: {
    background: 'linear-gradient(135deg,rgb(54, 71, 82) 0%, #2980b9 100%)',
    color: 'white',
    borderRadius: '50%',
    width: '25px',
    height: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  appointmentDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentTime: {
    display: 'flex',
    alignItems: 'center',
    color: '#2c3e50',
    fontSize: '0.8rem',
  },
  appointmentStatus: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: '500',
    gap: '4px',
  },
  noAppointments: {
    textAlign: 'center',
    padding: '20px',
    color: '#95a5a6',
    fontSize: '0.9rem',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '8px',
  },
  mainContent: {
    flex: '1',
    transition: 'margin 0.3s ease',
  },
  navbar: {
    marginLeft: '-8px',
    height: '75px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    backdropFilter: 'blur(5px)',
    zIndex: 98,
  },
  navbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navButton: {
    border: 'none',
    borderRadius: '6px',
    width: '80px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.85rem',
    transition: 'transform 0.2s',
    gap: '5px',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  appointmentsButton: {
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.85rem',
    transition: 'transform 0.2s',
    gap: '5px',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  logoutButton: {
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.85rem',
    transition: 'transform 0.2s',
    gap: '5px',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  buttonIcon: {
    marginRight: '5px',
  },
  contentArea: {
    padding: '20px',
  },
  welcomeText: {
    color: '#2c3e50',
    marginBottom: '5px',
    fontSize: '1.8rem',
    fontWeight: '600',
  },
  subText: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  statCard: {
    borderRadius: '8px',
    padding: '15px',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
    h4: {
      margin: '0 0 10px 0',
      fontSize: '0.9rem',
      fontWeight: '500',
    },
    p: {
      margin: '0',
      fontSize: '1.5rem',
      fontWeight: '600',
    },
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#2c3e50',
    background: 'rgba(255,255,255,0.9)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  spinner: {
    border: '4px solid rgba(0,0,0,0.1)',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.9)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: '20px',
    fontSize: '1.1rem',
  },
  retryButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'background 0.3s',
    '&:hover': {
      background: '#2980b9',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
  },
  modalContainer: {
    background: 'white',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '15px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)',
    color: 'white',
    borderRadius: '10px 10px 0 0',
  },
  closeModal: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    lineHeight: 1,
  },
  patientDetails: {
    display: 'flex',
    padding: '15px',
    borderBottom: '1px solid #eee',
  },
  patientImageContainer: {
    flex: '0 0 120px',
    paddingRight: '15px',
  },
  patientImage: {
    width: '100%',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  patientInfo: {
    flex: 1,
    fontSize: '0.85rem',
  },
  patientInfoItem: {
    display: 'flex',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f5f5f5',
  },
  infoLabel: {
    fontWeight: '600',
    width: '100px',
    color: '#2c3e50',
  },
  actionButtonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    padding: '15px',
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    borderRadius: '6px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'transform 0.2s',
    gap: '5px',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    },
  },
};

export default DoctorDashboard;