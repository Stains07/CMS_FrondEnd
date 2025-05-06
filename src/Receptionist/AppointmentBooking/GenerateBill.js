import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaPrint, FaPhone, FaEnvelope, FaHospital, FaUser, FaCalendarAlt, FaIdCard } from 'react-icons/fa';
import axios from 'axios';

const GenerateBill = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculations, setCalculations] = useState({
    consultation_fee: 0,
    service_charge: 0,
    gst: 0,
    total_amount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format gender
  const formatGender = (gender) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return gender;
    }
  };

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        // Fetch appointment data
        const appointmentResponse = await axios.get(`https://blueeye10.pythonanywhere.com/api/get/appointments/${appointmentId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setAppointment(appointmentResponse.data);

        const isFree = appointmentResponse.data.appointment_type === 'Unpaid';
        const consultationFee = isFree ? 0 : parseFloat(appointmentResponse.data.consultation_fee || 0);
        const serviceCharge = isFree ? 0 : 50;
        const gst = isFree ? 0 : parseFloat((0.18 * consultationFee).toFixed(2));
        let totalAmount = consultationFee + serviceCharge + gst;

        // If payment_status is "refund", set total amount to 0
        if (appointmentResponse.data.payment_status === 'refund') {
          totalAmount = 0;
        }

        setCalculations({
          consultation_fee: consultationFee,
          service_charge: serviceCharge,
          gst: gst,
          total_amount: totalAmount
        });

        // Check if bill already exists
        try {
          const billResponse = await axios.get(`https://blueeye10.pythonanywhere.com/api/billing/${appointmentId}/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          if (billResponse.data) {
            setBillGenerated(true);
            // Update calculations with bill data if available
            setCalculations({
              consultation_fee: parseFloat(billResponse.data.consultation_fee || consultationFee),
              service_charge: parseFloat(billResponse.data.service_charge || serviceCharge),
              gst: parseFloat(billResponse.data.gst || gst),
              total_amount: billResponse.data.payment_status === 'refund' ? 0 : parseFloat(billResponse.data.total_amount || totalAmount)
            });
          }
        } catch (billErr) {
          // If bill doesn't exist, continue without setting billGenerated
          console.log('No existing bill found');
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch appointment data');
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId]);

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`https://blueeye10.pythonanywhere.com/api/billing/${appointmentId}/`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      setBillGenerated(true);
      setIsSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate bill');
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!appointment) return <div className="alert alert-warning mt-5">No appointment data found</div>;

  return (
    <div className="container mt-2 printable-area" style={{ 
      height: '90vh', 
      width: '70%',
      margin: '0 auto',
      overflow: 'auto',
      fontSize: '0.85rem'
    }}>
      <div className="card bill-card h-100 shadow-sm">
        {/* Hospital Header */}
        <div className="bill-header text-center py-1 bg-light" style={{ lineHeight: '1.2' }}>
          <div className="d-flex align-items-center justify-content-center mb-1">
            <FaHospital className="me-1 text-primary" style={{ fontSize: '1.2rem' }} />
            <h2 className="hospital-name mb-0" style={{ fontSize: '1.3rem' }}>Medicare Hospital</h2>
          </div>
          <p className="hospital-details mb-0" style={{ fontSize: '0.7rem' }}>
            123 Health Street, Medical City, MC 12345 | <FaPhone className="me-1" />+1 (555) 123-4567 | 
            <FaEnvelope className="me-1" />info@cityhospital.com | <span className="text-danger">Emergency: +1 (555) 987-6543</span>
          </p>
        </div>

        <div className="card-body p-2">
          {/* Bill Title */}
          <div className="bill-title text-center mb-2">
            <h4 className="text-uppercase mb-1" style={{ fontSize: '1rem' }}>Medical Consultation Bill</h4>
            <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem' }}>
              <span><strong>Bill No:</strong> {appointmentId}</span>
              <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Patient and Appointment Info */}
          <div className="row mb-2">
            <div className="col-6 pe-1">
              <div className="info-section patient-info">
                <h5 className="section-title mb-1" style={{ fontSize: '0.8rem' }}>
                  <FaUser className="me-1" size={10} />Patient Details
                </h5>
                <table className="table table-sm table-borderless" style={{ fontSize: '0.7rem' }}>
                  <tbody>
                    <tr>
                      <th width="40%">MRNO:</th>
                      <td>{appointment.registration_id}</td>
                    </tr>
                    <tr>
                      <th>Name:</th>
                      <td>{appointment.patient_name}</td>
                    </tr>
                    <tr>
                      <th>Age:</th>
                      <td>{calculateAge(appointment.dob)} yrs </td>
                    </tr>
                    <tr>
                      <th>Gender:</th>
                      <td>{formatGender(appointment.gender)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="col-6 ps-1">
              <div className="info-section appointment-info">
                <h5 className="section-title mb-1" style={{ fontSize: '0.8rem' }}>
                  <FaCalendarAlt className="me-1" size={10} />Appointment Details
                </h5>
                <table className="table table-sm table-borderless" style={{ fontSize: '0.7rem' }}>
                  <tbody>
                    <tr>
                      <th width="40%">Department:</th>
                      <td>{appointment.department_name}</td>
                    </tr>
                    <tr>
                      <th>Doctor:</th>
                      <td>Dr. {appointment.doctor_name}</td>
                    </tr>
                    <tr>
                      <th>Token No:</th>
                      <td>{appointment.token_number}</td>
                    </tr>
                    <tr>
                      <th>Date/Time:</th>
                      <td>{new Date(appointment.appointment_date).toLocaleDateString()} {appointment.appointment_time}</td>
                    </tr>
                    <tr>
                      <th>Type:</th>
                      <td>{appointment.appointment_type}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Billing Details */}
          <div className="billing-details">
            <h5 className="section-title mb-1" style={{ fontSize: '0.8rem' }}>
              <FaIdCard className="me-1" size={10} />Billing Summary
            </h5>
            <table className="table table-bordered" style={{ fontSize: '0.7rem' }}>
              <thead>
                <tr className="table-primary">
                  <th width="70%">Description</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Consultation Fee</td>
                  <td className="text-end">{calculations.consultation_fee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Service Charge</td>
                  <td className="text-end">{calculations.service_charge.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>GST (18%)</td>
                  <td className="text-end">{calculations.gst.toFixed(2)}</td>
                </tr>
                <tr className="table-active">
                  <th>Total Amount</th>
                  <th className="text-end">
                    {appointment.payment_status === 'refund' ? (
                      <span className="text-danger">0.00 (Refunded)</span>
                    ) : (
                      calculations.total_amount.toFixed(2)
                    )}
                  </th>
                </tr>
              </tbody>
            </table>
            {/* Refund Message */}
            {appointment.payment_status === 'refund' && (
              <div className="alert alert-warning text-center py-1 mb-2" style={{ fontSize: '0.7rem' }}>
                <strong>Appointment Canceled:</strong> The total amount of ₹{(
                  calculations.consultation_fee + calculations.service_charge + calculations.gst
                ).toFixed(2)} has been refunded.
              </div>
            )}
          </div>
          
          {/* Payment Status */}
          {billGenerated && appointment.payment_status !== 'refund' && (
            <div className="alert alert-success text-center py-1 mb-2" style={{ fontSize: '0.7rem' }}>
              <strong>Payment Successful!</strong> Bill generated.
            </div>
          )}
          
          {/* Footer */}
          <div className="bill-footer text-center pt-1 border-top" style={{ fontSize: '0.65rem' }}>
            <p className="mb-0">Thank you for choosing City General Hospital</p>
            <small className="text-muted">Computer-generated receipt, no signature required</small>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons text-center mb-2">
          {billGenerated || appointment.payment_status === 'refund' ? (
            <button 
              className="btn btn-success btn-sm"
              onClick={handlePrint}
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
            >
              <FaPrint className="me-1" size={10} />Print
            </button>
          ) : (
            <>
              <button 
                className="btn btn-primary btn-sm me-1"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
              >
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <FaCheck className="me-1" size={10} />Confirm payment
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          .action-buttons {
            display: none !important;
          }
          .bill-card {
            border: none !important;
            box-shadow: none !important;
          }
          .hospital-logo, .section-title {
            color: black !important;
          }
          table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default GenerateBill;