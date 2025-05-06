
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";  // 👈 import toast
import 'react-toastify/dist/ReactToastify.css';          // 👈 import styles

const AddLabReport = () => {
  const navigate = useNavigate();
  const { prescriptionId } = useParams();

  const [prescription, setPrescription] = useState(null);
  const [formData, setFormData] = useState({
    test: "",
    actual_value: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        if (!prescriptionId) {
          setError("Prescription ID is missing");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `http://localhost:8000/api/lab/labtest-prescriptions/${prescriptionId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        if (!res.data.tests || res.data.tests.length === 0) {
          setError("No tests found in this prescription");
        }

        setPrescription(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.error || "Failed to load prescription details");
      }
    };

    fetchPrescription();
  }, [prescriptionId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.test) {
      setError("Please select a test");
      setIsSubmitting(false);
      return;
    }

    if (!formData.actual_value) {
      setError("Please enter the actual value");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      lab_test_prescription: Number(prescriptionId),
      test: Number(formData.test),
      actual_value: formData.actual_value,
    };

    try {
      await axios.post(
        "http://localhost:8000/api/lab/labreports/create/",
        payload,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      toast.success("Lab Report created successfully! 🎉", {
        position: "top-center",    // 👈 Make it appear at top center
        autoClose: 3000,           // 👈 3 seconds then disappear
      });

      // After short delay, navigate
      setTimeout(() => {
        navigate("/labtechnition/dashboard");
      }, 3000); // Match toast close time

    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.error || "Failed to add lab report. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!prescription) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading prescription details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <ToastContainer /> {/* 👈 Toast Container should be inside the component */}
      <h3 className="text-center text-primary mb-4">Add Lab Report</h3>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn-close float-end"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          {/* Patient and prescription info */}
          <div className="mb-4 p-3 bg-light rounded">
            <h5>Prescription Details</h5>
            <div className="row">
              <div className="col-md-4">
                <strong>Patient:</strong> {prescription.patient_name}
              </div>
              <div className="col-md-4">
                <strong>Doctor:</strong> Dr. {prescription.doctor_name}
              </div>
              <div className="col-md-4">
                <strong>Date:</strong> {new Date(prescription.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Test selection */}
            <div className="mb-3">
              <label className="form-label">Select Test</label>
              <select
                name="test"
                className="form-select"
                value={formData.test}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">-- Select Test --</option>
                {prescription.tests.map((test) => (
                  <option key={test.test_id} value={test.test_id}>
                    {test.test_name} (₹{test.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Actual value input */}
            <div className="mb-3">
              <label className="form-label">
                Actual Value <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="actual_value"
                className="form-control"
                value={formData.actual_value}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="Enter test result value"
              />
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  "Add Result"
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLabReport;


