import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import * as bootstrap from 'bootstrap'; // Proper import


// Import images
import HosLogo from './images/HosLogo.jpg';
import DoctorsGroup from './images/DoctorsGroup.jpg';
import Sniped from './images/sniped.jpg';
import BackgroundImage from './images/422438.jpg';
import DocImage from './images/doc.jpg';
import reception5 from './images/reception5.jpg';
import Theater from './images/422438.jpg';
import Doc1 from './images/Doctor pic8.jpg';
import Doc2 from './images/Doctor pic5.jpg';



const HospitalWebsite = () => {
  useEffect(() => {
    // Initialize Bootstrap components
    const initializeBootstrap = () => {
 // Initialize all dropdowns
 const dropdowns = Array.from(document.querySelectorAll('.dropdown-toggle'))
 .filter(el => !el.classList.contains('exclude-bootstrap'));
dropdowns.forEach(dropdown => {
 new bootstrap.Dropdown(dropdown);
});

// Initialize carousel
const carousel = new bootstrap.Carousel('#hospitalSlider', {
 interval: 5000,
 wrap: true
});

return () => carousel.dispose();
};
    // Scroll animation
    const checkScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', checkScroll);
    checkScroll();
    initializeBootstrap();

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  // ... rest of the component remains the same ...

  return (
    <div>
      {/* Top Contact Bar */}
      <div className="top-contact-bar">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <i className="bi bi-geo-alt-fill"></i> Medical College PO, Thiruvananthapuram, Kerala 695011
            </div>
            <div className="col-md-6 text-end">
              <span className="me-4">
                <i className="bi bi-telephone-fill"></i> +91 9074472372
              </span>
              <span>
                <i className="bi bi-ambulance"></i> Ambulance: +91 9633009616
              </span>
            </div>
          </div>
        </div>
      </div>

{/* Navbar */}
<nav className="navbar navbar-expand-lg navbar-dark shadow-lg sticky-top" 
     style={{ 
       backgroundColor: 'rgba(48, 45, 45, 0.8)', 
       backdropFilter: 'blur(10px)',
       borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
     }}>
  <div className="container">
    <a className="navbar-brand" href="#">
      <img src={HosLogo} alt="Hospital Logo" height="70" />
    </a>
    <h1 className="text-light mb-0"><b>MediCare</b></h1>

    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        {/* ... other nav items ... */}

        {/* Departments Dropdown */}
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" 
             href="#" 
             role="button" 
             data-bs-toggle="dropdown" 
             aria-expanded="false">
            <i className="bi bi-heart-pulse me-1"></i>Departments
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-heart text-danger me-2"></i>Cardiology
            </a></li>
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-brain text-info me-2"></i>Neurology
            </a></li>
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-bone text-warning me-2"></i>Orthopedics
            </a></li>
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-eye text-success me-2"></i>Ophthalmology
            </a></li>
          </ul>
        </li>

        {/* Social Media Dropdown */}
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" 
             href="#" 
             role="button" 
             data-bs-toggle="dropdown" 
             aria-expanded="false">
            <i className="bi bi-people me-1"></i>Connect
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-facebook text-primary me-2"></i>Facebook
            </a></li>
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-twitter text-info me-2"></i>Twitter
            </a></li>
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-instagram text-danger me-2"></i>Instagram
            </a></li>
            <li><a className="dropdown-item d-flex align-items-center" href="#">
              <i className="bi bi-linkedin text-primary me-2"></i>LinkedIn
            </a></li>
          </ul>
        </li>

        {/* ... remaining nav items ... */}
        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="bi bi-info-circle me-1"></i>About
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="bi bi-telephone me-1"></i>Contact
          </a>
        </li>

         {/* Services Dropdown - Now using Bootstrap structure */}
         <li className="nav-item dropdown position-static">
  <a
    className="nav-link dropdown-toggle"
    href="#"
    id="servicesDropdown"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i className="bi bi-grid me-1"></i>Services
  </a>

  <div
    className="dropdown-menu dropdown-menu-end p-3"
    aria-labelledby="servicesDropdown"
    style={{
      width: '420px',
      maxHeight: '80vh',
      overflowY: 'auto',
      borderRadius: '10px',
    }}
    onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing on click inside
  >
    <div className="row g-2">
      {[
        { name: 'Faculty Login', icon: 'bi-person-badge', color: 'primary' },
        { name: 'Patient Registration', icon: 'bi-clipboard-plus', color: 'success' },
        { name: 'Patient Login', icon: 'bi-door-open', color: 'info' },
        { name: 'Carriers', icon: 'bi-briefcase', color: 'warning' },
        { name: 'Appointment Booking', icon: 'bi-calendar-check', color: 'danger' },
        { name: 'Ambulance Service', icon: 'bi-ambulance', color: 'dark' },
        { name: 'Emergency', icon: 'bi-exclamation-triangle', color: 'danger' },
        { name: 'Book Lab Test', icon: 'bi-vial', color: 'primary' },
        { name: 'Online Medicine', icon: 'bi-capsule', color: 'success' },
      ].map((service, index) => (
        <div key={index} className="col-6">
          <a
            className="dropdown-item d-flex align-items-center p-3 hover-scale"
            href="#"
            style={{
              borderRadius: '10px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <i className={`bi ${service.icon} fs-5 text-${service.color} me-3`}></i>
            <span>{service.name}</span>
          </a>
        </div>
      ))}
    </div>
  </div>
</li>



      </ul>
    </div>
  </div>
</nav>
       





     {/* Image Slider */}
<div id="hospitalSlider" className="carousel slide hospital-slider" data-bs-ride="carousel">
  <div className="carousel-indicators">
    {[0, 1, 2, 3, 4].map((index) => (
      <button 
        key={index} 
        type="button" 
        data-bs-target="#hospitalSlider" 
        data-bs-slide-to={index} 
        className={index === 0 ? 'active' : ''}
      ></button>
    ))}
  </div>
  
  <div className="carousel-inner">
    {/* Slide 1 */}
    <div className="carousel-item active">
      <img src={DoctorsGroup} className="d-block w-100" alt="Medical Team" />
      <div className="carousel-caption d-none d-md-block">
        <h3>World-Class Medical Facilities</h3>
        <p>500+ Bed Multi-Specialty Hospital</p>
      </div>
    </div>

    {/* Slide 2 */}
    <div className="carousel-item">
      <img src={Sniped} className="d-block w-100" alt="Advanced Equipment" />
      <div className="carousel-caption d-none d-md-block">
        <h3>World-Class Medical Facilities</h3>
        <p>500+ Bed Multi-Specialty Hospital</p>
      </div>
    </div>

    {/* Slide 3 */}
    <div className="carousel-item">
      <img src={BackgroundImage} className="d-block w-100" alt="Emergency Care" />
      <div className="carousel-caption d-none d-md-block">
        <h3>World-Class Medical Facilities</h3>
        <p>500+ Bed Multi-Specialty Hospital</p>
      </div>
    </div>

    {/* Slide 4 - Add your 4th image import and use here */}
    <div className="carousel-item">
      <img src={reception5} className="d-block w-100" alt="Operation Theater" />
      <div className="carousel-caption d-none d-md-block">
        <h3>World-Class Medical Facilities</h3>
        <p>500+ Bed Multi-Specialty Hospital</p>
      </div>
    </div>

    {/* Slide 5 - Add your 5th image import and use here */}
    <div className="carousel-item">
      <img src={Theater} className="d-block w-100" alt="Patient Care" />
      <div className="carousel-caption d-none d-md-block">
        <h3>World-Class Medical Facilities</h3>
        <p>500+ Bed Multi-Specialty Hospital</p>
      </div>
    </div>
  </div>
  
  <button className="carousel-control-prev" type="button" data-bs-target="#hospitalSlider" data-bs-slide="prev">
    <span className="carousel-control-prev-icon"></span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#hospitalSlider" data-bs-slide="next">
    <span className="carousel-control-next-icon"></span>
  </button>
</div>



{/* Paragraph Slideshow */}
<section className="py-5 bg-light">
  <div className="container">
    <div id="textCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {/* Slide 1 */}
        <div className="carousel-item active">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="slide-content p-4 rounded-3 shadow-sm bg-white">
                <i className="bi bi-heart-pulse display-4 text-primary mb-4"></i>
                <h3 className="mb-3">Advanced Medical Technology</h3>
                <p className="lead text-muted">
                  At MediCare, we combine cutting-edge technology with compassionate care. 
                  Our state-of-the-art facilities feature robotic surgery systems, 
                  advanced imaging diagnostics, and AI-powered treatment planning 
                  to ensure precision in every procedure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className="carousel-item">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="slide-content p-4 rounded-3 shadow-sm bg-white">
                <i className="bi bi-people display-4 text-success mb-4"></i>
                <h3 className="mb-3">Expert Medical Team</h3>
                <p className="lead text-muted">
                  Our team of 200+ specialists includes internationally trained surgeons, 
                  researchers, and healthcare professionals. With an average of 15 years' 
                  experience, our staff maintains a 98% patient satisfaction rate through 
                  personalized care plans.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 3 */}
        <div className="carousel-item">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="slide-content p-4 rounded-3 shadow-sm bg-white">
                <i className="bi bi-clock-history display-4 text-danger mb-4"></i>
                <h3 className="mb-3">24/7 Emergency Care</h3>
                <p className="lead text-muted">
                  Our emergency department operates round-the-clock with a guaranteed 
                  response time under 5 minutes. Featuring a dedicated trauma center, 
                  cardiac care unit, and pediatric emergency wing, we're prepared for 
                  any medical crisis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 4 */}
        <div className="carousel-item">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="slide-content p-4 rounded-3 shadow-sm bg-white">
                <i className="bi bi-shield-check display-4 text-warning mb-4"></i>
                <h3 className="mb-3">Patient Safety First</h3>
                <p className="lead text-muted">
                  We maintain the highest international safety standards with 
                  ISO-certified sterilization protocols, AI-powered medication 
                  management, and real-time patient monitoring systems. Our 
                  infection control rate exceeds 99.8% - among the best globally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button className="carousel-control-prev" type="button" data-bs-target="#textCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#textCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>

      {/* Indicators */}
      <div className="carousel-indicators position-static mt-4">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#textCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active bg-dark' : 'bg-secondary'}
            aria-current={index === 0 ? 'true' : 'false'}
            style={{width: '12px', height: '12px', borderRadius: '50%'}}
          ></button>
        ))}
      </div>
    </div>
  </div>
</section>



 {/* Doctor Profiles */}
<section className="py-5 bg-light">
  <div className="container">
    <h2 className="text-center mb-5 section-heading">Our Leading Specialists</h2>
    
    <div className="row g-4">
      {[
        { 
          img: DocImage, 
          specialty: 'Cardiology', 
          name: 'Dr. John Doe', 
          qualification: 'MD, DM Cardiology', 
          description: 'With over 15 years of experience in interventional cardiology. Expert in angioplasty and pacemaker implantation.' 
        },
        { 
          img: Doc1, 
          specialty: 'Neurology', 
          name: 'Dr. Jane Smith', 
          qualification: 'DM Neurology', 
          description: 'Specialist in stroke management and neurodegenerative disorders. 12+ years of clinical experience.' 
        },
        { 
          img: Doc2, 
          specialty: 'Orthopedics', 
          name: 'Dr. Michael Johnson', 
          qualification: 'MS Orthopedics', 
          description: 'Expert in joint replacement surgeries and sports injuries. Performed 1000+ successful surgeries.' 
        }
      ].map((doctor, index) => (
        <div key={index} className="col-md-6 col-lg-4 animate-on-scroll">
          <div className="card doctor-card h-100 border-0">
            <div className="position-relative">
              <img src={doctor.img} className="doctor-image card-img-top" alt={doctor.name} 
                   style={{ height: '350px'}} />
              <div className="specialty-badge" style={{ fontSize: '0.9rem' }}>{doctor.specialty}</div>
            </div>
            <div className="card-body text-center px-3 py-3">
              <h4 className="card-title mb-1" style={{ fontSize: '1.2rem' }}>{doctor.name}</h4>
              <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>{doctor.qualification}</p>
              <p className="card-text" style={{ fontSize: '0.95rem' }}>{doctor.description}</p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <a href="#" className="btn btn-primary btn-sm">
                  <i className="bi bi-calendar-check"></i> Book Appointment
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

  
      

      <style jsx>{`
        .top-contact-bar {
          background:rgb(93, 101, 109);
          color: white;
          padding: 8px 0;
          font-size: 0.9rem;
          backdropFilter: 'blur(10px)',
        }
        
        .hospital-slider {
          height: 500px;
          overflow: hidden;
        }
        
        /* Other CSS styles from original */

         .slide-content {
    transition: transform 0.6s ease, opacity 0.6s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  /* Add this to your existing styles */
.dropdown-menu {
  display: none; /* Let Bootstrap handle visibility */
}

.show .dropdown-menu {
  display: block;
}

.dropdown-menu .row {
  margin: -0.5rem; /* Compensate for column padding */
}

.dropdown-item {
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  transform: translateX(5px);
  background: rgba(0,123,255,0.1);
}

.hover-scale:hover {
  transform: scale(1.05);
  transition: 0.3s ease-in-out;
}


      `}</style>
    </div>
  );
};

export default HospitalWebsite;