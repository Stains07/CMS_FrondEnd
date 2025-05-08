import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const LabReportPrintView = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`https://blueeye10.pythonanywhere.com/api/lab/labreports/${id}/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                setReport(response.data);
            } catch (error) {
                console.error("Error fetching report:", error);
            }
        };

        fetchReport();
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 500); // Wait a moment to ensure data loads

        return () => clearTimeout(timer);
    }, []);

    if (!report) {
        return <div className="text-center mt-5">Loading report...</div>;
    }

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Lab Report</h2>
            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <th>Report ID</th>
                        <td>{report.report_id}</td>
                    </tr>
                    <tr>
                        <th>Patient Name</th>
                        <td>{report.patient_name}</td>
                    </tr>
                    <tr>
                        <th>Doctor Name</th>
                        <td>{report.doctor_name}</td>
                    </tr>
                    <tr>
                        <th>Test Name</th>
                        <td>{report.test_name}</td>
                    </tr>
                    <tr>
                        <th>Actual Value</th>
                        <td>{report.actual_value}</td>
                    </tr>
                    <tr>
                        <th>Normal Range</th>
                        <td>{report.normal_range}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default LabReportPrintView;