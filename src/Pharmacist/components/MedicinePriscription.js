import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MedImage from './HosLogo.jpg'; // Make sure to have this image in your project

const PrescriptionView = ({ appointmentId, onClose }) => {
  
  // Dummy hospital data
  const hospitalInfo = {
    name: "Medicare Hospital",
    address: "456 Health Avenue, Medical City, MC 67890",
    phone: "(555) 765-4321",
    emergency: "(555) 999-8888",
    email: "contact@medicarehospital.org",
    website: "www.medicarehospital.org"
  };

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/pharmacy/api/prescriptions/${appointmentId}/`);
        if (response.data && response.data.length > 0) {
          setPrescription(response.data[0]); // Assuming the API returns an array
        } else {
          setError("No prescription data found");
        }
      } catch (err) {
        setError("Failed to fetch prescription data");
        console.error("Error fetching prescription:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [appointmentId]);

  if (loading) {
    return <div className="text-center py-2">Loading prescription...</div>;
  }

  if (error) {
    return <div className="text-center py-2 text-danger">{error}</div>;
  }

  if (!prescription) {
    return <div className="text-center py-2">No prescription found</div>;
  }

  return (
    <div className="prescription-container">
      <div className="prescription-card">
        {/* Header with hospital info */}
        <div className="prescription-header">
          <img src={MedImage} alt="Medicare Hospital Logo" className="hospital-logo" />
          <div className="hospital-info">
            <h2>{hospitalInfo.name}</h2>
            <p>{hospitalInfo.address}</p>
            <div className="hospital-contacts">
              <span>Phone: {hospitalInfo.phone}</span>
              <span>Emergency: {hospitalInfo.emergency}</span>
              <span>Email: {hospitalInfo.email}</span>
              <span>Website: {hospitalInfo.website}</span>
            </div>
          </div>
        </div>

        {/* Patient and prescription info */}
        <div className="prescription-body">
          <div className="patient-info">
            <h3>Patient Information</h3>
            <p><span>Name:</span> {prescription.patient.full_name}</p>
            <p><span>Registration ID:</span> {prescription.patient.registration_id}</p>
            <p><span>Gender:</span> {prescription.patient.gender}</p>
          </div>

          <div className="prescription-info">
            <h3>Prescription</h3>
            <p><span>Date:</span> {prescription.date_prescribed}</p>
          </div>
        </div>

        {/* Medicine details */}
        <div className="medicine-details">
          <h3>Medication Prescribed</h3>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Route</th>
                <th>Qty</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{prescription.medicine.medicine_name}</td>
                <td>{prescription.dosage}</td>
                <td>{prescription.frequency}</td>
                <td>{prescription.number_of_days} day(s)</td>
                <td>{prescription.route}</td>
                <td>{prescription.quantity}</td>
                <td>{prescription.take_medicine}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Doctor and footer */}
        <div className="prescription-footer">
          <div className="doctor-signature">
            <p>_________________________</p>
            <p>Dr. {prescription.doctor_name}</p>
            <p>{prescription.department_name}</p>
          </div>
          <div className="prescription-notes">
            <p><strong>Notes:</strong></p>
            <p>- Complete the full course of medication</p>
            <p>- Do not share your medication with others</p>
            <p>- Contact us if you experience any side effects</p>
          </div>
        </div>

        <div className="prescription-actions">
          <button className="print-button" onClick={() => window.print()}>Print Prescription</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;

// CSS styles (same as previous version)
const styles = `
.prescription-container {
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 10px auto;
  padding: 10px;
  font-size: 13px;
}

.prescription-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #d1d5db;
}

.prescription-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #3b82f6;
}

.hospital-logo {
  height: 50px;
  margin-right: 15px;
  object-fit: contain;
}

.hospital-info h2 {
  color: #1e40af;
  margin: 0 0 3px 0;
  font-size: 18px;
}

.hospital-info p {
  margin: 2px 0;
  color: #4b5563;
  font-size: 12px;
}

.hospital-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
  font-size: 11px;
}

.hospital-contacts span {
  background: #e0e7ff;
  padding: 2px 6px;
  border-radius: 3px;
  color: #1e40af;
}

.prescription-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-size: 12px;
}

.patient-info, .prescription-info {
  flex: 1;
}

.patient-info h3, .prescription-info h3 {
  color: #1e40af;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 3px;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.patient-info p, .prescription-info p {
  margin: 4px 0;
}

.patient-info span, .prescription-info span {
  font-weight: bold;
  margin-right: 5px;
}

.medicine-details {
  margin-bottom: 15px;
}

.medicine-details h3 {
  color: #1e40af;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 3px;
  margin: 0 0 8px 0;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  background: white;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-size: 12px;
}

th, td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #3b82f6;
  color: white;
  font-weight: normal;
}

tr:nth-child(even) {
  background-color: #f9fafb;
}

.prescription-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #3b82f6;
  font-size: 12px;
}

.doctor-signature {
  text-align: center;
  width: 40%;
}

.doctor-signature p {
  margin: 3px 0;
}

.prescription-notes {
  width: 55%;
}

.prescription-notes p {
  margin: 3px 0;
}

.prescription-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.print-button, .close-button {
  padding: 5px 15px;
  margin-left: 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.print-button {
  background-color: #3b82f6;
  color: white;
}

.print-button:hover {
  background-color: #2563eb;
}

.close-button {
  background-color: #e5e7eb;
  color: #4b5563;
}

.close-button:hover {
  background-color: #d1d5db;
}

@media print {
  .prescription-actions {
    display: none;
  }
  
  .prescription-card {
    box-shadow: none;
    border: none;
  }
}
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);