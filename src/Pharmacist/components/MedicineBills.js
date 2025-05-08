import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicineBills = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    medicine: '',
    price: '',
    gst: '5', // Default GST value
    status: 'Pending',
    date: new Date().toISOString().split('T')[0] // Default to today
  });

  const [errors, setErrors] = useState({});
  const [editBillId, setEditBillId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const API_BASE = 'https://blueeye10.pythonanywhere.com/api/pharmacy/medicinebills/';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchBills(), fetchDropdownData()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBills = async () => {
    const res = await axios.get(API_BASE);
    setBills(res.data);
  };

  const fetchDropdownData = async () => {
    const [patientsRes, doctorsRes, medicinesRes] = await Promise.all([
      axios.get('https://blueeye10.pythonanywhere.com/api/pharmacy/patients/'),
      axios.get('https://blueeye10.pythonanywhere.com/api/pharmacy/doctors/'),
      axios.get('https://blueeye10.pythonanywhere.com/api/pharmacy/medicines/all/'),
    ]);
    setPatients(patientsRes.data);
    setDoctors(doctorsRes.data);
    setMedicines(medicinesRes.data.filter(med => med.status === 'Available'));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    
    // If medicine is changed, auto-fill the price
    if (name === 'medicine') {
      const selectedMedicine = medicines.find(med => med.id == value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        price: selectedMedicine ? selectedMedicine.price_per_unit : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient) newErrors.patient = 'Patient is required';
    if (!formData.medicine) newErrors.medicine = 'Medicine is required';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Valid price is required';
    if (!formData.gst || isNaN(formData.gst)) newErrors.gst = 'Valid GST is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    if (formData.price && formData.gst) {
      const price = parseFloat(formData.price);
      const gst = parseFloat(formData.gst);
      return price + (price * gst / 100);
    }
    return 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSend = {
        ...formData,
        total: calculateTotal()
      };

      if (editBillId) {
        await axios.put(`${API_BASE}${editBillId}/update/`, dataToSend);
        setEditBillId(null);
      } else {
        await axios.post(`${API_BASE}create/`, dataToSend);
      }

      resetForm();
      fetchBills();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      patient: '',
      doctor: '',
      medicine: '',
      price: '',
      gst: '5',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const handleEdit = bill => {
    setFormData({
      patient: bill.patient,
      doctor: bill.doctor,
      medicine: bill.medicine,
      price: bill.price,
      gst: bill.gst,
      status: bill.status,
      date: bill.date || new Date().toISOString().split('T')[0]
    });
    setEditBillId(bill.bill_id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`${API_BASE}${id}/delete/`);
        fetchBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Error deleting bill. Please try again.');
      }
    }
  };

  const renderSelect = (name, options, label) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`border p-2 rounded ${errors[name] ? 'border-red-500' : ''}`}
        required
      >
        <option value="">Select {label}</option>
        {options.map(item => (
          <option key={item.id} value={item.id}>
            {item.full_name || item.doc_name || item.medicine_name}
            {item.registration_id ? ` (${item.registration_id})` : ''}
            {item.specialization ? ` - ${item.specialization}` : ''}
          </option>
        ))}
      </select>
      {errors[name] && <span className="text-red-500 text-xs">{errors[name]}</span>}
    </div>
  );

  const renderInput = (name, type, placeholder, label) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`border p-2 rounded ${errors[name] ? 'border-red-500' : ''}`}
      />
      {errors[name] && <span className="text-red-500 text-xs">{errors[name]}</span>}
    </div>
  );

  const filteredBills = bills.filter(bill => {
    // Search filter
    const matchesSearch = 
      bill.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.bill_id?.toString().includes(searchTerm);
    
    // Status filter
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container p-4 max-w-5xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">💊 Medicine Bill Management</h2>
        <button 
          onClick={() => {
            resetForm();
            setEditBillId(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Create New Bill'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Bill Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editBillId ? 'Edit Bill' : 'Create New Bill'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderSelect('patient', patients, 'Patient')}
            {renderSelect('doctor', doctors, 'Doctor')}
            {renderSelect('medicine', medicines, 'Medicine')}
            
            {renderInput('price', 'number', 'Price', 'Price')}
            {renderInput('gst', 'number', 'GST %', 'GST %')}
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`border p-2 rounded ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <span className="text-red-500 text-xs">{errors.date}</span>}
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <div className="text-lg font-semibold">
              Total: ₹ {calculateTotal().toFixed(2)}
              <span className="text-sm text-gray-600 ml-2">
                (Price: ₹{formData.price || '0'} + GST: {formData.gst || '0'}%)
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              {editBillId ? 'Update Bill' : 'Create Bill'}
            </button>
          </div>
        </form>
      )}

      {/* Bills Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-left text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Bill ID</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Medicine</th>
              <th>Price</th>
              <th>GST</th>
              <th>Total</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill) => (
                <tr key={bill.bill_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">#{bill.bill_id}</td>
                  <td>{bill.date || 'N/A'}</td>
                  <td>
                    <div className="font-medium">{bill.patient_name}</div>
                    <div className="text-xs text-gray-500">{bill.patient_registration_id}</div>
                  </td>
                  <td>
                    {bill.doctor_name ? (
                      <>
                        <div className="font-medium">{bill.doctor_name}</div>
                        <div className="text-xs text-gray-500">{bill.doctor_specialization}</div>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{bill.medicine_name}</td>
                  <td>₹{bill.price}</td>
                  <td>{bill.gst}%</td>
                  <td className="font-semibold">₹{bill.total}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bill.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="text-center space-x-2">
                    <button 
                      onClick={() => handleEdit(bill)} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(bill.bill_id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-4 text-center text-gray-500">
                  No bills found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineBills;