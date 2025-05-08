import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Image 
} from 'react-bootstrap';
import { 
  PencilSquare, Eye, PersonX, 
  PlusCircle, ArrowLeft 
} from 'react-bootstrap-icons';
import axios from 'axios';

const PharmacistList = () => {
  const navigate = useNavigate();
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        const response = await axios.get('https://blueeye10.pythonanywhere.com/api/pharmacy/get-pharmacists/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setPharmacists(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch pharmacists');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacists();
  }, []);

  const handleEdit = (pharmId) => {
    navigate(`/edit-pharmacist/${pharmId}`);
  };

  const handleView = (pharmId) => {
    navigate(`/view-pharmacist/${pharmId}`);
  };

  const handleInactivate = async (pharmId) => {
    if (window.confirm('Are you sure you want to inactivate this pharmacist?')) {
      try {
        await axios.patch(`/api/inactivate-pharmacist/${pharmId}/`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setPharmacists(pharmacists.map(pharm => 
          pharm.pharm_id === pharmId ? {...pharm, is_active: false} : pharm
        ));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to inactivate pharmacist');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-3">{error}</Alert>;
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="me-2" /> Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/add-pharmacist')}>
          <PlusCircle className="me-2" /> Add Pharmacist
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Pharmacist List</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Qualification</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pharmacists.map((pharmacist) => (
                  <tr key={pharmacist.pharm_id}>
                    <td>{pharmacist.pharm_id}</td>
                    <td>
                      {pharmacist.image ? (
                        <Image 
                          src={`http://localhost:8000${pharmacist.image}`} 
                          roundedCircle 
                          width="50" 
                          height="50" 
                          className="object-fit-cover"
                        />
                      ) : (
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ width: '50px', height: '50px' }}>
                          <span className="text-muted">No Image</span>
                        </div>
                      )}
                    </td>
                    <td>{pharmacist.name}</td>
                    <td>{pharmacist.phone_number}</td>
                    <td>{pharmacist.email_id}</td>
                    <td>{pharmacist.qualification}</td>
                    <td>
                      <Badge bg={pharmacist.is_active ? 'success' : 'secondary'}>
                        {pharmacist.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleView(pharmacist.pharm_id)}
                          title="View"
                        >
                          <Eye />
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          onClick={() => handleEdit(pharmacist.pharm_id)}
                          title="Edit"
                        >
                          <PencilSquare />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleInactivate(pharmacist.pharm_id)}
                          title="Inactivate"
                          disabled={!pharmacist.is_active}
                        >
                          <PersonX />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PharmacistList;