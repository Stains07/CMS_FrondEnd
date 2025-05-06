import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadTestReports = () => {
    const [labReports, setLabReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const baseURL = "http://localhost:8000/api/lab/labreports/";

    useEffect(() => {
        fetchLabReports();
    }, []);

    const fetchLabReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(baseURL, {
                headers: { Authorization: `Token ${token}` },
            });
            setLabReports(response.data);
        } catch (error) {
            console.error("Error fetching lab reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBill = (id) => {
        navigate(`/labtechnition/lab-bill/${id}`);
    };

    const handlePrintResult = (id) => {
        window.open(`/labtechnition/labreports/${id}/print`, '_blank');
    };

    const handleBackToDashboard = () => {
        navigate('/labtechnition/dashboard');
    };

    const filteredLabReports = labReports.filter((report) =>
        [
            report.patient_name,
            report.doctor_name,
            report.test_name,
            report.actual_value,
            report.normal_range
        ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <nav className="navbar navbar-dark bg-dark">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">
                        Clinical Management System — Lab Report Management
                    </span>
                    <button className="btn btn-outline-light" onClick={handleBackToDashboard}>
                        ⬅ Back to Dashboard
                    </button>
                </div>
            </nav>

            <div className="container my-4">
                <h2 className="mb-4 text-primary">Manage Lab Reports</h2>

                <div className="mb-3 w-50">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search lab reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="text-center mt-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover mt-3">
                            <thead className="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Test Name</th>
                                    <th>Actual Value</th>
                                    <th>Normal Range</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLabReports.map((report) => (
                                    <tr key={report.report_id}>
                                        <td>{report.report_id}</td>
                                        <td>{report.patient_name || '-'}</td>
                                        <td>{report.doctor_name || '-'}</td>
                                        <td>{report.test_name || '-'}</td>
                                        <td>{report.actual_value || '-'}</td>
                                        <td>{report.normal_range || '-'}</td>
                                        <td>
                                            <span className="badge bg-success">Completed</span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-primary btn-sm me-2" 
                                                onClick={() => handleGenerateBill(report.report_id)}
                                            >
                                                Generate Bill
                                            </button>
                                            <button 
                                                className="btn btn-info btn-sm" 
                                                onClick={() => handlePrintResult(report.report_id)}
                                            >
                                                Print Result
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default UploadTestReports;