import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BiTestTube, BiSearch, BiTrash, BiArrowBack, BiHome } from 'react-icons/bi';
import { toast } from 'react-toastify';

const LabTestPrescription = () => {
  const { appointment_id } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [existingPrescription, setExistingPrescription] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    sidebar: {
      width: '300px',
      padding: '20px',
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      color: 'white',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    },
    mainContent: {
      flex: 1,
      padding: '30px',
      background: '#f8f9fa',
    },
    navbar: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '15px',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      marginRight: '20px',
      color: 'white',
      textDecoration: 'none',
      padding: '8px 12px',
      borderRadius: '5px',
      transition: 'background-color 0.3s',
    },
    homeButton: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      color: 'white',
      textDecoration: 'none',
      padding: '8px 12px',
      borderRadius: '5px',
      transition: 'background-color 0.3s',
    },
    buttonHover: {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      margin: '0',
    },
    patientCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '25px',
      backdropFilter: 'blur(5px)',
    },
    patientHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
    },
    patientImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: '15px',
      border: '2px solid white',
    },
    patientName: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '5px',
    },
    patientDetails: {
      fontSize: '14px',
      lineHeight: '1.5',
    },
    detailItem: {
      marginBottom: '5px',
      display: 'flex',
      alignItems: 'center',
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '15px',
    },
    searchInput: {
      width: '100%',
      padding: '12px 15px 12px 40px',
      borderRadius: '30px',
      border: 'none',
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      transition: 'background-color 0.3s',
    },
    searchInputFocus: {
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'white',
    },
    searchResults: {
      position: 'absolute',
      width: '100%',
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      zIndex: '100',
      marginTop: '5px',
    },
    resultItem: {
      padding: '12px 15px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultItemHover: {
      backgroundColor: '#f5f5f5',
    },
    testName: {
      fontWeight: '500',
      color: '#333',
    },
    testPrice: {
      fontSize: '14px',
      color: '#6c5ce7',
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: '#6c5ce7',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      padding: '5px 10px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'background-color 0.2s',
    },
    addButtonHover: {
      backgroundColor: '#5649be',
    },
    addButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    contentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    contentTitle: {
      fontSize: '22px',
      fontWeight: '600',
      color: '#333',
    },
    prescriptionContainer: {
      display: 'flex',
      gap: '20px',
    },
    testsContainer: {
      flex: '1',
    },
    cartContainer: {
      width: '350px',
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    },
    cartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '1px solid #eee',
    },
    cartTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
    },
    cartCount: {
      backgroundColor: '#6c5ce7',
      color: 'white',
      borderRadius: '50%',
      width: '25px',
      height: '25px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    },
    cartItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f5f5f5',
    },
    removeButton: {
      backgroundColor: '#ff7675',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      padding: '5px 10px',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      transition: 'background-color 0.2s',
    },
    removeButtonHover: {
      backgroundColor: '#e66767',
    },
    notesContainer: {
      marginTop: '20px',
    },
    notesLabel: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: '500',
      color: '#333',
    },
    notesInput: {
      width: '100%',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      minHeight: '100px',
      fontSize: '14px',
      resize: 'vertical',
      transition: 'border-color 0.2s',
    },
    notesInputFocus: {
      borderColor: '#6c5ce7',
      outline: 'none',
    },
    submitButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#00b894',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    submitButtonHover: {
      backgroundColor: '#00a884',
    },
    deleteButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#ff7675',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    deleteButtonHover: {
      backgroundColor: '#e66767',
    },
    emptyCart: {
      textAlign: 'center',
      padding: '20px',
      color: '#666',
    },
    testCard: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    testInfo: {
      flex: '1',
    },
    testName: {
      fontWeight: '500',
      marginBottom: '5px',
      color: '#333',
    },
    testDescription: {
      fontSize: '13px',
      color: '#666',
      marginBottom: '5px',
    },
    testPrice: {
      fontSize: '14px',
      color: '#6c5ce7',
      fontWeight: '600',
    },
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://blueeye10.pythonanywhere.com/api/appointment/${appointment_id}/`);
        setPatientData(response.data);
        
        // Check for existing prescription
        try {
          const prescriptionResponse = await axios.get(`https://blueeye10.pythonanywhere.com/api/labtestprescriptions/appointment/${appointment_id}/`);
          setExistingPrescription(prescriptionResponse.data);
          setSelectedTests(prescriptionResponse.data.tests || []);
          setNotes(prescriptionResponse.data.notes || '');
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('Error fetching prescription:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast.error('Failed to load patient data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [appointment_id]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://blueeye10.pythonanywhere.com/api/search-labtests/?search=${searchTerm}`);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching lab tests:', error);
      toast.error('Failed to search lab tests');
    }
  };

  const addTestToCart = (test) => {
    if (!selectedTests.some(t => t.test_id === test.test_id)) {
      setSelectedTests([...selectedTests, test]);
      setSearchTerm('');
      setShowSearchResults(false);
    }
  };

  const removeTestFromCart = (testId) => {
    setSelectedTests(selectedTests.filter(test => test.test_id !== testId));
  };

  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      toast.error('Please add at least one lab test');
      return;
    }

    try {
      setIsLoading(true);
      const testIds = selectedTests.map(test => test.test_id);
      
      const payload = {
        test_ids: testIds,
        notes: notes
      };

      let response;
      if (existingPrescription) {
        // Update existing prescription
        response = await axios.put(`https://blueeye10.pythonanywhere.com/api/labtestprescriptions/appointment/${appointment_id}/`, payload);
      } else {
        // Create new prescription
        response = await axios.post(`https://blueeye10.pythonanywhere.com/api/labtestprescriptions/appointment/${appointment_id}/`, payload);
      }

      toast.success('Lab test prescription saved successfully');
      navigate(-1);
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save lab test prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!existingPrescription) return;

    try {
      setIsLoading(true);
      await axios.delete(`https://blueeye10.pythonanywhere.com/api/labtestprescriptions/${existingPrescription.prescription_id}/`);
      setExistingPrescription(null);
      setSelectedTests([]);
      setNotes('');
      toast.success('Prescription deleted successfully');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar with patient info and search */}
      <div style={styles.sidebar}>
        <div style={styles.navbar}>
          <div 
            style={styles.backButton}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={() => navigate(-1)}
          >
            <BiArrowBack size={18} />
          </div>
          <div 
            style={styles.homeButton}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={() => navigate('/')}
          >
            <BiHome size={18} />
          </div>
        </div>

        {patientData && (
          <div style={styles.patientCard}>
            <div style={styles.patientHeader}>
              <img 
                src={patientData.patient_image || 'https://via.placeholder.com/60'} 
                alt="Patient" 
                style={styles.patientImage} 
              />
              <div>
                <div style={styles.patientName}>{patientData.patient_name}</div>
                <div style={styles.patientDetails}>ID: {patientData.registration_id}</div>
              </div>
            </div>
            <div style={styles.patientDetails}>
              <div style={styles.detailItem}>Age: {patientData.patient_age}</div>
              <div style={styles.detailItem}>Gender: {patientData.patient_gender}</div>
              <div style={styles.detailItem}>Blood Group: {patientData.patient_blood_group}</div>
              <div style={styles.detailItem}>Doctor: {patientData.doctor_name}</div>
            </div>
          </div>
        )}

        <div style={styles.searchContainer}>
          <BiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search lab tests..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.trim() && setShowSearchResults(true)}
          />
          {showSearchResults && searchResults.length > 0 && (
            <div style={styles.searchResults}>
              {searchResults.map((test) => (
                <div 
                  key={test.test_id} 
                  style={styles.resultItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  onClick={() => addTestToCart(test)}
                >
                  <div>
                    <div style={styles.testName}>{test.test_name}</div>
                    <div style={styles.testPrice}>${test.price}</div>
                  </div>
                  <button 
                    style={{
                      ...styles.addButton,
                      ...(selectedTests.some(t => t.test_id === test.test_id) ? styles.addButtonDisabled : {}),
                    }}
                    onMouseEnter={(e) => !selectedTests.some(t => t.test_id === test.test_id) && 
                      (e.currentTarget.style.backgroundColor = '#5649be')}
                    onMouseLeave={(e) => !selectedTests.some(t => t.test_id === test.test_id) && 
                      (e.currentTarget.style.backgroundColor = '#6c5ce7')}
                    disabled={selectedTests.some(t => t.test_id === test.test_id)}
                  >
                    {selectedTests.some(t => t.test_id === test.test_id) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div style={styles.mainContent}>
        <div style={styles.contentHeader}>
          <h2 style={styles.contentTitle}>Lab Test Prescription</h2>
        </div>

        <div style={styles.prescriptionContainer}>
          <div style={styles.testsContainer}>
            {selectedTests.length > 0 ? (
              selectedTests.map((test) => (
                <div key={test.test_id} style={styles.testCard}>
                  <div style={styles.testInfo}>
                    <div style={styles.testName}>{test.test_name}</div>
                    {test.description && (
                      <div style={styles.testDescription}>{test.description}</div>
                    )}
                    {/* <div style={styles.testPrice}>Price: ${test.price}</div> */}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: '20px', 
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}>
                <BiTestTube size={40} color="#ddd" style={{ marginBottom: '10px' }} />
                <div style={{ color: '#666' }}>No tests selected yet. Search and add tests from the sidebar.</div>
              </div>
            )}
          </div>

          <div style={styles.cartContainer}>
            <div style={styles.cartHeader}>
              <div style={styles.cartTitle}>Selected Tests</div>
              <div style={styles.cartCount}>{selectedTests.length}</div>
            </div>

            {selectedTests.length > 0 ? (
              <>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedTests.map((test) => (
                    <div key={test.test_id} style={styles.cartItem}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{test.test_name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>${test.price}</div>
                      </div>
                      <button 
                        style={styles.removeButton}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e66767'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ff7675'}
                        onClick={() => removeTestFromCart(test.test_id)}
                      >
                        <BiTrash size={14} /> Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div style={styles.notesContainer}>
                  <label htmlFor="notes" style={styles.notesLabel}>Notes</label>
                  <textarea
                    id="notes"
                    style={styles.notesInput}
                    placeholder="Enter any additional notes for the lab tests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button 
                  style={styles.submitButton}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00a884'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00b894'}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : existingPrescription ? 'Update Prescription' : 'Save Prescription'}
                </button>

                {existingPrescription && (
                  <button 
                    style={styles.deleteButton}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e66767'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ff7675'}
                    onClick={handleDeletePrescription}
                    disabled={isLoading}
                  >
                    <BiTrash size={16} /> Delete Prescription
                  </button>
                )}
              </>
            ) : (
              <div style={styles.emptyCart}>
                <BiTestTube size={40} color="#ddd" style={{ marginBottom: '10px' }} />
                <div>Your selected tests will appear here</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTestPrescription;