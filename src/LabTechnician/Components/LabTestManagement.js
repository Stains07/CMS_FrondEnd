import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const baseURL = "https://blueeye10.pythonanywhere.com/api/lab/labtests/all/";

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(baseURL, {
        headers: { Authorization: `Token ${token}` },
      });
      setLabTests(response.data);
    } catch (error) {
      console.error("Error fetching lab tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/labtechnition/labtests/${id}/update`);
  };

  const handleAdd = () => {
    navigate(`/labtechnition/labtests/add`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this lab test?");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:8000/api/lab/labtests/${id}/delete/`,
          {},
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        setLabTests((prev) => prev.filter((test) => test.test_id !== id));
        alert("Lab test deleted successfully.");
      } catch (error) {
        console.error("Error deleting lab test:", error);
        alert("Failed to delete lab test.");
      }
    }
  };

  const filteredLabTests = labTests.filter((test) =>
    [test.test_name, test.category, test.description]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            Clinical Management System — <span className="fw-light">Lab Test Management</span>
          </span>
        </div>
      </nav>

      <div className="container my-4">
        <h2 className="mb-4 text-primary">Available Lab Tests</h2>

        {/* Search and Add */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            className="form-control w-50 me-2"
            placeholder="Search lab tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Lab Test
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredLabTests.length === 0 ? (
              <div className="alert alert-info text-center">
                No lab tests found.
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {filteredLabTests.map((test) => (
                  <div className="col" key={test.test_id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title text-primary">{test.test_name}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">{test.category}</h6>
                        <p className="card-text">
                          {test.description?.slice(0, 100) || "No description available."}
                        </p>
                        <ul className="list-unstyled mb-2">
                          <li><strong>Price:</strong> ₹{test.price}</li>
                          <li><strong>Normal Range:</strong> {test.normal_range || "-"}</li>
                          <li>
                            <strong>Status:</strong>{" "}
                            <span className={`badge ${test.status?.toLowerCase() === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {test.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="card-footer bg-white d-flex justify-content-between">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEdit(test.test_id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(test.test_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Back to Dashboard */}
        <div className="d-flex justify-content-center mt-5">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/labtechnition/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageLabTests;