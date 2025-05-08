import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaPrint, 
  FaFileInvoiceDollar,
  FaUser,
  FaIdCard,
  FaHospital,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave
} from 'react-icons/fa';
import { BiArrowBack } from 'react-icons/bi';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateBill = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billDetails, setBillDetails] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [departmentDetails, setDepartmentDetails] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Display only HH:MM
  };

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First check if bill already exists
        const billResponse = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/billing/${appointmentId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        
        // If bill exists, use that data
        if (billResponse.data) {
          setBillDetails(billResponse.data);
          await fetchAppointmentDetails(billResponse.data.appointment);
          return;
        }
        
        // If no bill exists, fetch appointment details to calculate
        await fetchAppointmentDetails(appointmentId);
        
      } catch (err) {
        if (err.response?.status === 404) {
          // Bill doesn't exist yet, fetch appointment details to calculate
          await fetchAppointmentDetails(appointmentId);
        } else {
          console.error('Error fetching data:', err);
          setError(err.response?.data?.error || 'Failed to load data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointmentDetails = async (appointmentId) => {
      try {
        const response = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/appointments/${appointmentId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        
        const appointment = response.data;
        setAppointmentDetails(appointment);
        
        // Fetch patient details
        const patientResponse = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/patients/${appointment.patient_id}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        setPatientDetails(patientResponse.data);
        
        // Fetch doctor details
        const doctorResponse = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/doctors/${appointment.doctor_id}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        setDoctorDetails(doctorResponse.data);
        
        // Fetch department details
        const departmentResponse = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/departments/${doctorResponse.data.department_id}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        setDepartmentDetails(departmentResponse.data);
        
        // Calculate bill if not already exists
        if (!billDetails) {
          calculateBill(appointment, doctorResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError(err.response?.data?.error || 'Failed to load appointment details.');
      }
    };

    fetchData();
  }, [appointmentId]);

  // Calculate bill amounts
  const calculateBill = (appointment, doctor) => {
    setCalculating(true);
    
    let consultationFee = 0;
    let serviceCharge = 0;
    let gst = 0;
    let totalAmount = 0;
    let paymentStatus = 'Pending';
    
    if (appointment.appointment_type !== 'Unpaid') {
      consultationFee = parseFloat(doctor.consultation_fee) || 0;
      serviceCharge = 50; // Fixed service charge
      gst = parseFloat((0.18 * consultationFee).toFixed(2)); // 18% GST
      totalAmount = parseFloat((consultationFee + serviceCharge + gst).toFixed(2));
      paymentStatus = 'Paid';
    } else {
      paymentStatus = 'Free';
    }
    
    const calculatedBill = {
      appointment: appointment.appointment_id,
      patient: appointment.patient_id,
      doctor: appointment.doctor_id,
      consultation_fee: consultationFee.toFixed(2),
      service_charge: serviceCharge.toFixed(2),
      gst: gst.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      payment_status: paymentStatus
    };
    
    setBillDetails(calculatedBill);
    setCalculating(false);
  };

  // Handle bill generation
  const handleGenerateBill = async () => {
    try {
      setCalculating(true);
      const response = await axios.post(
        'https://blueeye10.pythonanywhere.com/api/billing/',
        {
          appointment_id: appointmentId
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setBillDetails(response.data);
      setError('');
    } catch (err) {
      console.error('Error generating bill:', err);
      setError(err.response?.data?.error || 'Failed to generate bill. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {error}
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <BiArrowBack /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button 
        className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <BiArrowBack /> Back
      </button>

      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaFileInvoiceDollar /> Appointment Bill
          </h4>
        </div>
        
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h5 className="d-flex align-items-center gap-2">
                <FaUser /> Patient Details
              </h5>
              <div className="border p-3 rounded">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {patientDetails?.image ? (
                    <img 
                      src={`https://blueeye10.pythonanywhere.com${patientDetails.image}`} 
                      alt="Patient" 
                      className="rounded-circle"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <FaUser size={24} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h5 className="mb-1">{patientDetails?.full_name || 'N/A'}</h5>
                    <div className="text-muted small">
                      <span className="me-2">
                        <FaIdCard /> ID: {patientDetails?.registration_id || 'N/A'}
                      </span>
                      <span>
                        | Age: {calculateAge(patientDetails?.dob)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row small">
                  <div className="col-6">
                    <div><strong>Gender:</strong> {patientDetails?.gender || 'N/A'}</div>
                    <div><strong>Phone:</strong> {patientDetails?.phone || 'N/A'}</div>
                  </div>
                  <div className="col-6">
                    <div><strong>Blood Group:</strong> {patientDetails?.blood_group || 'N/A'}</div>
                    <div><strong>Address:</strong> {patientDetails?.address || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h5 className="d-flex align-items-center gap-2">
                <FaHospital /> Appointment Details
              </h5>
              <div className="border p-3 rounded">
                <div className="mb-2">
                  <span className="d-flex align-items-center gap-2">
                    <FaHospital /> <strong>Department:</strong> {departmentDetails?.department_name || 'N/A'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="d-flex align-items-center gap-2">
                    <FaUserMd /> <strong>Doctor:</strong> {doctorDetails?.doc_name || 'N/A'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="d-flex align-items-center gap-2">
                    <FaCalendarAlt /> <strong>Date:</strong> {formatDate(appointmentDetails?.appointment_date)}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="d-flex align-items-center gap-2">
                    <FaClock /> <strong>Time:</strong> {formatTime(appointmentDetails?.appointment_time)}
                  </span>
                </div>
                <div>
                  <span className="d-flex align-items-center gap-2">
                    <FaIdCard /> <strong>Token No:</strong> {appointmentDetails?.token_number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <FaMoneyBillWave /> Billing Details
              </h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Consultation Fee</td>
                      <td className="text-end">{billDetails?.consultation_fee || '0.00'}</td>
                    </tr>
                    <tr>
                      <td>Service Charge</td>
                      <td className="text-end">{billDetails?.service_charge || '0.00'}</td>
                    </tr>
                    <tr>
                      <td>GST (18%)</td>
                      <td className="text-end">{billDetails?.gst || '0.00'}</td>
                    </tr>
                    <tr className="table-active">
                      <td><strong>Total Amount</strong></td>
                      <td className="text-end"><strong>₹{billDetails?.total_amount || '0.00'}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleGenerateBill}
              disabled={calculating || billDetails?.appointment_bill_id}
            >
              {calculating ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FaPrint /> {billDetails?.appointment_bill_id ? 'Bill Generated' : 'Generate & Print Bill'}
                </>
              )}
            </button>
          </div>

          {billDetails?.appointment_bill_id && (
            <div className="alert alert-success mt-3">
              Bill generated successfully! Bill ID: {billDetails.appointment_bill_id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateBill;