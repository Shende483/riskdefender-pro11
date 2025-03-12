import { Box, Button } from "@mui/material";
import { useCallback } from "react";

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const displayRazorpay = useCallback(async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay failed to load!!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3039', { method: 'POST' });
      const data: { order_id: string } = await response.json(); // Type response properly

      console.log(data);

      const options = {
        key: 'rzp_test_XZz2z23huAFxwS', // Enter the Key ID generated from the Dashboard
        amount: 50000, // Amount in currency subunits (INR)
        currency: 'INR',
        name: 'Acme Corp',
        description: 'Test Transaction',
        image: 'https://example.com/your_logo',
        order_id: data.order_id, // Pass the id obtained in the response
        callback_url: 'http://65.2.42.136:3001/verify',
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      if ((window as any).Razorpay) {
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } else {
        console.error('Razorpay is not available on the window object.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  }, []);

  return (
    <Box>
      <Button onClick={displayRazorpay}>Pay now</Button>
    </Box>
  );
};
