import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteLabTest = () => {
  const { labTestId } = useParams();
  const navigate = useNavigate();
  const [testName, setTestName] = useState("");

  useEffect(() => {
    const fetchLabTest = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8000/api/lab/labtests/${labTestId}/update/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setTestName(response.data.test_name);
      } catch (error) {
        alert("Error fetching lab test details");
      }
    };
    fetchLabTest();
  }, [labTestId]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/lab/labtests/${labTestId}/delete/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      alert("Lab Test deactivated successfully");
      navigate("/labtechnition/dashboard");
    } catch (error) {
      alert("Error deactivating lab test");
    }
  };
  

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4 text-center">
            <h2 className="text-danger">Delete Lab Test</h2>
            <p className="mt-3">
              Are you sure you want to delete <strong>{testName}</strong>?
            </p>
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-danger me-3" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/labtechnition/dashboard")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteLabTest;
