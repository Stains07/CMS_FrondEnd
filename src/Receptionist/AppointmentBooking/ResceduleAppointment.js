import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaUser,
  FaIdCard,
  FaVenusMars,
  FaTint,
  FaBirthdayCake,
  FaPhone,
  FaHospital,
  FaStethoscope,
  FaPlus,
  FaMoneyBillWave,
  FaReceipt
} from 'react-icons/fa';
import { BiCalendar } from 'react-icons/bi';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import PaymentModal from './ReschedulePayment';

const API_BASE_URL = 'http://localhost:8000/api/';

const RescheduleAppointment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [consultationFee, setConsultationFee] = useState(0);
  const [previousPayment, setPreviousPayment] = useState(0);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}get/appointments/${appointmentId}/`,
          authHeaders
        );
        const appt = response.data;
        setAppointment(appt);
        setPatient({
          patient_id: appt.patient_id,
          full_name: appt.patient_name,
          registration_id: appt.registration_id,
          phone_number: appt.phone_number,
          gender: appt.gender,
          blood_group: appt.blood_group,
          dob: appt.dob,
          image: appt.image
        });
        setSelectedDepartment(appt.department_id);
        setSelectedDoctor(appt.doctor_id);
        setSelectedDate(appt.appointment_date);

        if (appt.payment_id) {
          try {
            const paymentResponse = await axios.get(
              `${API_BASE_URL}payments/${appt.payment_id}/`,
              authHeaders
            );
            setPreviousPayment(Number(paymentResponse.data.amount) || 0);
          } catch (error) {
            console.error('Error fetching payment details:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch appointment details');
        navigate(-1);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}departments/`, authHeaders);
        setDepartments(response.data);
      } catch (error) {
        toast.error('Failed to fetch departments');
      }
    };

    fetchAppointment();
    fetchDepartments();
  }, [appointmentId]);

  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
    if (!selectedDate) setSelectedDate(dates[0]);
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedDepartment) return;
      try {
        const response = await axios.get(
          `${API_BASE_URL}departments/${selectedDepartment}/doctors/`,
          authHeaders
        );
        const doctorsData = response.data.doctors?.map(doctor => ({
          ...doctor,
          consultation_fee: Number(doctor.consultation_fee) || 0
        })) || [];
        setDoctors(doctorsData);
        if (!doctorsData.some(doc => doc.doc_id == selectedDoctor)) {
          setSelectedDoctor('');
          setDoctorDetails(null);
        }
      } catch (error) {
        toast.error('Failed to fetch doctors');
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedDoctor && doctors.length > 0) {
      const doctor = doctors.find(d => d.doc_id == selectedDoctor);
      if (doctor) {
        setDoctorDetails(doctor);
        setConsultationFee(Number(doctor.consultation_fee) || 0);
        setSelectedSlot(null);
        setShowAddSlot(false);
      }
    }
  }, [selectedDoctor, doctors]);

  useEffect(() => {
    fetchBookedAppointments();
  }, [selectedDoctor, selectedDate]);

  const fetchBookedAppointments = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setTimeSlotsLoading(true);
    try {
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      const response = await axios.get(
        `${API_BASE_URL}appointments/doctor/${selectedDoctor}/${formattedDate}/`,
        authHeaders
      );

      const appointments = response.data?.length ? response.data : [];
      const bookedAppointments = appointments
        .filter(appt => appt.appointment_id != appointmentId)
        .map(appt => ({
          time: appt.appointment_time,
          token: appt.token_number
        }));

      setBookedSlots(bookedAppointments);
      generateTimeSlots(bookedAppointments);
    } catch (error) {
      if (error.response?.status === 404) {
        setBookedSlots([]);
        generateTimeSlots([]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch appointments');
      }
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  const generateTimeSlots = (bookedAppointments = []) => {
    if (!doctorDetails || !doctorDetails.consultation_time) {
      setTimeSlots([]);
      return;
    }
    const slots = [];
    const consultationTime = new Date(`1970-01-01T${doctorDetails.consultation_time}`);
    const now = new Date();
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (let i = 1; i <= 50; i++) {
      const startTime = new Date(consultationTime);
      startTime.setMinutes(consultationTime.getMinutes() + (i - 1) * 10);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + 10);
      const formattedStartTime = startTime.toTimeString().substring(0, 5);
      const formattedEndTime = endTime.toTimeString().substring(0, 5);
      const isBooked = bookedAppointments.some(appt => {
        const apptTime = appt.time.substring(0, 5);
        return apptTime === formattedStartTime || appt.token === i;
      });
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

    const currentAppointmentTime = appointment?.appointment_time?.substring(0, 5);
    if (
      selectedDoctor == appointment?.doctor_id &&
      selectedDate == appointment?.appointment_date &&
      currentAppointmentTime
    ) {
      const matchingSlot = slots.find(slot => slot.startTime === currentAppointmentTime);
      if (matchingSlot && !matchingSlot.isBooked && !matchingSlot.isExpired) {
        setSelectedSlot(matchingSlot);
      }
    }
  };

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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}api/appointments/${appointmentId}/`,
        {
          department_id: parseInt(selectedDepartment),
          doctor_id: parseInt(selectedDoctor),
          appointment_date: selectedDate,
          appointment_time: selectedSlot.startTime + ':00'
        },
        authHeaders
      );

      if (consultationFee !== previousPayment) {
        setShowPaymentModal(true);
      } else {
        toast.success('Appointment rescheduled successfully with no payment changes!');
        navigate('/appointments/reschedule-payment');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reschedule appointment');
    }
  };

  const handlePaymentComplete = status => {
    setPaymentStatus(status);
    if (status === 'success') {
      toast.success('Payment processed successfully!');
    } else if (status === 'refunded') {
      toast.success('Refund processed successfully!');
    }
    navigate('/appointments');
  };

  const calculatePaymentDifference = () => {
    return consultationFee - previousPayment;
  };

  if (loading) {
    return <div className="text-center py-5">Loading appointment details...</div>;
  }

  if (!appointment || !patient) {
    return <div className="text-center py-5">Appointment not found</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: '650px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-3 d-flex align-items-center gap-2"
        style={{ fontSize: '0.9rem', padding: '0.375rem 0.75rem' }}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-2">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <FaCalendarAlt size={18} /> Reschedule Appointment
          </h5>
        </div>

        <div className="card-body p-3">
          <div className="mb-3 p-2 border rounded bg-light">
            <div className="d-flex align-items-center gap-2">
              {patient.image ? (
                <img
                  src={`${API_BASE_URL}${patient.image}`}
                  alt="Patient"
                  className="rounded-circle"
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
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

          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Current Appointment Details</h6>
              <p>
                <strong>Department:</strong> {appointment.department_name}
              </p>
              <p>
                <strong>Doctor:</strong> Dr. {appointment.doctor_name}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {appointment.appointment_time.substring(0, 5)}
              </p>
              <p>
                <strong>Token:</strong> {appointment.token_number}
              </p>
              {previousPayment > 0 && (
                <p className="text-success">
                  <strong>Paid Amount:</strong> ${previousPayment.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small d-flex align-items-center gap-1">
                <FaHospital size={14} /> Department
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
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
                onChange={e => setSelectedDoctor(e.target.value)}
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
                      <FaUserMd size={12} /> {doctorDetails.department_name}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FaMoneyBillWave size={12} /> Fee: $
                      {typeof doctorDetails.consultation_fee === 'number'
                        ? doctorDetails.consultation_fee.toFixed(2)
                        : '0.00'}
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
                onChange={e => setSelectedDate(e.target.value)}
                required
              >
                <option value="">Select Date</option>
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
                    <span className="badge bg-success" style={{ width: '80px', height: '20px' }}>
                      Selected
                    </span>
                    <span className="badge bg-primary" style={{ width: '80px', height: '20px' }}>
                      Available
                    </span>
                    <span className="badge bg-secondary" style={{ width: '80px', height: '20px' }}>
                      Booked
                    </span>
                    <span
                      className="badge bg-light border"
                      style={{ width: '80px', height: '20px', color: 'black' }}
                    >
                      Expired
                    </span>
                  </div>
                </div>

                {timeSlotsLoading ? (
                  <div className="text-center py-1">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
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
                          slot.isBooked
                            ? 'btn-secondary disabled'
                            : slot.isExpired
                            ? 'btn-light disabled text-muted border'
                            : selectedSlot?.token === slot.token
                            ? 'btn-success'
                            : 'btn-outline-primary'
                        }`}
                        style={{
                          width: '60px',
                          height: '37px',
                          padding: '0.1rem',
                          fontSize: '0.7rem'
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

            <div className="col-12 mt-2">
              <button
                className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                onClick={handleSubmit}
                disabled={loading || !selectedSlot}
              >
                <BiCalendar size={16} /> Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onHide={() => {
            setShowPaymentModal(false);
            navigate('/appointments');
          }}
          amount={Math.abs(calculatePaymentDifference())}
          isRefund={calculatePaymentDifference() < 0}
          appointmentId={appointmentId}
          onPaymentComplete={handlePaymentComplete}
          previousPayment={previousPayment}
          newFee={consultationFee}
        />
      )}
    </div>
  );
};

export default RescheduleAppointment;