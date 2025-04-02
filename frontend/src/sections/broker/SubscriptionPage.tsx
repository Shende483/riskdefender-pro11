


import React, { useEffect, useMemo, useState } from "react";


import {
  Box,
  Card,
  Grid,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
} from "@mui/material";
import SubscriptionService from "../../Services/SubscriptionService";
import PlanService from "../../Services/PlanService";
import { PlanType } from "../../Types/SubscriptionTypes";
import PaymentGateway from "./PaymentGateway";


interface SubscriptionDetails {
  planName: string;
  numberOfBroker: number;
  expireDateTime: string;
 duration: string;
  status: string;
}

interface StatusMessage {
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
  field?: string;
}

export default function AccountManagement() {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails>({
    planName: "",
    numberOfBroker: 0,
    expireDateTime: "",
    duration: "1 month",
    status: "active",
  });

  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [netPayment, setNetPayment] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [plan, setPlan] = useState<PlanType[]>([]);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setSubscriptionDetails((prevDetails) => ({
      ...prevDetails,
      [name!]: value,
    }));

    // Recalculate total cost when number of brokers or duration changes
    if (name === "numberOfBroker" || name === "duration") {
      calculateTotalCost(value as string | number, name);
    }
  };

  const durationInMonths = useMemo(
    () => ({
      "1 month": 1,
      "3 months": 3,
      "6 months": 6,
      "1 year": 12,
    }),
    []
  );

  const calculateTotalCost = (value: string | number, fieldName: string) => {
    const numberOfBrokers = fieldName === "numberOfBroker" ? Number(value) : subscriptionDetails.numberOfBroker;
    const duration = fieldName === "duration" ? (value as string) : subscriptionDetails.duration;

    // Ensure duration is valid
    if (!duration || !durationInMonths[duration as keyof typeof durationInMonths]) {
      return; // Exit if duration is invalid
    }

    const pricePerBroker = plan[0].price; // ₹ per broker per month
    const total = 100*pricePerBroker * numberOfBrokers * durationInMonths[duration as keyof typeof durationInMonths];
    const gst = total * 0.18; // 18% GST
    const totalWithGST = total + gst;

    setTotalCost(total);
    setTotalGst(gst);
    setTotalPayment(totalWithGST);

    // Apply coupon code discount
    if (couponCode === "radha123") {
      const discountAmount = totalWithGST * 0.1; // 10% discount
      setDiscountPrice(discountAmount);
      setNetPayment(totalWithGST - discountAmount);
    } else {
      setDiscountPrice(0);
      setNetPayment(totalWithGST);
    }

    // Calculate expiry date
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + durationInMonths[duration as keyof typeof durationInMonths]);
    setSubscriptionDetails((prevDetails) => ({
      ...prevDetails,
      expireDateTime: currentDate.toISOString().split("T")[0],
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const planData = await PlanService.GetPlan();
        setPlan(planData.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subscribeDto = {
        planId: plan[0]._id,
        planName: subscriptionDetails.planName,
        numberOfBroker: subscriptionDetails.numberOfBroker,
        startDate: new Date(),
        endDate: subscriptionDetails.expireDateTime,
        status:subscriptionDetails.status
      };

      const response = await SubscriptionService.CreateSubscription(subscribeDto);

      if (response.statusCode === 201) {
        setSubscriptionId(response.subscriptionId);
        setResponseMessage({
          text: response.message,
          type: 'success'
        
        });
        setShowSnackbar(true);
      } else {
        setResponseMessage({
          text: response.message,
          type: 'error'
        });
        setShowSnackbar(true);
        return;
      }
    } catch (error: any) {
      setResponseMessage({
        text: error.message || 'Failed to create subscription.',
        type: 'error'
      });
      setShowSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };


  return (
    <Card sx={{ py: 3, my: 3, width: "100%", maxWidth: 800, mx: "auto", boxShadow: 3, borderRadius: 3 }}>
      <Box marginX={3} marginBottom={3} display="flex" gap={2} flexDirection="column">
        <Box bgcolor="lightblue" borderRadius={1} marginBottom={3}>
          <Typography variant="h4" marginBottom={2} marginTop={2} color="#00b0ff" textAlign="center" fontWeight={600}>
            Subscription Plan
          </Typography>
          <Typography variant="h3" marginBottom={3} textAlign="center" color="white" gutterBottom>
            1 BROKER = ₹1990/month + GST
          </Typography>
        </Box>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || 'info'}
            sx={{ width: '100%' }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Plan Name"
              name="planName"
              value={subscriptionDetails.planName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Number of Brokers"
              name="numberOfBroker"
              type="number"
              value={subscriptionDetails.numberOfBroker}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select name="duration" value={subscriptionDetails.duration} onChange={handleInputChange} required>
                <MenuItem value="1 month">1 Month</MenuItem>
                <MenuItem value="3 months">3 Months</MenuItem>
                <MenuItem value="6 months">6 Months</MenuItem>
                <MenuItem value="1 year">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Expiry Date"
              name="expireDateTime"
              value={subscriptionDetails.expireDateTime}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={subscriptionDetails.status} onChange={handleInputChange}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Total Cost: ₹{totalCost}</Typography>
          <Typography variant="h6">GST: ₹{totalGst}</Typography>
          <Typography variant="h6">Total Payment: ₹{totalPayment}</Typography>
          <Typography variant="h6">Discount: - ₹{discountPrice}</Typography>
          <Typography variant="h6">Net Payment: ₹{netPayment}</Typography>
        </Box>

        <Box sx={{ mt: 2 }} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Box width="100%" display="flex" alignItems="center">
            <Checkbox checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
            <Typography variant="body2">
              I agree to the <a href="#">Terms and Conditions</a>
            </Typography>
          </Box>


          {subscriptionId ? (
          <PaymentGateway
            subscriptionId={subscriptionId}
            amount={netPayment}
          />
        ) : (
          <Button 
            fullWidth 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!termsAccepted}
          >
            Create Subscription
          </Button>
        )}


        </Box>
       
      </Box>
    </Card>
  );
  
}


