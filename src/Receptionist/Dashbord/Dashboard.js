import React, { useState, useEffect, useRef } from 'react';
import { 
  BiArrowBack, 
  BiHomeAlt, 
  BiLogOut, 
  BiSearch,
  BiUserPlus,
  BiChevronRight, 
  BiChevronLeft,
  BiX,
  BiEdit,
  BiCalendar,
  BiShow,
  BiUserX,
  BiUser,
  BiCheckCircle,
  BiXCircle,BiHelpCircle,BiTime,BiCalendarCheck,BiCalendarPlus
} from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [receptionistData, setReceptionistData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientTable, setShowPatientTable] = useState(false);
  const sidebarRef = useRef();
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);
  const [watermarkIndex, setWatermarkIndex] = useState(0);
  const watermarkImages = [
    'https://img.icons8.com/color/96/000000/hospital.png',
    'https://img.icons8.com/color/96/000000/medical-doctor.png',
    'https://img.icons8.com/color/96/000000/health-checkup.png',
    'https://img.icons8.com/color/96/000000/medical-heart.png'
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    setReceptionistData(userData);
    fetchPatients();

    // Watermark animation interval
    const interval = setInterval(() => {
      setWatermarkIndex((prev) => (prev + 1) % watermarkImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('https://blueeye10.pythonanywhere.com/api/patients/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.registration_id.toString().includes(searchLower) ||
      patient.full_name.toLowerCase().includes(searchLower) ||
      (patient.phone_number && patient.phone_number.includes(searchTerm))
    );
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Handle outside click to close sidebar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);


  const styles = {
    navButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '40px',
    },
    navButtonHover: {
      filter: 'brightness(90%)',
    },
    searchInput: {
      borderRadius: '10px',
      height: '40px',
      padding: '0 10px',
      border: '1px solid #ccc',
      outline: 'none',
      width: '250px',
      transition: 'all 0.3s ease',
    },
  };
  
  return (
    <div className="d-flex" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Watermark Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: 0.05,
        background: 'cyan'

      }}>
        <img 
          src={watermarkImages[watermarkIndex]} 
          alt="watermark" 
          style={{
            width: '300px',
            height: '300px',
            objectFit: 'contain',
            transition: 'opacity 1s ease-in-out',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
      </div>

      {/* Inline CSS */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }

          .main-floating-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(45deg, rgb(68, 69, 123), rgb(9, 36, 87));
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            transition: all 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1001;
          }

          .main-floating-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
          }

          .floating-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(5px);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.4s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .floating-overlay.active {
            opacity: 1;
          }

          .floating-actions-box {
            position: relative;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            z-index: 1002;
            max-width: 800px;
            width: 90%;
            padding: 30px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }


          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            transition: all 0.8s ease;
            height: 100vh;
            overflow: hidden;
            z-index: 1000;
            background: linear-gradient(180deg,rgb(197, 209, 220),rgb(75, 82, 89));
            box-shadow: 5px 0 15px rgba(0,0,0,0.2);
            color: white;
          }
          .sidebar-expanded {
            width: 280px;
          }
          .sidebar-collapsed {
            width: 15px;
          }
          .toggle-btn {
            position: absolute;
            top: 50%;
            right: -15px;
            transform: translateY(-50%);
            z-index: 1050;
            border-radius: 50%;
            padding: 8px;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .toggle-btn:hover {
            transform: translateY(-50%) scale(1.1);
          }
          .patient-photo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }
          .address-cell {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .action-btn {
            padding: 0.25rem 0.5rem;
            margin: 0 2px;
          }
          .navbar-fixed {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 999;
            transition: left 0.3s ease;
            height: 90px;
            background: linear-gradient(180deg,rgb(244, 245, 245),rgb(186, 198, 211));
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }
          .navbar-expanded {
            left: 280px;
            right: 0;
          }
          .navbar-collapsed {
            left: 0;
            right: 0;
          }
          .table-container {
            max-height: 480px;
            overflow-y: auto;
            position: relative;
          }
          .table-container thead {
            position: sticky;
            top: 0;
            background-color: #fff;
            z-index: 1;
          }
          .logout-btn {
            background: linear-gradient(135deg,rgb(145, 38, 38),rgb(207, 190, 190));
            color: white;
            border: none;
            transition: all 0.3s ease;
          }
          .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
          }
          .sidebar-content {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .sidebar-header {
            font-weight: 700;
            color: white;
            margin-bottom: 30px;
            text-align: center;
            font-size: 1.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .sidebar-details {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.1);
          }
          .sidebar-contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-size: 0.9rem;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .sidebar-contact-item i {
            margin-right: 10px;
            min-width: 20px;
            text-align: center;
            color: #4ECDC4;
          }
          .hospital-quote {
            background: rgba(255,255,255,0.1);
            border-left: 3px solid #4ECDC4;
            padding: 15px;
            margin-top: 25px;
            font-style: italic;
            border-radius: 0 8px 8px 0;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .status-active {
            color: #28a745;
            background-color: rgba(40, 167, 69, 0.1);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
          }
          .status-inactive {
            color: #dc3545;
            background-color: rgba(220, 53, 69, 0.1);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
          }

          @media (max-width: 992px) {
            .sidebar-expanded {
              width: 250px;
            }
            .navbar-expanded {
              left: 250px;
            }
            .vibrant-actions .action-btn {
              padding: 15px 20px;
              font-size: 0.9rem;
            }
          }

          @media (max-width: 768px) {
            .sidebar-expanded {
              width: 0;
              position: absolute;
            }
            .navbar-expanded, .navbar-collapsed {
              left: 0;
            }
            .floating-actions-box {
              grid-template-columns: 1fr;
              padding: 20px;
            }
            .search-container {
              width: 100%;
              margin-left: 0 !important;
            }
            .navbar-buttons {
              display: none;
            }
            .mobile-menu-btn {
              display: block !important;
            }
          }

          @media (max-width: 576px) {
            .vibrant-actions .action-btn {
              min-width: 100%;
              padding: 12px 15px;
              font-size: 0.85rem;
            }
            .action-btn i {
              font-size: 1.1rem;
              margin-right: 8px;
            }
            .main-floating-btn {
              width: 50px;
              height: 50px;
            }
          }

          .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: #4ECDC4;
            font-size: 1.5rem;
            margin-right: 15px;
          }

          .mobile-menu-container {
            position: fixed;
            bottom: 80px;
            left: 0;
            right: 0;
            background: white;
            padding: 15px;
            box-shadow: 0 -5px 15px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-around;
            z-index: 1000;
          }

          .mobile-menu-btn.active {
            color: #FF6B6B;
          }

              .action-card {
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 10px;
    }
    
    .action-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .action-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      flex-shrink: 0;
    }
    
    .action-content h6 {
      margin-bottom: 5px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .action-content p {
      margin: 0;
      font-size: 0.8rem;
      color: #718096;
    }
    
    .floating-actions-box {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 800px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    @media (max-width: 768px) {
      .floating-actions-box {
        grid-template-columns: 1fr;
      }
    }
        `}
      </style>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar-container ${
          isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'
        }`}
      >
        {/* Toggle Button */}
        <button
          className="toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <BiChevronLeft size={24} color="#2c3e50" /> : <BiChevronRight size={24} color="#2c3e50" />}
        </button>

        {isSidebarOpen && (
          <div className="sidebar-content">
            <div className="sidebar-header"  style={{ marginTop: '-5px'}}>
              <h4>MediCare Hospital</h4>
            </div>
            <div className="d-flex flex-column align-items-center text-center mb-4">
              <img
                src={
                  receptionistData?.image
                    ? `https://blueeye10.pythonanywhere.com${receptionistData.image}`
                    : 'https://ui-avatars.com/api/?background=4ECDC4&color=fff&name=' + (receptionistData?.first_name || 'R')
                }
                alt="Receptionist"
                className="rounded-circle mb-2"
                style={{ width: '140px', height: '140px', objectFit: 'cover', border: '3px solid rgb(3, 140, 131)' ,marginTop: '-25px'}}
              />
              <h5 className="mb-1" style={{ color: ' rgb(3, 140, 131' }}>{receptionistData?.first_name} {receptionistData?.last_name}</h5>
              <small className="text-muted">Receptionist ID: REC00{receptionistData?.rec_id}</small>
            </div>

            <div className="sidebar-details" style={{ marginTop: '-10px',marginLeft: '-10px',marginRight: '-10px'}}>
              <div className="sidebar-contact-item" >
                <i className="bi bi-geo-alt-fill"></i>
                <span>123 Health Street, Medical City, PIN 560001</span>
              </div>
              <div className="sidebar-contact-item">
                <i className="bi bi-envelope-fill"></i>
                <span>info@medicarehospital.com</span>
              </div>
              <div className="sidebar-contact-item">
                <i className="bi bi-telephone-fill"></i>
                <span>+91 80 2222 1111 (Main)</span>
              </div>
              <div className="sidebar-contact-item">
                <i className="bi bi-globe"></i>
                <span>www.medicarehospital.in</span>
              </div>
              
              <div className="hospital-quote" style={{ marginTop: '-8px'}}>
                <p className="mb-0">
                  <i className="bi bi-quote" style={{ color: '#4ECDC4' }}></i> 
                  <em>MediCare Hospital - Where compassion meets cutting-edge care. Our commitment to your health is unwavering, with a legacy of trust spanning three decades.</em>
                  <i className="bi bi-quote" style={{ color: '#4ECDC4' }}></i>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ 
        marginLeft: isSidebarOpen ? '280px' : '0', 
        transition: 'margin 0.4s ease',
        paddingBottom: '80px' // Space for mobile menu
      }}>
      {/* Navbar */}
      <nav
        className={`navbar navbar-expand-lg navbar-light px-3 navbar-fixed ${
          isSidebarOpen ? 'navbar-expanded' : 'navbar-collapsed'
        }`}
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: '0',
          zIndex: '999',
          marginBottom: '-70px'
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Left Section - Back, Home, Search */}
          <div className="d-flex align-items-center gap-3">
            <button
              style={{
                ...styles.navButton,
                background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
              }}
              onClick={() => navigate(-1)}
              onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(90%)')}
              onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <BiArrowBack size={18} />
              Back
            </button>

            <button
              style={{
                ...styles.navButton,
                background: 'linear-gradient(135deg, #4CAF50 0%, rgb(175, 227, 178) 100%)',
              }}
              onClick={() => navigate('/')}
              onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(90%)')}
              onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <BiHomeAlt size={18} />
              Home
            </button>

            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowPatientTable(true)}
              style={styles.searchInput}
            />
          </div>

          {/* Right Section - Action Buttons */}
          <div className="d-flex align-items-center gap-3">
            <button
              style={{
                ...styles.navButton,
                background: 'linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)',
              }}
              onClick={() => navigate('/patient_registration')}
              onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(90%)')}
              onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <BiUserPlus size={18} />
              New Patient
            </button>

            <button
              style={{
                ...styles.navButton,
                background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              }}
              onClick={() => navigate('/appointment-booking')}
              onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(90%)')}
              onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <BiCalendar size={18} />
              Appointment
            </button>

            <button
              style={{
                ...styles.navButton,
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              }}
              onClick={handleLogout}
              onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(90%)')}
              onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <BiLogOut size={18} />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn d-lg-none"
              onClick={() => setIsActive(!isActive)}
              style={{ background: 'transparent', border: 'none', fontSize: '24px' }}
            >
              <i className={`bi ${isActive ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>
      </nav>


{/* Floating Action Button */}
<div
  ref={containerRef}
  className="floating-container"
  style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999 }}
>
  <div
    className="main-floating-btn"
    onClick={() => setIsActive((prev) => !prev)}
    style={{
      background: 'linear-gradient(135deg, rgb(11, 27, 100) 0%, #764ba2 100%)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    }}
  >
    <i className={`bi ${isActive ? 'bi-x-lg' : 'bi-plus-lg'} text-white fs-4`}></i>
  </div>
</div>

{/* Floating Actions Overlay */}
{isActive && (
  <div
    className="floating-overlay active"
    style={{ pointerEvents: 'auto', zIndex: 1000 }}
    onClick={(e) => {
      if (e.target.classList.contains('floating-overlay')) {
        setIsActive(false);
      }
    }}
  >
    <div className="floating-actions-box">
      {/* View All Appointments */}
      
      <div
        className="action-card"
        onClick={(e) => {
          e.stopPropagation(); // Prevent overlay click
          navigate('/appointments/list');
          setIsActive(false);
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderLeft: '4px solid #667eea',
        }}
      >
        <div className="action-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <BiCalendar size={24} className="text-white" />
        </div>
        <div className="action-content">
          <h6>View All Appointments</h6>
          <p>See all scheduled appointments</p>
        </div>
      </div>

      {/* Book Appointment */}
      <div
        className="action-card"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/appointment-booking');
          setIsActive(false);
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(58, 201, 169, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
          borderLeft: '4px solid #3ac9a9',
        }}
      >
        <div className="action-icon" style={{ background: 'linear-gradient(135deg, #3ac9a9 0%, #34d399 100%)' }}>
          <BiCalendarPlus size={24} className="text-white" />
        </div>
        <div className="action-content">
          <h6>Book Appointment</h6>
          <p>Schedule a new appointment</p>
        </div>
      </div>

      {/* Marked Appointments */}
      <div
        className="action-card"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/appointments/marked');
          setIsActive(false);
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
          borderLeft: '4px solid #fbbf24',
        }}
      >
        <div className="action-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
          <BiCalendarCheck size={24} className="text-white" />
        </div>
        <div className="action-content">
          <h6>Marked Appointments</h6>
          <p>View completed appointments</p>
        </div>
      </div>

      {/* View All Doctors */}
      <div
        className="action-card"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/view-doctors');
          setIsActive(false);
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
          borderLeft: '4px solid #ec4899',
        }}
      >
        <div className="action-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
          <BiUserPlus size={24} className="text-white" />
        </div>
        <div className="action-content">
          <h6>View All Doctors</h6>
          <p>See available doctors</p>
        </div>
      </div>
    </div>
  </div>
)}

{/* Dashboard Content */}
<main className="p-3 p-md-4" style={{ 
  marginTop: '80px',
  marginLeft: isSidebarOpen ? '1px' : '0',
  transition: 'margin 0.3s ease',
  width: isSidebarOpen ? 'calc(100% - 1px)' : '100%'
}}>
  {showPatientTable && (
    <div className="card mb-4 border-0" style={{
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="card-header d-flex justify-content-between align-items-center py-2 px-3" style={{
        background: 'linear-gradient(135deg,rgb(161, 172, 223) 0%,rgb(73, 69, 78) 100%)',
        color: 'white',
        borderBottom: 'none'
      }}>
        <h5 className="mb-0 fs-6 fw-semibold">
          <i className="bi bi-people-fill me-2"></i> Patient List
        </h5>
        <button
          className="btn btn-sm btn-light p-1"
          onClick={() => setShowPatientTable(false)}
          style={{ borderRadius: '50%', width: '28px', height: '28px' }}
        >
          <BiX size={16} />
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive table-container" style={{ maxHeight: '500px' }}>
          <table className="table table-sm table-hover mb-0 align-middle">
            <thead style={{
              background: 'linear-gradient(135deg,rgb(59, 101, 163) 0%, #e4e8f0 100%)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <tr>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>No</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>MRNO</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Photo</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Name</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Phone</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Gender</th>
                <th className="py-2 px-2" style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: '600',
                  maxWidth: '120px'
                }}>Address</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Status</th>
                <th className="py-2 px-2" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient, index) => (
                  <tr key={patient.id} style={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
                    fontSize: '0.85rem'
                  }}>
                    <td className="py-2 px-2">{index + 1}</td>
                    <td className="py-2 px-2 fw-medium">
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {patient.registration_id.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      {patient.image ? (
                        <img
                          src={`https://blueeye10.pythonanywhere.com${patient.image}`}
                          alt="Patient"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center" style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#f0f2f5'
                        }}>
                          <BiUser size={16} />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2 fw-medium text-nowrap">{patient.full_name}</td>
                    <td className="py-2 px-2 text-nowrap">{patient.phone_number || 'N/A'}</td>
                    <td className="py-2 px-2">
                      <span className={`badge ${
                        patient.gender === 'M' ? 'bg-info bg-opacity-10 text-info' : 
                        patient.gender === 'F' ? 'bg-light bg-opacity-10 text-danger' : 
                        'bg-secondary bg-opacity-10 text-secondary'
                      }`}>
                        {patient.gender === 'M' ? 'Male' : 
                        patient.gender === 'F' ? 'Female' : 'Other'}
                      </span>
                    </td>
                    <td className="py-2 px-2" style={{
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={patient.address || 'N/A'}>
                      {patient.address || 'N/A'}
                    </td>
                    <td className="py-2 px-2">
  <span className={`badge ${
    patient.patient_status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 
    patient.patient_status === 'Inactive' ? 'bg-danger bg-opacity-10 text-danger' :
    patient.patient_status === 'Pending' ? 'bg-warning bg-opacity-10 text-warning' :
    'bg-secondary bg-opacity-10 text-secondary'
  } d-flex align-items-center`}>
    {patient.patient_status === 'Active' ? (
      <>
        <BiCheckCircle className="me-1" size={14} /> Active
      </>
    ) : patient.patient_status === 'Inactive' ? (
      <>
        <BiXCircle className="me-1" size={14} /> Inactive
      </>
    ) : patient.patient_status === 'Pending' ? (
      <>
        <BiTime className="me-1" size={14} /> Pending
      </>
    ) : (
      <>
        <BiHelpCircle className="me-1" size={14} /> {patient.patient_status || 'Unknown'}
      </>
    )}
  </span>
</td>
                    <td className="py-2 px-2">
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center"
                          onClick={() => navigate(`/edit-patient/${patient.patient_id}`)}
                          title="Edit"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <BiEdit size={14} className="me-1" />
                          <span className="d-none d-md-inline">Edit</span>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2 d-flex align-items-center"
                          onClick={() => navigate('/appointment-booking', { state: { patient } })}
                          title="Book"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <BiCalendar size={14} className="me-1" />
                          <span className="d-none d-md-inline">Book</span>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info py-1 px-2 d-flex align-items-center"
                          onClick={() => navigate(`/patient/${patient.patient_id}`)}
                          title="View"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <BiShow size={14} className="me-1" />
                          <span className="d-none d-md-inline">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    <div className="d-flex flex-column align-items-center justify-content-center py-3">
                      <BiSearch size={32} className="mb-2 opacity-50" />
                      <h6 className="mb-1">No patients found</h6>
                      <small>Try adjusting your search query</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
  {children}
</main>
      </div>
    </div>
  );
};

export default DashboardLayout;