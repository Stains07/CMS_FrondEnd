import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LabBillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [bill, setBill] = useState(null);
  const [gst, setGst] = useState("");

  const baseURL = `https://blueeye10.pythonanywhere.com/api/lab/labreports/${id}/`;
  const createBillURL = `https://blueeye10.pythonanywhere.com/api/lab/labtestbills/create/`;

  useEffect(() => {
    if (!id) {
      navigate("/error");
      return;
    }

    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(baseURL, {
          headers: { Authorization: `Token ${token}` },
        });
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };

    fetchReport();
  }, [id, navigate]);

  const handleGstChange = (e) => setGst(e.target.value);

  const createLabBill = async () => {
    const gstValue = parseFloat(gst);
    if (isNaN(gstValue) || gstValue < 0 || gstValue > 100) {
      alert("Please enter a valid GST between 0 and 100.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        createBillURL,
        { report_id: id, gst: gstValue },
        { headers: { Authorization: `Token ${token}` } }
      );
      setBill(response.data.data);
    } catch (error) {
      console.error("Error creating bill:", error);
      alert("Failed to create bill. Please check the console for more details.");
    }
  };

  const generatePDF = () => {
    if (!bill) {
      alert("No bill available to generate PDF.");
      return;
    }

    const doc = new jsPDF();

    const renderPDFContent = () => {
      doc.setFontSize(18);
      doc.text("Clinical Management System", 55, 40);
      doc.setFontSize(14);
      doc.text("Lab Test Bill", 80, 50);

      const result = autoTable(doc, {
        startY: 60,
        head: [['Field', 'Details']],
        body: [
          ['Patient Name', bill.patient_name || '-'],
          ['Doctor Name', bill.doctor_name || '-'],
          ['Test Name', bill.test_name || '-'],
          ['Date', new Date().toLocaleDateString()],
          ['Amount', `$${bill.price || "0.00"}`],
          ['GST', `${bill.gst || "0.00"}%`],
          ['Total Amount', `$${bill.total_amount || "0.00"}`],
          ['Payment Status', 'Paid'],
        ],
        theme: 'grid',
      });

      const finalY = doc.lastAutoTable?.finalY || 100;
 // ✅ Get finalY safely
      doc.setFontSize(10);
      doc.text("Thank you for choosing our lab. Get well soon!", 60, finalY + 20);
      doc.save(`Lab_Bill_${bill.l_bill_id}.pdf`);
    };

    // Skip logo for now (or use local image instead)
    renderPDFContent();
  };

  if (!report) return <div>Loading report data...</div>;

  return (
    <div className="container mt-4">
      <h2>Generate Lab Test Bill</h2>

      <div className="mb-3">
        <label className="form-label">GST Percentage:</label>
        <input
          type="number"
          className="form-control"
          value={gst}
          onChange={handleGstChange}
          placeholder="Enter GST (0–100)"
          min="0"
          max="100"
        />
      </div>

      <button className="btn btn-primary" onClick={createLabBill}>
        Create Bill
      </button>

      {bill && (
        <div className="mt-4">
          <h4>Bill Created Successfully</h4>
          <button className="btn btn-success" onClick={generatePDF}>
            Download Bill PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default LabBillForm;