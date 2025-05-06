import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BiArrowBack, BiHomeAlt, BiPrinter,
  BiUser, BiPhone, BiMap, BiEnvelope, BiXCircle, BiCheckCircle,BiCalendar
} from 'react-icons/bi';
import { FaHospital } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaNotesMedical, FaHeartbeat } from 'react-icons/fa';

const PatientCard = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/get/patients/${patientId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      Swal.fire('Error', 'Failed to fetch patient data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!patient) return;

    const isActive = patient.patient_status === 'Active';
    const action = isActive ? 'deactivate' : 'activate';
    const actionText = isActive ? 'Deactivate' : 'Activate';

    const result = await Swal.fire({
      title: `Confirm ${actionText}`,
      text: `Are you sure you want to ${action} this patient?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isActive ? '#d33' : '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `http://localhost:8000/api/patients/${patientId}/${action}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        Swal.fire('Success!', `Patient has been ${actionText.toLowerCase()}d successfully.`, 'success');
        fetchPatient();
      } catch (error) {
        console.error('Error updating patient status:', error);
        Swal.fire('Error', `Failed to ${actionText.toLowerCase()} patient.`, 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="alert alert-danger">Patient not found</div>;
  }

  return (
    <div className="container py-3" style={{ maxWidth: '800px' }}>
      
      {/* Navbar */}
      <div className="d-flex justify-content-start align-items-center gap-2 mb-3 d-print-none">
        <button 
          className="btn text-white d-flex align-items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #74ebd5, #ACB6E5)' }}
          onClick={() => navigate(-1)}
        >
          <BiArrowBack /> Back
        </button>
        <button 
          className="btn text-white d-flex align-items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}
          onClick={() => navigate('/')}
        >
          <BiHomeAlt /> Home
        </button>
        <button 
          className="btn text-white d-flex align-items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #00b09b, #96c93d)' }}
          onClick={handlePrint}
        >
          <BiPrinter /> Print
        </button>
      </div>

      {/* Patient Card */}
      <div className="card border-0 shadow-sm" ref={printRef} style={{ borderRadius: '15px' }}>
        
        {/* Hospital Header */}
        <div className="text-white py-2 px-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px', background: 'linear-gradient(135deg, #17a2b8, #2c3e50)' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <FaHospital size={24} className="me-2" />
              <div>
                <h4 className="mb-0">MediCare Hospital</h4>
                <small className="opacity-75">Patient Health Record</small>
              </div>
            </div>
            <div className="text-end">
              <div className="d-flex flex-column">
                <small className="d-flex align-items-center justify-content-end">
                  <BiPhone className="me-1" /> +91 80 2222 1111
                </small>
                <small className="d-flex align-items-center justify-content-end">
                  <BiMap className="me-1" /> 123 Health St, Medical City
                </small>
                <small className="d-flex align-items-center justify-content-end">
                  <BiEnvelope className="me-1" /> info@medicare.com
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Content */}
        <div className="row g-0">
          {/* Patient Image and Status */}
          <div className="col-md-4 bg-light d-flex flex-column align-items-center justify-content-center p-3">
            {patient.image ? (
              <img 
                src={`http://localhost:8000${patient.image}`} 
                alt="Patient" 
                className="img-fluid rounded-circle border border-4 border-info mb-2"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-2"
                style={{ width: '150px', height: '150px', border: '4px solid #17a2b8' }}
              >
                <BiUser size={60} className="text-white" />
              </div>
            )}

            {/* Status Change Button */}
            <div className="text-center mt-2 d-print-none">
              <button 
                className="btn text-white btn-sm"
                style={{ 
                  background: patient.patient_status === 'Active' 
                    ? 'linear-gradient(135deg, #ff5858, #f857a6)' 
                    : 'linear-gradient(135deg, #00c6ff, #0072ff)' 
                }}
                onClick={handleStatusChange}
              >
                {patient.patient_status === 'Active' ? (
                  <><BiXCircle className="me-1" /> Deactivate</>
                ) : (
                  <><BiCheckCircle className="me-1" /> Activate</>
                )}
              </button>
            </div>
          </div>

          {/* Patient Details */}
          <div className="col-md-8">
            <div className="p-3">
              <h3 className="mb-3 text-info d-flex align-items-center">
                <BiUser className="me-2" /> {patient.full_name}
              </h3>
              {/* Rest of the details unchanged */}
              
              <div className="row">
                <div className="col-md-6 mb-2">
                  <h6 className="text-muted mb-2 d-flex align-items-center">
                    <FaNotesMedical className="me-1" /> Personal Details
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-center">
                      <FaNotesMedical className="me-2 text-info" />
                      <div>
                        <strong>MRNO:</strong> {patient.registration_id}
                      </div>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FaHeartbeat className="me-2 text-info" />
                      <div>
                        <strong>Gender:</strong> {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                      </div>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <BiCalendar className="me-2 text-info" />
                      <div>
                        <strong>DOB:</strong> {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                      </div>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FaHeartbeat className="me-2 text-info" />
                      <div>
                        <strong>Blood Group:</strong> {patient.blood_group || 'N/A'}
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="col-md-6 mb-2">
                  <h6 className="text-muted mb-2 d-flex align-items-center">
                    <BiPhone className="me-1" /> Contact Information
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-center">
                      <BiPhone className="me-2 text-info" />
                      <div>
                        <strong>Phone:</strong> {patient.phone_number || 'N/A'}
                      </div>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <BiMap className="me-2 text-info" />
                      <div>
                        <strong>Address:</strong>
                        <div className="text-muted small mt-1">{patient.address || 'N/A'}</div>
                      </div>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <BiCalendar className="me-2 text-info" />
                      <div>
                        <strong>Registered On:</strong> {new Date(patient.created_at).toLocaleDateString()}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

       {/* Footer */}
       <div className="bg-light p-2 border-top text-center">
          <p className="mb-0 small text-muted">
            MediCare Hospital - Excellence in healthcare since 1994.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
