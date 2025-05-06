import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaHome, FaCalendarAlt, FaPhone, FaVenusMars, FaTint, FaCamera,FaInfoCircle,FaSave } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditPatient = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        dob: '',
        gender: '',
        blood_group: '',
        phone_number: '',
        image: null,
        patient_status: 'Active'
    });

    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/patients/${patientId}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                const patientData = response.data;
                setFormData({
                    full_name: patientData.full_name || '',
                    address: patientData.address || '',
                    dob: patientData.dob ? patientData.dob.split('T')[0] : '',
                    gender: patientData.gender || '',
                    blood_group: patientData.blood_group || '',
                    phone_number: patientData.phone_number || '',
                    image: null,
                    patient_status: patientData.patient_status || 'Active'
                });
                if (patientData.image) {
                    setPreview(patientData.image);
                }
            } catch (err) {
                setError('Failed to fetch patient data: ' + (err.response?.data?.message || err.message));
            }
        };
        fetchPatient();
    }, [patientId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('full_name', formData.full_name);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('dob', formData.dob);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('blood_group', formData.blood_group);
        formDataToSend.append('phone_number', formData.phone_number);
        formDataToSend.append('patient_status', formData.patient_status);
        if (formData.image) formDataToSend.append('image', formData.image);

        try {
            await axios.put(`http://localhost:8000/api/patients/update/${patientId}/`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Patient updated successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError('Error updating patient: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container py-3" style={{ maxWidth: '500px', minHeight: '90vh' }}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success text-white py-3">
              <div className="d-flex align-items-center">
                <FaUser className="me-2" size={18} />
                <h5 className="mb-0">Edit Patient Details</h5>
              </div>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger py-2 mb-3 small">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="h-100 d-flex flex-column">
                <div className="flex-grow-1">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="full_name" className="form-label small fw-medium text-muted">
                        <FaUser className="me-1" size={14} /> Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm border-success"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="phone_number" className="form-label small fw-medium text-muted">
                        <FaPhone className="me-1" size={14} /> Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-sm border-success"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="dob" className="form-label small fw-medium text-muted">
                        <FaCalendarAlt className="me-1" size={14} /> Date of Birth
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm border-success"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="gender" className="form-label small fw-medium text-muted">
                        <FaVenusMars className="me-1" size={14} /> Gender
                      </label>
                      <select
                        className="form-select form-select-sm border-success"
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="blood_group" className="form-label small fw-medium text-muted">
                        <FaTint className="me-1" size={14} /> Blood Group
                      </label>
                      <select
                        className="form-select form-select-sm border-success"
                        id="blood_group"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Blood Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="patient_status" className="form-label small fw-medium text-muted">
                        <FaInfoCircle className="me-1" size={14} /> Status
                      </label>
                      <select
                        className="form-select form-select-sm border-success"
                        id="patient_status"
                        name="patient_status"
                        value={formData.patient_status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="admited">Admitted</option>
                        <option value="discharged">Discharged</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label small fw-medium text-muted">
                      <FaHome className="me-1" size={14} /> Address
                    </label>
                    <textarea
                      className="form-control form-control-sm border-success"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="image" className="form-label small fw-medium text-muted">
                      <FaCamera className="me-1" size={14} /> Patient Photo
                    </label>
                    <input
                      type="file"
                      className="form-control form-control-sm border-success"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {preview && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <img
                          src={preview}
                          alt="Preview"
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #28a745'
                          }}
                        />
                        <span className="small text-muted">Image Preview</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-auto">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                  >
                    <FaSave size={14} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
};

export default EditPatient;