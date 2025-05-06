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
  FaPlus
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
        const response = await axios.get('http://localhost:8000/api/departments/', {
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
          `http://localhost:8000/api/departments/${selectedDepartment}/doctors/`, 
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
          `http://localhost:8000/api/appointments/doctor/${selectedDoctor}/${selectedDate}/`,
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
        `http://localhost:8000/api/patients/?registration_id=${searchTerm}`,
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
        const slotDateTime = new Date(`${selectedDate}T${formattedStartTime}:00`);
        isExpired = slotDateTime < now;
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
        'http://localhost:8000/api/appointments/book/',
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
            <FaCalendarAlt /> Book Appointment
          </h4>
        </div>
        
        <div className="card-body">
          {!patientFromTable && !patient && (
            <div className="mb-4">
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <FaUser /> Search Patient
              </h5>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Patient Registration ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={searchPatient}
                >
                  <FaSearch /> Search
                </button>
              </div>
              {error && <div className="text-danger mt-2">{error}</div>}
            </div>
          )}

          {patient && (
            <div className="mb-4 p-3 border rounded bg-light">
              <div className="d-flex align-items-center gap-3">
                {patient.image ? (
                  <img 
                    src={`http://localhost:8000${patient.image}`} 
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
                  <h5 className="mb-1">{patient.full_name}</h5>
                  <div className="text-muted small">
                    <span className="me-2">
                      <FaIdCard /> ID: {patient.registration_id}
                    </span>
                    <span className="me-2">
                      <FaUserMd /> Phone: {patient.phone}
                    </span>
                    <span>
                      | Blood Group: {patient.blood_group || 'N/A'}
                    </span>
                    <span>
                      | Age: {patient.dob || 'N/A'}
                    </span>
                    <span>
                      | Gender: {patient.gender || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          {patient && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label d-flex align-items-center gap-2">
                  <FaHospital /> Department
                </label>
                <select
                  className="form-select"
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
                <label className="form-label d-flex align-items-center gap-2">
                  <FaStethoscope /> Doctor
                </label>
                <select
                  className="form-select"
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
                  <div className="alert alert-info py-2">
                    <div className="d-flex flex-wrap justify-content-between gap-2 small">
                      <span>
                        <strong>Consultation Time:</strong> {doctorDetails.consultation_time}
                      </span>
                      <span>
                        <strong>Consultation Fee:</strong> ₹{doctorDetails.consultation_fee || 'N/A'}
                      </span>
                      <span>
                        <strong>Specialization:</strong> {doctorDetails.department_name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label d-flex align-items-center gap-2">
                  <BiCalendar /> Appointment Date
                </label>
                <select
                  className="form-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoctor && selectedDate && (
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label d-flex align-items-center gap-2">
                      <FaClock /> Available Time Slots
                    </label>
                    {showAddSlot && (
                      <button 
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={handleAddSlot}
                      >
                        <FaPlus size={12} /> Add Slot
                      </button>
                    )}
                  </div>
                  
                  {timeSlotsLoading ? (
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="alert alert-warning py-2 small">
                      No time slots available. Please select another date or contact support.
                    </div>
                  ) : timeSlots.every(slot => slot.isBooked || slot.isExpired) ? (
                    <div className="alert alert-warning py-2 small">
                      No available time slots for this date. Please select another date or click "Add Slot".
                    </div>
                  ) : (
                    <>
                      <div className="d-flex flex-wrap gap-1">
                        {timeSlots.map(slot => (
                          <button
                            key={slot.token}
                            className={`btn btn-sm ${
                              slot.isBooked ? 'btn-secondary disabled' : 
                              slot.isExpired ? 'btn-light disabled text-muted' :
                              selectedSlot?.token === slot.token ? 'btn-success bg-light-green' : 'btn-outline-primary'
                            }`}
                            style={{ 
                              width: '80px', 
                              height: '40px',
                              padding: '0.25rem',
                              fontSize: '0.75rem',
                              backgroundColor: selectedSlot?.token === slot.token ? '#90EE90' : undefined
                            }}
                            onClick={() => !slot.isBooked && !slot.isExpired && setSelectedSlot(slot)}
                            disabled={slot.isBooked || slot.isExpired}
                          >
                            <div className="fw-bold">#{slot.token}</div>
                            <div>{slot.startTime}</div>
                          </button>
                        ))}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-2 small">
                        <span className="d-flex align-items-center">
                          <span className="badge bg-light-green me-1" style={{width: '12px', height: '12px'}}></span>
                          Selected
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="badge bg-primary me-1" style={{width: '12px', height: '12px'}}></span>
                          Available
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="badge bg-secondary me-1" style={{width: '12px', height: '12px'}}></span>
                          Booked
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="badge bg-light me-1 border" style={{width: '12px', height: '12px'}}></span>
                          Expired
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="col-12 mt-3">
                  <h5 className="d-flex align-items-center gap-2">
                    <FaMoneyBillWave /> Payment Details
                  </h5>
                  <div className="row g-2">
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
                <div className="col-12 mt-3">
                  <button
                    className="btn btn-primary px-3 py-1 d-flex align-items-center gap-2"
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
                        <BiCalendar /> Confirm Appointment
                      </>
                    )}
                  </button>
                  {error && <div className="text-danger mt-2 small">{error}</div>}
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
                <h5 className="modal-title">Appointment Booked Successfully</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBillModal(false)}></button>
              </div>
              <div className="modal-body">
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
                  <FaFileInvoiceDollar /> Generate Bill Now
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




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { 
//   FaSearch, 
//   FaUser, 
//   FaFileInvoiceDollar,
//   FaPrint,
//   FaEdit,
//   FaEye,
//   FaArrowLeft,
//   FaHome,
//   FaCalendarAlt
// } from 'react-icons/fa';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import moment from 'moment';

// const ViewAllAppointments = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [filteredAppointments, setFilteredAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [dateFilter, setDateFilter] = useState('today');

//   // Date filter options
//   const dateOptions = [
//     { value: 'previous', label: 'Previous Day' },
//     { value: 'today', label: 'Today' },
//     { value: 'tomorrow', label: 'Tomorrow' },
//     { value: 'next4', label: 'Next 4 Days' },
//     { value: 'all', label: 'All Appointments' }
//   ];

//   // Fetch all appointments with bill status
//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const response = await axios.get('http://localhost:8000/api/appointments/book/', {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//           }
//         });
        
//         // Fetch bill status for each appointment
//         const appointmentsWithBillStatus = await Promise.all(
//           response.data.map(async (appointment) => {
//             try {
//               const billResponse = await axios.get(
//                 `http://localhost:8000/api/billing/${appointment.appointment_id}/`,
//                 {
//                   headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//                   }
//                 }
//               );
//               return { ...appointment, billGenerated: true };
//             } catch (err) {
//               if (err.response?.status === 404) {
//                 return { ...appointment, billGenerated: false };
//               }
//               return appointment;
//             }
//           })
//         );
        
//         setAppointments(appointmentsWithBillStatus);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching appointments:', err);
//         setError('Failed to load appointments. Please try again later.');
//         setLoading(false);
//       }
//     };
    
//     fetchAppointments();
//   }, []);

//   // Filter and sort appointments based on search term and date filter
//   useEffect(() => {
//     let filtered = [...appointments];
    
//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter(appt => 
//         appt.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         appt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         appt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
    
//     // Apply date filter
//     const today = moment().startOf('day');
//     switch (dateFilter) {
//       case 'previous':
//         const yesterday = moment().subtract(1, 'day').startOf('day');
//         filtered = filtered.filter(appt => 
//           moment(appt.appointment_date).isSame(yesterday, 'day')
//         );
//         break;
//       case 'today':
//         filtered = filtered.filter(appt => 
//           moment(appt.appointment_date).isSame(today, 'day')
//         );
//         break;
//       case 'tomorrow':
//         const tomorrow = moment().add(1, 'day').startOf('day');
//         filtered = filtered.filter(appt => 
//           moment(appt.appointment_date).isSame(tomorrow, 'day')
//         );
//         break;
//       case 'next4':
//         const next4Days = moment().add(4, 'days').endOf('day');
//         filtered = filtered.filter(appt => 
//           moment(appt.appointment_date).isBetween(today, next4Days, null, '[]')
//         );
//         break;
//       case 'all':
//         // No date filtering needed
//         break;
//       default:
//         break;
//     }
    
//     // Sort by date (ascending) and time (ascending)
//     filtered.sort((a, b) => {
//       const dateA = moment(`${a.appointment_date} ${a.appointment_time}`);
//       const dateB = moment(`${b.appointment_date} ${b.appointment_time}`);
//       return dateA - dateB;
//     });
    
//     setFilteredAppointments(filtered);
//   }, [searchTerm, dateFilter, appointments]);

//   // Handle view details
//   const handleViewDetails = (appointment) => {
//     setSelectedAppointment(appointment);
//     setShowDetailsModal(true);
//   };

// // In ViewAllAppointments.js
// const handleEdit = (appointmentId) => {
//   navigate(`/appointments/reschedule/${appointmentId}`);
// };

//   // Handle bill generation/printing
//   const handleBillAction = (appointment) => {
//     if (appointment.billGenerated) {
//       navigate(`/billing/${appointment.appointment_id}`);
//     } else {
//       navigate(`/billing/${appointment.appointment_id}`);
//     }
//   };

//   return (
//     <div className="container-fluid py-4">
//       {/* Navigation and Search Bar */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div className="d-flex gap-2">
//           <button 
//             className="btn btn-outline-secondary d-flex align-items-center gap-2"
//             onClick={() => navigate(-1)}
//           >
//             <FaArrowLeft /> Back
//           </button>
//           <button 
//             className="btn btn-outline-primary d-flex align-items-center gap-2"
//             onClick={() => navigate('/')}
//           >
//             <FaHome /> Home
//           </button>
//         </div>
        
//         <div className="d-flex gap-3 align-items-center">
//           <select
//             className="form-select"
//             value={dateFilter}
//             onChange={(e) => setDateFilter(e.target.value)}
//             style={{ width: '180px' }}
//           >
//             {dateOptions.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
          
//           <div className="input-group" style={{ width: '300px' }}>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search by registration ID, name..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <button className="btn btn-outline-secondary" type="button">
//               <FaSearch />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="card shadow">
//         <div className="card-header bg-primary text-white">
//           <h4 className="mb-0 d-flex align-items-center gap-2">
//             <FaCalendarAlt /> Appointment List
//           </h4>
//         </div>
        
//         <div className="card-body">
//           {error && <div className="alert alert-danger">{error}</div>}
          
//           {loading ? (
//             <div className="text-center py-5">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p>Loading appointments...</p>
//             </div>
//           ) : filteredAppointments.length === 0 ? (
//             <div className="alert alert-info text-center py-4">
//               No appointments found matching your criteria.
//             </div>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-striped table-hover">
//                 <thead className="table-dark">
//                   <tr>
//                     <th>SL No</th>
//                     <th>Photo</th>
//                     <th>Registration ID</th>
//                     <th>Patient Name</th>
//                     <th>Doctor</th>
//                     <th>Department</th>
//                     <th>Status</th>
//                     <th>Bill Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredAppointments.map((appointment, index) => (
//                     <tr key={appointment.appointment_id}>
//                       <td>{index + 1}</td>
//                       <td>
//                         {appointment.image ? (
//                           <img 
//                             src={`http://localhost:8000${appointment.image}`} 
//                             alt="Patient" 
//                             className="rounded-circle"
//                             style={{ width: '40px', height: '40px', objectFit: 'cover' }}
//                           />
//                         ) : (
//                           <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
//                             style={{ width: '40px', height: '40px' }}
//                           >
//                             <FaUser size={16} className="text-white" />
//                           </div>
//                         )}
//                       </td>
//                       <td>{appointment.registration_id}</td>
//                       <td>{appointment.patient_name}</td>
//                       <td>{appointment.doctor_name}</td>
//                       <td>{appointment.department_name}</td>
//                       <td>
//                         <span className={`badge ${
//                           appointment.status === 'completed' ? 'bg-success' :
//                           appointment.status === 'cancelled' ? 'bg-danger' :
//                           moment(appointment.appointment_date).isBefore(moment(), 'day') ? 'bg-warning' : 'bg-primary'
//                         }`}>
//                           {appointment.status === 'completed' ? 'Completed' :
//                            appointment.status === 'cancelled' ? 'Cancelled' :
//                            moment(appointment.appointment_date).isBefore(moment(), 'day') ? 'Missed' : 'Upcoming'}
//                         </span>
//                       </td>
//                       <td>
//                         <span className={`badge ${
//                           appointment.billGenerated ? 'bg-success' : 'bg-warning'
//                         }`}>
//                           {appointment.billGenerated ? 'Generated' : 'Pending'}
//                         </span>
//                       </td>
//                       <td>
//                         <div className="d-flex gap-2">
//                           <button 
//                             className="btn btn-sm btn-outline-info"
//                             onClick={() => handleViewDetails(appointment)}
//                             title="View Details"
//                           >
//                             <FaEye />
//                           </button>
//                           <button 
//                           className="btn btn-sm btn-outline-primary"
//                           onClick={() => navigate(`/appointments/reschedule/${appointment.appointment_id}`)}
//                           title="Edit"
//                         >
//                           <FaEdit />
//                         </button>
//                           <button 
//                             className={`btn btn-sm ${appointment.billGenerated ? 'btn-outline-success' : 'btn-outline-warning'}`}
//                             onClick={() => handleBillAction(appointment)}
//                             title={appointment.billGenerated ? 'Print Bill' : 'Generate Bill'}
//                           >
//                             {appointment.billGenerated ? <FaPrint /> : <FaFileInvoiceDollar />}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Appointment Details Modal */}
//       {showDetailsModal && selectedAppointment && (
//         <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">Appointment Details</h5>
//                 <button 
//                   type="button" 
//                   className="btn-close" 
//                   onClick={() => setShowDetailsModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="row mb-3">
//                   <div className="col-md-4 text-center">
//                     {selectedAppointment.image ? (
//                       <img 
//                         src={`http://localhost:8000${selectedAppointment.image}`} 
//                         alt="Patient" 
//                         className="rounded-circle mb-2"
//                         style={{ width: '100px', height: '100px', objectFit: 'cover' }}
//                       />
//                     ) : (
//                       <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
//                         style={{ width: '100px', height: '100px' }}
//                       >
//                         <FaUser size={40} className="text-white" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="col-md-8">
//                     <h4>{selectedAppointment.patient_name}</h4>
//                     <p className="mb-1">
//                       <strong>Registration ID:</strong> {selectedAppointment.registration_id}
//                     </p>
//                     <p className="mb-1">
//                       <strong>Appointment ID:</strong> {selectedAppointment.appointment_id}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="card mb-3">
//                       <div className="card-header bg-light">
//                         <h6 className="mb-0">Appointment Details</h6>
//                       </div>
//                       <div className="card-body">
//                         <p><strong>Doctor:</strong> {selectedAppointment.doctor_name}</p>
//                         <p><strong>Department:</strong> {selectedAppointment.department_name}</p>
//                         <p><strong>Date:</strong> {moment(selectedAppointment.appointment_date).format('DD-MM-YYYY')}</p>
//                         <p><strong>Time:</strong> {selectedAppointment.appointment_time.substring(0, 5)}</p>
//                         <p><strong>Status:</strong> 
//                           <span className={`badge ${
//                             selectedAppointment.status === 'completed' ? 'bg-success' :
//                             selectedAppointment.status === 'cancelled' ? 'bg-danger' : 'bg-primary'
//                           } ms-2`}>
//                             {selectedAppointment.status}
//                           </span>
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="card mb-3">
//                       <div className="card-header bg-light">
//                         <h6 className="mb-0">Billing Information</h6>
//                       </div>
//                       <div className="card-body">
//                         <p><strong>Bill Status:</strong> 
//                           <span className={`badge ${
//                             selectedAppointment.billGenerated ? 'bg-success' : 'bg-warning'
//                           } ms-2`}>
//                             {selectedAppointment.billGenerated ? 'Generated' : 'Pending'}
//                           </span>
//                         </p>
//                         <button 
//                           className={`btn w-100 mt-2 ${
//                             selectedAppointment.billGenerated ? 'btn-success' : 'btn-warning'
//                           }`}
//                           onClick={() => {
//                             handleBillAction(selectedAppointment);
//                             setShowDetailsModal(false);
//                           }}
//                         >
//                           {selectedAppointment.billGenerated ? (
//                             <>
//                               <FaPrint /> Print Bill
//                             </>
//                           ) : (
//                             <>
//                               <FaFileInvoiceDollar /> Generate Bill
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button 
//                   type="button" 
//                   className="btn btn-secondary" 
//                   onClick={() => setShowDetailsModal(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewAllAppointments;