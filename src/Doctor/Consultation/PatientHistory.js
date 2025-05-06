import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiNotepad, BiCalendar, BiUser, BiClinic, BiTestTube, BiCapsule } from 'react-icons/bi';
import axios from 'axios';

const PatientHistory = () => {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/api/patient-history/${patient_id}/`);
        // Sort appointments by date (newest first)
        const sortedAppointments = response.data.appointments.sort((a, b) => 
          new Date(b.appointment_date) - new Date(a.appointment_date)
        );
        setHistoryData({
          ...response.data,
          appointments: sortedAppointments
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatientHistory();
  }, [patient_id]);

  if (loading) return <div className="p-4 text-center">Loading patient history...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!historyData) return <div className="p-4 text-center">No history data found</div>;

  // Group prescriptions by appointment_id for easier lookup
  const prescriptionsByAppointment = historyData.prescriptions.reduce((acc, prescription) => {
    acc[prescription.appointment_id] = prescription;
    return acc;
  }, {});

  // Group lab tests by prescription_id (which is linked to appointment_id)
  const labTestsByPrescription = historyData.lab_tests.reduce((acc, labTest) => {
    acc[labTest.prescription_id] = labTest;
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patient Medical History</h1>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Back
        </button>
      </div>

      {historyData.appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No appointment history found for this patient
        </div>
      ) : (
        <div className="space-y-8">
          {historyData.appointments.map((appointment) => (
            <div key={appointment.appointment_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Appointment Header */}
              <div className="bg-blue-50 p-4 border-b">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <BiCalendar className="text-blue-500" size={20} />
                    <span className="font-semibold">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </span>
                    <span className="text-gray-500">
                      {appointment.appointment_time}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <BiUser className="text-blue-500" size={20} />
                      <span>Dr. {appointment.doctor_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BiClinic className="text-blue-500" size={20} />
                      <span>{appointment.department_name}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: appointment.status === 'scheduled' ? '#E1F5FE' : 
                                          appointment.status === 'Pending' ? '#FFF8E1' : '#E8F5E9',
                        color: appointment.status === 'scheduled' ? '#0288D1' : 
                               appointment.status === 'Pending' ? '#FFA000' : '#388E3C'
                      }}
                    >
                      {appointment.status}
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: appointment.appointment_type === 'Paid' ? '#E8F5E9' : '#FFF3E0',
                        color: appointment.appointment_type === 'Paid' ? '#2E7D32' : '#E65100'
                      }}
                    >
                      {appointment.appointment_type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Section */}
              <div className="p-4 border-b">
                <h3 className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                  <BiNotepad className="mr-2 text-green-500" /> Prescription Details
                </h3>
                
                {prescriptionsByAppointment[appointment.appointment_id] ? (
                  <div>
                    <div className="mb-3">
                      <span className="font-medium">Diagnosis: </span>
                      <span>{prescriptionsByAppointment[appointment.appointment_id].diagnosis || 'Not specified'}</span>
                    </div>
                    
                    <h4 className="flex items-center text-md font-medium text-gray-600 mb-2">
                      <BiCapsule className="mr-2 text-blue-500" /> Medicines Prescribed
                    </h4>
                    
                    {prescriptionsByAppointment[appointment.appointment_id].medicines.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-50 rounded-lg overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Medicine</th>
                              <th className="px-4 py-2 text-left">Company</th>
                              <th className="px-4 py-2 text-left">Dosage</th>
                              <th className="px-4 py-2 text-left">Frequency</th>
                              <th className="px-4 py-2 text-left">Route</th>
                              <th className="px-4 py-2 text-left">Duration</th>
                              <th className="px-4 py-2 text-left">Instructions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptionsByAppointment[appointment.appointment_id].medicines.map((medicine, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2">{medicine.medicine_name}</td>
                                <td className="px-4 py-2">{medicine.company_name}</td>
                                <td className="px-4 py-2">{medicine.dosage}</td>
                                <td className="px-4 py-2">{medicine.frequency}</td>
                                <td className="px-4 py-2 capitalize">{medicine.route}</td>
                                <td className="px-4 py-2">{medicine.number_of_days} days</td>
                                <td className="px-4 py-2">{medicine.take_medicine}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No medicines prescribed</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No prescription available for this appointment</div>
                )}
              </div>

              {/* Lab Tests Section */}
              <div className="p-4">
                <h3 className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                  <BiTestTube className="mr-2 text-purple-500" /> Lab Tests
                </h3>
                
                {labTestsByPrescription[prescriptionsByAppointment[appointment.appointment_id]?.prescription_id] ? (
                  <div>
                    <div className="mb-2">
                      <span className="font-medium">Status: </span>
                      <span className="capitalize">
                        {labTestsByPrescription[prescriptionsByAppointment[appointment.appointment_id].prescription_id].status}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="font-medium">Tests Ordered: </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {labTestsByPrescription[prescriptionsByAppointment[appointment.appointment_id].prescription_id].test_names.map((test, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {labTestsByPrescription[prescriptionsByAppointment[appointment.appointment_id].prescription_id].notes && (
                      <div>
                        <span className="font-medium">Notes: </span>
                        <span>{labTestsByPrescription[prescriptionsByAppointment[appointment.appointment_id].prescription_id].notes}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No lab tests ordered for this appointment</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;