import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiPlus, BiSearch, BiTrash, BiSave, BiArrowBack } from 'react-icons/bi';
import { FaUserInjured, FaNotesMedical, FaPills, FaFilePrescription, FaCapsules } from 'react-icons/fa';
import { GiMedicinePills } from 'react-icons/gi';

const Ordinances = () => {
  const { appointment_id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [cart, setCart] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const API_ENDPOINTS = {
    appointment: `https://blueeye10.pythonanywhere.com/api/appointment/${appointment_id}/`,
    prescription: `https://blueeye10.pythonanywhere.com/api/prescription-note/${appointment_id}/`,
    prescriptionMedicines: `https://blueeye10.pythonanywhere.com/api/prescription-medicines/${appointment_id}/`,
    medicineSearch: `https://blueeye10.pythonanywhere.com/api/api/medicines/search/`,
    listMedicines: `https://blueeye10.pythonanywhere.com/api/medicines/`,
    deleteMedicine: `https://blueeye10.pythonanywhere.com/api/delete-prescription-medicine/`,
  };

  const [formData, setFormData] = useState({
    number_of_days: 1,
    dosage: '',
    frequency: '',
    route: 'oral',
    quantity: 1,
    take_medicine: 'after meal',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const appointmentResponse = await axios.get(API_ENDPOINTS.appointment);
        setAppointment(appointmentResponse.data);

        const prescriptionResponse = await axios.get(API_ENDPOINTS.prescription);
        if (prescriptionResponse.data && prescriptionResponse.data.exists) {
          setDiagnosis(prescriptionResponse.data.diagnosis);
          setPrescriptionId(prescriptionResponse.data.prescription_id);
        }

        const medicinesResponse = await axios.get(API_ENDPOINTS.prescriptionMedicines);
        if (medicinesResponse.data && medicinesResponse.data.length > 0) {
          const updatedCart = medicinesResponse.data.map((item) => ({
            ...item,
            id: item.id, // Include the prescription medicine ID for deletion
            medicine: item.medicine_id,
            medicine_name: item.medicine_name,
            total_price: (item.medicine_price || 0) * (item.quantity || 1),
          }));
          setCart(updatedCart);
        }

        setLoading(false);
      } catch (err) {
        console.error('Initial data loading error:', err);
        setError(err.response?.data?.detail || err.message);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [appointment_id]);

  useEffect(() => {
    const searchMedicines = async () => {
      if (searchTerm.trim() === '') {
        setMedicines([]);
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.medicineSearch, {
          params: { search: searchTerm },
        });
        setMedicines(response.data);
      } catch (err) {
        console.error('Medicine search error:', err);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchMedicines();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'number_of_days' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddToCart = () => {
    if (!selectedMedicine) return;

    // Check if medicine already exists in cart
    const existingItemIndex = cart.findIndex(item => item.medicine === selectedMedicine.medicine_id);
    
    if (existingItemIndex !== -1) {
      showNotification('This medicine is already in the prescription', 'warning');
      return;
    }

    const newItem = {
      medicine: selectedMedicine.medicine_id,
      medicine_name: selectedMedicine.medicine_name,
      medicine_price: selectedMedicine.price_per_unit || 0,
      ...formData,
      total_price: (selectedMedicine.price_per_unit || 0) * (formData.quantity || 1),
    };

    setCart([...cart, newItem]);
    setSelectedMedicine(null);
    setSearchTerm('');
    setMedicines([]);
    setFormData({
      number_of_days: 1,
      dosage: '',
      frequency: '',
      route: 'oral',
      quantity: 1,
      take_medicine: 'after meal',
    });
  };

  const handleRemoveFromCart = async (index, itemId) => {
    try {
      // If item has an ID, it means it's already saved in the database
      if (itemId) {
        await axios.delete(`${API_ENDPOINTS.deleteMedicine}${itemId}/`);
      }
      
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
      showNotification('Medicine removed from prescription', 'success');
    } catch (err) {
      console.error('Error removing medicine:', err);
      showNotification('Failed to remove medicine', 'error');
    }
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].total_price = (newCart[index].medicine_price || 0) * (newQuantity || 1);
    setCart(newCart);
  };

  const handleSavePrescription = async () => {
    try {
      if (!diagnosis.trim()) {
        showNotification('Please enter a diagnosis', 'warning');
        return;
      }

      const prescriptionResponse = await savePrescription();

      if (cart.length > 0) {
        await savePrescriptionMedicines(prescriptionResponse.data.prescription_id);
      }

      showNotification('Prescription saved successfully!', 'success');
      setTimeout(() => navigate('/doctor/dashboard'), 1500);
    } catch (err) {
      console.error('Prescription save error:', err);
      showNotification(err.response?.data?.detail || 'Failed to save prescription. Please try again.', 'error');
    }
  };

  const savePrescription = async () => {
    const prescriptionData = {
      diagnosis: diagnosis,
      appointment: appointment_id,
      patient: appointment.patient,
      doctor: appointment.doctor,
    };

    if (prescriptionId) {
      return await axios.put(API_ENDPOINTS.prescription, prescriptionData);
    } else {
      return await axios.post(API_ENDPOINTS.prescription, prescriptionData);
    }
  };

  const savePrescriptionMedicines = async (prescriptionId) => {
    const medicinesToSave = cart.map((item) => ({
      appointment: appointment_id,
      prescription: prescriptionId,
      medicine: item.medicine,
      number_of_days: item.number_of_days,
      dosage: item.dosage,
      frequency: item.frequency,
      route: item.route,
      quantity: item.quantity,
      take_medicine: item.take_medicine,
    }));

    return await axios.post(API_ENDPOINTS.prescriptionMedicines, medicinesToSave);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!appointment) return <div className="error">Appointment not found</div>;

  return (
    <div className="prescription-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="prescription-nav">
        <button onClick={() => navigate(-1)} className="nav-button back-button">
          <BiArrowBack /> Back
        </button>
        <div className="nav-title">
          <FaFilePrescription /> Prescription
        </div>
      </nav>

      <div className="prescription-layout">
        {/* Left Section - Patient Details and Medicine Search */}
        <div className="left-section">
          <div className="combined-card">
            {/* Patient Details */}
            <div className="patient-details">
              <FaUserInjured className="patient-icon" />
              <img
                src={appointment.patient_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patient_name || 'P')}`}
                alt={appointment.patient_name || 'Patient'}
                className="patient-image"
                onError={(e) => {
                  console.error('Patient image failed to load:', appointment.patient_image);
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patient_name || 'P')}`;
                }}
              />
              <div className="patient-info">
                <span>{appointment.patient_name}</span> | 
                <span>ID: {appointment.registration_id}</span> | 
                <span>{appointment.patient_age} yrs</span> | 
                <span>{appointment.patient_gender}</span> | 
                <span>Dr. {appointment.doctor_name}</span>
              </div>
            </div>

            {/* Medicine Search */}
            <div className="medicine-search">
              <div className="search-header">
                <GiMedicinePills className="search-icon" />
                <h5>Add Medicine</h5>
              </div>
              <div className="search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search medicine..."
                  className="search-input"
                />
                <BiSearch className="search-icon-right" />
              </div>

              {/* Search Results */}
              {medicines.length > 0 && (
                <div className="medicine-results">
                  {medicines.map((medicine) => (
                    <div
                      key={medicine.medicine_id}
                      onClick={() => setSelectedMedicine(medicine)}
                      className={`medicine-result-item ${
                        selectedMedicine?.medicine_id === medicine.medicine_id ? 'selected' : ''
                      }`}
                    >
                      <div className="medicine-name">{medicine.medicine_name}</div>
                      <div className="medicine-details">
                        <span className="generic">{medicine.generic_name}</span>
                        <span className={`status ${medicine.status.toLowerCase()}`}>
                          {medicine.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Medicine Form */}
              {selectedMedicine && (
                <div className="medicine-form">
                  <div className="form-header">
                    <FaPills className="form-icon" />
                    <h6>{selectedMedicine.medicine_name}</h6>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Days</label>
                      <input
                        type="number"
                        name="number_of_days"
                        value={formData.number_of_days}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Dosage</label>
                      <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleInputChange}
                        placeholder="1 tablet"
                      />
                    </div>
                    <div className="form-group">
                      <label>Frequency</label>
                      <input
                        type="text"
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleInputChange}
                        placeholder="twice daily"
                      />
                    </div>
                    <div className="form-group">
                      <label>Route</label>
                      <select name="route" value={formData.route} onChange={handleInputChange}>
                        <option value="oral">Oral</option>
                        <option value="external">External</option>
                        <option value="nasal">Nasal</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>When</label>
                      <select
                        name="take_medicine"
                        value={formData.take_medicine}
                        onChange={handleInputChange}
                      >
                        <option value="after meal">After Meal</option>
                        <option value="before meal">Before Meal</option>
                        <option value="any time">Any Time</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleAddToCart} className="add-button">
                    <BiPlus /> Add to Prescription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Diagnosis and Prescription Cart */}
        <div className="right-section">
          {/* Diagnosis Card */}
          <div className="diagnosis-card">
            <div className="diagnosis-header">
              <FaNotesMedical className="diagnosis-icon" />
              <h3>Diagnosis</h3>
            </div>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis details..."
              className="diagnosis-textarea"
            />
          </div>

          {/* Prescription Cart */}
          <div className="prescription-cart">
            <div className="cart-header">
              <h3><FaCapsules /> Prescription ({cart.length})</h3>
              <button onClick={handleSavePrescription} className="save-button">
                <BiSave /> Save
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>No medicines added yet</p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="item-main">
                      <div className="item-name"><FaPills className="item-icon" /> {item.medicine_name}</div>
                      <button 
                        onClick={() => handleRemoveFromCart(index, item.id)} 
                        className="remove-button"
                      >
                        <BiTrash />
                      </button>
                    </div>
                    <div className="item-details">
                      <span>{item.dosage}</span>
                      <span>{item.frequency}</span>
                      <span>{item.number_of_days}d</span>
                      <span className="capitalize">{item.route}</span>
                      <span>{item.take_medicine}</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                        min="1"
                        className="quantity-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .prescription-container {
          display: flex;
          flex-direction: column;
          min-width: 1250px;
          height: 100vh;
          background-color:rgb(215, 226, 236);
        }

        /* Notification */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 5px;
          color: white;
          z-index: 1000;
          animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
        }

        .notification.info {
          background-color: #2196F3;
        }

        .notification.success {
          background-color: #4CAF50;
        }

        .notification.warning {
          background-color: #FF9800;
        }

        .notification.error {
          background-color: #F44336;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        /* Navigation Bar */
        .prescription-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: linear-gradient(135deg,rgb(109, 112, 183) 0%,rgb(72, 105, 80) 100%);
          color: white;
          box_shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-title {
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Main Layout */
        .prescription-layout {
          display: flex;
          flex: 1;
          padding: 15px;
          gap: 15px;
          overflow: hidden;
        }

        .left-section {
          margin-left:50px;
          height: 110%;
          width: 45%;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .right-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        /* Combined Card (Patient Details + Medicine Search) */
        .combined-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Patient Details */
        .patient-details {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
          color: white;
        }

        .patient-icon {
          font-size: 1.2rem;
        }

        .patient-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e0e0e0;
        }

        .patient-info {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .patient-info span {
          margin: 0 5px;
        }

        /* Medicine Search */
        .medicine-search {
          padding: 15px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .search-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: #11998e;
        }

        .search-icon {
          font-size: 1.2rem;
        }

        .search-container {
          position: relative;
          margin-bottom: 10px;
        }

        .search-input {
          width: 100%;
          padding: 8px 30px 8px 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: #11998e;
        }

        .search-icon-right {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        /* Medicine Results */
        .medicine-results {
          max-height: 120px;
          overflow-y: auto;
          margin-bottom: 5px;
        }

        .medicine-result-item {
          padding: 5px;
          border-radius: 6px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid #eee;
          height: 60px;
        }

        .medicine-result-item:hover {
          background: rgba(17, 153, 142, 0.05);
          border-color: rgba(17, 153, 142, 0.3);
        }

        .medicine-result-item.selected {
          background: rgba(17, 153, 142, 0.1);
          border-color: rgba(17, 153, 142, 0.5);
        }

        .medicine-name {
          font-weight: 500;
          font-size: 0.9rem;
          color: #333;
        }

        .medicine-details {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 0.75rem;
        }

        .generic {
          color: #666;
        }

        .status {
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 500;
        }

        .status.available {
          background: rgba(0, 200, 83, 0.1);
          color: #00a152;
        }

        .status.unavailable {
          background: rgba(255, 82, 82, 0.1);
          color: #d32f2f;
        }

        /* Medicine Form */
        .medicine-form {
          padding-top: 10px;
          border-top: 1px solid #eee;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: #11998e;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.75rem;
          color: #555;
          margin-bottom: 4px;
        }

        .form-group input, 
        .form-group select {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.8rem;
          outline: none;
        }

        .form-group input:focus, 
        .form-group select:focus {
          border-color: #11998e;
        }

        .add-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 8px;
          margin-top: 10px;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Diagnosis Card */
        .diagnosis-card {
          margin-right:50px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .diagnosis-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: linear-gradient(135deg,rgb(235, 115, 165) 0%,rgb(94, 49, 68) 100%);
          color: white;
        }

        .diagnosis-icon {
          font-size: 1.2rem;
        }

        .diagnosis-textarea {
          width: 100%;
          height: 100px;
          padding: 15px;
          border: none;
          resize: none;
          outline: none;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Prescription Cart */
        .prescription-cart {
          margin-right:50px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: linear-gradient(135deg,rgb(98, 120, 215) 0%, #764ba2 100%);
          color: white;
        }

        .save-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-button:hover {
          background:rgb(101, 158, 103);
        }

        .empty-cart {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #999;
          font-size: 0.9rem;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .cart-item {
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 8px;
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .item-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .item-name {
          font-weight: 500;
          font-size: 0.9rem;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .item-icon {
          font-size: 0.9rem;
        }

        .remove-button {
          background: none;
          border: none;
          color: #ff5252;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .remove-button:hover {
          transform: scale(1.1);
        }

        .item-details {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 0.75rem;
          color: #555;
        }

        .item-details span {
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 8px;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .quantity-input {
          width: 40px;
          padding: 3px;
          text-align: center;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        /* Loading and Error States */
        .loading, 
        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-size: 1.2rem;
        }

        .error {
          color: #ff5252;
        }

        /* Responsive Design */
        @media (max-width: 992px) {
          .prescription-layout {
            flex-direction: column;
          }

          .left-section {
            width: 100%;
          }

          .right-section {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .patient-details {
            flex-wrap: wrap;
            gap: 8px;
          }

          .patient-info {
            font-size: 0.8rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .diagnosis-textarea {
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default Ordinances;