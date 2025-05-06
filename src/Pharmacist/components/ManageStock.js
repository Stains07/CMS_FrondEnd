import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const MedicineStockManagement = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStock, setEditingStock] = useState(null);
    const [quantityChange, setQuantityChange] = useState(0);
    const [restockAmount, setRestockAmount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get('http://localhost:8000/api/pharmacy/stocks/', {
                headers: { Authorization: `Token ${token}` }
            });
            setStocks(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch stock data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (stockId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `http://localhost:8000/api/pharmacy/stocks/${stockId}/update/`,
                { quantity_change: quantityChange },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchStocks();
            setEditingStock(null);
            setQuantityChange(0);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update stock");
        }
    };

    const handleRestock = async (stockId) => {
        try {
            if (restockAmount <= 0) {
                setError("Restock amount must be positive");
                return;
            }

            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8000/api/pharmacy/stocks/${stockId}/restock/`,
                { amount: restockAmount },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchStocks();
            setEditingStock(null);
            setRestockAmount(0);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to restock");
        }
    };

    const handleBackToDashboard = () => {
        navigate("/pharmacist/dashboard");
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary">Medicine Stock Management</h2>
                <button 
                    className="btn btn-outline-secondary"
                    onClick={handleBackToDashboard}
                >
                    Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="alert alert-danger mb-3">
                    {error}
                    <button 
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-primary">
                        <tr>
                            <th>Medicine</th>
                            <th>Current Stock</th>
                            <th>Threshold</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => (
                            <tr 
                                key={stock.stock_id} 
                                className={stock.needs_restock ? 'table-warning' : ''}
                            >
                                <td>
                                    <strong>{stock.medicine_name || 'N/A'}</strong><br />
                                    <small className="text-muted">{stock.medicine?.generic_name || ''}</small>
                                </td>
                                <td>{stock.current_quantity}</td>
                                <td>{stock.restock_threshold}</td>
                                <td>
                                    {stock.needs_restock ? (
                                        <span className="badge bg-danger">Needs Restock</span>
                                    ) : (
                                        <span className="badge bg-success">Adequate</span>
                                    )}
                                </td>
                                <td>{new Date(stock.last_updated).toLocaleString()}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setEditingStock(stock.stock_id)}
                                        >
                                            Adjust
                                        </button>
                                        <button
                                            className="btn btn-sm btn-warning"
                                            onClick={() => {
                                                const defaultAmount = Math.max(stock.restock_threshold * 2, 1);
                                                setRestockAmount(defaultAmount);
                                                setEditingStock(stock.stock_id);
                                            }}
                                        >
                                            Quick Restock
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingStock && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Restock {stocks.find(s => s.stock_id === editingStock)?.medicine?.medicine_name || 'Medicine'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setEditingStock(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Restock Amount</label>
                                    <input
                                        type="number"
                                        className={`form-control ${restockAmount <= 0 ? 'is-invalid' : ''}`}
                                        value={restockAmount}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            setRestockAmount(value);
                                        }}
                                        min="1"
                                    />
                                    {restockAmount <= 0 && (
                                        <div className="invalid-feedback">
                                            Amount must be greater than zero
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setEditingStock(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={() => handleRestock(editingStock)}
                                    disabled={restockAmount <= 0}
                                >
                                    Confirm Restock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineStockManagement;