import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  TextField,
  Card,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Grid,
  Checkbox,
} from "@mui/material";
import RazorpayPayment from "./RazorpayPayment"; // Ensure this component is imported

interface SubscriptionDetails {
  planName: string;
  numberOfBroker: number;
  activeDateTime: string;
  expireDateTime: string;
  transactionId: string;
  transactionDate: string;
  status: string;
  duration: string;
}

export default function AccountManagement() {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails>({
    planName: "",
    numberOfBroker: 1,
    activeDateTime: "",
    expireDateTime: "",
    transactionId: "TXN123456", // Default transaction ID
    transactionDate: new Date().toISOString().split("T")[0], // Default transaction date (today's date)
    status: "active", // Default status
    duration: "",
  });

  const [responseMessage, setResponseMessage] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [netPayment, setNetPayment] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [datasendnew, setDatasendnew] = useState<any>(null);

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1] ||
      ""
    );
  };

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

    const pricePerBroker = 1990; // ₹1990 per broker per month
    const total = pricePerBroker * numberOfBrokers * durationInMonths[duration];
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
    currentDate.setMonth(currentDate.getMonth() + durationInMonths[duration]);
    setSubscriptionDetails((prevDetails) => ({
      ...prevDetails,
      expireDateTime: currentDate.toISOString().split("T")[0],
    }));
  };

  const handleCreateSubscriptionDetails = async () => {
    try {
      const token = getToken();
      const response = await axios.post(
        "http://localhost:3040/subscription-details/create",
        subscriptionDetails,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResponseMessage(response.data.message || "Subscription created successfully.");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create subscription.";
      setResponseMessage(errorMessage);
    }
  };

  return (
    <Card sx={{ py: 3, my: 3, width: "100%", maxWidth: 800, mx: "auto", boxShadow: 3, borderRadius: 3 }}>
      <Box marginX={3} marginBottom={3} display="flex" gap={2} flexDirection="column">
        <Typography variant="h5" textAlign="center" fontWeight={600}>
          Subcription Plan
        </Typography>
        <Typography variant="h6" textAlign="center" color="primary" gutterBottom>
          1 BROKER = ₹1990/month + gst
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Plan Name"
              name="planName"
              value={subscriptionDetails.planName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
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
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select name="duration" value={subscriptionDetails.duration} onChange={handleInputChange}>
                <MenuItem value="1 month">1 Month</MenuItem>
                <MenuItem value="3 months">3 Months</MenuItem>
                <MenuItem value="6 months">6 Months</MenuItem>
                <MenuItem value="1 year">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Active Date"
              name="activeDateTime"
              type="date"
              value={subscriptionDetails.activeDateTime}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Expire Date"
              name="expireDateTime"
              type="date"
              value={subscriptionDetails.expireDateTime}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Transaction ID"
              name="transactionId"
              value={subscriptionDetails.transactionId}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              disabled // Disable editing
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Transaction Date"
              name="transactionDate"
              type="date"
              value={subscriptionDetails.transactionDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled // Disable editing
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Status"
              name="status"
              value={subscriptionDetails.status}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              disabled // Disable editing
            />
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

        <Box display="flex" alignItems="center">
          <Checkbox checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
          <Typography variant="body2">
            I agree to the <a href="#">Terms and Conditions</a>
          </Typography>
        </Box>

        <Button onClick={handleCreateSubscriptionDetails} variant="contained" sx={{ mt: 2 }}>
          Create Subscription
        </Button>
        {responseMessage && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {responseMessage}
          </Typography>
        )}

<RazorpayPayment totalPayment={netPayment} datasend={datasendnew} />
      </Box>
    </Card>
  );
}