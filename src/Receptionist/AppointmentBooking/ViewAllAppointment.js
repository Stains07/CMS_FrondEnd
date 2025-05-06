import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaUser, 
  FaFileInvoiceDollar,
  FaPrint,
  FaEdit,
  FaEye,
  FaArrowLeft,
  FaHome,
  FaCalendarAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';

const ViewAllAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');

  // Date filter options
  const dateOptions = [
    { value: 'previous', label: 'Previous Day' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'next4', label: 'Next 4 Days' },
    { value: 'all', label: 'All Appointments' }
  ];

  // Fetch all appointments with bill status
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('https://blueeye10.pythonanywhere.com/api/appointments/book/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        // Fetch bill status for each appointment
        const appointmentsWithBillStatus = await Promise.all(
          response.data.map(async (appointment) => {
            try {
              const billResponse = await axios.get(
                `https://blueeye10.pythonanywhere.com/api/billing/${appointment.appointment_id}/`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                  }
                }
              );
              return { ...appointment, billGenerated: true };
            } catch (err) {
              if (err.response?.status === 404) {
                return { ...appointment, billGenerated: false };
              }
              return appointment;
            }
          })
        );
        
        setAppointments(appointmentsWithBillStatus);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Filter and sort appointments based on search term and date filter
  useEffect(() => {
    let filtered = [...appointments];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appt => 
        appt.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    const today = moment().startOf('day');
    switch (dateFilter) {
      case 'previous':
        const yesterday = moment().subtract(1, 'day').startOf('day');
        filtered = filtered.filter(appt => 
          moment(appt.appointment_date).isSame(yesterday, 'day')
        );
        break;
      case 'today':
        filtered = filtered.filter(appt => 
          moment(appt.appointment_date).isSame(today, 'day')
        );
        break;
      case 'tomorrow':
        const tomorrow = moment().add(1, 'day').startOf('day');
        filtered = filtered.filter(appt => 
          moment(appt.appointment_date).isSame(tomorrow, 'day')
        );
        break;
      case 'next4':
        const next4Days = moment().add(4, 'days').endOf('day');
        filtered = filtered.filter(appt => 
          moment(appt.appointment_date).isBetween(today, next4Days, null, '[]')
        );
        break;
      case 'all':
        // No date filtering needed
        break;
      default:
        break;
    }
    
    // Sort by date (ascending) and time (ascending)
    filtered.sort((a, b) => {
      const dateA = moment(`${a.appointment_date} ${a.appointment_time}`);
      const dateB = moment(`${b.appointment_date} ${b.appointment_time}`);
      return dateA - dateB;
    });
    
    setFilteredAppointments(filtered);
  }, [searchTerm, dateFilter, appointments]);

  // Handle view details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

// In ViewAllAppointments.js
const handleEdit = (appointmentId) => {
  navigate(`/appointments/reschedule/${appointmentId}`);
};

  // Handle bill generation/printing
  const handleBillAction = (appointment) => {
    if (appointment.billGenerated) {
      navigate(`/billing/${appointment.appointment_id}`);
    } else {
      navigate(`/billing/${appointment.appointment_id}`);
    }
  };


  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await axios.patch(
          `https://blueeye10.pythonanywhere.com/api/api/appointments/${appointmentId}/cancel/`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        alert('Appointment cancelled successfully.');
  
        // Update local state to reflect cancelled appointment
        setAppointments(prevAppointments =>
          prevAppointments.map(appt =>
            appt.appointment_id === appointmentId
              ? { ...appt, status: 'cancelled' }
              : appt
          )
        );
  
        setShowDetailsModal(false);  // Close the modal after cancelling
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };
  

  return (
    <div className="container-fluid py-4">
      {/* Navigation and Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => navigate('/')}
          >
            <FaHome /> Home
          </button>
        </div>
        
        <div className="d-flex gap-3 align-items-center">
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="input-group" style={{ width: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by registration ID, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaCalendarAlt /> Appointment List
          </h4>
        </div>
        
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="alert alert-info text-center py-4">
              No appointments found matching your criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>SL No</th>
                    <th>Photo</th>
                    <th>Registration ID</th>
                    <th>Patient Name</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Bill Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => (
                    <tr key={appointment.appointment_id}>
                      <td>{index + 1}</td>
                      <td>
                        {appointment.image ? (
                          <img 
                            src={`http://localhost:8000${appointment.image}`} 
                            alt="Patient" 
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <FaUser size={16} className="text-white" />
                          </div>
                        )}
                      </td>
                      <td>{appointment.registration_id}</td>
                      <td>{appointment.patient_name}</td>
                      <td>{appointment.doctor_name}</td>
                      <td>{appointment.department_name}</td>
                      <td>
                        <span className={`badge ${
                          appointment.status === 'completed' ? 'bg-success' :
                          appointment.status === 'cancelled' ? 'bg-danger' :
                          moment(appointment.appointment_date).isBefore(moment(), 'day') ? 'bg-warning' : 'bg-primary'
                        }`}>
                          {appointment.status === 'completed' ? 'Completed' :
                           appointment.status === 'cancelled' ? 'Cancelled' :
                           moment(appointment.appointment_date).isBefore(moment(), 'day') ? 'Missed' : 'Upcoming'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          appointment.billGenerated ? 'bg-success' : 'bg-warning'
                        }`}>
                          {appointment.billGenerated ? 'Generated' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewDetails(appointment)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/appointments/reschedule/${appointment.appointment_id}`)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                          <button 
                            className={`btn btn-sm ${appointment.billGenerated ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            onClick={() => handleBillAction(appointment)}
                            title={appointment.billGenerated ? 'Print Bill' : 'Generate Bill'}
                          >
                            {appointment.billGenerated ? <FaPrint /> : <FaFileInvoiceDollar />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Appointment Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-4 text-center">
                    {selectedAppointment.image ? (
                      <img 
                        src={`http://localhost:8000${selectedAppointment.image}`} 
                        alt="Patient" 
                        className="rounded-circle mb-2"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <FaUser size={40} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <h4>{selectedAppointment.patient_name}</h4>
                    <p className="mb-1">
                      <strong>Registration ID:</strong> {selectedAppointment.registration_id}
                    </p>
                    <p className="mb-1">
                      <strong>Appointment ID:</strong> {selectedAppointment.appointment_id}
                    </p>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Appointment Details</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Doctor:</strong> {selectedAppointment.doctor_name}</p>
                        <p><strong>Department:</strong> {selectedAppointment.department_name}</p>
                        <p><strong>Date:</strong> {moment(selectedAppointment.appointment_date).format('DD-MM-YYYY')}</p>
                        <p><strong>Time:</strong> {selectedAppointment.appointment_time.substring(0, 5)}</p>
                        <p><strong>Status:</strong> 
                          <span className={`badge ${
                            selectedAppointment.status === 'completed' ? 'bg-success' :
                            selectedAppointment.status === 'cancelled' ? 'bg-danger' : 'bg-primary'
                          } ms-2`}>
                            {selectedAppointment.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Billing Information</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Bill Status:</strong> 
                          <span className={`badge ${
                            selectedAppointment.billGenerated ? 'bg-success' : 'bg-warning'
                          } ms-2`}>
                            {selectedAppointment.billGenerated ? 'Generated' : 'Pending'}
                          </span>
                        </p>
                        <button 
                          className={`btn w-100 mt-2 ${
                            selectedAppointment.billGenerated ? 'btn-success' : 'btn-warning'
                          }`}
                          onClick={() => {
                            handleBillAction(selectedAppointment);
                            setShowDetailsModal(false);
                          }}
                        >
                          {selectedAppointment.billGenerated ? (
                            <>
                              <FaPrint /> Print Bill
                            </>
                          ) : (
                            <>
                              <FaFileInvoiceDollar /> Generate Bill
                            </>
                          )}
                        </button>
 

                      </div>
                      
                    </div>
                    <button 
  className="btn btn-danger w-100 mt-2"
  onClick={() => handleCancelAppointment(selectedAppointment.appointment_id)}
  disabled={selectedAppointment.status !== 'scheduled'}
>
  Cancel Appointment
</button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllAppointments;