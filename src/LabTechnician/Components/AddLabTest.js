import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddLabTest = () => {
    const [testName, setTestName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [normalRange, setNormalRange] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Trimmed values
        const trimmedTestName = testName.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const trimmedNormalRange = normalRange.trim();

        // Validation
        if (!trimmedTestName || trimmedTestName.length < 3) {
            return alert("Please enter a valid Test Name (at least 3 characters).");
        }

        const validCategories = ["Blood", "Urine", "Imaging"];
        if (!validCategories.includes(trimmedCategory)) {
            return alert("Category must be one of: Blood, Urine, Imaging.");
        }

        if (!trimmedDescription || trimmedDescription.length < 10) {
            return alert("Description must be at least 10 characters.");
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return alert("Price must be a valid positive number.");
        }

        const normalRangeRegex = /^[0-9.]+\s*-\s*[0-9.]+\s*\w*\/?\w*$/; // e.g. 4.0 - 5.5 mmol/L
        if (!normalRangeRegex.test(trimmedNormalRange)) {
            return alert("Normal Range must be in format like: 4.0 - 5.5 mmol/L");
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "https://blueeye10.pythonanywhere.com/api/lab/labtests/add/",
                {
                    test_name: trimmedTestName,
                    category: trimmedCategory,
                    description: trimmedDescription,
                    price: parsedPrice,
                    normal_range: trimmedNormalRange,
                },
                { headers: { Authorization: `Token ${token}` } }
            );
            alert("Lab test added successfully");
            navigate("/lab-test-management");
        } catch (error) {
            console.error("Error adding lab test:", error);
            alert("Failed to add lab test. Please check the form and try again.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card show p-4">
                        <h2 className="text-center mb-4">Add Lab Test</h2>
                        <form onSubmit={handleSubmit}>
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
                                    placeholder="e.g. Blood, Urine, Imaging"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                />
                                <small className="text-muted">
                                    Allowed values: Blood, Urine, Imaging
                                </small>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Enter Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Price</label>
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
                            <div className="mb-3">
                                <label className="form-label">Normal Range</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. 4.0 - 5.5 mmol/L"
                                    value={normalRange}
                                    onChange={(e) => setNormalRange(e.target.value)}
                                    required
                                />
                                <small className="text-muted">
                                    Format: e.g. 4.0 - 5.5 mmol/L
                                </small>
                            </div>
                            <button type="submit" className="btn btn-success w-100 mb-3">
                                Submit
                            </button>
                        </form>
                        <button
                            className="btn btn-secondary w-100"
                            onClick={() => navigate("/lab-test-management")}
                        >
                            Back to List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLabTest;