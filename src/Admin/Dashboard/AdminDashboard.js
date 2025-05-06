import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Card, Row, Col } from 'react-bootstrap';
import { FaHome, FaUserPlus, FaUserMd, FaSignOutAlt } from 'react-icons/fa';
import { MdMedicalServices, MdScience, MdLocalPharmacy, MdPerson } from 'react-icons/md';
import './AdminDashboard.css'; // Custom CSS file for additional styling

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar bg="light" expand="lg" className="dashboard-navbar">
        <Container fluid>
          <Navbar.Brand href="#home" className="fw-bold text-primary">
            Admin Panel
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-primary" className="me-2" onClick={() => navigate('/')}>
                <FaHome className="me-1" /> Home
              </Button>
              <Button variant="outline-success" className="me-2" onClick={() => navigate('/add-staff')}>
                <FaUserPlus className="me-1" /> Add Staff
              </Button>
              <Button variant="outline-info" className="me-2" onClick={() => navigate('/add-doctor')}>
                <FaUserMd className="me-1" /> Add Doctor
              </Button>
              <Button variant="outline-danger" onClick={handleLogout}>
                <FaSignOutAlt className="me-1" /> Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Dashboard Cards */}
      <Container className="dashboard-cards-container">
        <Row className="g-4">
          {/* Receptionist Card */}
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card receptionist-card" 
              onClick={() => navigate('/view-receptionists')}
            >
              <Card.Body className="text-center">
                <MdPerson className="dashboard-icon" />
                <Card.Title>Receptionists</Card.Title>
                <Card.Text>
                  Manage all reception staff
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Doctor Card */}
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card doctor-card" 
              onClick={() => navigate('/view-all-doctors')}
            >
              <Card.Body className="text-center">
                <FaUserMd className="dashboard-icon" />
                <Card.Title>Doctors</Card.Title>
                <Card.Text>
                  Manage all doctors
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Pharmacist Card */}
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card pharmacist-card" 
              onClick={() => navigate('/pharmacists')}
            >
              <Card.Body className="text-center">
                <MdLocalPharmacy className="dashboard-icon" />
                <Card.Title>Pharmacists</Card.Title>
                <Card.Text>
                  Manage pharmacy staff
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Lab Technician Card */}
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card labtech-card" 
              onClick={() => navigate('/lab-technicians')}
            >
              <Card.Body className="text-center">
                <MdScience className="dashboard-icon" />
                <Card.Title>Lab Technicians</Card.Title>
                <Card.Text>
                  Manage laboratory staff
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;