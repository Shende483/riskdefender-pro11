

import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Alert, CircularProgress } from '@mui/material';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentGatewayProps {
  subscriptionId: string;
  amount: number;
}

export default function PaymentGateway({ subscriptionId, amount }: PaymentGatewayProps) {
  const [loading, setLoading] = useState(true); // Start in loading state
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  // ✅ Wrap initiatePayment inside useCallback
  const initiatePayment = useCallback(async () => {
    try {
      setLoading(true);
      const orderResponse = await axios.post(
        'http://localhost:3040/payment-details/create-payment',
        { subscriptionId, amount, currency: 'INR' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const options = {
        key: 'rzp_test_eOk7fWZMLa686r',
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: 'RiskDefender',
        description: 'Payment for subscription',
        handler: async (response: any) => {
          try {
            await axios.post(
              'http://localhost:3040/payment-details/verify-payment',
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                amount: orderResponse.data.amount,
                subscriptionId: orderResponse.data.subscriptionId,
              },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setStatusMessage('Payment successful!');

            try {
              await axios.post(
                'http://localhost:3040/subscription-details/update',
                {
                  status: 'active',
                  subscriptionId: orderResponse.data.subscriptionId,
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
            } catch (error: any) {
              setStatusMessage('Failed to update subscription.');
            }
            navigate('/broker');
          } catch (error) {
            setStatusMessage('Payment verification failed');
          }
        },
        prefill: {
          email: orderResponse.data.email,
          contact: orderResponse.data.mobile,
        },
        theme: { color: '#3399cc' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response: any) => {
        setStatusMessage(`Payment failed: ${response.error.description}`);

        try {
          await axios.post(
            'http://localhost:3040/subscription-details/update',
            {
              status: 'inactive',
              subscriptionId: orderResponse.data.subscriptionId,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        } catch (error: any) {
          setStatusMessage('Failed to update subscription.');
        }
      });
      rzp.open();
    } catch (error) {
      setStatusMessage('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, amount, accessToken, navigate]); // ✅ Dependencies added for stability

  useEffect(() => {
    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        initiatePayment(); // ✅ Now safe to call
      };
      script.onerror = () => setStatusMessage('Failed to load payment gateway. Please refresh.');
      document.body.appendChild(script);
    };

    if (!window.Razorpay) {
      loadRazorpay();
    } else {
      setRazorpayLoaded(true);
      initiatePayment(); // ✅ Now safe to call
    }
  }, [initiatePayment]); // ✅ Fixed missing dependency warning

  return (
    <Box>
      {loading && <CircularProgress size={24} />}
      {statusMessage && (
        <Alert severity={statusMessage.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {statusMessage}
        </Alert>
      )}
    </Box>
  );
}
