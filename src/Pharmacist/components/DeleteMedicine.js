import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteMedicine = () => {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8000/api/pharmacy/medicines/${medicineId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setMedicineName(response.data.medicine_name);
      } catch (error) {
        alert("Error fetching medicine details");
      }
    };
    fetchMedicine();
  }, [medicineId]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/pharmacy/medicines/${medicineId}/delete/`, {
        headers: { Authorization: `Token ${token}` },
      });
      alert("Medicine Deleted Successfully");
      navigate("/pharmacist/medicines");
    } catch (error) {
      alert("Error deleting medicine");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4 text-center">
            <h2 className="text-danger">Delete Medicine</h2>
            <p className="mt-3">
              Are you sure you want to delete <strong>{medicineName}</strong>?
            </p>
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-danger me-3" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/pharmacist/medicines")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMedicine;
