import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../Service/ApiService'; // Import the updated ApiService
import { 
  Container, Form, Button, Alert, Card, 
  Row, Col, Spinner, Modal, Tab, Tabs 
} from 'react-bootstrap';
import { FaUserMd, FaUserShield, FaFlask, FaPills, FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './FacultyLogin.css';

const SingleLoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('admin');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTabChange = (role) => {
    setActiveTab(role);
    setFormData({
      ...formData,
      role
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { username, password, role } = formData;

      // Use ApiService to handle the login request
      const response = await ApiService.login({ username, password }, role);

      // Handle successful login
      handleSuccessfulLogin(response.data, role);
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = (data, role) => {
    // Store tokens and user data based on role
    if (role === 'admin') {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        email: data.email,
        id: data.user_id
      }));
      navigate('/admin/dashboard');
    } 
    else if (role === 'doctor') {
      localStorage.setItem('accessToken', data.tokens.access);
      localStorage.setItem('refreshToken', data.tokens.refresh);
      localStorage.setItem('doctorData', JSON.stringify(data.doctor));
      navigate('/doctor/dashboard');
    }
    else if (role === 'lab') {
      localStorage.setItem('labUserData', JSON.stringify(data));
      localStorage.setItem('token', data.data.access);
      navigate('/labtechnition/dashboard');
    }
    else if (role === 'pharmacist') {
      localStorage.setItem('userData', JSON.stringify(data));
      localStorage.setItem('token', data.data.access);
      navigate('/pharmacist/dashboard');
    }
    else if (role === 'receptionist') {
      localStorage.setItem('access_token', data.Token.Access);
      localStorage.setItem('refresh_token', data.Token.Refresh);
      localStorage.setItem('user_data', JSON.stringify(data.UserData));
      navigate('/dashboard');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaUserShield className="me-2" />;
      case 'doctor': return <FaUserMd className="me-2" />;
      case 'lab': return <FaFlask className="me-2" />;
      case 'pharmacist': return <FaPills className="me-2" />;
      case 'receptionist': return <FaUser className="me-2" />;
      default: return <FaUser className="me-2" />;
    }
  };

  return (
    <div className="login-page-container">
      <Container className="login-form-container">
        <Card className="login-card">
          <Card.Header className="text-center">
            <h3 className="login-title">
              <FaSignInAlt className="me-2" />
              MediCare Hospital Faculty
            </h3>
          </Card.Header>
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabChange}
              className="mb-4 role-tabs"
              fill
            >
              <Tab eventKey="admin" title={
                <span>{getRoleIcon('admin')} Admin</span>
              } />
              <Tab eventKey="doctor" title={
                <span>{getRoleIcon('doctor')} Doctor</span>
              } />
              <Tab eventKey="lab" title={
                <span>{getRoleIcon('lab')} Lab</span>
              } />
              <Tab eventKey="pharmacist" title={
                <span>{getRoleIcon('pharmacist')} Pharmacist</span>
              } />
              <Tab eventKey="receptionist" title={
                <span>{getRoleIcon('receptionist')} Receptionist</span>
              } />
            </Tabs>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder={`Enter ${activeTab} username`}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Logging in...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="me-2" />
                      Login as {activeTab}
                    </>
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-3">
              <Button 
                variant="link" 
                onClick={() => setShowSignupModal(true)}
                className="text-decoration-none"
              >
                <FaUserPlus className="me-1" />
                Don't have an account? Sign up
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Signup Modal */}
      <Modal show={showSignupModal} onHide={() => setShowSignupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please contact the system administrator to create an account for you.</p>
          <p>Or navigate to the appropriate registration page:</p>
          <div className="d-grid gap-2">
            <Button variant="outline-success" onClick={() => navigate('/signup-doctor')}>
              Staff SignUp
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSignupModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SingleLoginPage;