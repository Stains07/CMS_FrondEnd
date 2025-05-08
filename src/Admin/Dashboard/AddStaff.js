import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Form, Button, Card, Row, Col, 
  Alert, Image, Tab, Tabs, Modal ,Navbar,
} from 'react-bootstrap';
import { FaUserPlus, FaImage, FaArrowLeft } from 'react-icons/fa';
import { MdMedicalServices, MdScience, MdPerson } from 'react-icons/md';
import './AddStaff.css';

const StaffRegistrationForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    role: 'Receptionist',
    first_name: '',
    last_name: '',
    name: '',
    dob: '',
    phone_number: '',
    email: '',
    email_id: '',
    qualification: '',
    salary: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newStaffId, setNewStaffId] = useState(null);

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
      
      // Append common fields
      data.append('role', formData.role);
      data.append('phone_number', formData.phone_number);
      data.append('qualification', formData.qualification);
      data.append('salary', formData.salary);
      if (formData.image) data.append('image', formData.image);

      // Append role-specific fields
      if (formData.role === 'Receptionist') {
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('email', formData.email);
        if (formData.dob) data.append('dob', formData.dob);
      } else {
        data.append('name', formData.name);
        data.append('email_id', formData.email_id);
        if (formData.dob) data.append('dob', formData.dob);
      }

      const response = await axios.post(
        'https://blueeye10.pythonanywhere.com/api/register-staff/', 
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      setNewStaffId(response.data.id);
      setSuccess(response.data.message);
      setShowSuccessModal(true);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      role: 'Receptionist',
      first_name: '',
      last_name: '',
      name: '',
      dob: '',
      phone_number: '',
      email: '',
      email_id: '',
      qualification: '',
      salary: '',
      image: null
    });
    setPreviewImage(null);
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role
    });
  };

  return (
    <div>
      <Navbar bg="light" className="header p-2">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Go back"
        >
          <FaArrowLeft className="me-1" /> Back
        </Button>
      </Navbar>

      <Container
        className="registration-container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          paddingTop: "1.5rem",
        }}
      >
        <Card className="registration-card w-100">
          <Card.Header className="text-center">
            <h3 style={{ fontSize: "1rem" }}>
              <FaUserPlus className="me-1" /> Register Staff
            </h3>
          </Card.Header>
          <Card.Body style={{ padding: "0.8rem" }}>
            {error && (
              <Alert
                variant="danger"
                style={{
                  fontSize: "0.7rem",
                  padding: "0.4rem",
                  marginBottom: "0.5rem",
                }}
              >
                {error}
              </Alert>
            )}

            <Tabs
              activeKey={formData.role}
              onSelect={handleRoleChange}
              className="role-tabs"
            >
              <Tab
                eventKey="Receptionist"
                title={
                  <span style={{ fontSize: "0.75rem" }}>
                    <MdPerson className="me-1" /> Receptionist
                  </span>
                }
              />
              <Tab
                eventKey="Pharmacist"
                title={
                  <span style={{ fontSize: "0.75rem" }}>
                    <MdMedicalServices className="me-1" /> Pharmacist
                  </span>
                }
              />
              <Tab
                eventKey="LabTechnician"
                title={
                  <span style={{ fontSize: "0.75rem" }}>
                    <MdScience className="me-1" /> Lab Technician
                  </span>
                }
              />
            </Tabs>

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  {formData.role === "Receptionist" ? (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-1">
                            <Form.Label>First Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-1">
                            <Form.Label>Last Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-1">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-1">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-1">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email_id"
                              value={formData.email_id}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-1">
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
                      <Form.Group className="mb-1">
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

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-1">
                        <Form.Label>Qualification *</Form.Label>
                        <Form.Control
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-1">
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
                  </Row>
                </Col>
              </Row>

              <Row className="mt-1">
                <Col md={12} className="text-center">
                  <Form.Group>
                    <Form.Label>Photo</Form.Label>
                    <div
                      className="image-upload-container"
                      onClick={triggerFileInput}
                    >
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          roundedCircle
                          className="staff-image-preview"
                        />
                      ) : (
                        <div className="image-upload-placeholder">
                          <FaImage size={20} />
                          <p>Upload</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid mt-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register Staff"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "0.9rem" }}>
              Registration Successful
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert
              variant="success"
              style={{ fontSize: "0.7rem", padding: "0.4rem" }}
            >
              {success}
            </Alert>
            <p style={{ fontSize: "0.7rem" }}>Staff ID: {newStaffId}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowSuccessModal(false)}
              style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate(`/staff/${newStaffId}`);
              }}
              style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
            >
              View Profile
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default StaffRegistrationForm;