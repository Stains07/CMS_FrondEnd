import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";

const PrescriptionView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cart, setCart] = useState([]);
  const [showBill, setShowBill] = useState(false);
  const navigate = useNavigate();

  const hospitalInfo = {
    name: "Medicare Hospital",
    address: "456 Health Avenue, Medical City, MC 67890",
    phone: "(555) 765-4321",
    emergency: "(555) 999-8888",
    email: "contact@medicarehospital.org",
    website: "www.medicarehospital.org"
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/pharmacy/prescriptions/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const formattedData = response.data.map(prescription => ({
          ...prescription,
          prescription_date: new Date(prescription.prescription_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }));

        setPrescriptions(formattedData);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch prescriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const togglePrescriptionDetails = (prescriptionId) => {
    if (expandedPrescription === prescriptionId) {
      setExpandedPrescription(null);
    } else {
      setExpandedPrescription(prescriptionId);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/pharmacist/dashboard");
  };

  const viewPrescription = (prescriptionId) => {
    navigate(`/pharmacist/prescription/${prescriptionId}`);
  };

  const reduceStock = async (items) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authorization token is missing");
        return;
      }
  
      const response = await axios.post(
        "http://localhost:8000/api/pharmacy/reduce-stock/",
        { items },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
  
      console.log("Stock reduced:", response.data);
    } catch (error) {
      console.error("Failed to reduce stock:", error.response?.data || error.message);
      setError("Error reducing stock. Please try again.");
    }
  };

  const addToCart = (medicine, prescription) => {
    try {
      const price = parseFloat(medicine.price_per_unit) || 0.00;

      // Check if we're adding for a different patient than currently selected
      if (selectedPatient && selectedPatient.patientId !== prescription.patient_id) {
        setError("You can only add medicines for one patient at a time. Please complete the current patient's bill first.");
        return;
      }

      if (!selectedPatient) {
        setSelectedPatient({
          patientId: prescription.patient_id,
          patientName: prescription.patient_name,
          prescriptionId: prescription.prescription_id,
          doctorName: prescription.doctor_name,
          prescriptionDate: prescription.prescription_date
        });
      }

      // Check if the exact same medicine (same name and dosage) is already in the cart
      const existingItem = cart.find(item => 
        item.medicine_name === medicine.medicine_name && 
        item.dosage === medicine.dosage &&
        item.prescriptionId === prescription.prescription_id
      );

      if (existingItem) {
        setError(`${medicine.medicine_name} (${medicine.dosage}) is already in the cart for this prescription.`);
        return;
      }

      // If not, add it to the cart
      setCart([...cart, {
        ...medicine,
        price: price,
        quantity: 1,
        prescriptionId: prescription.prescription_id,
        patientId: prescription.patient_id
      }]);

      // Call reduceStock to update the stock
      const itemsToReduce = [{ medicine_name: medicine.medicine_name, quantity: 1 }];
      reduceStock(itemsToReduce);
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add medicine to cart. Please try again.");
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);

    if (newCart.length === 0) {
      setSelectedPatient(null);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0.00;
      return total + price * item.quantity;
    }, 0);
  };

  const calculateGST = () => {
    return calculateSubtotal() * 0.05;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST();
  };

  const generateBill = () => {
    setShowBill(true);
  };

  const printBill = () => {
    window.print();
  };

  const closeBill = () => {
    setShowBill(false);
    setCart([]);
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading prescriptions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {showBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hospital Bill</h5>
                <button type="button" className="btn-close" onClick={closeBill}></button>
              </div>
              <div className="modal-body" id="bill-content">
                <div className="text-center mb-4">
                  <h3>{hospitalInfo.name}</h3>
                  <p className="mb-1">{hospitalInfo.address}</p>
                  <p className="mb-1">Phone: {hospitalInfo.phone} | Emergency: {hospitalInfo.emergency}</p>
                  <p className="mb-1">Email: {hospitalInfo.email} | Website: {hospitalInfo.website}</p>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5>Patient Details</h5>
                    <p><strong>Name:</strong> {selectedPatient?.patientName}</p>
                    <p><strong>Prescription ID:</strong> {selectedPatient?.prescriptionId}</p>
                  </div>
                  <div className="col-md-6 text-end">
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Doctor:</strong> Dr. {selectedPatient?.doctorName}</p>
                    <p><strong>Prescription Date:</strong> {selectedPatient?.prescriptionDate}</p>
                  </div>
                </div>
                
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.medicine_name}</td>
                        <td>{item.dosage}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="row justify-content-end">
                  <div className="col-md-4">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Subtotal</th>
                          <td>${calculateSubtotal().toFixed(2)}</td>
                        </tr>
                        <tr>
                          <th>GST (5%)</th>
                          <td>${calculateGST().toFixed(2)}</td>
                        </tr>
                        <tr className="table-active">
                          <th>Total</th>
                          <td>${calculateTotal().toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <p>Thank you for choosing {hospitalInfo.name}</p>
                  <p>For any queries, please contact our billing department</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeBill}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={printBill}>
                  Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Prescriptions</h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={handleBackToDashboard}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          {prescriptions.length === 0 ? (
            <div className="alert alert-info">
              No prescriptions found.
              <button 
                className="btn btn-sm btn-outline-secondary ms-3"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="accordion" id="prescriptionsAccordion">
              {prescriptions.map(prescription => (
                <div key={prescription.prescription_id} className="card mb-3 shadow-sm">
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <button
                          className="btn btn-link text-decoration-none"
                          onClick={() => togglePrescriptionDetails(prescription.prescription_id)}
                        >
                          <h5 className="mb-0">
                            Prescription #{prescription.prescription_id}
                          </h5>
                        </button>
                        <div className="ms-3">
                          <small className="text-muted">
                            Patient: {prescription.patient_name} | 
                            Doctor: Dr. {prescription.doctor_name} | 
                            Date: {prescription.prescription_date}
                          </small>
                        </div>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-info me-2"
                          onClick={() => viewPrescription(prescription.prescription_id)}
                        >
                          <i className="bi bi-eye-fill me-1"></i> View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => togglePrescriptionDetails(prescription.prescription_id)}
                        >
                          {expandedPrescription === prescription.prescription_id ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedPrescription === prescription.prescription_id && (
                    <div className="card-body">
                      <h6 className="text-primary mb-3">Prescribed Medications</h6>
                      {prescription.medicines.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead className="table-primary">
                              <tr>
                                <th>Medicine</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Price</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prescription.medicines.map((medicine, index) => (
                                <tr key={index}>
                                  <td>{medicine.medicine_name}</td>
                                  <td>{medicine.dosage}</td>
                                  <td>{medicine.frequency}</td>
                                  <td>{medicine.number_of_days} days</td>
                                  <td>${(parseFloat(medicine.price_per_unit) || 0.00).toFixed(2)}</td>
                                  <td>
                                    <button 
                                      className="btn btn-sm btn-success"
                                      onClick={() => addToCart(medicine, prescription)}
                                      disabled={selectedPatient && selectedPatient.patientId !== prescription.patient_id}
                                    >
                                      <i className="bi bi-cart-plus"></i> Add
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-warning">
                          No medications prescribed for this prescription.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{top: '20px'}}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-cart3 me-2"></i>
                Medicine Cart
              </h5>
            </div>
            <div className="card-body">
              {selectedPatient ? (
                <>
                  <div className="mb-3">
                    <h6>Patient: {selectedPatient.patientName}</h6>
                    <small className="text-muted">
                      Prescription: #{selectedPatient.prescriptionId}
                    </small>
                  </div>
                  
                  {cart.length === 0 ? (
                    <div className="alert alert-info">
                      Cart is empty. Add medicines from prescriptions.
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Medicine</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cart.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <small>
                                    {item.medicine_name}<br/>
                                    <span className="text-muted">{item.dosage}</span>
                                  </small>
                                </td>
                                <td>
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                                    className="form-control form-control-sm"
                                    style={{width: '50px'}}
                                  />
                                </td>
                                <td>
                                  ${(parseFloat(item.price) || 0.00).toFixed(2)} <small className="text-muted">/unit</small><br/>
                                  <strong>${((parseFloat(item.price) || 0.00) * item.quantity).toFixed(2)}</strong>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeFromCart(index)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mt-3 border-top pt-2">
                        <h6 className="mb-0">Subtotal:</h6>
                        <h6 className="mb-0">${calculateSubtotal().toFixed(2)}</h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">GST (5%):</h6>
                        <h6 className="mb-0">${calculateGST().toFixed(2)}</h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <h5 className="mb-0">Total:</h5>
                        <h5 className="mb-0 text-primary">${calculateTotal().toFixed(2)}</h5>
                      </div>
                      
                      <button 
                        className="btn btn-primary w-100 mt-3"
                        onClick={generateBill}
                      >
                        <i className="bi bi-receipt me-2"></i>
                        Generate Bill
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="alert alert-warning">
                  Select a patient by adding medicines from their prescription.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;