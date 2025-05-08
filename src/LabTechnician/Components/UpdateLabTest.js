import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const UpdateLabTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testName, setTestName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const fetchLabTest = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`https://blueeye10.pythonanywhere.com/api/lab/labtests/${id}/update/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const data = response.data;
        setTestName(data.test_name);
        setCategory(data.category || "");
        setDescription(data.description || "");
        setPrice(data.price);
      } catch (error) {
        console.error("Error fetching lab test:", error);
        alert("Failed to load lab test details.");
      }
    };

    fetchLabTest();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/api/lab/labtests/${id}/`, 
        {
          test_name: testName,
          category: category,
          description: description,
          price: price,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      alert("Lab Test updated successfully");
      navigate("/labtechnition/dashboard");
    } catch (error) {
      console.error("Error updating lab test:", error);
      alert("Failed to update lab test. Please check the form.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Edit Lab Test</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label">Test Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Test Name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Update Lab Test
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLabTest;