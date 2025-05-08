import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateBill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateBill = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Validate location state
        if (!location.state?.patient || !location.state?.cart) {
          throw new Error("Missing patient or cart data");
        }

        const { patient, cart } = location.state;

        // Validate required fields
        if (!patient.patientId) {
          throw new Error("Patient ID is required");
        }

        if (!Array.isArray(cart) || cart.length === 0) {
          throw new Error("Cart must contain at least one item");
        }

        // Prepare request data with type safety
        const billData = {
          patient_id: patient.patientId,
          prescription_id: patient.prescriptionId || null,
          cart_items: cart.map(item => ({
            medicine_id: item.id || item.medicine_id || null,
            medicine_name: item.medicine_name || 'Unknown Medicine',
            dosage: item.dosage || '',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1
          }))
        };

        // Make API request
        const response = await axios.post(
          "https://blueeye10.pythonanywhere.com/api/pharmacy/generate-bill/",
          billData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Validate response structure
        if (!response.data?.bill) {
          throw new Error("Invalid response format from server");
        }

        // Format bill data for display
        setBill({
          ...response.data.bill,
          patient_name: patient.patientName || 'Unknown Patient',
          items: cart,
          bill_date: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          bill_number: `BIL-${Date.now().toString().slice(-6)}`,
          gst: response.data.bill.gst || 5.0, // Default GST if not provided
          total: parseFloat(response.data.bill.total) || 0
        });
        
      } catch (err) {
        console.error("Bill generation error:", err);
        
        // Handle different error formats
        let errorMessage = "Failed to generate bill";
        if (err.response) {
          errorMessage = err.response.data?.error || 
                        err.response.data?.detail || 
                        JSON.stringify(err.response.data);
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    generateBill();
  }, [location, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewBill = () => {
    navigate('/pharmacy/prescriptions');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Generating bill...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error.toString()}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => navigate('/pharmacy/prescriptions')}
          >
            Back to Prescriptions
          </button>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          No bill data available
          <button 
            className="btn btn-sm btn-outline-warning ms-3"
            onClick={() => navigate('/pharmacy/prescriptions')}
          >
            Back to Prescriptions
          </button>
        </div>
      </div>
    );
  }

  // Calculate values if not provided by server
  const subtotal = bill.price || bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstRate = bill.gst || 5.0;
  const gstAmount = subtotal * (gstRate / 100);
  const totalAmount = subtotal + gstAmount;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4 no-print">
        <button 
          className="btn btn-outline-secondary"
          onClick={handleNewBill}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Prescriptions
        </button>
        <button 
          className="btn btn-primary"
          onClick={handlePrint}
        >
          <i className="bi bi-printer me-1"></i> Print Bill
        </button>
      </div>

      <div className="bill-container p-4 border shadow-sm bg-white">
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .bill-container, .bill-container * {
                visibility: visible;
              }
              .bill-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                margin: 0;
                border: none;
                background: white;
              }
              .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        <div className="text-center mb-4">
          <h2 className="text-primary">MEDCARE HOSPITAL</h2>
          <p className="mb-1">123 Health Street, Medical City, MC 12345</p>
          <p>Phone: (123) 456-7890 | GSTIN: 22AAAAA0000A1Z5</p>
          <h4 className="mt-3 border-top border-bottom py-2">MEDICINE BILL</h4>
        </div>
        
        <div className="row mb-4">
          <div className="col-md-6">
            <p><strong>Bill No:</strong> {bill.bill_number}</p>
            <p><strong>Bill Date:</strong> {bill.bill_date}</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p><strong>Patient:</strong> {bill.patient_name}</p>
            <p><strong>Prescription No:</strong> {bill.prescription || 'N/A'}</p>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Qty</th>
                <th>Unit Price (₹)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.medicine_name || 'Unknown'}</td>
                  <td>{item.dosage || '-'}</td>
                  <td>{item.quantity || 0}</td>
                  <td>{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>{(parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" className="text-end"><strong>Subtotal:</strong></td>
                <td>{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="5" className="text-end"><strong>GST ({gstRate}%):</strong></td>
                <td>{gstAmount.toFixed(2)}</td>
              </tr>
              <tr className="table-active">
                <td colSpan="5" className="text-end"><strong>Total Amount:</strong></td>
                <td><strong>{totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-4 pt-3 border-top">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Payment Status:</strong> 
                <span className={`badge ${bill.status === 'Paid' ? 'bg-success' : 'bg-warning'} ms-2`}>
                  {bill.status || 'Pending'}
                </span>
              </p>
              <p><strong>Payment Mode:</strong> Cash</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-1">For MedCare Hospital</p>
              <div className="mt-4 pt-2">
                <p className="mb-0 border-top pt-2">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-muted">
          <small>Thank you for your visit. Please bring this bill for any returns or exchanges within 7 days.</small>
        </div>
      </div>
    </div>
  );
};

export default GenerateBill;