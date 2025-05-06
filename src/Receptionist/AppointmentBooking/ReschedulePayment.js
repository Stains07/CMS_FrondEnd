import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaMoneyBillWave, FaReceipt, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

const PaymentModal = ({ 
  show, 
  onHide, 
  amount, 
  isRefund, 
  appointmentId, 
  onPaymentComplete,
  previousPayment,
  newFee
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  
  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Create a new payment record
      const response = await axios.post(
        `${API_BASE_URL}payments/`,
        {
          appointment_id: appointmentId,
          amount: newFee,
          payment_method: paymentMethod,
          status: 'completed',
          notes: isRefund 
            ? `Refund of $${(previousPayment - newFee).toFixed(2)} processed` 
            : `Additional payment of $${(newFee - previousPayment).toFixed(2)} collected`
        },
        authHeaders
      );

      // If this was a refund, create a refund record
      if (isRefund) {
        await axios.post(
          `${API_BASE_URL}refunds/`,
          {
            payment_id: response.data.payment_id,
            amount: previousPayment - newFee,
            reason: 'Appointment rescheduled with lower fee'
          },
          authHeaders
        );
      }

      onPaymentComplete(isRefund ? 'refunded' : 'success');
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          {isRefund ? <FaExchangeAlt /> : <FaMoneyBillWave />}
          {isRefund ? 'Refund Due' : 'Additional Payment Required'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <h6 className="d-flex justify-content-between">
            <span>Previous Fee:</span>
            <span>${previousPayment.toFixed(2)}</span>
          </h6>
          <h6 className="d-flex justify-content-between">
            <span>New Fee:</span>
            <span>${newFee.toFixed(2)}</span>
          </h6>
          <hr />
          <h5 className={`d-flex justify-content-between ${isRefund ? 'text-success' : 'text-primary'}`}>
            <span>{isRefund ? 'Refund Amount:' : 'Amount Due:'}</span>
            <span>${amount.toFixed(2)}</span>
          </h5>
        </div>

        {!isRefund && (
          <div className="mb-3">
            <label className="form-label">Payment Method</label>
            <select 
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="insurance">Insurance</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
        )}

        <div className="alert alert-info small">
          {isRefund ? (
            <>The new appointment fee is lower than the amount already paid. A refund will be processed.</>
          ) : (
            <>The new appointment fee is higher than the amount already paid. Please collect the difference.</>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant={isRefund ? "success" : "primary"} 
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : isRefund ? 'Process Refund' : 'Confirm Payment'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;