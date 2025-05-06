import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHome, FaCalendarAlt, FaPhone, FaVenusMars, FaTint, FaCamera, FaIdCard, FaGlobeAsia, FaMapMarkerAlt, FaCity, FaMailBulk, FaCalendar } from 'react-icons/fa';
import { BiShow } from 'react-icons/bi';

const PatientRegistration = () => {
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

  const [addressParts, setAddressParts] = useState({
    country: 'India',
    line1: '',
    state: '',
    district: '',
    pincode: ''
  });

  const [preview, setPreview] = useState('');
  const [registrationId, setRegistrationId] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const keralaDistricts = ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"];

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Full Name: Only alphabets and spaces, max 25 characters
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (!/^[A-Za-z\s]+$/.test(formData.full_name)) {
      newErrors.full_name = 'Full name must contain only alphabets and spaces';
    } else if (formData.full_name.length > 25) {
      newErrors.full_name = 'Full name must not exceed 25 characters';
    }

    // DOB: Not after today, not before 150 years ago
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const today = new Date();
      const dob = new Date(formData.dob);
      const maxDate = new Date(today.setHours(0, 0, 0, 0));
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 150);

      if (dob > maxDate) {
        newErrors.dob = 'Date of birth cannot be in the future';
      } else if (dob < minDate) {
        newErrors.dob = 'Date of birth cannot be more than 150 years ago';
      }
    }

    // Gender: Required
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Blood Group: Required
    if (!formData.blood_group) {
      newErrors.blood_group = 'Blood group is required';
    }

    // Phone Number: Only digits and optional + prefix, max 15 characters
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?\d{1,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must contain only digits (optional + prefix) and max 15 characters';
    }

    // Address Line 1: Max 50 characters
    if (!addressParts.line1) {
      newErrors.line1 = 'Address line 1 is required';
    } else if (addressParts.line1.length > 50) {
      newErrors.line1 = 'Address line 1 must not exceed 50 characters';
    }

    // Pincode: Required for India
    if (addressParts.country === 'India' && !addressParts.pincode) {
      newErrors.pincode = 'Pincode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const { country, line1, state, district, pincode } = addressParts;
    let fullAddress = '';

    if (country === 'India') {
      fullAddress = `${line1}, ${district ? district + ', ' : ''}${state} - ${pincode}`;
    } else {
      fullAddress = line1;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('full_name', formData.full_name);
    formDataToSend.append('address', fullAddress);
    formDataToSend.append('dob', formData.dob);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('blood_group', formData.blood_group);
    formDataToSend.append('phone_number', formData.phone_number);
    formDataToSend.append('patient_status', formData.patient_status);
    if (formData.image) formDataToSend.append('image', formData.image);

    try {
      const response = await axios.post('http://localhost:8000/api/patients/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const patient = {
        registration_id: response.data.registration_id || response.data.id,
        full_name: formData.full_name,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.blood_group,
        phone_number: formData.phone_number,
        address: fullAddress,
        patient_status: formData.patient_status
      };

      setRegistrationId(response.data.registration_id || response.data.id);
      setPatientData(patient);
      alert('Patient registered successfully!');
    } catch (error) {
      alert('Error registering patient: ' + (error.response?.data?.message || error.message));
    }
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(41, 71, 128) 0%,rgb(132, 147, 189) 100%)', // Vibrant gradient background
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '700px',
        margin: '1rem'
      }}>
        {registrationId && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Patient Registered: <strong>{registrationId}</strong></span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* <button 
                style={{
                  background: 'transparent',
                  border: '1px solid #155724',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  color: '#155724',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => navigate(`/patient/${patientData.patient_id}`)}
                title="View"
                aria-label="View patient details"
                onMouseOver={(e) => {
                  e.target.style.background = '#155724';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#155724';
                }}
              >
                <BiShow size={14} style={{ marginRight: '0.25rem' }} />
                <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>View</span>
              </button> */}
              <button
                style={{
                  background: 'transparent',
                  border: '1px solid #155724',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  color: '#155724',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => navigate('/appointment-booking', { state: { patient: patientData } })}
                title="Book Appointment"
                aria-label="Book appointment for patient"
                onMouseOver={(e) => {
                  e.target.style.background = '#155724';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#155724';
                }}
              >
                <FaCalendar size={14} style={{ marginRight: '0.25rem' }} />
                <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>Book</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
          backdropFilter: 'blur(10px)', // Glassmorphism effect
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h4 style={{ 
            textAlign: 'center', 
            color: '#fff', // White text for contrast
            marginBottom: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <FaIdCard style={{ color: '#667eea' }} />
            New Patient Registration
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Personal Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0 0.5rem',
                  fontSize: '0.8rem',
                  color: '#4a5568',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaUser style={{ color: '#667eea' }} />
                  Personal Information
                </label>
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1.5rem 1rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2rem',
                          border: errors.full_name ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        placeholder="Full Name"
                        required 
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        aria-label="Full Name"
                      />
                      <FaUser style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }} />
                    </div>
                    {errors.full_name && (
                      <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="date" 
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2rem',
                          border: errors.dob ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 150)).toISOString().split('T')[0]}
                        aria-label="Date of Birth"
                      />
                      <FaCalendarAlt style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }} />
                    </div>
                    {errors.dob && (
                      <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.dob}</p>
                    )}
                  </div>

                  <div>
                    <div style={{ position: 'relative' }}>
                      <select 
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2rem',
                          border: errors.gender ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          appearance: 'none',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        required
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        aria-label="Gender"
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                      <FaVenusMars style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }} />
                    </div>
                    {errors.gender && (
                      <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <div style={{ position: 'relative' }}>
                      <select 
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2rem',
                          border: errors.blood_group ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          appearance: 'none',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        required
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        aria-label="Blood Group"
                      >
                        <option value="">Select Blood Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      <FaTint style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }} />
                    </div>
                    {errors.blood_group && (
                      <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.blood_group}</p>
                    )}
                  </div>

                  <div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="tel" 
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2rem',
                          border: errors.phone_number ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        placeholder="Phone Number"
                        required
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        aria-label="Phone Number"
                      />
                      <FaPhone style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }} />
                    </div>
                    {errors.phone_number && (
                      <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone_number}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div style={{ position: 'relative' }}>
                <label style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0 0.5rem',
                  fontSize: '0.8rem',
                  color: '#4a5568',
                  zIndex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaCamera style={{ color: '#667eea' }} />
                  Patient Photo
                </label>
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1.5rem 1rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{
                        width: '100%',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.5)',
                        padding: '0.25rem'
                      }}
                      aria-label="Upload patient photo"
                    />
                  </div>
                  {preview && (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #e2e8f0',
                      margin: '0 auto'
                    }}>
                      <img 
                        src={preview} 
                        alt="Patient Preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0 0.5rem',
                  fontSize: '0.8rem',
                  color: '#4a5568',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaHome style={{ color: '#667eea' }} />
                  Address Information
                </label>
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1.5rem 1rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <div>
                    <div style={{ position: 'relative' }}>
                      <select 
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          appearance: 'none',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        value={addressParts.country}
                        onChange={(e) => setAddressParts({ 
                          ...addressParts, 
                          country: e.target.value, 
                          state: '', 
                          district: '', 
                          pincode: '', 
                          line1: '' 
                        })}
                        aria-label="Country"
                      >
                        <option value="India">India</option>
                        <option value="Outside India">Outside India</option>
                      </select>
                      <FaGlobeAsia style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }} />
                    </div>
                  </div>

                  {addressParts.country === 'India' && (
                    <>
                      <div>
                        <div style={{ position: 'relative' }}>
                          <select 
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.5rem 0.5rem 2rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.25rem',
                              fontSize: '0.9rem',
                              appearance: 'none',
                              background: 'rgba(255, 255, 255, 0.5)'
                            }}
                            value={addressParts.state}
                            onChange={(e) => setAddressParts({ 
                              ...addressParts, 
                              state: e.target.value, 
                              district: '' 
                            })}
                            aria-label="State"
                          >
                            <option value="">Select State</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Karnataka">Karnataka</option>
                          </select>
                          <FaMapMarkerAlt style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#a0aec0'
                          }} />
                        </div>
                      </div>

                      {addressParts.state === 'Kerala' && (
                        <div>
                          <div style={{ position: 'relative' }}>
                            <select 
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.5rem 0.5rem 2rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.25rem',
                                fontSize: '0.9rem',
                                appearance: 'none',
                                background: 'rgba(255, 255, 255, 0.5)'
                              }}
                              value={addressParts.district}
                              onChange={(e) => setAddressParts({ 
                                ...addressParts, 
                                district: e.target.value 
                              })}
                              aria-label="District"
                            >
                              <option value="">Select District</option>
                              {keralaDistricts.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <FaCity style={{
                              position: 'absolute',
                              left: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#a0aec0'
                            }} />
                          </div>
                        </div>
                      )}

                      <div>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.5rem 0.5rem 2rem',
                              border: errors.line1 ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                              borderRadius: '0.25rem',
                              fontSize: '0.9rem',
                              background: 'rgba(255, 255, 255, 0.5)'
                            }}
                            placeholder="Address Line 1"
                            required
                            value={addressParts.line1}
                            onChange={(e) => setAddressParts({ 
                              ...addressParts, 
                              line1: e.target.value 
                            })}
                            aria-label="Address Line 1"
                          />
                          <FaHome style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#a0aec0'
                          }} />
                        </div>
                        {errors.line1 && (
                          <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.line1}</p>
                        )}
                      </div>

                      <div>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="number" 
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.5rem 0.5rem 2rem',
                              border: errors.pincode ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                              borderRadius: '0.25rem',
                              fontSize: '0.9rem',
                              background: 'rgba(255, 255, 255, 0.5)'
                            }}
                            placeholder="Pincode"
                            required
                            value={addressParts.pincode}
                            onChange={(e) => setAddressParts({ 
                              ...addressParts, 
                              pincode: e.target.value 
                            })}
                            aria-label="Pincode"
                          />
                          <FaMailBulk style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#a0aec0'
                          }} />
                        </div>
                        {errors.pincode && (
                          <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.pincode}</p>
                        )}
                      </div>
                    </>
                  )}

                  {addressParts.country !== 'India' && (
                    <div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.5rem 0.5rem 2rem',
                            border: errors.line1 ? '1px solid #e53e3e' : '1px solid #e2e8f0',
                            borderRadius: '0.25rem',
                            fontSize: '0.9rem',
                            background: 'rgba(255, 255, 255, 0.5)'
                          }}
                          placeholder="Full Address"
                          required
                          value={addressParts.line1}
                          onChange={(e) => setAddressParts({ 
                            ...addressParts, 
                            line1: e.target.value 
                          })}
                          aria-label="Full Address"
                        />
                        <FaHome style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#a0aec0'
                        }} />
                      </div>
                      {errors.line1 && (
                        <p style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.line1}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid #e53e3e',
                color: '#e53e3e',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e53e3e';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = '#e53e3e';
              }}
              aria-label="Cancel registration"
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                background: '#667eea',
                border: '1px solid #667eea',
                color: 'white',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#5a67d8';
                e.target.style.borderColor = '#5a67d8';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.borderColor = '#667eea';
              }}
              aria-label="Register patient"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;