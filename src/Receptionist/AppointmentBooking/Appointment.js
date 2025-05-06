import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaStethoscope,
  FaHospital,
  FaUserMd,
  FaIdCard,
  FaPlus,
  FaVenusMars,
  FaTint,
  FaBirthdayCake,
  FaPhone
} from 'react-icons/fa';
import { BiArrowBack, BiCalendar } from 'react-icons/bi';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientFromTable = location.state?.patient;

  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [patient, setPatient] = useState(patientFromTable || null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('https://blueeye10.pythonanywhere.com/api/departments/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
      }
    };
    fetchDepartments();
  }, []);

  // Set available dates
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0]);
  }, []);

  // Fetch doctors when department is selected
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedDepartment) return;
      
      try {
        const response = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/departments/${selectedDepartment}/doctors/`, 
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        setDoctors(response.data.doctors || []);
        setSelectedDoctor('');
        setDoctorDetails(null);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again later.');
      }
    };
    fetchDoctors();
  }, [selectedDepartment]);

  // Set doctor details when doctor is selected
  useEffect(() => {
    if (selectedDoctor && doctors.length > 0) {
      const doctor = doctors.find(d => d.doc_id == selectedDoctor);
      setDoctorDetails(doctor);
      setSelectedSlot(null);
      setShowAddSlot(false);
    }
  }, [selectedDoctor, doctors]);

  // Fetch booked appointments and generate time slots
  useEffect(() => {
    const fetchBookedAppointments = async () => {
      if (!selectedDoctor || !selectedDate) return;
      
      setTimeSlotsLoading(true);
      try {
        const response = await axios.get(
          `https://blueeye10.pythonanywhere.com/api/appointments/doctor/${selectedDoctor}/${selectedDate}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        
        // Handle both single object and array responses
        const appointments = Array.isArray(response.data) ? response.data : [response.data];
        
        // Extract booked times and token numbers
        const bookedAppointments = appointments.map(appt => ({
          time: appt.appointment_time,
          token: appt.token_number
        }));
        
        setBookedSlots(bookedAppointments);
        generateTimeSlots(bookedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        if (err.response?.status === 404) {
          setBookedSlots([]);
          generateTimeSlots([]);
        } else {
          setError('Failed to load appointments. Please try again later.');
        }
      } finally {
        setTimeSlotsLoading(false);
      }
    };
    
    fetchBookedAppointments();
  }, [selectedDoctor, selectedDate]);

  // Search patient by registration ID
  const searchPatient = async () => {
    if (!searchTerm) return;
    try {
      const response = await axios.get(
        `https://blueeye10.pythonanywhere.com/api/patients/?registration_id=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      if (response.data.length > 0) {
        setPatient(response.data[0]);
        setError('');
      } else {
        setError('Patient not found');
      }
    } catch (err) {
      console.error('Error searching patient:', err);
      setError('Error searching patient');
    }
  };

  // Generate time slots (5-minute intervals)
  const generateTimeSlots = (bookedAppointments = []) => {
    if (!doctorDetails || !doctorDetails.consultation_time) {
      setTimeSlots([]);
      return;
    }
    
    const slots = [];
    const consultationTime = new Date(`1970-01-01T${doctorDetails.consultation_time}`);
    const now = new Date();
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    // Generate up to 50 tokens
    for (let i = 1; i <= 50; i++) {
      const startTime = new Date(consultationTime);
      startTime.setMinutes(consultationTime.getMinutes() + (i - 1) * 5); // 5-minute intervals
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + 5);
      
      const formattedStartTime = startTime.toTimeString().substring(0, 5);
      const formattedEndTime = endTime.toTimeString().substring(0, 5);
      
      // Check if the slot is booked
      const isBooked = bookedAppointments.some(appt => {
        const apptTime = appt.time.substring(0, 5); // Compare HH:MM
        return apptTime === formattedStartTime || appt.token === i;
      });
      
      // Check if the slot is expired (only for today)
      let isExpired = false;
      if (isToday) {
        const slotTime = startTime.getHours() * 60 + startTime.getMinutes();
        isExpired = slotTime < currentTime;
      }
      
      slots.push({
        token: i,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        isBooked,
        isExpired
      });
    }
    
    setTimeSlots(slots);
    setShowAddSlot(slots.every(slot => slot.isBooked || slot.isExpired));
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (!patient || !selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        patient_id: patient.patient_id,
        department_id: parseInt(selectedDepartment),
        doctor_id: parseInt(selectedDoctor),
        appointment_date: selectedDate,
        appointment_time: selectedSlot.startTime + ':00',
        registration_id: patient.registration_id
      };

      const response = await axios.post(
        'https://blueeye10.pythonanywhere.com/api/appointments/book/',
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Appointment booked successfully!');
      setAppointmentId(response.data.appointment.appointment_id);
      setShowBillModal(true);
      setError('');
      const newBookedAppointment = {
        time: selectedSlot.startTime + ':00',
        token: response.data.appointment.token_number
      };
      const updatedBookedSlots = [...bookedSlots, newBookedAppointment];
      setBookedSlots(updatedBookedSlots);
      generateTimeSlots(updatedBookedSlots);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding additional slot
  const handleAddSlot = () => {
    if (!doctorDetails) return;
    
    const newTokenNumber = timeSlots.length + 1;
    const lastSlot = timeSlots[timeSlots.length - 1];
    const lastEndTime = new Date(`1970-01-01T${lastSlot.endTime}:00`);
    
    const newStartTime = new Date(lastEndTime);
    const newEndTime = new Date(newStartTime);
    newEndTime.setMinutes(newStartTime.getMinutes() + 5);
    
    const newSlot = {
      token: newTokenNumber,
      startTime: newStartTime.toTimeString().substring(0, 5),
      endTime: newEndTime.toTimeString().substring(0, 5),
      isBooked: false,
      isExpired: false
    };
    
    setTimeSlots([...timeSlots, newSlot]);
    setShowAddSlot(false);
  };

  // Handle bill generation
  const handleGenerateBill = () => {
    if (appointmentId) {
      navigate(`/billing/${appointmentId}`);
    }
  };



  return (
    <div className="container py-4" style={{ maxWidth: '650px' }}>
      <button 
        className="btn btn-outline-secondary mb-3 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
        style={{ fontSize: '0.9rem', padding: '0.375rem 0.75rem' }}
      >
        <BiArrowBack /> Back
      </button>

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-2">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <FaCalendarAlt size={18} /> Book Appointment
          </h5>
        </div>
        
        <div className="card-body p-3">
          {!patientFromTable && !patient && (
            <div className="mb-3">
              <h6 className="d-flex align-items-center gap-2 mb-2">
                <FaUser size={16} /> Search Patient
              </h6>
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Enter Patient Registration ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                  onClick={searchPatient}
                >
                  <FaSearch size={12} /> Search
                </button>
              </div>
              {error && <div className="text-danger mt-1 small">{error}</div>}
            </div>
          )}

          {patient && (
            <div className="mb-3 p-2 border rounded bg-light">
              <div className="d-flex align-items-center gap-2">
                {patient.image ? (
                  <img 
                    src={`http://localhost:8000${patient.image}`} 
                    alt="Patient" 
                    className="rounded-circle"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                    style={{ width: '50px', height: '50px' }}
                  >
                    <FaUser size={16} className="text-white" />
                  </div>
                )}
                <div className="flex-grow-1">
                  <h6 className="mb-1">{patient.full_name}</h6>
                  <div className="d-flex flex-wrap gap-2 small text-muted">
                    <span className="d-flex align-items-center gap-1">
                      <FaIdCard size={12} /> {patient.registration_id}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FaPhone size={12} /> {patient.phone_number || 'N/A'}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FaVenusMars size={12} /> {patient.gender || 'N/A'}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FaTint size={12} /> {patient.blood_group || 'N/A'}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FaBirthdayCake size={12} /> {patient.dob || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 mb-2 small">
              {success}
            </div>
          )}

          {patient && (
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label small d-flex align-items-center gap-1">
                  <FaHospital size={14} /> Department
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small d-flex align-items-center gap-1">
                  <FaStethoscope size={14} /> Doctor
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={!selectedDepartment}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.doc_id} value={doctor.doc_id}>
                      {doctor.doc_name} ({doctor.department_name})
                    </option>
                  ))}
                </select>
              </div>

              {doctorDetails && (
                <div className="col-12">
                  <div className="alert alert-info py-1 px-2 mb-2 small">
                    <div className="d-flex flex-wrap justify-content-between gap-1">
                      <span className="d-flex align-items-center gap-1">
                        <FaClock size={12} /> {doctorDetails.consultation_time}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <FaMoneyBillWave size={12} /> ₹{doctorDetails.consultation_fee || 'N/A'}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <FaHospital size={12} /> {doctorDetails.department_name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label small d-flex align-items-center gap-1">
                  <BiCalendar size={16} /> Appointment Date
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoctor && selectedDate && (
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">

                

                    <label className="form-label small d-flex align-items-center gap-1">
                      <FaClock size={14} /> Time Slots
                    </label>
                    <div className="d-flex gap-1">
                      <span className="badge bg-success" style={{width: '80px', height: '20px'}}>Selected</span>
                      <span className="badge bg-primary" style={{width: '80px', height: '20px'}}>Available</span>
                      <span className="badge bg-secondary" style={{width: '80px', height: '20px'}}>Booked</span>
                      <span className="badge bg-light border" style={{width: '80px', height: '20px',color:'black'}}>Expired</span>
                    </div>
                  </div>
                  
                  {timeSlotsLoading ? (
                    <div className="text-center py-1">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="alert alert-warning py-1 px-2 small mb-1">
                      No time slots available
                    </div>
                  ) : timeSlots.every(slot => slot.isBooked || slot.isExpired) ? (
                    <div className="alert alert-warning py-1 px-2 small mb-1">
                      No available slots. Click "Add Slot" below.
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-1 mb-1">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.token}
                          className={`btn btn-sm ${
                            slot.isBooked ? 'btn-secondary disabled' : 
                            slot.isExpired ? 'btn-light disabled text-muted border' :
                            selectedSlot?.token === slot.token ? 'btn-success' : 'btn-outline-primary'
                          }`}
                          style={{ 
                            width: '60px', 
                            height: '37px',
                            padding: '0.1rem',
                            fontSize: '0.7rem',
                          }}
                          onClick={() => !slot.isBooked && !slot.isExpired && setSelectedSlot(slot)}
                          disabled={slot.isBooked || slot.isExpired}
                        >
                          <div className="fw-bold">Token{slot.token}</div>
                          <div>{slot.startTime}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showAddSlot && (
                    <button 
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 w-100 mt-1"
                      onClick={handleAddSlot}
                    >
                      <FaPlus size={12} /> Add Slot
                    </button>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="col-12 mt-2">
                  <h6 className="d-flex align-items-center gap-1">
                    <FaMoneyBillWave size={14} /> Payment
                  </h6>
                  <div className="row g-1">
                    <div className="col-md-6">
                      <label className="form-label small">Payment Method</label>
                      <select
                        className="form-select form-select-sm"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="credit_card">Credit Card</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Consultation Fee</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={`₹${doctorDetails?.consultation_fee || '0'}`}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedSlot && (
                <div className="col-12 mt-2">
                  <button
                    className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    onClick={handleBookAppointment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Booking...
                      </>
                    ) : (
                      <>
                        <BiCalendar size={16} /> Confirm Appointment
                      </>
                    )}
                  </button>
                  {error && <div className="text-danger mt-1 small">{error}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bill Generation Modal */}
      {showBillModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white py-2">
                <h5 className="modal-title small">Appointment Booked</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBillModal(false)}></button>
              </div>
              <div className="modal-body py-2 small">
                <p>Would you like to generate the bill now?</p>
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowBillModal(false)}
                >
                  Later
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                  onClick={handleGenerateBill}
                >
                  <FaFileInvoiceDollar size={12} /> Generate Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;