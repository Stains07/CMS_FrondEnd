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
  const [pendingMessage, setPendingMessage] = useState(null);

  const BASE_URL = 'https://blueeye10.pythonanywhere.com';

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
        navigate('/faculty-login');
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
          console.log('Appointment Statuses:', [...new Set(appointmentsResponse.data.map(a => a.status))]);
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

  // Handle patient selection
  const handlePatientSelect = (appointment) => {
    if (appointment.status === 'Pending') {
      setPendingMessage('The patient has not yet confirmed the appointment.');
      setSelectedPatient(null);
      setTimeout(() => setPendingMessage(null), 3000); // Clear message after 3 seconds
    } else {
      setPendingMessage(null);
      setSelectedPatient(appointment);
    }
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
      
      {/* Navbar */}
      <nav style={{
        ...styles.navbar,
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? '280px' : '60px',
        right: isRightSidebarOpen ? '300px' : '0',
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transition: 'left 0.3s, right 0.3s'
      }}>
        <div style={styles.navbarLeft}>
          <button style={{...styles.navButton, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)' }} onClick={() => navigate(-1)}>
            <BiArrowBack size={18} />
            Back
          </button>
          <button style={{...styles.navButton, background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)' }} onClick={() => navigate('/')}>
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

      {/* Left Sidebar - Doctor Profile */}
      <div
        ref={sidebarRef}
        style={{
          ...styles.sidebarContainer,
          width: isSidebarOpen ? '280px' : '30px',
          background: isSidebarOpen 
            ? 'linear-gradient(135deg, rgba(242, 245, 240, 0.9) 0%, rgba(196, 197, 195, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(115, 116, 118, 0.9) 0%, rgba(125, 211, 252, 0.9) 100%)',
          zIndex: 1000
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
        <div style={{
          ...styles.rightSidebar,
          background: 'linear-gradient(135deg, rgba(237, 239, 235, 0.9) 0%, rgba(211, 224, 215, 0.9) 100%)',
          zIndex: 1000
        }}>
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
                  onClick={() => handlePatientSelect(appointment)}
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

      {/* Pending Appointment Message */}
      {pendingMessage && (
        <div style={styles.pendingMessage}>
          <p>{pendingMessage}</p>
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
        marginRight: isRightSidebarOpen ? '300px' : '0',
        marginTop: '80px' // Space for fixed navbar
      }}>
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
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(200, 200, 200, 0.8) 0%, rgba(100, 100, 100, 0.8) 100%)'}}>
              <h4>Pending</h4>
              <p>{appointments.filter(a => a.status === 'Pending').length}</p>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(237, 203, 201, 0.8) 0%, rgba(239, 83, 80, 0.8) 100%)'}}>
              <h4>Canceled</h4>
              <p>{appointments.filter(a => a.status === 'Canceled').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  dashboardContainer: { 
    display: 'flex', 
    minHeight: '100vh', 
    position: 'relative', 
    overflow: 'hidden' 
  },
  backgroundImage: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${HospitalImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.1,
    zIndex: -1
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    width: 'auto',
    // margin: '0 20px'
  },
  navbarLeft: { 
    display: 'flex', 
    gap: '10px' 
  },
  navbarRight: { 
    display: 'flex', 
    gap: '10px' 
  },
  navButton: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  appointmentsButton: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  logoutButton: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  buttonIcon: { 
    marginRight: '5px' 
  },
  sidebarContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    transition: 'width 0.3s',
    display: 'flex',
    flexDirection: 'column'
  },
  toggleButton: {
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    color: '#333'
  },
  sidebarContent: { 
    padding: '20px', 
    flex: 1, 
    overflowY: 'auto' 
  },
  hospitalHeader: { 
    textAlign: 'center', 
    marginBottom: '20px' 
  },
  hospitalTitle: { 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    color: '#333' 
  },
  hospitalDivider: { 
    height: '2px', 
    background: '#3498db', 
    margin: '10px 0' 
  },
  doctorProfile: { 
    textAlign: 'center', 
    marginBottom: '20px' 
  },
  doctorImage: { 
    width: '100px', 
    height: '100px', 
    borderRadius: '50%', 
    marginBottom: '10px' 
  },
  doctorName: { 
    fontSize: '1.2rem', 
    fontWeight: 'bold', 
    color: '#333' 
  },
  doctorDepartment: { 
    display: 'block', 
    color: '#666', 
    fontSize: '0.9rem' 
  },
  doctorId: { 
    display: 'block', 
    color: '#666', 
    fontSize: '0.9rem' 
  },
  doctorInfo: { 
    marginTop: '20px' 
  },
  infoItem: { 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '10px' 
  },
  icon: { 
    marginRight: '10px', 
    color: '#3498db' 
  },
  rightSidebar: {
    
    position: 'fixed',
    // top: '1px', // Below navbar
    right: 0,
    width: '300px',
    height: 'calc(100% - 1px)', // Adjust height to account for navbar
    backdropFilter: 'blur(5px)',
    padding: '20px',
    overflowY: 'auto'
  },
  rightSidebarHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '10px' 
  },
  rightSidebarTitle: { 
    fontSize: '1.2rem', 
    fontWeight: 'bold', 
    color: '#333' 
  },
  closeRightSidebar: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#333' 
  },
  dateText: { 
    color: '#666', 
    fontSize: '0.9rem', 
    marginBottom: '15px' 
  },
  searchContainer: { 
    position: 'relative', 
    marginBottom: '15px' 
  },
  searchIcon: { 
    position: 'absolute', 
    left: '10px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    color: '#666' 
  },
  searchInput: {
    width: '100%',
    padding: '8px 8px 8px 35px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    outline: 'none'
  },
  appointmentsList: { 
    maxHeight: 'calc(100vh - 170px)', // Adjusted for navbar and header
    overflowY: 'auto' 
  },
  appointmentCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  appointmentHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '10px' 
  },
  patientThumbnail: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    marginRight: '10px' 
  },
  appointmentHeaderText: { 
    flex: 1 
  },
  patientName: { 
    fontSize: '1rem', 
    fontWeight: 'bold', 
    margin: 0 
  },
  registrationId: { 
    fontSize: '0.8rem', 
    color: '#666' 
  },
  tokenBadge: {
    background: '#3498db',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '0.8rem'
  },
  appointmentDetails: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  appointmentTime: { 
    display: 'flex', 
    alignItems: 'center', 
    fontSize: '0.9rem' 
  },
  appointmentStatus: { 
    display: 'flex', 
    alignItems: 'center', 
    fontSize: '0.9rem' 
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  },
  modalContainer: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px',
    width: '575px', // Increased by 15% from 500px
    maxWidth: '90%',
    height: '66vh', // Increased by 10% from 60vh
    overflowY: 'hidden', // Disable scrolling
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '15px' 
  },
  closeModal: { 
    background: 'none', 
    border: 'none', 
    fontSize: '1.2rem', 
    cursor: 'pointer' 
  },
  patientDetails: { 
    display: 'flex', 
    marginBottom: '20px',
    flex: 1 
  },
  patientImageContainer: { 
    marginRight: '20px' 
  },
  patientImage: { 
    width: '80px', 
    height: '80px', 
    borderRadius: '50%' 
  },
  patientInfo: { 
    flex: 1 
  },
  patientInfoItem: { 
    marginBottom: '8px' 
  },
  infoLabel: { 
    fontWeight: 'bold', 
    marginRight: '10px' 
  },
  actionButtonsContainer: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '10px' 
  },
  actionButton: {
    flex: '1 1 calc(33.333% - 10px)',
    padding: '8px',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  },
  mainContent: { 
    flex: 1, 
    padding: '20px', 
    transition: 'margin 0.3s' 
  },
  contentArea: { 
    padding: '20px', 
    borderRadius: '10px', 
    background: 'rgba(255, 255, 255, 0.85)' 
  },
  welcomeText: { 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    marginBottom: '10px' 
  },
  subText: { 
    color: '#666', 
    marginBottom: '20px' 
  },
  statsContainer: { 
    display: 'flex', 
    gap: '20px', 
    flexWrap: 'wrap' 
  },
  statCard: {
    flex: '1 1 200px',
    padding: '20px',
    borderRadius: '10px',
    color: '#fff',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center'
  },
  errorText: { 
    color: '#F44336', 
    marginBottom: '20px' 
  },
  retryButton: {
    padding: '10px 20px',
    background: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  pendingMessage: {
    position: 'fixed',
    top: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 193, 7, 0.9)',
    color: '#333',
    padding: '10px 20px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 3000
  },
  noAppointments: { 
    textAlign: 'center', 
    color: '#666', 
    padding: '20px' 
  }
};

const getAppointmentCardStyle = (status) => {
  const styles = {
    'Completed': { borderLeft: '4px solid #4CAF50' },
    'Cancelled': { borderLeft: '4px solid #F44336' },
    'In Progress': { borderLeft: '4px solid #FF9800' },
    'Pending': { borderLeft: '4px solid #9E9E9E' },
    'Confirmed': { borderLeft: '4px solid #2196F3' }
  };
  return styles[status] || styles['Pending'];
};

export default DoctorDashboard;