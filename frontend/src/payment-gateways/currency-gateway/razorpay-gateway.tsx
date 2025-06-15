

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import RazorpayService from '../../Services/api-services/payment-gateway-service/razorpay-gatway-service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentGatewayProps {
  planId: string;
  couponCode: string;
  amount: number;
  currency: string;
  paymentType: 'createBroker' | 'renewBroker' | 'tradingJournalRenew' | 'alertRenew' | 'penaltyPayment';
  data: {
    marketTypeId?: string;
    brokerId?: string;
    subAccountName?: string;
    brokerAccountId?: string;
    journalId?: string;
    alertId?: string;
  };
  onSuccess?: (response: { razorpayPaymentId: string; razorpayOrderId: string }) => void;
}

export default function PaymentGateway({
  planId,
  couponCode,
  amount,
  currency,
  paymentType,
  data,
  onSuccess,
}: PaymentGatewayProps) {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const isInitiated = useRef(false);

  const validateData = () => {
    switch (paymentType) {
      case 'createBroker': return data.marketTypeId && data.brokerId && data.subAccountName;
      case 'renewBroker': return data.brokerAccountId;
      case 'tradingJournalRenew': return data.journalId;
      case 'alertRenew': return data.alertId;
      case 'penaltyPayment': return data.brokerAccountId;
      default: return false;
    }
  };

  const getPaymentDescription = () => {
    switch (paymentType) {
      case 'createBroker': return 'Payment for new broker account';
      case 'renewBroker': return 'Renewal of broker plan';
      case 'tradingJournalRenew': return 'Trading journal renewal';
      case 'alertRenew': return 'Alert renewal';
      case 'penaltyPayment': return 'Penalty plan payment';
      default: return 'Payment for service';
    }
  };

  const getSuccessRedirectPath = () => {
    switch (paymentType) {
      case 'createBroker': return '/add-broker-rules';
      case 'renewBroker': return '/add-broker-rules';
      case 'tradingJournalRenew': return '/add-broker-rules';
      case 'alertRenew': return '/add-broker-rules';
      case 'penaltyPayment': return '/update-broker-rules';
      default: return '/';
    }
  };

  const getPaymentName = () => {
    switch (paymentType) {
      case 'createBroker': return 'RiskDefender - New Broker';
      case 'renewBroker': return 'RiskDefender - Broker Renewal';
      case 'tradingJournalRenew': return 'RiskDefender - Journal Renewal';
      case 'alertRenew': return 'RiskDefender - Alert Renewal';
      case 'penaltyPayment': return 'RiskDefender - Penalty Plan';
      default: return 'RiskDefender';
    }
  };

  const getPaymentData = () => {
    switch (paymentType) {
      case 'createBroker': return { marketTypeId: data.marketTypeId, brokerId: data.brokerId, subAccountName: data.subAccountName };
      case 'renewBroker': return { brokerAccountId: data.brokerAccountId };
      case 'penaltyPayment': return { brokerAccountId: data.brokerAccountId };
      default: return {};
    }
  };

  const initiatePayment = useCallback(async () => {
    if (isInitiated.current) return;
    isInitiated.current = true;

    if (!validateData()) {
      setStatusMessage('Missing required data for payment');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orderResponse = await RazorpayService.createPayment({
        planId,
        couponCode,
        amount,
        currency,
        paymentType,
      });

      if (!orderResponse?.success || !orderResponse?.data) {
        throw new Error(orderResponse?.message || 'Invalid payment response from server');
      }
      if (!orderResponse.data.amount || !orderResponse.data.currency || !orderResponse.data.orderId || !orderResponse.data.keyId) {
        throw new Error('Required payment details missing in response');
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: getPaymentName(),
        description: getPaymentDescription(),
        handler: async (response: any) => {
          try {
            await RazorpayService.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount,
              planId,
              paymentType,
              currency,
              brokerAccountId: data.brokerAccountId,
              couponCode,
              marketTypeId: data.marketTypeId,
              brokerId: data.brokerId,
              subAccountName: data.subAccountName,
            });
            setStatusMessage('Payment successful!');
            console.log('PaymentGateway: Payment verified, calling onSuccess', { razorpayPaymentId: response.razorpay_payment_id, razorpayOrderId: response.razorpay_order_id });
            onSuccess?.({ razorpayPaymentId: response.razorpay_payment_id, razorpayOrderId: response.razorpay_order_id });
            navigate(getSuccessRedirectPath());
          } catch (error) {
            setStatusMessage('Payment verification failed');
            console.error('PaymentGateway: Payment verification error:', error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: orderResponse.data.email,
          contact: orderResponse.data.mobile,
        },
        theme: { color: '#3399cc' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setStatusMessage(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      let errorMessage = 'Payment initialization failed';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      setStatusMessage(errorMessage);
      console.error('PaymentGateway: Payment initialization error:', error);
      setLoading(false);
    }
  }, [planId, couponCode, amount, currency, paymentType, data, navigate, onSuccess]);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadRazorpay = () => {
      script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => initiatePayment();
      script.onerror = () => setStatusMessage('Failed to load payment gateway. Please refresh.');
      document.body.appendChild(script);
    };

    if (!window.Razorpay && !isInitiated.current) {
      loadRazorpay();
    } else if (window.Razorpay && !isInitiated.current) {
      initiatePayment();
    }

    return () => {
      if (script) document.body.removeChild(script);
    };
  }, [initiatePayment]);

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


/*
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import RazorpayService from '../../Services/api-services/payment-gateway-service/razorpay-gatway-service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentGatewayProps {
  planId: string;
  couponCode: string;
  amount: number;
  currency: string;
  paymentType: 'createBroker' | 'renewBroker' | 'tradingJournalRenew' | 'alertRenew' | 'penaltyPayment';
  data: {
    marketTypeId?: string;
    brokerId?: string;
    subAccountName?: string;
    brokerAccountId?: string;
    journalId?: string;
    alertId?: string;
  };
  onSuccess?: (response: { razorpayPaymentId: string; razorpayOrderId: string }) => void;
}

export default function PaymentGateway({
  planId,
  couponCode,
  amount,
  currency,
  paymentType,
  data,
  onSuccess,
}: PaymentGatewayProps) {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const isInitiated = useRef(false);

  const validateData = () => {
    switch (paymentType) {
      case 'createBroker': return data.marketTypeId && data.brokerId && data.subAccountName;
      case 'renewBroker': return data.brokerAccountId;
      case 'tradingJournalRenew': return data.journalId;
      case 'alertRenew': return data.alertId;
      case 'penaltyPayment': return data.brokerAccountId;
      default: return false;
    }
  };

  const getPaymentDescription = () => {
    switch (paymentType) {
      case 'createBroker': return 'Payment for new broker account';
      case 'renewBroker': return 'Renewal of broker plan';
      case 'tradingJournalRenew': return 'Trading journal renewal';
      case 'alertRenew': return 'Alert renewal';
      case 'penaltyPayment': return 'Penalty plan payment';
      default: return 'Payment for service';
    }
  };

  const getSuccessRedirectPath = () => {
    switch (paymentType) {
      case 'createBroker': return '/add-broker-rules';
      case 'renewBroker': return '/add-broker-rules';
      case 'tradingJournalRenew': return '/add-broker-rules';
      case 'alertRenew': return '/add-broker-rules';
      case 'penaltyPayment': return '/update-broker-rules';
      default: return '/';
    }
  };

  const getPaymentName = () => {
    switch (paymentType) {
      case 'createBroker': return 'RiskDefender - New Broker';
      case 'renewBroker': return 'RiskDefender - Broker Renewal';
      case 'tradingJournalRenew': return 'RiskDefender - Journal Renewal';
      case 'alertRenew': return 'RiskDefender - Alert Renewal';
      case 'penaltyPayment': return 'RiskDefender - Penalty Plan';
      default: return 'RiskDefender';
    }
  };

  const getPaymentData = () => {
    switch (paymentType) {
      case 'createBroker': return { marketTypeId: data.marketTypeId, brokerId: data.brokerId, subAccountName: data.subAccountName };
      case 'renewBroker': return { brokerAccountId: data.brokerAccountId };
      case 'penaltyPayment': return { brokerAccountId: data.brokerAccountId };
      default: return {};
    }
  };

  const initiatePayment = useCallback(async () => {
    if (isInitiated.current) return;
    isInitiated.current = true;

    if (!validateData()) {
      setStatusMessage('Missing required data for payment');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orderResponse = await RazorpayService.createPayment({
        planId,
        couponCode,
        amount,
        currency,
        paymentType,
      });

      if (!orderResponse?.success || !orderResponse?.data) {
        throw new Error(orderResponse?.message || 'Invalid payment response from server');
      }
      if (!orderResponse.data.amount || !orderResponse.data.currency || !orderResponse.data.orderId || !orderResponse.data.keyId) {
        throw new Error('Required payment details missing in response');
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: getPaymentName(),
        description: getPaymentDescription(),
        handler: async (response: any) => {
          try {
            await RazorpayService.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount,
              planId,
              paymentType,
              currency,
              brokerAccountId: data.brokerAccountId,
              couponCode,
              marketTypeId: data.marketTypeId,
              brokerId: data.brokerId,
              subAccountName: data.subAccountName,
            });
            setStatusMessage('Payment successful!');
            onSuccess?.({ razorpayPaymentId: response.razorpay_payment_id, razorpayOrderId: response.razorpay_order_id });
            navigate(getSuccessRedirectPath());
          } catch (error) {
            setStatusMessage('Payment verification failed');
            console.error('Payment verification error:', error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: orderResponse.data.email,
          contact: orderResponse.data.mobile,
        },
        theme: { color: '#3399cc' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setStatusMessage(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      let errorMessage = 'Payment initialization failed';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      setStatusMessage(errorMessage);
      console.error('Payment initialization error:', error);
      setLoading(false);
    }
  }, [planId, couponCode, amount, currency, paymentType, data, navigate, onSuccess]);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadRazorpay = () => {
      script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => initiatePayment();
      script.onerror = () => setStatusMessage('Failed to load payment gateway. Please refresh.');
      document.body.appendChild(script);
    };

    if (!window.Razorpay && !isInitiated.current) {
      loadRazorpay();
    } else if (window.Razorpay && !isInitiated.current) {
      initiatePayment();
    }

    return () => {
      if (script) document.body.removeChild(script);
    };
  }, [initiatePayment]);

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
*/


/*
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import RazorpayService from '../../Services/api-services/payment-gateway-service/razorpay-gatway-service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentGatewayProps {
  planId: string;
  couponCode: string;
  amount: number;
  currency: string;
  paymentType: 'createBroker' | 'renewBroker' | 'tradingJournalRenew' | 'alertRenew' | 'penaltyPayment';
  data: {
    marketTypeId?: string;
    brokerId?: string;
    subAccountName?: string;
    brokerAccountId?: string;
    journalId?: string;
    alertId?: string;
   // penaltyId?: string;
  };
}

export default function PaymentGateway({
  planId,
  couponCode,
  amount,
  currency,
  paymentType,
  data,
}: PaymentGatewayProps) {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const isInitiated = useRef(false);

  const validateData = () => {
    switch (paymentType) {
      case 'createBroker':
        return data.marketTypeId && data.brokerId && data.subAccountName;
      case 'renewBroker':
        return data.brokerAccountId;
      case 'tradingJournalRenew':
        return data.journalId;
      case 'alertRenew':
        return data.alertId;
      case 'penaltyPayment':
        return data.brokerAccountId;
      default:
        return false;
    }
  };

  const getPaymentDescription = () => {
    switch (paymentType) {
      case 'createBroker': return 'Payment for new broker account';
      case 'renewBroker': return 'Renewal of broker plan';
      case 'tradingJournalRenew': return 'Trading journal renewal';
      case 'alertRenew': return 'Alert renewal';
      case 'penaltyPayment': return 'Penalty plan payment';
      default: return 'Payment for service';
    }
  };

  const getSuccessRedirectPath = () => {
    switch (paymentType) {
      case 'createBroker': return '/add-broker-rules';
      case 'renewBroker': return '/add-broker-rules';
      case 'tradingJournalRenew': return '/add-broker-rules';
      case 'alertRenew': return '/add-broker-rules';
      case 'penaltyPayment': return '/update-broker-rules';
      default: return '/';
    }
  };

  const getPaymentName = () => {
    switch (paymentType) {
      case 'createBroker': return 'RiskDefender - New Broker';
      case 'renewBroker': return 'RiskDefender - Broker Renewal';
      case 'tradingJournalRenew': return 'RiskDefender - Journal Renewal';
      case 'alertRenew': return 'RiskDefender - Alert Renewal';
      case 'penaltyPayment': return 'RiskDefender - Penalty Plan';
      default: return 'RiskDefender';
    }
  };

  const getPaymentData = () => {
    switch (paymentType) {
      case 'createBroker':
        return { marketTypeId: data.marketTypeId, brokerId: data.brokerId, subAccountName: data.subAccountName };
      case 'renewBroker':
        return { brokerAccountId: data.brokerAccountId };
     // case 'tradingJournalRenew':
      //  return { journalId: data.journalId };
      //case 'alertRenew':
       // return { alertId: data.alertId };
      case 'penaltyPayment':
        return { brokerAccountId: data.brokerAccountId };
      default:
        return {};
    }
  };

  const initiatePayment = useCallback(async () => {
    if (isInitiated.current) return;
    isInitiated.current = true;

    if (!validateData()) {
      setStatusMessage('Missing required data for payment');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orderResponse = await RazorpayService.createPayment({
        planId,
        couponCode,
        amount,
        currency,
        paymentType,
      });

      if (!orderResponse?.success || !orderResponse?.data) {
        throw new Error(orderResponse?.message || 'Invalid payment response from server');
      }
      if (!orderResponse.data.amount || !orderResponse.data.currency || !orderResponse.data.orderId || !orderResponse.data.keyId) {
        throw new Error('Required payment details missing in response');
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: getPaymentName(),
        description: getPaymentDescription(),
      //  notes: {
       //   paymentType,
         // description: getPaymentDescription(),
         // ...getPaymentData(),
     //   },
        handler: async (response: any) => {
          try {
            await RazorpayService.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: amount, // Use prop amount, already in paisa/cents
              planId,
              paymentType,
              currency,
              brokerAccountId: data.brokerAccountId,
             // journalId: data.journalId,
             // alertId: data.alertId,
             // penaltyId: data.penaltyId,
              couponCode,
              marketTypeId: data.marketTypeId,
              brokerId: data.brokerId,
              subAccountName: data.subAccountName,

            });
            setStatusMessage('Payment successful!');
            navigate(getSuccessRedirectPath());
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
      rzp.on('payment.failed', (response: any) => {
        setStatusMessage(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      let errorMessage = 'Payment initialization failed';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      setStatusMessage(`Payment initialization failed: ${errorMessage}`);
      console.error('Payment initialization error:', error);
    } finally {
      setLoading(false);
    }
  }, [planId, couponCode, amount, currency, paymentType, data, navigate]);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadRazorpay = () => {
      script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => initiatePayment();
      script.onerror = () => setStatusMessage('Failed to load payment gateway. Please refresh.');
      document.body.appendChild(script);
    };

    if (!window.Razorpay && !isInitiated.current) {
      loadRazorpay();
    } else if (window.Razorpay && !isInitiated.current) {
      initiatePayment();
    }

    return () => {
      if (script) document.body.removeChild(script);
    };
  }, [initiatePayment]);

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
  */