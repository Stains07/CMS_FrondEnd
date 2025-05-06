import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Form, Button, Card, Alert, 
  Image, Row, Col, Spinner, Modal
} from 'react-bootstrap';
import { FaUserMd, FaImage, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './AddDoctor.css';

const DoctorRegistrationForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    doc_name: '',
    department: '',
    dob: '',
    phone_number: '',
    email: '',
    salary: '',
    consultation_time: '',
    consultation_fee: '',
    image: null
  });
  const [departments, setDepartments] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDepartments, setFetchingDepartments] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Fetch departments from API
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/getdepartments/');
        setDepartments(response.data);
        setFetchingDepartments(false);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
        setFetchingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = new FormData();
      
      // Append all form data
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      }

      const response = await axios.post(
        'http://localhost:8000/api/register-doctor/', 
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="doctor-registration-container">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        <FaArrowLeft className="me-2" /> Back
      </Button>

      <Card className="doctor-registration-card">
        <Card.Header className="text-center">
          <h3><FaUserMd className="me-2" />Register New Doctor</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Image Upload */}
              <Col md={4} className="mb-4">
                <div 
                  className="image-upload-container"
                  onClick={triggerFileInput}
                >
                  {previewImage ? (
                    <Image 
                      src={previewImage} 
                      roundedCircle 
                      className="doctor-image-preview"
                    />
                  ) : (
                    <div className="image-upload-placeholder">
                      <FaImage size={40} />
                      <p>Click to upload photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </Col>

              <Col md={8}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="doc_name"
                        value={formData.doc_name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department *</Form.Label>
                      {fetchingDepartments ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Form.Select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>
                              {dept.department_name}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        pattern="[0-9]{10}"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Salary *</Form.Label>
                      <Form.Control
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Consultation Fee *</Form.Label>
                      <Form.Control
                        type="number"
                        name="consultation_fee"
                        value={formData.consultation_fee}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Consultation Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="consultation_time"
                    value={formData.consultation_time}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading || fetchingDepartments}
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Registering...</span>
                  </>
                ) : (
                  'Register Doctor'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            <FaCheck className="me-2" />
            Doctor registered successfully. Please proceed to signup.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowSuccessModal(false)}
          >
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/admin/doctors');
            }}
          >
            View Doctors List
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DoctorRegistrationForm;