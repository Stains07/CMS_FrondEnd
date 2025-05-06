
import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";

const LabTestPrescriptionView = () => {
  const [labPrescriptions, setLabPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLabPrescriptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/lab/labtest-prescriptions/", {
          headers: { Authorization: `Token ${token}` },
        });

        const formattedData = response.data.map(prescription => ({
          ...prescription,
          created_at: new Date(prescription.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
          tests: prescription.tests || [] // Ensure tests is always an array
        }));

        setLabPrescriptions(formattedData);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch lab test prescriptions");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabPrescriptions();
  }, []);

  const togglePrescriptionDetails = (id) => {
    setExpandedPrescription(prev => (prev === id ? null : id));
  };

  const handleBackToDashboard = () => {
    navigate("/labtechnition/dashboard");
  };

  const handleAddResult = async (prescriptionId) => {
    if (!prescriptionId) {
      setError("Invalid prescription ID");
      return;
    }

    setIsNavigating(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. First update the status to 'completed'
      await axios.patch(
        `http://localhost:8000/api/lab/labtest-prescriptions/${prescriptionId}/update-status/`,
        { status: "completed" },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 2. After successful status update, navigate to Add Result page
      navigate(`/labtechnition/add-result/${prescriptionId}`);
    } catch (err) {
      console.error("Error updating status or navigating:", err);
      setError("Failed to update prescription status or navigate.");
    } finally {
      setIsNavigating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading lab test prescriptions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => window.location.reload()}>
            Retry
          </button>
          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Lab Test Prescriptions</h2>
        <button className="btn btn-outline-secondary" onClick={handleBackToDashboard}>
          <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
        </button>
      </div>

      {labPrescriptions.length === 0 ? (
        <div className="alert alert-info">
          No lab test prescriptions found.
        </div>
      ) : (
        <div className="accordion" id="labPrescriptionsAccordion">
          {labPrescriptions.map(prescription => (
            <div key={prescription.prescription_id} className="card mb-3 shadow-sm">
              <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className="btn btn-link text-decoration-none"
                      onClick={() => togglePrescriptionDetails(prescription.prescription_id)}
                    >
                      <h5 className="mb-0">
                        Lab Test Prescription #{prescription.prescription_id}
                      </h5>
                    </button>
                    <div className="ms-3">
                      <small className="text-muted">
                        Patient: {prescription.patient_name} | Doctor: Dr. {prescription.doctor_name} | Date: {prescription.created_at} | Status: <span className={`badge bg-${prescription.status === 'completed' ? 'success' : prescription.status === 'cancelled' ? 'danger' : 'warning'}`}>{prescription.status}</span>
                      </small>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => togglePrescriptionDetails(prescription.prescription_id)}
                  >
                    {expandedPrescription === prescription.prescription_id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>

              {expandedPrescription === prescription.prescription_id && (
                <div className="card-body">
                  <div className="mb-4">
                    <h6 className="text-primary">Notes</h6>
                    <div className="p-3 bg-light rounded">
                      {prescription.notes || 'No additional notes provided.'}
                    </div>
                  </div>

                  <h6 className="text-primary mb-3">Requested Lab Tests</h6>
                  {prescription.tests.length > 0 ? (
                    <ul className="list-group mb-3">
                      {prescription.tests.map((test, index) => (
                        <li key={`${prescription.prescription_id}-${test.test_id || index}`} className="list-group-item">
                          {test.test_name} - ₹{test.price}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="alert alert-warning mb-3">
                      No lab tests requested for this prescription.
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                      className="btn btn-success"
                      onClick={() => handleAddResult(prescription.prescription_id)}
                      disabled={isNavigating}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      {isNavigating ? 'Processing...' : 'Add Result'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabTestPrescriptionView;



