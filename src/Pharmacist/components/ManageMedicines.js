import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const baseURL = "https://blueeye10.pythonanywhere.com/api/pharmacy/medicines/all/";

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(baseURL, {
        headers: { Authorization: `Token ${token}` },
      });
      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/pharmacist/medicines/${id}/update`);
  };
  

  const handleAdd = () => {
    navigate(`/pharmacist/medicines/add`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this medicine?");
    
    if (!confirmDelete) {
      return; // User cancelled deletion
    }
  
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://blueeye10.pythonanywhere.com/api/pharmacy/medicines/${id}/delete/`, {
        headers: { Authorization: `Token ${token}` },
      });
  
      // Remove the deleted medicine from the list
      setMedicines((prev) => prev.filter((med) => med.medicine_id !== id));
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Failed to delete medicine.");
    }
  };
  

  const filteredMedicines = medicines.filter((med) =>
    [med.medicine_name, med.generic_name, med.company_name]
      .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            Clinical Management System — <span className="fw-light">Medicine Management</span>
          </span>
        </div>
      </nav>

      <div className="container my-4">
        <h2 className="mb-4 text-success">Avilable Medicines</h2>

        {/* Search and Add Button */}
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            className="form-control w-50 me-2"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleAdd}>
            + Add Medicine
          </button>
        </div>

        {/* Medicine Table */}
        {loading ? (
          <div className="text-center mt-4">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover mt-3">
              <thead className="table-success">
                <tr>
                  {/* <th>ID</th> */}
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Company</th>
                  {/* <th>Stock</th> */}
                  <th>Price/Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr key={med.medicine_id}>
                    {/* <td>{med.medicine_id}</td> */}
                    <td>{med.medicine_name}</td>
                    <td>{med.generic_name}</td>
                    <td>{med.company_name}</td>
                    {/* <td>{med.stock_quantity}</td> */}
                    <td>₹{med.price_per_unit}</td>
                    <td>
                      <span className={`badge ${med.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(med.medicine_id)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(med.medicine_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No medicines found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-outline-success" onClick={() => navigate('/pharmacist/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageMedicines;