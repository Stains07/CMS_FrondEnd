import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BiArrowBack, // Navbar: Back button
  BiHomeAlt,   // Navbar: Home button
  BiLogOut,    // Navbar: Logout button
  BiTestTube,  // Sidebar/Card: Manage Lab Tests
  BiFile,      // Sidebar/Card: View Test Requests
  BiUpload,    // Sidebar/Card: Upload Test Reports
  BiVial,      // Stat: Total Tests
  BiCalendar,  // Stat: Today's Tests
  BiHourglass, // Stat: Pending Tests
  BiCheckCircle, // Stat: Completed Tests
  BiChevronLeft, // Sidebar: Toggle closed
  BiChevronRight // Sidebar: Toggle open
} from 'react-icons/bi';
import HospitalImage from './Lab.jpg'; // Adjust path to match your project

const LabTechnicianDashboard = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [labTechnicianData, setLabTechnicianData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [totalTests, setTotalTests] = useState(0);
  const [todaysTests, setTodaysTests] = useState(0);
  const [pendingTests, setPendingTests] = useState(0);
  const [completedTests, setCompletedTests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('labUserData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.data && parsedData.data.labtechnician) {
          setLabTechnicianData(parsedData.data.labtechnician);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Failed to load technician data');
      }
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('https://blueeye10.pythonanywhere.com/api/lab/labtest/dashboard-stats/');
      const { totalTests, todaysTests, pendingTests, completedTests } = response.data;
      setTotalTests(totalTests || 0);
      setTodaysTests(todaysTests || 0);
      setPendingTests(pendingTests || 0);
      setCompletedTests(completedTests || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to fetch dashboard statistics');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('labUserData');
    navigate('/');
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

  // Loading state
  if (loading) {
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
        right: '20px',
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transition: 'left 0.3s'
      }}>
        <div style={styles.navbarLeft}>
          <button 
            style={{...styles.navButton, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)'}} 
            onClick={() => navigate(-1)}
          >
            <BiArrowBack size={18} />
            Back
          </button>
          <button 
            style={{...styles.navButton, background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'}} 
            onClick={() => navigate('/lab-technician-dashboard')}
          >
            <BiHomeAlt size={18} />
            Home
          </button>
        </div>
        <div style={styles.navbarRight}>
          <button 
            style={{...styles.logoutButton, background: 'linear-gradient(135deg, #e74c3c 0%, #ec7063 100%)'}} 
            onClick={handleLogout}
          >
            <BiLogOut style={styles.buttonIcon} />
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{
          ...styles.sidebarContainer,
          width: isSidebarOpen ? '280px' : '60px',
          background: isSidebarOpen 
            ? 'linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(147, 197, 253, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(191, 219, 254, 0.9) 0%, rgba(125, 211, 252, 0.9) 100%)',
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

        {isSidebarOpen ? (
          <div style={styles.sidebarContent}>
            <div style={styles.hospitalHeader}>
              <h4 style={styles.hospitalTitle}>MediCare Laboratory</h4>
              <div style={styles.hospitalDivider}></div>
            </div>
            {labTechnicianData && (
              <div style={styles.technicianProfile}>
                <img
                  src={labTechnicianData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(labTechnicianData.name || 'T')}`}
                  alt="Lab Technician"
                  style={styles.technicianImage}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(labTechnicianData.name || 'T')}`;
                  }}
                />
                <h5 style={styles.technicianName}>{labTechnicianData.name || 'Lab Technician'}</h5>
                <small style={styles.technicianId}>ID: TECH{labTechnicianData.lab_tech_id?.toString().padStart(2, '0') || '00'}</small>
              </div>
            )}
            <div style={styles.navMenu}>
              <button
                style={styles.navItem}
                onClick={() => navigate('/lab-test-management')}
              >
                <BiTestTube style={styles.navIcon} />
                Manage Lab Tests
              </button>
              <button
                style={styles.navItem}
                onClick={() => navigate('/labtest-prescriptions')}
              >
                <BiFile style={styles.navIcon} />
                View Test Requests
              </button>
              <button
                style={styles.navItem}
                onClick={() => navigate('/labtechnition/upload-report')}
              >
                <BiUpload style={styles.navIcon} />
                Upload Test Reports
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.sidebarContentClosed}>
            <div style={styles.navMenu}>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/lab-test-management')}
                title="Manage Lab Tests"
              >
                <BiTestTube size={24} />
              </button>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/labtest-prescriptions')}
                title="View Test Requests"
              >
                <BiFile size={24} />
              </button>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/labtechnition/upload-report')}
                title="Upload Test Reports"
              >
                <BiUpload size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? '280px' : '60px',
        marginTop: '80px'
      }}>
        <div style={styles.contentArea}>
          <h3 style={styles.welcomeText}>Welcome, {labTechnicianData?.name?.split(' ')[0] || 'Lab Technician'}</h3>
          <p style={styles.subText}>Manage your laboratory operations efficiently</p>

          {/* Stat Cards */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <BiVial size={40} style={{ marginBottom: '10px', color: '#2196F3' }} />
              <h4>Total Tests</h4>
              <h3>{totalTests}</h3>
            </div>
            <div style={styles.statCard}>
              <BiCalendar size={40} style={{ marginBottom: '10px', color: '#4CAF50' }} />
              <h4>Today's Tests</h4>
              <h3>{todaysTests}</h3>
            </div>
            <div style={styles.statCard}>
              <BiHourglass size={40} style={{ marginBottom: '10px', color: '#FF9800' }} />
              <h4>Pending Tests</h4>
              <h3>{pendingTests}</h3>
            </div>
            <div style={styles.statCard}>
              <BiCheckCircle size={40} style={{ marginBottom: '10px', color: '#9C27B0' }} />
              <h4>Completed Tests</h4>
              <h3>{completedTests}</h3>
            </div>
          </div>

          {/* Action Cards */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <h4>Manage Lab Tests</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)'}}
                onClick={() => navigate('/lab-test-management')}
              >
                <BiTestTube size={16} />
                Go to Lab Tests
              </button>
            </div>
            <div style={styles.statCard}>
              <h4>View Test Requests</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'}}
                onClick={() => navigate('/labtest-prescriptions')}
              >
                <BiFile size={16} />
                View Requests
              </button>
            </div>
            <div style={styles.statCard}>
              <h4>Upload Test Reports</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'}}
                onClick={() => navigate('/labtechnition/upload-report')}
              >
                <BiUpload size={16} />
                Upload Reports
              </button>
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
    margin: '0 20px'
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
  sidebarContentClosed: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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
  technicianProfile: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  technicianImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    marginBottom: '10px'
  },
  technicianName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333'
  },
  technicianId: {
    display: 'block',
    color: '#666',
    fontSize: '0.9rem'
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  navItem: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background 0.2s'
  },
  navItemClosed: {
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    background: 'none',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center'
  },
  navIcon: {
    marginRight: '10px'
  },
  mainContent: {
    flex: 1,
    padding: '20px',
    transition: 'margin 0.3s'
  },
  contentArea: {
    padding: '20px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(5px)'
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
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  statCard: {
    flex: '1 1 200px',
    padding: '20px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(5px)',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  actionButton: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '10px'
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
  }
};

export default LabTechnicianDashboard;