import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddMedicine = () => {
    const [medicineName, setMedicineName] = useState("");
    const [genericName, setGenericName] = useState("");
    const [companyName, setCompanyName] = useState("");
    // const [stockQuantity, setStockQuantity] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8000/api/pharmacy/medicines/",
                {
                    medicine_name: medicineName,
                    generic_name: genericName,
                    company_name: companyName,
                    
                    price_per_unit: pricePerUnit,
                },
                { headers: { Authorization: `Token ${token}` } }
            );
            alert("Medicine added successfully");
            navigate("/manage-stock");
        } catch (error) {
            console.error("Error adding medicine:", error);
            alert("Failed to add medicine. Make sure all fields are valid.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card show p-4">
                        <h2 className="text-center mb-4">Add Medicine</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Medicine Name</label>
                                <input
                                    type="text" className="form-control"
                                    placeholder="Enter Medicine Name"
                                    value={medicineName}
                                    onChange={(e) => setMedicineName(e.target.value)}
                                    required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Generic Name</label>
                                <input
                                    type="text" className="form-control"
                                    placeholder="Enter Generic Name"
                                    value={genericName}
                                    onChange={(e) => setGenericName(e.target.value)}
                                    required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text" className="form-control"
                                    placeholder="Enter Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required />
                            </div>
                            {/* <div className="mb-3">
                                <label className="form-label">Stock Quantity</label>
                                <input
                                    type="number" className="form-control"
                                    placeholder="Enter Stock Quantity"
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                    min="0"
                                    required />
                            </div> */}
                            <div className="mb-3">
                                <label className="form-label">Price Per Unit</label>
                                <input
                                    type="number" className="form-control"
                                    placeholder="Enter Price"
                                    value={pricePerUnit}
                                    onChange={(e) => setPricePerUnit(e.target.value)}
                                    step="0.01"
                                    min="0.01"
                                    required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Add Medicine</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMedicine;
