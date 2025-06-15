import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  Checkbox,
  Snackbar,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import PaymentGateway from "../../../../../../payment-gateways/currency-gateway/razorpay-gateway";
import AlertService from "../../../../../../Services/api-services/dashboard-services/sections-services/alert-services/alert.service";
import AlertPlanService from "../../../../../../Services/api-services/plan-info-service/my-alerting-plan-service";
import { PlanType, CouponResponse } from "../../../../../../Services/api-services/plan-info-service/my-alerting-plan-service";

interface StatusMessage {
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface Alert {
  _id: string;
  alertLimit: number;
  createdAt: string;
  paymentStatus: string;
}

interface AlertResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Alert[];
}

export default function AlertPlanPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(true);
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [planId, setPlanId] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(0);
  const [netPayment, setNetPayment] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");

  const currencySymbols: { [key: string]: string } = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    SGD: "S$",
    CAD: "C$",
    AUD: "A$",
  };

  const getExpiryDate = (billingCycle: string): string => {
    const today = new Date();
    const months = billingCycle === "yearly" ? 12 : 1;
    const expiryDate = new Date(today.setMonth(today.getMonth() + months));
    return expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoadingAlerts(true);
      try {
        const response: AlertResponse = await AlertService.getAlertLimits();
        if (response.statusCode === 200 && response.success) {
          setAlerts(Array.isArray(response.data) ? response.data : []);
          if (response.data.length === 0) {
            setResponseMessage({ text: "No alert data found", type: "info" });
            setShowSnackbar(true);
          }
        } else {
          setResponseMessage({ text: response.message || "Failed to fetch alert data", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error fetching alert data:", error);
        setResponseMessage({ text: "Failed to fetch alert data", type: "error" });
        setShowSnackbar(true);
      } finally {
        setIsLoadingAlerts(false);
      }
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const planData = await AlertPlanService.getActivePlan();
        if (planData.statusCode === 200 && planData.success) {
          const mappedPlans: PlanType[] = planData.data.map((p) => ({
            ...p,
            _id: p._id,
            price: {
              INR: p.price?.INR ?? 0,
              USD: p.price?.USD ?? 0,
              EUR: p.price?.EUR ?? 0,
              GBP: p.price?.GBP ?? 0,
              AED: p.price?.AED ?? 0,
              SGD: p.price?.SGD ?? 0,
              CAD: p.price?.CAD ?? 0,
              AUD: p.price?.AUD ?? 0,
            },
            gstRate: p.gstRate ?? 18,
            discountPercent: p.discountPercent ?? 0,
            billingCycle: p.billingCycle ?? "monthly",
            alertLimit: p.alertLimit ?? 0,
            createdDate: p.createdDate ?? null,
            modifiedDate: p.modifiedDate ?? null,
            __v: p.__v ?? 0,
          }));
          setPlans(mappedPlans);
          setGstRate(mappedPlans[0]?.gstRate || 18);
        } else {
          setResponseMessage({ text: "Failed to load plans", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error loading plans:", error);
        setResponseMessage({ text: "Failed to load plans", type: "error" });
        setShowSnackbar(true);
      }
    };
    loadPlans();
  }, []);

  const handleCurrencyChange = (e: SelectChangeEvent<string>) => {
    setSelectedCurrency(e.target.value);
    const selectedPlan = plans.find((p) => p._id === planId);
    if (selectedPlan) {
      calculateTotalCost(selectedPlan);
    }
  };

  const calculateTotalCost = (selectedPlan: PlanType, couponDiscountOverride?: number) => {
    const months = selectedPlan.billingCycle === "yearly" ? 12 : 1;
    let total = selectedPlan.price[selectedCurrency as keyof typeof selectedPlan.price] * months;
    total = Number(total.toFixed(2));
    const discountPercentage = selectedPlan.discountPercent || 0;
    const discountAmount = total * (discountPercentage / 100);
    const totalAfterDiscount = total - Number(discountAmount.toFixed(2));
    const gst = totalAfterDiscount * (selectedPlan.gstRate / 100);
    const totalWithGST = totalAfterDiscount + Number(gst.toFixed(2));

    setTotalCost(total);
    setTotalGst(gst);
    setTotalPayment(totalWithGST);
    setDiscountPrice(discountAmount);

    const effectiveCouponDiscount = couponDiscountOverride !== undefined ? couponDiscountOverride : couponDiscount;
    const couponDiscountAmount = effectiveCouponDiscount > 0 ? Math.abs(totalWithGST * (effectiveCouponDiscount / 100)) : 0;
    const couponDiscountRounded = Number(couponDiscountAmount.toFixed(2));
    setNetPayment(totalWithGST - couponDiscountRounded);
  };

  const handleSelect = (selectedPlan: PlanType) => {
    setPlanId(selectedPlan._id);
    setGstRate(selectedPlan.gstRate);
    setCouponDiscount(0);
    setIsFormValid(false);
    calculateTotalCost(selectedPlan);
  };

  const handleAlertSelection = (alertId: string) => {
    setSelectedAlertId((prev) => (prev === alertId ? null : alertId));
  };

  const handleCouponVerify = async () => {
    if (!couponCode) {
      setResponseMessage({ text: "Please enter a coupon code", type: "error" });
      setShowSnackbar(true);
      return;
    }
    if (!planId) {
      setResponseMessage({ text: "Please select a plan first", type: "error" });
      setShowSnackbar(true);
      return;
    }
    try {
      const response: CouponResponse = await AlertPlanService.verifyCoupon(couponCode);
      const selectedPlan = plans.find((p) => p._id === planId);
      if (!selectedPlan) {
        setResponseMessage({ text: "Please select a plan first", type: "error" });
        setShowSnackbar(true);
        return;
      }
      if (response.statusCode === 200 && response.success) {
        setCouponDiscount(response.discountPercentage);
        setResponseMessage({ text: "Coupon applied successfully", type: "success" });
        calculateTotalCost(selectedPlan, response.discountPercentage);
      } else {
        setCouponDiscount(0);
        setResponseMessage({ text: response.message || "Invalid coupon code", type: "error" });
        calculateTotalCost(selectedPlan, 0);
      }
      setShowSnackbar(true);
    } catch (error) {
      setCouponDiscount(0);
      setResponseMessage({ text: "Failed to verify coupon", type: "error" });
      setShowSnackbar(true);
      const selectedPlan = plans.find((p) => p._id === planId);
      if (selectedPlan) {
        calculateTotalCost(selectedPlan, 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!selectedAlertId) {
      setResponseMessage({ text: "Please select an alert", type: "error" });
      setShowSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    if (!planId) {
      setResponseMessage({ text: "Please select a plan", type: "error" });
      setShowSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    if (!termsAccepted) {
      setResponseMessage({ text: "Please accept the terms and conditions", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const selectedPlan = plans.find((p) => p._id === planId);
      if (!selectedPlan) {
        setResponseMessage({ text: "Selected plan not found", type: "error" });
        setShowSnackbar(true);
        setIsSubmitting(false);
        return;
      }
      setIsFormValid(true);
    } catch (error) {
      setResponseMessage({ text: "An error occurred", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  return (
    <Card sx={{ py: 3, my: 3, width: "100%", mx: "auto", boxShadow: 3, borderRadius: 3 }}>
      <Box sx={{ mx: 3, mb: 3, display: "flex", gap: 3, flexDirection: "column" }}>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || "info"}
            sx={{ width: "100%" }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Payment Currency
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Pay with Currency</InputLabel>
                  <Select
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                  >
                    {Object.keys(currencySymbols).map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency} ({currencySymbols[currency]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pay with Crypto
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (Coming Soon: BTC, ETH, USDT, and more)
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Alerts (Total: {alerts.length})
            </Typography>
            {isLoadingAlerts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : alerts.length > 0 ? (
              <List
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  mt: 1,
                  p: 1,
                  bgcolor: "",
                  borderRadius: 1,
                }}
              >
                {alerts.map((alert) => (
                  <ListItem
                    key={alert._id}
                    dense
                    onClick={() => handleAlertSelection(alert._id)}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "" } }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedAlertId === alert._id}
                        disabled={!!selectedAlertId && selectedAlertId !== alert._id}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Alert ID: ${alert._id}`}
                      secondary={
                        <>
                          <strong>Limit:</strong> {alert.alertLimit} alerts |{" "}
                          <strong>Created:</strong>{" "}
                          {new Date(alert.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })} |{" "}
                          <strong>Status:</strong> {alert.paymentStatus}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No alert data available.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Select Alert Plan
            </Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
              {plans.map((plan) => {
                const months = plan.billingCycle === "yearly" ? 12 : 1;
                const actualPrice = plan.price[selectedCurrency as keyof typeof plan.price] * months;
                const discountPercentage = plan.discountPercent || 0;
                const offerPrice = actualPrice * (1 - discountPercentage / 100);

                return (
                  <Box
                    key={plan._id}
                    sx={{
                      bgcolor: planId === plan._id ? "lightsalmon" : "lightblue",
                      borderRadius: 1,
                      p: 2,
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.02)" },
                      position: "relative",
                    }}
                    onClick={() => handleSelect(plan)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "-17px",
                        left: "70%",
                        transform: "translateX(-50%)",
                        bgcolor: "green",
                        color: "white",
                        borderRadius: "12px",
                        px: 2,
                        py: 0.5,
                        boxShadow: 1,
                        zIndex: 1,
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        {discountPercentage}% OFF
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color={planId === plan._id ? "salmon" : "#00b0ff"}
                      textAlign="center"
                      fontWeight={600}
                      mb={1}
                    >
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {plan.description}
                    </Typography>
                    <Typography variant="body1" sx={{ textDecoration: "line-through" }} mb={1}>
                      Actual Price: {currencySymbols[selectedCurrency]}{actualPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      Offer Price: {currencySymbols[selectedCurrency]}{offerPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {selectedCurrency} + GST
                    </Typography>
                    <Typography variant="body2" color="text.primary" mb={1}>
                      • Additional Limit: {plan.alertLimit} alerts
                    </Typography>
                    {plan.features.map((feature, index) => (
                      <Typography key={index} variant="body2" color="text.primary">
                        • {feature}
                      </Typography>
                    ))}
                    <Typography variant="body1" color="red" mt={2}>
                      Valid Until: {getExpiryDate(plan.billingCycle)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Pricing Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={1}>
                  <TextField
                    label="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    variant="outlined"
                    fullWidth
                    placeholder="e.g., SAVE10"
                  />
                  <Button
                    variant="contained"
                    onClick={handleCouponVerify}
                    disabled={!planId}
                    sx={{ minWidth: 100 }}
                  >
                    Apply
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">Actual Cost: {currencySymbols[selectedCurrency]}{totalCost.toFixed(2)}</Typography>
              <Typography variant="body1">Plan Discount: - {currencySymbols[selectedCurrency]}{discountPrice.toFixed(2)}</Typography>
              <Typography variant="body1">GST ({gstRate}%): {currencySymbols[selectedCurrency]}{totalGst.toFixed(2)}</Typography>
              <Typography variant="body1">
                Coupon Discount: - {currencySymbols[selectedCurrency]}{(totalPayment * (couponDiscount / 100)).toFixed(2)}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                Net Payment: {currencySymbols[selectedCurrency]}{netPayment.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
              <Box display="flex" alignItems="center">
                <Checkbox checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
                <Typography variant="body2">
                  I agree to the <a href="#">Terms and Conditions</a>
                </Typography>
              </Box>

              {isFormValid ? (
                <PaymentGateway
                  planId={planId}
                  couponCode={couponCode}
                  amount={Math.round(netPayment * 100)}
                  currency={selectedCurrency}
                  paymentType="alertRenew"
                  data={{ alertId: selectedAlertId || "" }}
                />
              ) : (
                <Button
                  fullWidth
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || isFormValid}
                  sx={{ maxWidth: { sm: 300 }, display: "flex", alignItems: "center", gap: 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      Processing...
                    </>
                  ) : (
                    "Purchase Plan"
                  )}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Card>
  );
}