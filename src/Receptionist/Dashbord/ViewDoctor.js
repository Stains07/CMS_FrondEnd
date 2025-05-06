import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css/animate.min.css';

const DepartmentsAndDoctors = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/departments/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setDepartments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch doctors for selected department
  const fetchDoctors = async (departmentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/departments/${departmentId}/doctors/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setSelectedDepartment(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading && !selectedDepartment) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mx-auto mt-5" style={{ maxWidth: '600px' }}>
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold text-primary">Our Departments & Specialists</h2>
      
      <div className="row">
        {/* Departments List */}
        <div className="col-lg-4 mb-4 mb-lg-0">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white py-3">
              <h4 className="mb-0">Medical Departments</h4>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {departments.map((dept) => (
                  <button
                    key={dept.department_id}
                    onClick={() => fetchDoctors(dept.department_id)}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center 
                      ${selectedDepartment?.department_id === dept.department_id ? 'active' : ''}`}
                  >
                    <span className="fw-bold">{dept.department_name}</span>
                    <span className="badge bg-primary rounded-pill">
                      {dept.doctors?.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Display */}
        <div className="col-lg-8">
          {selectedDepartment ? (
            <div className="animate__animated animate__fadeIn">
              <div className="card border-0 shadow-lg mb-4">
                <div className="card-header bg-gradient-primary text-white py-3">
                  <h3 className="mb-0">
                    {selectedDepartment.department_name} Specialists
                  </h3>
                </div>
              </div>

              {loading ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {selectedDepartment.doctors.map((doctor) => (
                    <div key={doctor.doc_id} className="col">
                      <div className="card h-100 border-0 shadow-sm doctor-card animate__animated animate__fadeInUp">
                        <div className="row g-0 h-100">
                          <div className="col-md-5">
                            {doctor.image ? (
                              <img 
                                src={doctor.image} 
                                className="img-fluid rounded-start h-100 object-fit-cover" 
                                alt={doctor.doc_name}
                              />
                            ) : (
                              <div className="h-100 d-flex align-items-center justify-content-center bg-light">
                                <i className="bi bi-person-bounding-box text-muted" style={{ fontSize: '3rem' }}></i>
                              </div>
                            )}
                          </div>
                          <div className="col-md-7">
                            <div className="card-body">
                              <h5 className="card-title text-primary fw-bold">{doctor.doc_name}</h5>
                              <p className="text-muted mb-2">
                                <i className="bi bi-briefcase me-2"></i>
                                {selectedDepartment.department_name}
                              </p>
                              <p className="text-muted mb-2">
                                <i className="bi bi-clock me-2"></i>
                                Consultation: {new Date(`2000-01-01T${doctor.consultation_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-muted mb-3">
                                <i className="bi bi-currency-rupee me-2"></i>
                                Fee: ₹{doctor.consultation_fee}
                              </p>
                              <div className="d-flex justify-content-between align-items-center">
                                <a 
                                  href={`tel:${doctor.phone_number}`} 
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-telephone me-1"></i> Call
                                </a>
                                <button className="btn btn-sm btn-primary">
                                  <i className="bi bi-calendar-check me-1"></i> Book
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card border-0 shadow-lg h-100">
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <i className="bi bi-hospital text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-muted">Select a department to view specialists</h4>
                <p className="text-muted">Click on any department from the list to see available doctors</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
        }
        
        .doctor-card {
          transition: all 0.3s ease;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .doctor-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .list-group-item.active {
          background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
          border-color: rgba(58, 123, 213, 0.5);
        }
        
        .object-fit-cover {
          object-fit: cover;
        }
        
        .card-header {
          border-radius: 10px 10px 0 0 !important;
        }
      `}</style>
    </div>
  );
};

export default DepartmentsAndDoctors;