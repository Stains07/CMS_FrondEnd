// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const RecepDashboard = () => {
//     const navigate = useNavigate();
//     const userData = JSON.parse(localStorage.getItem('user_data'));
//     const accessToken = localStorage.getItem('access_token');

//     useEffect(() => {
//         // Redirect to login if no access token
//         if (!accessToken) {
//             navigate('/login');
//         }
        
//         // Set default axios headers
//         axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//     }, [navigate, accessToken]);

//     const handleLogout = () => {
//         // Clear local storage
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('user_data');
//         navigate('/login');
//     };

//     return (
//         <div className="container-fluid">
//             <div className="row">
//                 {/* Sidebar */}
//                 <nav className="col-md-2 d-none d-md-block bg-light sidebar">
//                     <div className="sidebar-sticky pt-4">
//                         <h4 className="px-3">Receptionist Dashboard</h4>
//                         <ul className="nav flex-column">
//                             <li className="nav-item">
//                                 <button className="nav-link active" onClick={() => navigate('/receptionist-dashboard')}>
//                                     Dashboard
//                                 </button>
//                             </li>
//                             <li className="nav-item">
//                                 <button className="nav-link" onClick={() => navigate('/appointments')}>
//                                     Appointments
//                                 </button>
//                             </li>
//                             <li className="nav-item">
//                                 <button className="nav-link" onClick={() => navigate('/patients')}>
//                                     Patients
//                                 </button>
//                             </li>
//                         </ul>
//                     </div>
//                 </nav>

//                 {/* Main Content */}
//                 <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
//                     <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
//                         <h1 className="h2">Welcome, {userData?.first_name} {userData?.last_name}</h1>
//                         <button className="btn btn-danger" onClick={handleLogout}>
//                             Logout
//                         </button>
//                     </div>

//                     {/* Profile Information */}
//                     <div className="row">
//                         <div className="col-md-4">
//                             <div className="card mb-4 shadow-sm">
//                                 <img 
//                                     src={userData?.image ? 
//                                         `http://localhost:8000${userData.image}` : 
//                                         'https://via.placeholder.com/150'} 
//                                     className="card-img-top" 
//                                     alt="Profile" 
//                                 />
//                                 <div className="card-body">
//                                     <h5 className="card-title">Profile Information</h5>
//                                     <ul className="list-group list-group-flush">
//                                         <li className="list-group-item">
//                                             <strong>Email:</strong> {userData?.email}
//                                         </li>
//                                         <li className="list-group-item">
//                                             <strong>Phone:</strong> {userData?.phone_number}
//                                         </li>
//                                         <li className="list-group-item">
//                                             <strong>Qualification:</strong> {userData?.qualification}
//                                         </li>
//                                         <li className="list-group-item">
//                                             <strong>Salary:</strong> ₹{userData?.salary}
//                                         </li>
//                                     </ul>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Quick Actions */}
//                         <div className="col-md-8">
//                             <div className="row">
//                                 <div className="col-md-6 mb-4">
//                                     <div className="card text-white bg-primary h-100">
//                                         <div className="card-body">
//                                             <h5 className="card-title">New Appointment</h5>
//                                             <p className="card-text">Schedule a new patient appointment</p>
//                                             <button 
//                                                 className="btn btn-light" 
//                                                 onClick={() => navigate('/new-appointment')}
//                                             >
//                                                 Create Appointment
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="col-md-6 mb-4">
//                                     <div className="card text-white bg-success h-100">
//                                         <div className="card-body">
//                                             <h5 className="card-title">Patient Records</h5>
//                                             <p className="card-text">Access patient medical records</p>
//                                             <button 
//                                                 className="btn btn-light"
//                                                 onClick={() => navigate('/patients')}
//                                             >
//                                                 View Patients
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default RecepDashboard;





import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTimes } from 'react-icons/fa';

const PatientRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        gender: '',
        blood_group: '',
        phone_number: '',
        address_line: '',
        country: '',
        state: '',
        district: '',
        pincode: ''
    });
    
    const [photo, setPhoto] = useState(null);

    const indianStates = ['Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra'];
    const keralaDistricts = [
        'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
        'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur',
        'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad',
        'Kannur', 'Kasaragod'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        if (name === 'country') {
            if (value !== 'India') {
                updatedData.state = '';
                updatedData.district = '';
            }
        }

        if (name === 'state') {
            if (value !== 'Kerala') {
                updatedData.district = '';
            }
        }

        setFormData(updatedData);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Photo size should be less than 2MB.');
                e.target.value = '';
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                alert('Only JPEG or PNG images are allowed.');
                e.target.value = '';
                return;
            }
            setPhoto(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken'); // Use 'accessToken' to match your naming
            const formDataToSend = new FormData();
            for (const key in formData) {
                formDataToSend.append(key, formData[key]);
            }
    
            const response = await fetch('http://localhost:8000/api/patients/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Token may be null; backend will handle it
                    // Do NOT set 'Content-Type'; FormData sets it automatically with the correct boundary
                },
                body: formDataToSend
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Patient registered successfully!');
                navigate('/patients');
            } else {
                // Construct a detailed error message from the backend response
                const errorMsg = data.detail || (data.errors
                    ? Object.values(data.errors).flat().join(', ')
                    : JSON.stringify(data)) || 'Unknown error';
                alert(`Error registering patient: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again later.');
        }
    };

    const generateFullAddress = () => {
        const {
            address_line, district, state, country, pincode
        } = formData;

        const parts = [
            address_line,
            district || '',
            state || '',
            country || '',
            pincode || ''
        ];

        return parts.filter(Boolean).join(', ');
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(to right, #f0f4f8, #d9e2ec)',
            padding: '2rem'
        }}>
            <form onSubmit={handleSubmit} className="p-4 bg-white rounded-4 shadow" style={{ maxWidth: '480px', width: '100%' }}>
                <h5 className="text-center mb-3 fw-bold">📝 Patient Registration</h5>

                <div className="mb-2">
                    <label className="form-label small">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="form-control form-control-sm"
                        required
                    />
                </div>

                <div className="row g-2 mb-2">
                    <div className="col-6">
                        <label className="form-label small">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required
                        />
                    </div>
                    <div className="col-6">
                        <label className="form-label small">Phone</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required
                        />
                    </div>
                </div>

                <div className="row g-2 mb-2">
                    <div className="col-6">
                        <label className="form-label small">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="form-select form-select-sm"
                            required
                        >
                            <option value="">Select</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                        </select>
                    </div>
                    <div className="col-6">
                        <label className="form-label small">Blood Group</label>
                        <select
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                            className="form-select form-select-sm"
                            required
                        >
                            <option value="">Select</option>
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-2">
                    <label className="form-label small">Patient Photo (Optional)</label>
                    <input
                        type="file"
                        name="photo"
                        accept="image/jpeg,image/png"
                        onChange={handlePhotoChange}
                        className="form-control form-control-sm"
                    />
                </div>

                <div className="mb-2">
                    <label className="form-label small">Address Line</label>
                    <input
                        type="text"
                        name="address_line"
                        value={formData.address_line}
                        onChange={handleChange}
                        className="form-control form-control-sm"
                        required
                    />
                </div>

                <div className="row g-2 mb-2">
                    <div className="col-6">
                        <label className="form-label small">Country</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="form-select form-select-sm"
                            required
                        >
                            <option value="">Select</option>
                            <option value="India">India</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {formData.country === 'India' && (
                        <div className="col-6">
                            <label className="form-label small">State</label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="form-select form-select-sm"
                                required
                            >
                                <option value="">Select</option>
                                {indianStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="row g-2 mb-2">
                    {formData.state === 'Kerala' && (
                        <div className="col-6">
                            <label className="form-label small">District</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="form-select form-select-sm"
                                required
                            >
                                <option value="">Select</option>
                                {keralaDistricts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="col-6">
                        <label className="form-label small">Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={formData.country === 'India'}
                        />
                    </div>
                </div>

                <div className="mb-3 p-2 bg-light border rounded small text-muted">
                    <strong>📍 Address Preview:</strong><br />
                    {generateFullAddress() || <span className="text-secondary">Not entered</span>}
                </div>

                <div className="d-flex justify-content-between">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => navigate(-1)}
                    >
                        <FaTimes className="me-1" /> Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate('/patient_card')}
                    >
                        <FaEye className="me-1" /> View Card
                    </button>

                    <button
                        type="submit"
                        className="btn btn-outline-success btn-sm"
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientRegistration;





// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const PatientRegistration = () => {
//     const [formData, setFormData] = useState({
//         full_name: '',
//         address: '',
//         dob: '',
//         gender: '',
//         blood_group: '',
//         phone_number: '',
//         image: null,
//         patient_status: 'Active'
//     });
//     const [preview, setPreview] = useState('');
//     const [submittedData, setSubmittedData] = useState(null);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const formDataToSend = new FormData();
//             for (const key in formData) {
//                 formDataToSend.append(key, formData[key]);
//             }

//             const response = await axios.post('http://localhost:8000/api/patients/', formDataToSend, {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });

//             setSubmittedData(response.data);
//         } catch (error) {
//             alert('Error registering patient: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setFormData({ ...formData, image: file });
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setPreview(reader.result);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     return (
//         <div style={{
//             minHeight: '100vh',
//             background: 'linear-gradient(45deg, #f3f4f6 0%, #e5e7eb 100%)',
//             padding: '2rem',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center'
//         }}>
//             {!submittedData ? (
//                 <form onSubmit={handleSubmit} style={{
//                     background: 'white',
//                     padding: '1.5rem',
//                     borderRadius: '15px',
//                     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                     width: '100%',
//                     maxWidth: '480px',
//                 }}>
//                     <h5 className="text-center mb-4" style={{ fontSize: '1.4rem' }}>Patient Registration</h5>

//                     <div className="row g-2">
//                         {/* Compact Form Fields */}
//                         {['full_name', 'address', 'dob', 'phone_number', 'gender', 'blood_group'].map((field) => (
//                             <div className="col-12" key={field}>
//                                 <div className="form-floating">
//                                     {field === 'gender' || field === 'blood_group' ? (
//                                         <select
//                                             className="form-select form-select-sm"
//                                             id={field}
//                                             value={formData[field]}
//                                             onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
//                                             required
//                                         >
//                                             <option value="">Select {field.replace('_', ' ')}</option>
//                                             {field === 'gender' ? 
//                                                 ['M', 'F', 'O'].map(opt => (
//                                                     <option key={opt} value={opt}>
//                                                         {opt === 'M' ? 'Male' : opt === 'F' ? 'Female' : 'Other'}
//                                                     </option>
//                                                 )) :
//                                                 ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(opt => (
//                                                     <option key={opt} value={opt}>{opt}</option>
//                                                 ))}
//                                         </select>
//                                     ) : field === 'dob' ? (
//                                         <input
//                                             type="date"
//                                             className="form-control form-control-sm"
//                                             id={field}
//                                             value={formData[field]}
//                                             onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
//                                         />
//                                     ) : field === 'address' ? (
//                                         <textarea
//                                             className="form-control form-control-sm"
//                                             id={field}
//                                             style={{ height: '80px' }}
//                                             value={formData[field]}
//                                             onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
//                                             required
//                                         />
//                                     ) : (
//                                         <input
//                                             type={field === 'phone_number' ? 'tel' : 'text'}
//                                             className="form-control form-control-sm"
//                                             id={field}
//                                             placeholder={field.replace('_', ' ')}
//                                             value={formData[field]}
//                                             onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
//                                             required
//                                         />
//                                     )}
//                                     <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
//                                 </div>
//                             </div>
//                         ))}

//                         {/* Image Upload */}
//                         <div className="col-12">
//                             <div className="mb-2">
//                                 <label className="form-label small">Patient Photo</label>
//                                 <input
//                                     type="file"
//                                     className="form-control form-control-sm"
//                                     accept="image/*"
//                                     onChange={handleImageChange}
//                                 />
//                                 {preview && (
//                                     <div className="mt-1" style={{ width: '80px', height: '80px' }}>
//                                         <img src={preview} alt="Preview" className="img-thumbnail" />
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Submit Button */}
//                         <div className="col-12 text-end">
//                             <button
//                                 type="submit"
//                                 className="btn btn-primary btn-sm px-3"
//                                 style={{ borderRadius: '20px' }}
//                             >
//                                 Register
//                             </button>
//                         </div>
//                     </div>
//                 </form>
//             ) : (
//                 /* Registration Card */
//                 <div style={{
//                     background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
//                     padding: '2rem',
//                     borderRadius: '15px',
//                     width: '100%',
//                     maxWidth: '800px',
//                     color: 'white',
//                     position: 'relative'
//                 }}>
//                     {/* Hospital Header */}
//                     <div className="text-center mb-4">
//                         <h3 style={{ margin: 0 }}>MedLife Hospital</h3>
//                         <div className="d-flex justify-content-center gap-3 small">
//                             <span>📞 +91 123 456 7890</span>
//                             <span>📍 Health Street, Kochi</span>
//                             <span>🌐 www.medlifehospital.com</span>
//                         </div>
//                     </div>

//                     {/* Patient Details */}
//                     <div className="row">
//                         <div className="col-3">
//                             <div className="bg-white p-1 rounded">
//                                 <img 
//                                     src={preview} 
//                                     alt="Patient" 
//                                     className="img-fluid rounded"
//                                     style={{ height: '150px', objectFit: 'cover' }}
//                                 />
//                             </div>
//                         </div>
//                         <div className="col-9">
//                             <div className="row g-2">
//                                 <div className="col-6">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">Registration ID:</span> {submittedData.registration_id}
//                                     </div>
//                                 </div>
//                                 <div className="col-6">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">Name:</span> {submittedData.full_name}
//                                     </div>
//                                 </div>
//                                 <div className="col-6">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">DOB:</span> {new Date(submittedData.dob).toLocaleDateString()}
//                                     </div>
//                                 </div>
//                                 <div className="col-6">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">Gender:</span> {submittedData.gender === 'M' ? 'Male' : 'Female'}
//                                     </div>
//                                 </div>
//                                 <div className="col-12">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">Address:</span> {submittedData.address}
//                                     </div>
//                                 </div>
//                                 <div className="col-6">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">Blood Group:</span> {submittedData.blood_group}
//                                     </div>
//                                 </div>
//                                 <div className="col-6">
//                                     <div className="bg-white bg-opacity-10 p-2 rounded">
//                                         <span className="fw-bold">Phone:</span> {submittedData.phone_number}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="d-flex gap-2 justify-content-end mt-4">
//                         <button 
//                             className="btn btn-light btn-sm"
//                             onClick={() => window.print()}
//                         >
//                             Print
//                         </button>
//                         <button 
//                             className="btn btn-outline-light btn-sm"
//                             onClick={() => setSubmittedData(null)}
//                         >
//                             Cancel
//                         </button>
//                         <button 
//                             className="btn btn-light btn-sm"
//                             onClick={() => navigate('/book-appointment')}
//                         >
//                             Book Appointment
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PatientRegistration;