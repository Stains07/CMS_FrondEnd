import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import * as bootstrap from 'bootstrap';

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
// import rece from './images/hospital1.jpg';
// import Hospital2 from './images/hospital2.jpg';
// import Hospital3 from './images/hospital3.jpg';
// import Hospital4 from './images/hospital4.jpg';
// import Hospital5 from './images/hospital5.jpg';

const HospitalWebsite = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Handle scroll event for navbar
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
      
      // Scroll animation for elements
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('visible');
        }
      });
    };

    // Initialize Bootstrap components
    const initializeBootstrap = () => {
      new bootstrap.Carousel('#hospitalSlider', { interval: 5000, wrap: true });
      new bootstrap.Carousel('#textCarousel', { interval: 6000, wrap: true });
      new bootstrap.Carousel('#galleryCarousel', { interval: 4000, wrap: true });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    initializeBootstrap();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Scroll to section function
  const scrollToSection = (sectionId, event) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: 'smooth'
      });
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      event.target.classList.add('active');
    }
  };

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

      {/* Navigation Bar */}
      <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => scrollToSection('home', e)}>
            <img src={HosLogo} alt="Hospital Logo" height="50" className="me-2 rounded-circle" />
            <span className="fw-bold">MediCare Hospital</span>
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a 
                  className="nav-link active" 
                  href="#" 
                  onClick={(e) => scrollToSection('home', e)}
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link" 
                  href="#" 
                  onClick={(e) => scrollToSection('about', e)}
                >
                  About
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link" 
                  href="#" 
                  onClick={(e) => scrollToSection('specialities', e)}
                >
                  Specialities
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link" 
                  href="#" 
                  onClick={(e) => scrollToSection('gallery', e)}
                >
                  Gallery
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link" 
                  href="#" 
                  onClick={(e) => scrollToSection('doctors', e)}
                >
                  Doctors
                </a>
              </li>
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                <a 
                  className="btn btn-outline-light faculty-login-btn" 
                  href="/faculty-login"
                >
                  <i className="bi bi-person-badge me-1"></i>Faculty Login
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Image Slider - Home Section */}
      <div id="home" className="pt-5">
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
                <h3>Advanced Medical Technology</h3>
                <p>Cutting-edge diagnostic and treatment equipment</p>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="carousel-item">
              <img src={BackgroundImage} className="d-block w-100" alt="Emergency Care" />
              <div className="carousel-caption d-none d-md-block">
                <h3>24/7 Emergency Services</h3>
                <p>Immediate care when you need it most</p>
              </div>
            </div>

            {/* Slide 4 */}
            <div className="carousel-item">
              <img src={reception5} className="d-block w-100" alt="Operation Theater" />
              <div className="carousel-caption d-none d-md-block">
                <h3>Comfortable Patient Rooms</h3>
                <p>Healing environment for optimal recovery</p>
              </div>
            </div>

            {/* Slide 5 */}
            <div className="carousel-item">
              <img src={Theater} className="d-block w-100" alt="Patient Care" />
              <div className="carousel-caption d-none d-md-block">
                <h3>Modern Operation Theaters</h3>
                <p>State-of-the-art surgical facilities</p>
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
      </div>

      {/* About Section */}
      <section id="about" className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <img src={HosLogo} alt="About Hospital" className="img-fluid rounded shadow" />
            </div>
            <div className="col-lg-6">
              <h2 className="section-heading mb-4">About MediCare Hospital</h2>
              <p className="lead">
                Founded in 1985, MediCare Hospital has grown to become one of the leading healthcare providers in the region.
              </p>
              <p>
                With over 500 beds and 50+ specialties, we provide comprehensive healthcare services with a patient-centric approach. 
                Our hospital is equipped with state-of-the-art technology and staffed by highly qualified medical professionals.
              </p>
              <p>
                We are committed to delivering exceptional patient care through innovation, compassion, and excellence in medical services.
              </p>
              <button className="btn btn-primary mt-3">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialities Section */}
      <section id="specialities" className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 section-heading">Our Specialities</h2>
          
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

      {/* Gallery Section */}
      <section id="gallery" className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center mb-5 section-heading">Hospital Gallery</h2>
          
          <div id="galleryCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {/* Slide 1 */}
              <div className="carousel-item active">
                <div className="row g-4 justify-content-center">
                  {[reception5, Sniped, DocImage].map((img, idx) => (
                    <div key={idx} className="col-md-4 animate-on-scroll">
                      <div className="gallery-card card border-0 shadow-sm h-100">
                        <img src={img} className="card-img-top" alt={`Hospital ${idx + 1}`} />
                        <div className="card-body text-center">
                          <h5 className="card-title">Hospital Facility {idx + 1}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Slide 2 */}
              <div className="carousel-item">
                <div className="row g-4 justify-content-center">
                  {[Doc2, Doc1, DoctorsGroup].map((img, idx) => (
                    <div key={idx} className="col-md-4 animate-on-scroll">
                      <div className="gallery-card card border-0 shadow-sm h-100">
                        <img src={img} className="card-img-top" alt={`Hospital ${idx + 4}`} />
                        <div className="card-body text-center">
                          <h5 className="card-title">Hospital Facility {idx + 4}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button className="carousel-control-prev" type="button" data-bs-target="#galleryCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#galleryCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>

      {/* Doctor Profiles */}
      <section id="doctors" className="py-5 bg-light">
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
                <div className="card doctor-card h-100 border-0 shadow-sm">
                  <div className="position-relative">
                    <img src={doctor.img} className="doctor-image card-img-top" alt={doctor.name} 
                         style={{ height: '350px', objectFit: 'cover' }} />
                    <div className="specialty-badge">{doctor.specialty}</div>
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
          background: rgb(93, 101, 109);
          color: white;
          padding: 8px 0;
          font-size: 0.9rem;
        }
        
        .hospital-slider {
          height: 500px;
          overflow: hidden;
        }
        
        .slide-content {
          transition: transform 0.6s ease, opacity 0.6s ease;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .specialty-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #007bff;
          color: white;
          padding: 5px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .section-heading {
          position: relative;
          display: inline-block;
          padding-bottom: 10px;
        }

        .section-heading:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: #007bff;
        }

        .navbar {
          background-color: rgba(40, 40, 40, 0.9) !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          height: 70px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar.scrolled {
          background-color: rgba(30, 30, 30, 0.95) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .nav-link {
          font-weight: 500;
          padding: 10px 15px;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8);
        }

        .nav-link:hover,
        .nav-link.active {
          color: #ffffff !important;
          transform: translateY(-2px);
        }

        .faculty-login-btn {
          border-radius: 20px;
          padding: 8px 20px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .faculty-login-btn:hover {
          background-color: rgba(255, 255, 255, 0.9);
          color: #333 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .doctor-card,
        .gallery-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 10px;
          overflow: hidden;
        }

        .doctor-card:hover,
        .gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .gallery-card img {
          height: 250px;
          object-fit: cover;
        }

        .carousel-control-prev,
        .carousel-control-next {
          width: 50px;
        }

        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-size: 60%;
        }
      `}</style>
    </div>
  );
};

export default HospitalWebsite;