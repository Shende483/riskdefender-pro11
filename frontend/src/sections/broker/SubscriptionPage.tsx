import { useState, useEffect, useMemo, SetStateAction } from 'react';
import { Card, CardContent, CardHeader, Grid, Typography, Select, MenuItem, Checkbox, Box, TextField } from '@mui/material';
import io from 'socket.io-client';
import RazorpayPayment from './RazorpayPayment';

// Define the type for the subscription plans
interface Plan {
  name: string;
  subaccount: number;
  price: {
    value: number;
    currency: string;
    gst: number;
  };
  features: string[];
}

// Define the structure for plan data
const planData: Record<string, Plan> = {
  basic: {
    name: 'Basic Plan:',
    subaccount: 3,
    price: { value: 1990, currency: 'INR/Month', gst: 0.18 },
    features: ['Connect with up to 3 brokers', 'Full access to all trading and investing features'],
  },
  advance: {
    name: 'Advance Plan:',
    subaccount: 7,
    price: {
      value: 3990,
      currency: 'INR/Month',
      gst: 0.18,

    },
    features: ['Connect with up to 7 brokers', 'Full access to all trading and investing features',],
  },
  pro: {
    name: 'Pro Plan:',
    subaccount: 17,
    price: {
      value: 6990,
      currency: 'INR/Month',
      gst: 0.18,

    },
    features: ['Connect with up to 17 brokers', 'Full access to all trading and investing features',],
  },
};

// WebSocket connection
const socket = io('http://localhost:3001');

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [duration, setDuration] = useState<string>('1 Year');
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [netPayment, setNetPayment] = useState<number>(0);
  const [datasendnew, setDatasendnew] = useState<any>(null);
  const [pay, setPay] = useState<string | null>(null);

  // Map durations to months
  const durationInMonths = useMemo(
    () => ({
      '1 Month': 1,
      '3 Month': 3,
      '6 Month': 6,
      '1 Year': 12,
    }),
    []
  );

  const calculateTotalCost = (plan: Plan, selectedDuration: string, code: string) => {
    if (plan && selectedDuration) {
      const total = plan.price.value * durationInMonths[selectedDuration as keyof typeof durationInMonths];
      const gst = total * plan.price.gst;
      const totalWithGST = total + gst;

      setTotalCost(total);
      setTotalGst(gst);
      setTotalPayment(totalWithGST);

      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + durationInMonths[selectedDuration as keyof typeof durationInMonths]);
      setExpireDate(currentDate);

      if (code === 'radha123') {
        const discountFactor = 0.1;
        const discountAmount = totalWithGST * discountFactor;
        const netAmount = totalWithGST - discountAmount;

        setDiscountPrice(discountAmount);
        setNetPayment(netAmount);
      } else {
        setDiscountPrice(0);
        setNetPayment(totalWithGST);
      }
    }
  };

  const handlePlanClick = (plan: string) => {
    setSelectedPlan(plan);
    calculateTotalCost(planData[plan], duration, couponCode);
  };

  const handleDurationSelect = (selectedDuration: string) => {
    setDuration(selectedDuration);
    calculateTotalCost(planData[selectedPlan], selectedDuration, couponCode);
  };

  useEffect(() => {
    socket.on('p', (status: string) => {
      setPay(status);
    });

    if (selectedPlan && duration) {
      const newDatasend = {
        selectedPlan: planData[selectedPlan],
        selectedDuration: duration,
        expiryDate: expireDate,
        createdDate: new Date(),
        couponCode,
        subaccountAllowed: planData[selectedPlan].subaccount,
      };

      setDatasendnew(newDatasend);
    }
  }, [selectedPlan, duration, couponCode, expireDate]);

  const handleCouponCode = (code: string) => {
    setCouponCode(code);
    calculateTotalCost(planData[selectedPlan], duration, code);
  };

  return (
    <div>
      <Card sx={{ padding: 2, background: 'white' }}>
        <Typography variant="h5">Choose a Plan: {pay}</Typography>

        <Grid container spacing={2}>
          {Object.keys(planData).map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan}>
              <Card sx={{ cursor: 'pointer', backgroundColor: selectedPlan === plan ? 'lightblue' : 'lightgray' }} onClick={() => handlePlanClick(plan)}>
                <CardHeader title={planData[plan].name} subheader={selectedPlan === plan ? 'Selected' : ''} />
                <CardContent>
                  <Typography variant="h5">₹ {planData[plan].price.value} / {planData[plan].price.currency}</Typography>
                  <Typography variant="body2">{planData[plan].price.gst * 100}% GST applicable</Typography>
                  {planData[plan].features.map((feature, index) => (
                    <Typography key={index} variant="body2">
                      {feature}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, p: 2 }}>
          <Box display='flex' gap={2}>
            <Box>
              <Typography variant="h6">Enter Broker :</Typography>
              <TextField label="Broker Name" variant="outlined" />
            </Box>
            <Box>
              <Typography variant="h6">Select Duration:</Typography>
              <Select sx={{ minWidth: 200 }} value={duration} onChange={(e) => handleDurationSelect(e.target.value)}>
                {Object.keys(durationInMonths).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          <Typography variant="h6">Total Cost: ₹{totalCost}</Typography>
          <Typography variant="h6">GST: ₹{totalGst}</Typography>
          <Typography variant="h6">Total Payment: ₹{totalPayment}</Typography>

          <Typography variant="h6">Discount: - ₹{discountPrice}</Typography>
          <Typography variant="h6">Net Payment: ₹{netPayment}</Typography>

          <Typography variant="h6">Have a Coupon Code ?</Typography>
          <Box style={{ display: 'flex' }}>
            <TextField variant="outlined" label="Enter Coupon Code" onChange={(e) => handleCouponCode(e.target.value)} />
          </Box>

          <Box display='flex' alignItems='center'>
            <Checkbox checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
            <Typography variant="body2">I agree to the <a href="#">Terms and Conditions</a></Typography>
          </Box>

          <RazorpayPayment totalPayment={netPayment} datasend={datasendnew} disabled={!termsAccepted} />
        </Box>
      </Card>
    </div>
  );
};
