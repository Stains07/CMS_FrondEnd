import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const UpdateMedicine = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [medicineName, setMedicineName] = useState("");
    const [genericName, setGenericName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [pricePerUnit, setPricePerUnit] = useState("");

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8000/api/pharmacy/medicines/${id}/`, {
                  headers: {
                    Authorization: `Token ${token}`,
                  },
                });
                

                const data = response.data;
                setMedicineName(data.medicine_name);
                setGenericName(data.generic_name);
                setCompanyName(data.company_name);
                setPricePerUnit(data.price_per_unit);
            } catch (error) {
                console.error("Error fetching medicine:", error);
                alert("Failed to load medicine details.");
            }
        };

        fetchMedicine();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8000/api/pharmacy/medicines/${id}/update/`, 

                {
                    medicine_name: medicineName,
                    generic_name: genericName,
                    company_name: companyName,
                    price_per_unit: pricePerUnit,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            alert("Medicine updated successfully");
            navigate("/manage-medicines");
        } catch (error) {
            console.error("Error updating medicine:", error);
            alert("Failed to update medicine. Please check the form.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow p-4">
                        <h2 className="text-center mb-4">Edit Medicine</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label">Medicine Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Medicine Name"
                                    value={medicineName}
                                    onChange={(e) => setMedicineName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Generic Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Generic Name"
                                    value={genericName}
                                    onChange={(e) => setGenericName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Price Per Unit</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter Price"
                                    value={pricePerUnit}
                                    onChange={(e) => setPricePerUnit(e.target.value)}
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100">
                                Update Medicine
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateMedicine;
