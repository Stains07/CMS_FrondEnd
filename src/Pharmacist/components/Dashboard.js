import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BiArrowBack, // Navbar: Back button
  BiHomeAlt,   // Navbar: Home button
  BiLogOut,    // Navbar: Logout button
//   BiPills,     // Sidebar/Card: Manage Medicines
  BiFile,      // Sidebar/Card: View Prescriptions
  BiBox,       // Sidebar/Card: Manage Stock
  BiReceipt,   // Sidebar/Card: Manage Bills
  BiChevronLeft, // Sidebar: Toggle closed
  BiChevronRight // Sidebar: Toggle open
} from 'react-icons/bi';
import HospitalImage from './Pharmacy.jpg'; // Adjust path to match your project

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [pharmacistData, setPharmacistData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.data && parsedData.data.pharmacist) {
          setPharmacistData(parsedData.data.pharmacist);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
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
            onClick={() => navigate('/pharmacist-dashboard')}
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
              <h4 style={styles.hospitalTitle}>MediCare Pharmacy</h4>
              <div style={styles.hospitalDivider}></div>
            </div>
            {pharmacistData && (
              <div style={styles.pharmacistProfile}>
                <img
                  src={pharmacistData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(pharmacistData.name || 'P')}`}
                  alt="Pharmacist"
                  style={styles.pharmacistImage}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pharmacistData.name || 'P')}`;
                  }}
                />
                <h5 style={styles.pharmacistName}>{pharmacistData.name || 'Pharmacist'}</h5>
                <small style={styles.pharmacistId}>ID: PHARM{pharmacistData.pharm_id?.toString().padStart(2, '0') || '00'}</small>
                {/* {pharmacistData.qualification && (
                  <small style={styles.pharmacistQualification}>{pharmacistData.qualification}</small>
                )} */}
              </div>
            )}
            <div style={styles.navMenu}>
              <button
                style={styles.navItem}
                onClick={() => navigate('/manage-medicines')}
              >
                <BiFile style={styles.navIcon} />
                Manage Medicines
              </button>
              <button
                style={styles.navItem}
                onClick={() => navigate('/view-prescriptions')}
              >
                <BiFile style={styles.navIcon} />
                 Prescriptions
              </button>
              <button
                style={styles.navItem}
                onClick={() => navigate('/manage-stock')}
              >
                <BiBox style={styles.navIcon} />
                Manage Stock
              </button>
              <button
                style={styles.navItem}
                onClick={() => navigate('/manage-bills')}
              >
                <BiReceipt style={styles.navIcon} />
                Manage Bills
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.sidebarContentClosed}>
            <div style={styles.navMenu}>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/manage-medicines')}
                title="Manage Medicines"
              >
                <BiFile size={24} />
              </button>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/view-prescriptions')}
                title="View Prescriptions"
              >
                <BiFile size={24} />
              </button>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/manage-stock')}
                title="Manage Stock"
              >
                <BiBox size={24} />
              </button>
              <button
                style={styles.navItemClosed}
                onClick={() => navigate('/manage-bills')}
                title="Manage Bills"
              >
                <BiReceipt size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? '280px' : '30px',
        marginTop: '80px'
      }}>
        <div style={styles.contentArea}>
          <h3 style={styles.welcomeText}>Welcome, {pharmacistData?.name?.split(' ')[0] || 'Pharmacist'}</h3>
          <p style={styles.subText}>Manage your pharmacy operations efficiently</p>

          {/* Dashboard Cards */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <h4>Manage Medicines</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)'}}
                onClick={() => navigate('/manage-medicines')}
              >
                <BiFile size={16} />
                Go to Medicines
              </button>
            </div>
            <div style={styles.statCard}>
              <h4>View Prescriptions</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'}}
                onClick={() => navigate('/view-prescriptions')}
              >
                <BiFile size={16} />
                 Prescriptions
              </button>
            </div>
            <div style={styles.statCard}>
              <h4>Manage Stock</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'}}
                onClick={() => navigate('/manage-stock')}
              >
                <BiBox size={16} />
                Manage Stock
              </button>
            </div>
            {/* <div style={styles.statCard}>
              <h4>Manage Bills</h4>
              <button
                style={{...styles.actionButton, background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'}}
                onClick={() => navigate('/manage-bills')}
              >
                <BiReceipt size={16} />
                Manage Bills
              </button>
            </div> */}
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
  pharmacistProfile: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  pharmacistImage: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    marginBottom: '10px'
  },
  pharmacistName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333'
  },
  pharmacistId: {
    display: 'block',
    color: '#666',
    fontSize: '0.9rem'
  },
  pharmacistQualification: {
    display: 'block',
    color: '#3498db',
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
    flexWrap: 'wrap'
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
    marginTop: '10px',
    marginLeft: '40px'
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
  }
};

export default PharmacistDashboard;