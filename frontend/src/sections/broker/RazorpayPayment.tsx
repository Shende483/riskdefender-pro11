import { Box, Button, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3039');

interface RazorpayPaymentProps {
  totalPayment: number;
  datasend: any;
  disabled: boolean;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ totalPayment, datasend, disabled }) => {
  const [order, setOrder] = useState<{ id: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paylog, setPaylog] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('Paylogin', (data: string) => {
      setPaylog(data);
    });

    socket.on('paymentStatus', (status: string) => {
      setPaymentStatus(status);
    });

    socket.on('paymentStatu', (status: string) => {
      setPaymentStatus(status);
      socket.emit('create', {
        amount: totalPayment,
        userdata: datasend,
      });
    });

    return () => {
      socket.off('Paylogin');
      socket.off('paymentStatus');
      socket.off('paymentStatu');
    };
  }, [totalPayment, datasend]);

  const initiatePayment = async () => {
    try {
      socket.emit('createOrder', {
        amount: totalPayment * 100,
        userdata: datasend,
      });

      socket.on('orderCreated', async (response: { id: string }) => {
        try {
          setOrder(response);

          const options = {
            key: 'your_razorpay_key',
            amount: totalPayment * 100,
            currency: 'INR',
            name: 'Your Business Name',
            description: 'Payment for order',
            theme: { color: '#11C526' },

            handler: async (handlerresponse: any) => {
              socket.emit('verifyPayment', {
                payment_id: handlerresponse.razorpay_payment_id,
                order_id: handlerresponse.razorpay_order_id,
                amount: totalPayment * 100,
              });
            },
          };


          const razorpayInstance = new (window as any).Razorpay(options);
          razorpayInstance.open();
        } catch (error) {
          console.error('Error processing payment:', error);
        }
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
    }

    
    navigate("/broker");
  };

  return (
    <Box>
      <Button onClick={initiatePayment} disabled={disabled} variant="contained">Make Secure Payment</Button>
      {paylog && <Typography>Login: {paylog}</Typography>}
      {order && <Typography>Order ID: {order.id}</Typography>}
      {paymentStatus && <Typography>{paymentStatus}</Typography>}
    </Box>
  );
};

export default RazorpayPayment;
