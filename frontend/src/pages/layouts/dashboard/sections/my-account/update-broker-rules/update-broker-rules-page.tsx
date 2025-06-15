

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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from "@mui/material";
import UpdateTradingRulesService from "../../../../../../Services/api-services/dashboard-services/sections-services/my-account-services/update-broker-rules-service";
import PenaltyPlanService from "../../../../../../Services/api-services/plan-info-service/penalty-plan-service";
import PaymentGateway from "../../../../../../payment-gateways/currency-gateway/razorpay-gateway";
import { TradingRules, rules, Rule } from "../../broker/common-files/common-rules-data/trading-rules-config";

interface SubBrokerAccount {
  _id: string;
  marketTypeId: string;
  brokerId: string;
  brokerName: React.ReactNode;
  brokerKey: string;
  subAccountName: string;
  startDate: string;
  endDate: string;
  proxyServiceId: string;
  status: string;
  pendingUpdate: boolean;
  updateStart: string | null;
  updateEnd: string | null;
}

interface StatusMessage {
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface PenaltyPayment {
  _id: string;
  name: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  discountPercent: number;
  description: string;
  gstRate: number;
  status: string;
}

const RuleCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  minHeight: 80,
  width: "100%",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UpdateTradingRulesPage() {
  const [accounts, setAccounts] = useState<SubBrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [selectedSubBroker, setSelectedSubBroker] = useState<SubBrokerAccount | null>(null);
  const [verifyRules, setVerifyRules] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [noRulesChange, setNoRulesChange] = useState<boolean>(false);
  const [tradingRules, setTradingRules] = useState<TradingRules>({ cash: [], future: [], option: [] });
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [penaltyPayment, setPenaltyPayment] = useState<PenaltyPayment | null>(null);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");

  const DEFAULT_MARKET_TYPE = 'stockmarket';

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

  const getFilteredRules = (marketType: string, tradingType: string) => {
    return rules.filter(
      (rule) => rule.marketType === marketType.toLowerCase() && rule.tradingType === tradingType
    );
  };

  const initializeRules = () => {
    return rules.map((rule) => ({
      key: rule.key,
      value: rule.defaultValue,
      error: undefined,
    }));
  };

  const parseTimeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const validateRule = (rule: Rule, value: any): string | undefined => {
    if (rule.type === "number") {
      if (value === "" || isNaN(value) || Number(value) < 0) {
        return "Must be a non-negative number";
      }
      if (rule.constraints.max && Number(value) > rule.constraints.max) {
        return `Must not exceed ${rule.constraints.max}`;
      }
    }
    if (rule.type === "time" && value !== "") {
      if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
        return "Must be in HH:mm:ss format";
      }
      if (rule.constraints.maxTime) {
        const valueSeconds = parseTimeToSeconds(value);
        const maxSeconds = parseTimeToSeconds(rule.constraints.maxTime);
        if (valueSeconds > maxSeconds) {
          return `Must not exceed ${rule.constraints.maxTime}`;
        }
      }
      if (rule.constraints.maxDurationHours) {
        const valueSeconds = parseTimeToSeconds(value);
        const maxSeconds = rule.constraints.maxDurationHours * 3600;
        if (valueSeconds > maxSeconds) {
          return `Must not exceed ${rule.constraints.maxDurationHours} hours`;
        }
      }
    }
    if (rule.type === "timerange" && value) {
      if (!value.start || !value.end || (value.start !== "" && !/^\d{2}:\d{2}$/.test(value.start)) || (value.end !== "" && !/^\d{2}:\d{2}$/.test(value.end))) {
        return "Must be valid HH:mm times";
      }
      if (rule.constraints.maxDurationHours && value.start !== "" && value.end !== "") {
        const [startHours, startMinutes] = value.start.split(":").map(Number);
        const [endHours, endMinutes] = value.end.split(":").map(Number);
        let durationHours = (endHours * 60 + endMinutes - (startHours * 60 + startMinutes)) / 60;
        if (durationHours < 0) durationHours += 24;
        if (durationHours > rule.constraints.maxDurationHours) {
          return `Time range must not exceed ${rule.constraints.maxDurationHours} hours`;
        }
      }
    }
    if (rule.type === "enum" && rule.options && value !== "" && !rule.options.includes(value)) {
      return "Invalid option selected";
    }
    return undefined;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          if (activeAccounts.length === 0) {
            setResponseMessage({ text: "No accounts found", type: "info" });
            setShowSnackbar(true);
          }
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          setResponseMessage({ text: activeResponse.message || "Failed to fetch accounts", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setResponseMessage({ text: "Failed to fetch accounts", type: "error" });
        setShowSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTradingRules({
      cash: initializeRules(),
      future: initializeRules(),
      option: initializeRules(),
    });
  }, []);

  const handleCurrencyChange = (e: SelectChangeEvent<string>) => {
    setSelectedCurrency(e.target.value);
  };

  const handleSubBrokerSelection = (account: SubBrokerAccount) => {
    if (selectedSubBroker?._id === account._id) {
      setSelectedSubBroker(null);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    } else {
      const now = new Date();
      const updateStart = account.updateStart ? new Date(account.updateStart) : null;
      const updateEnd = account.updateEnd ? new Date(account.updateEnd) : null;

      if (!account.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
        setResponseMessage({
          text: account.pendingUpdate
            ? `Trading rules for ${account.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
            : `No update request exists for ${account.subAccountName}. Request an update first.`,
          type: "warning",
        });
        setShowSnackbar(true);
        return;
      }

      setSelectedSubBroker(account);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    }
  };

  const handleRequestUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.requestUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request submitted successfully. Edit window opens in 5 days.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to request update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error requesting update:", error);
      setResponseMessage({ text: "Failed to request update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCancelUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.cancelUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request cancelled successfully.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
          if (selectedSubBroker?._id === accountId) {
            setSelectedSubBroker(null);
            setVerifyRules(false);
            setTermsAccepted(false);
            setNoRulesChange(false);
            setSelectedTab(0);
            setPenaltyPayment(null);
            setShowPaymentDashboard(false);
          }
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to cancel update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error cancelling update:", error);
      setResponseMessage({ text: "Failed to cancel update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleRuleChange = (subType: "cash" | "future" | "option", key: string, value: any) => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    setTradingRules((prev) => {
      const updatedRules = prev[subType].map((rule) => {
        if (rule.key !== key) return rule;
        const ruleDef = rules.find((r) => r.key === key);
        const error = ruleDef ? validateRule(ruleDef, value) : undefined;
        return { ...rule, value, error };
      });
      return { ...prev, [subType]: updatedRules };
    });
  };

  const handleResetRules = (subType: "cash" | "future" | "option") => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const filteredRules = getFilteredRules(marketType, subType);
    const initialRules = filteredRules.map((rule) => ({
      key: rule.key,
      value: rule.defaultValue,
      error: undefined,
    }));
    setTradingRules((prev) => ({
      ...prev,
      [subType]: initialRules,
    }));
    setResponseMessage({ text: `${subType.charAt(0).toUpperCase() + subType.slice(1)} rules reset`, type: "info" });
    setShowSnackbar(true);
  };

  const submitRulesAfterPayment = async (paymentData: { razorpayPaymentId: string; razorpayOrderId: string }) => {
    console.log('UpdateTradingRulesPage: submitRulesAfterPayment called with', paymentData);
    if (!selectedSubBroker) {
      console.error('UpdateTradingRulesPage: No broker selected');
      setResponseMessage({ text: "No broker account selected.", type: "error" });
      setShowSnackbar(true);
      setIsSubmitting(null);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const cashRules = getFilteredRules(marketType, "cash").map(r => r.key);
    const futureRules = getFilteredRules(marketType, "future").map(r => r.key);
    const optionRules = getFilteredRules(marketType, "option").map(r => r.key);

    const formattedRules = {
      cash: tradingRules.cash
        .filter(({ key }) => cashRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
      future: tradingRules.future
        .filter(({ key }) => futureRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
      option: tradingRules.option
        .filter(({ key }) => optionRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
    };

    console.log('UpdateTradingRulesPage: Validating formatted rules for marketType', marketType, formattedRules);

    for (const subType of ["cash", "future", "option"] as const) {
      for (const rule of formattedRules[subType]) {
        const ruleDef = rules.find((r) => r.key === rule.key && r.marketType === marketType);
        if (!ruleDef || rule.value === null) continue;
        const error = validateRule(ruleDef, rule.value);
        if (error) {
          console.error(`UpdateTradingRulesPage: Validation error for ${ruleDef.name} in ${subType}: ${error}`);
          setResponseMessage({ text: `Invalid value for ${ruleDef.name} in ${subType}: ${error}`, type: "error" });
          setShowSnackbar(true);
          setIsSubmitting(null);
          return;
        }
      }
    }

    setIsSubmitting(selectedSubBroker._id);
    console.log('UpdateTradingRulesPage: Submitting rules to backend', {
      _id: selectedSubBroker._id,
      noRulesChange,
      tradingRuleData: formattedRules,
    });

    try {
      const response = await UpdateTradingRulesService.setTradingRules({
        _id: selectedSubBroker._id,
        noRulesChange,
        tradingRuleData: formattedRules,
      });
      console.log('UpdateTradingRulesPage: Backend response', response);

      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Trading rules updated successfully", type: "success" });
        setShowSnackbar(true);
        setSelectedSubBroker(null);
        setTradingRules({
          cash: initializeRules(),
          future: initializeRules(),
          option: initializeRules(),
        });
        setVerifyRules(false);
        setTermsAccepted(false);
        setNoRulesChange(false);
        setSelectedTab(0);
        setPenaltyPayment(null);
        setShowPaymentDashboard(false);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        console.log('UpdateTradingRulesPage: Fetched updated accounts', activeResponse);
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          console.error('UpdateTradingRulesPage: Failed to fetch updated accounts', activeResponse.message);
          setResponseMessage({ text: activeResponse.message || "Failed to refresh accounts", type: "error" });
          setShowSnackbar(true);
        }
      } else {
        console.error('UpdateTradingRulesPage: Backend error', response.message);
        setResponseMessage({ text: response.message || "Failed to update trading rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error: any) {
      console.error('UpdateTradingRulesPage: Error updating trading rules', error);
      setResponseMessage({ text: error.message || "Failed to update trading rules", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
      console.log('UpdateTradingRulesPage: Submission complete, isSubmitting reset');
    }
  };

  const handleSubmitRules = async () => {
    if (!selectedSubBroker || isSubmitting) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }

    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    if (!verifyRules) {
      setResponseMessage({ text: "Please verify your entered rules", type: "error" });
      setShowSnackbar(true);
      return;
    }

    if (!termsAccepted) {
      setResponseMessage({ text: "Please accept the terms and conditions", type: "error" });
      setShowSnackbar(true);
      return;
    }

    setIsSubmitting(selectedSubBroker._id);

    try {
      const planResponse = await PenaltyPlanService.GetPlanByType("updatePenalty");
      if (planResponse.statusCode === 200 && planResponse.success && planResponse.data?.length > 0) {
        setPenaltyPayment(planResponse.data[0]);
        setShowPaymentDashboard(true);
      } else {
        setResponseMessage({ text: planResponse.message || "No penalty plan found for updating rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error fetching penalty payment:", error);
      setResponseMessage({ text: "Failed to fetch penalty payment", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleClosePaymentDialog = () => {
    setShowPaymentDashboard(false);
    setPenaltyPayment(null);
    setIsSubmitting(null);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderRuleInput = (rule: Rule, subType: "cash" | "future" | "option") => {
    const ruleValue = tradingRules[subType].find((r) => r.key === rule.key);
    const value = ruleValue?.value;
    const error = ruleValue?.error;
    const errorId = error ? `error-${subType}-${rule.key}` : undefined;
    const isEditable = selectedSubBroker && selectedSubBroker.pendingUpdate &&
      selectedSubBroker.updateStart && selectedSubBroker.updateEnd &&
      new Date() >= new Date(selectedSubBroker.updateStart) &&
      new Date() <= new Date(selectedSubBroker.updateEnd);

    const getTooltipDescription = () => {
      let description = rule.description;
      if (rule.type === "number" && rule.constraints.max) {
        description += ` (Max: ${rule.constraints.max})`;
      } else if (rule.type === "time" && (rule.constraints.maxTime || rule.constraints.maxDurationHours)) {
        description += ` (Max: ${rule.constraints.maxTime || `${rule.constraints.maxDurationHours} hours`})`;
      } else if (rule.type === "timerange" && rule.constraints.maxDurationHours) {
        description += ` (Max duration: ${rule.constraints.maxDurationHours} hours)`;
      }
      return description;
    };

    const input = (() => {
      switch (rule.type) {
        case "boolean":
          return (
            <Box sx={{ minHeight: 40 }}>
              <Checkbox
                checked={value || false}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.checked)}
                disabled={!isEditable}
                color="primary"
                data-testid={`rule-${subType}-${rule.key}`}
              />
            </Box>
          );
        case "number":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="number"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value === "" ? "" : Number(e.target.value))}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                InputProps={{ inputProps: { min: 0, max: rule.constraints.max } }}
                sx={{ width: 100 }}
                error={!!error}
                helperText={error || (rule.constraints.max && `Max: ${rule.constraints.max}`)}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "time":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="text"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm:ss"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error || (rule.constraints.maxTime && `Max: ${rule.constraints.maxTime}`) || (rule.constraints.maxDurationHours && `Max: ${rule.constraints.maxDurationHours} hours`)}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "timerange":
          const startErrorId = error ? `error-${subType}-${rule.key}-start` : undefined;
          const endErrorId = error ? `error-${subType}-${rule.key}-end` : undefined;
          const timerangeValue = value || { start: "", end: "" };
          return (
            <Box sx={{ display: "flex", gap: 0.5, minHeight: 38 }}>
              <TextField
                type="text"
                value={timerangeValue.start}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, start: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "Start" || (rule.constraints.maxDurationHours && `Max: ${rule.constraints.maxDurationHours} hours`)}
                inputProps={{ "aria-describedby": startErrorId }}
                data-testid={`rule-${subType}-${rule.key}-start`}
              />
              <TextField
                type="text"
                value={timerangeValue.end}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, end: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "End"}
                inputProps={{ "aria-describedby": endErrorId }}
                data-testid={`rule-${subType}-${rule.key}-end`}
              />
              {error && (
                <>
                  <Typography id={startErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (Start)
                  </Typography>
                  <Typography id={endErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (End)
                  </Typography>
                </>
              )}
            </Box>
          );
        case "enum":
          return (
            <Box sx={{ minHeight: 38 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditable} error={!!error}>
                <InputLabel>{rule.name}</InputLabel>
                <Select
                  value={value ?? ""}
                  onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                  label={rule.name}
                >
                  <MenuItem value="">None</MenuItem>
                  {rule.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error && <Typography id={errorId} variant="caption" color="error">{error}</Typography>}
              </FormControl>
            </Box>
          );
        default:
          return null;
      }
    })();

    return (
      <Box>
        <Tooltip title={getTooltipDescription()}>
          <Box>{input}</Box>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Card sx={{ py: 4, my: 4, width: "100%", maxWidth: 1200, mx: "auto", boxShadow: 4, borderRadius: 4 }}>
      <Box sx={{ mx: 4, mb: 4, display: "flex", gap: 4, flexDirection: "column" }}>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 10 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || "info"}
            sx={{ width: "100%", fontSize: "1.1rem", py: 2 }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Broker Accounts (Total: {accounts.length})
              {selectedSubBroker && ` [ Selected: ${selectedSubBroker.subAccountName} ]`}
            </Typography>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : accounts.length > 0 ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                {accounts.map((account) => (
                  <ListItem
                    key={account._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: account.pendingUpdate ? "#ccffcc" : "inherit",
                      border: account.pendingUpdate ? "1px solid #2e7d32" : "none",
                      borderRadius: 2,
                      mb: 2,
                      py: 2,
                      px: 3,
                      cursor: "pointer",
                      "&:hover": { bgcolor: account.pendingUpdate ? "#ccffcc" : "#f5f5f5" },
                    }}
                    onClick={() => handleSubBrokerSelection(account)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedSubBroker?._id === account._id}
                          disabled={!!(selectedSubBroker && selectedSubBroker._id !== account._id)}
                          color="primary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6">{account.subAccountName}</Typography>}
                        secondary={
                          <Typography variant="body1">
                            <strong>Broker:</strong> {account.brokerName} |{" "}
                            <strong>Market:</strong> {account.marketTypeId} |{" "}
                            <strong>Start:</strong>{" "}
                            {new Date(account.startDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>End:</strong>{" "}
                            {new Date(account.endDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>Status:</strong> {account.status}
                            {account.pendingUpdate && account.updateStart && account.updateEnd && (
                              <>
                                {" | "}
                                <strong>Update Window:</strong>{" "}
                                {new Date(account.updateStart).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })} to{" "}
                                {new Date(account.updateEnd).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </>
                            )}
                          </Typography>
                        }
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && !account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Request Update"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || !account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Update"
                        )}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No accounts available.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Edit Trading Rules {selectedSubBroker ? `for ${selectedSubBroker.subAccountName}` : ""}
            </Typography>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="Trading rules tabs"
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <StyledTab label="Cash" />
              <StyledTab label="Futures" />
              <StyledTab label="Options" />
            </Tabs>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleResetRules(["cash", "future", "option"][selectedTab] as "cash" | "future" | "option")}
                disabled={
                  !selectedSubBroker || !selectedSubBroker.pendingUpdate ||
                  !selectedSubBroker.updateStart ||
                  !selectedSubBroker.updateEnd ||
                  new Date() < new Date(selectedSubBroker.updateStart) ||
                  new Date() > new Date(selectedSubBroker.updateEnd)
                }
              >
                Reset {["Cash", "Futures", "Options"][selectedTab]} Rules
              </Button>
            </Box>
            <TabPanel value={selectedTab} index={0}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Cash Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "cash").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {rule.name}
                          </Typography>
                          {renderRuleInput(rule, "cash")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Futures Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "future").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {rule.name}
                          </Typography>
                          {renderRuleInput(rule, "future")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Options Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "option").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {rule.name}
                          </Typography>
                          {renderRuleInput(rule, "option")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} mb={2}>
                Edit Terms
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={verifyRules}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setVerifyRules(!verifyRules);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I verified my entered rules properly
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Checkbox
                      checked={noRulesChange}
                      onChange={() => {
                        if (!selectedSubBroker) {
                          setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                          setShowSnackbar(true);
                          return;
                        }
                        setNoRulesChange(!noRulesChange);
                      }}
                      color="primary"
                    />
                    <Typography variant="body2" color="text.secondary">
                      I don’t want to change rules ever
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Checkbox
                      checked={termsAccepted}
                      onChange={() => {
                        if (!selectedSubBroker) {
                          setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                          setShowSnackbar(true);
                          return;
                        }
                        setTermsAccepted(!termsAccepted);
                      }}
                      color="primary"
                    />
                    <Typography variant="body2" color="text.secondary">
                      I agree to the <a href="#" style={{ color: "#1976d2" }}>Terms and Conditions</a>
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitRules}
                disabled={!!isSubmitting || !selectedSubBroker || !verifyRules || !termsAccepted}
                sx={{ mt: 2, fontSize: "1rem", py: 1, px: 3 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" />
                    Fetching Payment...
                  </>
                ) : (
                  "Update Trading Rules"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={showPaymentDashboard}
          onClose={handleClosePaymentDialog}
          maxWidth="xs"
          sx={{ "& .MuiDialog-paper": { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
            Penalty Payment
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {penaltyPayment ? (
              <>
                <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
                  <InputLabel>Select Currency</InputLabel>
                  <Select
                    value={selectedCurrency}
                    label="Currency"
                    onChange={handleCurrencyChange}
                  >
                    {Object.keys(currencySymbols).map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency} ({currencySymbols[currency]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      {penaltyPayment.name}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Price:</strong> {currencySymbols[selectedCurrency]}
                      {penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price].toFixed(2)}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>GST:</strong> {penaltyPayment.gstRate}%
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Total:</strong> {currencySymbols[selectedCurrency]}
                      {(
                        penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100)
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {penaltyPayment.description}
                    </Typography>
                  </CardContent>
                </Card>
                {penaltyPayment && selectedSubBroker && (
                  <PaymentGateway
                    planId={penaltyPayment._id}
                    couponCode=""
                    amount={Math.round(
                      penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100) *
                        100
                    )}
                    currency={selectedCurrency}
                    paymentType="penaltyPayment"
                    data={{ brokerAccountId: selectedSubBroker._id }}
                    onSuccess={submitRulesAfterPayment}
                  />
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Loading payment details...
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClosePaymentDialog}
              sx={{ fontSize: "1rem", py: 1, px: 2 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Card>
  );
}













/*
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from "@mui/material";
import UpdateTradingRulesService from "../../../../../../Services/api-services/dashboard-services/sections-services/my-account-services/update-broker-rules-service";
import PenaltyPlanService from "../../../../../../Services/api-services/plan-info-service/penalty-plan-service";
import PaymentGateway from "../../../../../../payment-gateways/currency-gateway/razorpay-gateway";
import { TradingRules, rules, Rule } from "../../broker/common-files/common-rules-data/trading-rules-config";

interface SubBrokerAccount {
  _id: string;
  marketTypeId: string;
  brokerId: string;
  brokerName: React.ReactNode;
  brokerKey: string;
  subAccountName: string;
  startDate: string;
  endDate: string;
  proxyServiceId: string;
  status: string;
  pendingUpdate: boolean;
  updateStart: string | null;
  updateEnd: string | null;
}

interface StatusMessage {
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface PenaltyPayment {
  _id: string;
  name: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  discountPercent: number;
  description: string;
  gstRate: number;
  status: string;
}

const RuleCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  minHeight: 80,
  width: "100%",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UpdateTradingRulesPage() {
  const [accounts, setAccounts] = useState<SubBrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [selectedSubBroker, setSelectedSubBroker] = useState<SubBrokerAccount | null>(null);
  const [verifyRules, setVerifyRules] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [noRulesChange, setNoRulesChange] = useState<boolean>(false);
  const [tradingRules, setTradingRules] = useState<TradingRules>({ cash: [], future: [], option: [] });
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [penaltyPayment, setPenaltyPayment] = useState<PenaltyPayment | null>(null);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");

  const DEFAULT_MARKET_TYPE = 'stockmarket';

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

  const getFilteredRules = (marketType: string, tradingType: string) => {
    return rules.filter(
      (rule) => rule.marketType === marketType.toLowerCase() && rule.tradingType === tradingType
    );
  };

  const initializeRules = () => {
    return rules.map((rule) => ({
      key: rule.key,
      value: rule.type === "boolean" ? false :
             rule.type === "number" ? "" :
             rule.type === "time" ? "" :
             rule.type === "timerange" ? { start: "", end: "" } :
             rule.type === "enum" ? "" : "",
      error: undefined,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          if (activeAccounts.length === 0) {
            setResponseMessage({ text: "No accounts found", type: "info" });
            setShowSnackbar(true);
          }
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          setResponseMessage({ text: activeResponse.message || "Failed to fetch accounts", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setResponseMessage({ text: "Failed to fetch accounts", type: "error" });
        setShowSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTradingRules({
      cash: initializeRules(),
      future: initializeRules(),
      option: initializeRules(),
    });
  }, []);

  const handleCurrencyChange = (e: SelectChangeEvent<string>) => {
    setSelectedCurrency(e.target.value);
  };

  const handleSubBrokerSelection = (account: SubBrokerAccount) => {
    if (selectedSubBroker?._id === account._id) {
      setSelectedSubBroker(null);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    } else {
      const now = new Date();
      const updateStart = account.updateStart ? new Date(account.updateStart) : null;
      const updateEnd = account.updateEnd ? new Date(account.updateEnd) : null;

      if (!account.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
        setResponseMessage({
          text: account.pendingUpdate
            ? `Trading rules for ${account.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
            : `No update request exists for ${account.subAccountName}. Request an update first.`,
          type: "warning",
        });
        setShowSnackbar(true);
        return;
      }

      setSelectedSubBroker(account);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    }
  };

  const handleRequestUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.requestUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request submitted successfully. Edit window opens in 5 days.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to request update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error requesting update:", error);
      setResponseMessage({ text: "Failed to request update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCancelUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.cancelUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request cancelled successfully.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
          if (selectedSubBroker?._id === accountId) {
            setSelectedSubBroker(null);
            setVerifyRules(false);
            setTermsAccepted(false);
            setNoRulesChange(false);
            setSelectedTab(0);
            setPenaltyPayment(null);
            setShowPaymentDashboard(false);
          }
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to cancel update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error cancelling update:", error);
      setResponseMessage({ text: "Failed to cancel update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const validateRule = (rule: Rule, value: any): string | undefined => {
    if (rule.type === "number" && (value === "" || isNaN(value) || Number(value) < 0)) {
      return "Must be a non-negative number";
    }
    if (rule.type === "time" && value !== "" && !/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return "Must be in HH:mm:ss format";
    }
    if (rule.type === "timerange") {
      if (!value || !value.start || !value.end || (value.start !== "" && !/^\d{2}:\d{2}$/.test(value.start)) || (value.end !== "" && !/^\d{2}:\d{2}$/.test(value.end))) {
        return "Must be valid HH:mm times";
      }
    }
    if (rule.type === "enum" && rule.options && value !== "" && !rule.options.includes(value)) {
      return "Invalid option selected";
    }
    return undefined;
  };

  const handleRuleChange = (subType: "cash" | "future" | "option", key: string, value: any) => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    setTradingRules((prev) => {
      const updatedRules = prev[subType].map((rule) => {
        if (rule.key !== key) return rule;
        const ruleDef = rules.find((r) => r.key === key);
        const error = ruleDef ? validateRule(ruleDef, value) : undefined;
        return { ...rule, value, error };
      });
      return { ...prev, [subType]: updatedRules };
    });
  };

  const handleResetRules = (subType: "cash" | "future" | "option") => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const filteredRules = getFilteredRules(marketType, subType);
    const initialRules = filteredRules.map((rule) => ({
      key: rule.key,
      value: rule.type === "boolean" ? false :
             rule.type === "number" ? "" :
             rule.type === "time" ? "" :
             rule.type === "timerange" ? { start: "", end: "" } :
             rule.type === "enum" ? "" : "",
      error: undefined,
    }));
    setTradingRules((prev) => ({
      ...prev,
      [subType]: initialRules,
    }));
    setResponseMessage({ text: `${subType.charAt(0).toUpperCase() + subType.slice(1)} rules reset`, type: "info" });
    setShowSnackbar(true);
  };

  const submitRulesAfterPayment = async (paymentData: { razorpayPaymentId: string; razorpayOrderId: string }) => {
    console.log('UpdateTradingRulesPage: submitRulesAfterPayment called with', paymentData);
    if (!selectedSubBroker) {
      console.error('UpdateTradingRulesPage: No broker selected');
      setResponseMessage({ text: "No broker account selected.", type: "error" });
      setShowSnackbar(true);
      setIsSubmitting(null);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const cashRules = getFilteredRules(marketType, "cash").map(r => r.key);
    const futureRules = getFilteredRules(marketType, "future").map(r => r.key);
    const optionRules = getFilteredRules(marketType, "option").map(r => r.key);

    const formattedRules = {
      cash: tradingRules.cash
        .filter(({ key }) => cashRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
      future: tradingRules.future
        .filter(({ key }) => futureRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
      option: tradingRules.option
        .filter(({ key }) => optionRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
    };

    console.log('UpdateTradingRulesPage: Validating formatted rules for marketType', marketType, formattedRules);

    for (const subType of ["cash", "future", "option"] as const) {
      for (const rule of formattedRules[subType]) {
        const ruleDef = rules.find((r) => r.key === rule.key && r.marketType === marketType);
        if (!ruleDef || rule.value === null) continue;
        const error = validateRule(ruleDef, rule.value);
        if (error) {
          console.error(`UpdateTradingRulesPage: Validation error for ${ruleDef.name} in ${subType}: ${error}`);
          setResponseMessage({ text: `Invalid value for ${ruleDef.name} in ${subType}: ${error}`, type: "error" });
          setShowSnackbar(true);
          setIsSubmitting(null);
          return;
        }
      }
    }

    setIsSubmitting(selectedSubBroker._id);
    console.log('UpdateTradingRulesPage: Submitting rules to backend', {
      _id: selectedSubBroker._id,
      noRulesChange,
      tradingRuleData: formattedRules,
    });

    try {
      const response = await UpdateTradingRulesService.setTradingRules({
        _id: selectedSubBroker._id,
        noRulesChange,
        tradingRuleData: formattedRules,
      });
      console.log('UpdateTradingRulesPage: Backend response', response);

      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Trading rules updated successfully", type: "success" });
        setShowSnackbar(true);
        setSelectedSubBroker(null);
        setTradingRules({
          cash: initializeRules(),
          future: initializeRules(),
          option: initializeRules(),
        });
        setVerifyRules(false);
        setTermsAccepted(false);
        setNoRulesChange(false);
        setSelectedTab(0);
        setPenaltyPayment(null);
        setShowPaymentDashboard(false);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        console.log('UpdateTradingRulesPage: Fetched updated accounts', activeResponse);
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          console.error('UpdateTradingRulesPage: Failed to fetch updated accounts', activeResponse.message);
          setResponseMessage({ text: activeResponse.message || "Failed to refresh accounts", type: "error" });
          setShowSnackbar(true);
        }
      } else {
        console.error('UpdateTradingRulesPage: Backend error', response.message);
        setResponseMessage({ text: response.message || "Failed to update trading rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error: any) {
      console.error('UpdateTradingRulesPage: Error updating trading rules', error);
      setResponseMessage({ text: error.message || "Failed to update trading rules", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
      console.log('UpdateTradingRulesPage: Submission complete, isSubmitting reset');
    }
  };

  const handleSubmitRules = async () => {
    if (!selectedSubBroker || isSubmitting) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }

    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    if (!verifyRules) {
      setResponseMessage({ text: "Please verify your entered rules", type: "error" });
      setShowSnackbar(true);
      return;
    }

    if (!termsAccepted) {
      setResponseMessage({ text: "Please accept the terms and conditions", type: "error" });
      setShowSnackbar(true);
      return;
    }

    setIsSubmitting(selectedSubBroker._id);

    try {
      const planResponse = await PenaltyPlanService.GetPlanByType("updatePenalty");
      if (planResponse.statusCode === 200 && planResponse.success && planResponse.data?.length > 0) {
        setPenaltyPayment(planResponse.data[0]);
        setShowPaymentDashboard(true);
      } else {
        setResponseMessage({ text: planResponse.message || "No penalty plan found for updating rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error fetching penalty payment:", error);
      setResponseMessage({ text: "Failed to fetch penalty payment", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleClosePaymentDialog = () => {
    setShowPaymentDashboard(false);
    setPenaltyPayment(null);
    setIsSubmitting(null);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderRuleInput = (rule: Rule, subType: "cash" | "future" | "option") => {
    const ruleValue = tradingRules[subType].find((r) => r.key === rule.key);
    const value = ruleValue?.value;
    const error = ruleValue?.error;
    const errorId = error ? `error-${subType}-${rule.key}` : undefined;
    const isEditable = selectedSubBroker && selectedSubBroker.pendingUpdate &&
      selectedSubBroker.updateStart && selectedSubBroker.updateEnd &&
      new Date() >= new Date(selectedSubBroker.updateStart) &&
      new Date() <= new Date(selectedSubBroker.updateEnd);

    const input = (() => {
      switch (rule.type) {
        case "boolean":
          return (
            <Box sx={{ minHeight: 40 }}>
              <Checkbox
                checked={value || false}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.checked)}
                disabled={!isEditable}
                color="primary"
                data-testid={`rule-${subType}-${rule.key}`}
              />
            </Box>
          );
        case "number":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="number"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value === "" ? "" : Number(e.target.value))}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ width: 100 }}
                error={!!error}
                helperText={error}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "time":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="text"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm:ss"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "timerange":
          const startErrorId = error ? `error-${subType}-${rule.key}-start` : undefined;
          const endErrorId = error ? `error-${subType}-${rule.key}-end` : undefined;
          const timerangeValue = value || { start: "", end: "" };
          return (
            <Box sx={{ display: "flex", gap: 0.5, minHeight: 38 }}>
              <TextField
                type="text"
                value={timerangeValue.start}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, start: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "Start"}
                inputProps={{ "aria-describedby": startErrorId }}
                data-testid={`rule-${subType}-${rule.key}-start`}
              />
              <TextField
                type="text"
                value={timerangeValue.end}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, end: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "End"}
                inputProps={{ "aria-describedby": endErrorId }}
                data-testid={`rule-${subType}-${rule.key}-end`}
              />
              {error && (
                <>
                  <Typography id={startErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (Start)
                  </Typography>
                  <Typography id={endErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (End)
                  </Typography>
                </>
              )}
            </Box>
          );
        case "enum":
          return (
            <Box sx={{ minHeight: 38 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditable} error={!!error}>
                <InputLabel>{rule.name}</InputLabel>
                <Select
                  value={value ?? ""}
                  onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                  label={rule.name}
                >
                  <MenuItem value="">None</MenuItem>
                  {rule.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error && <Typography id={errorId} variant="caption" color="error">{error}</Typography>}
              </FormControl>
            </Box>
          );
        default:
          return null;
      }
    })();

    return <Box>{input}</Box>;
  };

  return (
    <Card sx={{ py: 4, my: 4, width: "100%", maxWidth: 1200, mx: "auto", boxShadow: 4, borderRadius: 4 }}>
      <Box sx={{ mx: 4, mb: 4, display: "flex", gap: 4, flexDirection: "column" }}>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 10 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || "info"}
            sx={{ width: "100%", fontSize: "1.1rem", py: 2 }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Broker Accounts (Total: {accounts.length})
              {selectedSubBroker && ` [ Selected: ${selectedSubBroker.subAccountName} ]`}
            </Typography>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : accounts.length > 0 ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                {accounts.map((account) => (
                  <ListItem
                    key={account._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: account.pendingUpdate ? "#ccffcc" : "inherit",
                      border: account.pendingUpdate ? "1px solid #2e7d32" : "none",
                      borderRadius: 2,
                      mb: 2,
                      py: 2,
                      px: 3,
                      cursor: "pointer",
                      "&:hover": { bgcolor: account.pendingUpdate ? "#ccffcc" : "#f5f5f5" },
                    }}
                    onClick={() => handleSubBrokerSelection(account)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedSubBroker?._id === account._id}
                          disabled={!!(selectedSubBroker && selectedSubBroker._id !== account._id)}
                          color="primary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6">{account.subAccountName}</Typography>}
                        secondary={
                          <Typography variant="body1">
                            <strong>Broker:</strong> {account.brokerName} |{" "}
                            <strong>Market:</strong> {account.marketTypeId} |{" "}
                            <strong>Start:</strong>{" "}
                            {new Date(account.startDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>End:</strong>{" "}
                            {new Date(account.endDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>Status:</strong> {account.status}
                            {account.pendingUpdate && account.updateStart && account.updateEnd && (
                              <>
                                {" | "}
                                <strong>Update Window:</strong>{" "}
                                {new Date(account.updateStart).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })} to{" "}
                                {new Date(account.updateEnd).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </>
                            )}
                          </Typography>
                        }
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && !account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Request Update"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || !account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Update"
                        )}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No accounts available.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Edit Trading Rules {selectedSubBroker ? `for ${selectedSubBroker.subAccountName}` : ""}
            </Typography>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="Trading rules tabs"
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <StyledTab label="Cash" />
              <StyledTab label="Futures" />
              <StyledTab label="Options" />
            </Tabs>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleResetRules(["cash", "future", "option"][selectedTab] as "cash" | "future" | "option")}
                disabled={
                  !selectedSubBroker || !selectedSubBroker.pendingUpdate ||
                  !selectedSubBroker.updateStart ||
                  !selectedSubBroker.updateEnd ||
                  new Date() < new Date(selectedSubBroker.updateStart) ||
                  new Date() > new Date(selectedSubBroker.updateEnd)
                }
              >
                Reset {["Cash", "Futures", "Options"][selectedTab]} Rules
              </Button>
            </Box>
            <TabPanel value={selectedTab} index={0}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Cash Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "cash").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "cash")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Futures Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "future").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "future")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Options Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "option").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "option")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} mb={2}>
                Edit Terms
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={verifyRules}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setVerifyRules(!verifyRules);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I verified my entered rules properly
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={noRulesChange}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setNoRulesChange(!noRulesChange);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I don’t want to change rules ever
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={termsAccepted}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setTermsAccepted(!termsAccepted);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I agree to the <a href="#" style={{ color: "#1976d2" }}>Terms and Conditions</a>
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitRules}
                disabled={!!isSubmitting || !selectedSubBroker || !verifyRules || !termsAccepted}
                sx={{ mt: 2, fontSize: "1rem", py: 1, px: 3 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" />
                    Fetching Payment...
                  </>
                ) : (
                  "Update Trading Rules"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={showPaymentDashboard}
          onClose={handleClosePaymentDialog}
          maxWidth="xs"
          sx={{ "& .MuiDialog-paper": { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
            Penalty Payment
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {penaltyPayment ? (
              <>
                <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
                  <InputLabel>Select Currency</InputLabel>
                  <Select
                    value={selectedCurrency}
                    label="Currency"
                    onChange={handleCurrencyChange}
                  >
                    {Object.keys(currencySymbols).map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency} ({currencySymbols[currency]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      {penaltyPayment.name}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Price:</strong> {currencySymbols[selectedCurrency]}
                      {penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price].toFixed(2)}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>GST:</strong> {penaltyPayment.gstRate}%
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Total:</strong> {currencySymbols[selectedCurrency]}
                      {(
                        penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100)
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {penaltyPayment.description}
                    </Typography>
                  </CardContent>
                </Card>
                {penaltyPayment && selectedSubBroker && (
                  <PaymentGateway
                    planId={penaltyPayment._id}
                    couponCode=""
                    amount={Math.round(
                      penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100) *
                        100
                    )}
                    currency={selectedCurrency}
                    paymentType="penaltyPayment"
                    data={{ brokerAccountId: selectedSubBroker._id }}
                    onSuccess={submitRulesAfterPayment}
                  />
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Loading payment details...
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClosePaymentDialog}
              sx={{ fontSize: "1rem", py: 1, px: 2 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Card>
  );
}


*/

















/*
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from "@mui/material";
import UpdateTradingRulesService from "../../../../../../Services/api-services/dashboard-services/sections-services/my-account-services/update-broker-rules-service";
import PenaltyPlanService from "../../../../../../Services/api-services/plan-info-service/penalty-plan-service";
import PaymentGateway from "../../../../../../payment-gateways/currency-gateway/razorpay-gateway";
import { TradingRules, rules, Rule } from "../../broker/common-files/common-rules-data/trading-rules-config";

interface SubBrokerAccount {
  _id: string;
  marketTypeId: string;
  brokerId: string;
  brokerName: React.ReactNode;
  brokerKey: string;
  subAccountName: string;
  startDate: string;
  endDate: string;
  proxyServiceId: string;
  status: string;
  pendingUpdate: boolean;
  updateStart: string | null;
  updateEnd: string | null;
}

interface StatusMessage {
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface PenaltyPayment {
  _id: string;
  name: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  discountPercent: number;
  description: string;
  gstRate: number;
  status: string;
}

const RuleCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  minHeight: 80,
  width: "100%",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UpdateTradingRulesPage() {
  const [accounts, setAccounts] = useState<SubBrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [selectedSubBroker, setSelectedSubBroker] = useState<SubBrokerAccount | null>(null);
  const [verifyRules, setVerifyRules] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [noRulesChange, setNoRulesChange] = useState<boolean>(false);
  const [tradingRules, setTradingRules] = useState<TradingRules>({ cash: [], future: [], option: [] });
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [penaltyPayment, setPenaltyPayment] = useState<PenaltyPayment | null>(null);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");

  const DEFAULT_MARKET_TYPE = 'stockmarket';

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

  const getFilteredRules = (marketType: string, tradingType: string) => {
    return rules.filter(
      (rule) => rule.marketType === marketType.toLowerCase() && rule.tradingType === tradingType
    );
  };

  const initializeRules = () => {
    return rules.map((rule) => ({
      key: rule.key,
      value: rule.type === "boolean" ? false :
             rule.type === "number" ? "" :
             rule.type === "time" ? "" :
             rule.type === "timerange" ? { start: "", end: "" } :
             rule.type === "enum" ? "" : "",
      error: undefined,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          if (activeAccounts.length === 0) {
            setResponseMessage({ text: "No accounts found", type: "info" });
            setShowSnackbar(true);
          }
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          setResponseMessage({ text: activeResponse.message || "Failed to fetch accounts", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setResponseMessage({ text: "Failed to fetch accounts", type: "error" });
        setShowSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTradingRules({
      cash: initializeRules(),
      future: initializeRules(),
      option: initializeRules(),
    });
  }, []);

  const handleCurrencyChange = (e: SelectChangeEvent<string>) => {
    setSelectedCurrency(e.target.value);
  };

  const handleSubBrokerSelection = (account: SubBrokerAccount) => {
    if (selectedSubBroker?._id === account._id) {
      setSelectedSubBroker(null);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    } else {
      const now = new Date();
      const updateStart = account.updateStart ? new Date(account.updateStart) : null;
      const updateEnd = account.updateEnd ? new Date(account.updateEnd) : null;

      if (!account.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
        setResponseMessage({
          text: account.pendingUpdate
            ? `Trading rules for ${account.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
            : `No update request exists for ${account.subAccountName}. Request an update first.`,
          type: "warning",
        });
        setShowSnackbar(true);
        return;
      }

      setSelectedSubBroker(account);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    }
  };

  const handleRequestUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.requestUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request submitted successfully. Edit window opens in 5 days.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to request update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error requesting update:", error);
      setResponseMessage({ text: "Failed to request update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCancelUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.cancelUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request cancelled successfully.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
          if (selectedSubBroker?._id === accountId) {
            setSelectedSubBroker(null);
            setVerifyRules(false);
            setTermsAccepted(false);
            setNoRulesChange(false);
            setSelectedTab(0);
            setPenaltyPayment(null);
            setShowPaymentDashboard(false);
          }
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to cancel update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error cancelling update:", error);
      setResponseMessage({ text: "Failed to cancel update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const validateRule = (rule: Rule, value: any): string | undefined => {
    if (rule.type === "number" && (value === "" || isNaN(value) || Number(value) < 0)) {
      return "Must be a non-negative number";
    }
    if (rule.type === "time" && value !== "" && !/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return "Must be in HH:mm:ss format";
    }
    if (rule.type === "timerange") {
      if (!value || !value.start || !value.end || (value.start !== "" && !/^\d{2}:\d{2}$/.test(value.start)) || (value.end !== "" && !/^\d{2}:\d{2}$/.test(value.end))) {
        return "Must be valid HH:mm times";
      }
    }
    if (rule.type === "enum" && rule.options && value !== "" && !rule.options.includes(value)) {
      return "Invalid option selected";
    }
    return undefined;
  };

  const handleRuleChange = (subType: "cash" | "future" | "option", key: string, value: any) => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    setTradingRules((prev) => {
      const updatedRules = prev[subType].map((rule) => {
        if (rule.key !== key) return rule;
        const ruleDef = rules.find((r) => r.key === key);
        const error = ruleDef ? validateRule(ruleDef, value) : undefined;
        return { ...rule, value, error };
      });
      return { ...prev, [subType]: updatedRules };
    });
  };

  const handleResetRules = (subType: "cash" | "future" | "option") => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const filteredRules = getFilteredRules(marketType, subType);
    const initialRules = filteredRules.map((rule) => ({
      key: rule.key,
      value: rule.type === "boolean" ? false :
             rule.type === "number" ? "" :
             rule.type === "time" ? "" :
             rule.type === "timerange" ? { start: "", end: "" } :
             rule.type === "enum" ? "" : "",
      error: undefined,
    }));
    setTradingRules((prev) => ({
      ...prev,
      [subType]: initialRules,
    }));
    setResponseMessage({ text: `${subType.charAt(0).toUpperCase() + subType.slice(1)} rules reset`, type: "info" });
    setShowSnackbar(true);
  };

  const submitRulesAfterPayment = async (paymentData: { razorpayPaymentId: string; razorpayOrderId: string }) => {
    console.log('UpdateTradingRulesPage: submitRulesAfterPayment called with', paymentData);
    if (!selectedSubBroker) {
      console.error('UpdateTradingRulesPage: No broker selected');
      setResponseMessage({ text: "No broker account selected.", type: "error" });
      setShowSnackbar(true);
      setIsSubmitting(null);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const cashRules = getFilteredRules(marketType, "cash").map(r => r.key);
    const futureRules = getFilteredRules(marketType, "future").map(r => r.key);
    const optionRules = getFilteredRules(marketType, "option").map(r => r.key);

    const formattedRules = {
      cash: tradingRules.cash
        .filter(({ key }) => cashRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
      future: tradingRules.future
        .filter(({ key }) => futureRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
      option: tradingRules.option
        .filter(({ key }) => optionRules.includes(key))
        .map(({ key, value }) => ({
          key,
          value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
        })),
    };

    console.log('UpdateTradingRulesPage: Validating formatted rules for marketType', marketType, formattedRules);

    for (const subType of ["cash", "future", "option"] as const) {
      for (const rule of formattedRules[subType]) {
        const ruleDef = rules.find((r) => r.key === rule.key);
        if (!ruleDef || rule.value === null) continue;
        const error = validateRule(ruleDef, rule.value);
        if (error) {
          console.error(`UpdateTradingRulesPage: Validation error for ${ruleDef.name} in ${subType}: ${error}`);
          setResponseMessage({ text: `Invalid value for ${ruleDef.name} in ${subType}: ${error}`, type: "error" });
          setShowSnackbar(true);
          setIsSubmitting(null);
          return;
        }
      }
    }

    setIsSubmitting(selectedSubBroker._id);
    console.log('UpdateTradingRulesPage: Submitting rules to backend', {
      _id: selectedSubBroker._id,
      noRulesChange,
      tradingRuleData: formattedRules,
    });

    try {
      const response = await UpdateTradingRulesService.setTradingRules({
        _id: selectedSubBroker._id,
        noRulesChange,
        tradingRuleData: formattedRules,
      });
      console.log('UpdateTradingRulesPage: Backend response', response);

      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Trading rules updated successfully", type: "success" });
        setShowSnackbar(true);
        setSelectedSubBroker(null);
        setTradingRules({
          cash: initializeRules(),
          future: initializeRules(),
          option: initializeRules(),
        });
        setVerifyRules(false);
        setTermsAccepted(false);
        setNoRulesChange(false);
        setSelectedTab(0);
        setPenaltyPayment(null);
        setShowPaymentDashboard(false);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        console.log('UpdateTradingRulesPage: Fetched updated accounts', activeResponse);
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          console.error('UpdateTradingRulesPage: Failed to fetch updated accounts', activeResponse.message);
          setResponseMessage({ text: activeResponse.message || "Failed to refresh accounts", type: "error" });
          setShowSnackbar(true);
        }
      } else {
        console.error('UpdateTradingRulesPage: Backend error', response.message);
        setResponseMessage({ text: response.message || "Failed to update trading rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error: any) {
      console.error('UpdateTradingRulesPage: Error updating trading rules', error);
      setResponseMessage({ text: error.message || "Failed to update trading rules", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
      console.log('UpdateTradingRulesPage: Submission complete, isSubmitting reset');
    }
  };

  const handleSubmitRules = async () => {
    if (!selectedSubBroker || isSubmitting) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }

    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    if (!verifyRules) {
      setResponseMessage({ text: "Please verify your entered rules", type: "error" });
      setShowSnackbar(true);
      return;
    }

    if (!termsAccepted) {
      setResponseMessage({ text: "Please accept the terms and conditions", type: "error" });
      setShowSnackbar(true);
      return;
    }

    setIsSubmitting(selectedSubBroker._id);

    try {
      const planResponse = await PenaltyPlanService.GetPlanByType("updatePenalty");
      if (planResponse.statusCode === 200 && planResponse.success && planResponse.data?.length > 0) {
        setPenaltyPayment(planResponse.data[0]);
        setShowPaymentDashboard(true);
      } else {
        setResponseMessage({ text: planResponse.message || "No penalty plan found for updating rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error fetching penalty payment:", error);
      setResponseMessage({ text: "Failed to fetch penalty payment", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleClosePaymentDialog = () => {
    setShowPaymentDashboard(false);
    setPenaltyPayment(null);
    setIsSubmitting(null);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderRuleInput = (rule: Rule, subType: "cash" | "future" | "option") => {
    const ruleValue = tradingRules[subType].find((r) => r.key === rule.key);
    const value = ruleValue?.value;
    const error = ruleValue?.error;
    const errorId = error ? `error-${subType}-${rule.key}` : undefined;
    const isEditable = selectedSubBroker && selectedSubBroker.pendingUpdate &&
      selectedSubBroker.updateStart && selectedSubBroker.updateEnd &&
      new Date() >= new Date(selectedSubBroker.updateStart) &&
      new Date() <= new Date(selectedSubBroker.updateEnd);

    const input = (() => {
      switch (rule.type) {
        case "boolean":
          return (
            <Box sx={{ minHeight: 40 }}>
              <Checkbox
                checked={value || false}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.checked)}
                disabled={!isEditable}
                color="primary"
                data-testid={`rule-${subType}-${rule.key}`}
              />
            </Box>
          );
        case "number":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="number"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value === "" ? "" : Number(e.target.value))}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ width: 100 }}
                error={!!error}
                helperText={error}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "time":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="text"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm:ss"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "timerange":
          const startErrorId = error ? `error-${subType}-${rule.key}-start` : undefined;
          const endErrorId = error ? `error-${subType}-${rule.key}-end` : undefined;
          const timerangeValue = value || { start: "", end: "" };
          return (
            <Box sx={{ display: "flex", gap: 0.5, minHeight: 38 }}>
              <TextField
                type="text"
                value={timerangeValue.start}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, start: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "Start"}
                inputProps={{ "aria-describedby": startErrorId }}
                data-testid={`rule-${subType}-${rule.key}-start`}
              />
              <TextField
                type="text"
                value={timerangeValue.end}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, end: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "End"}
                inputProps={{ "aria-describedby": endErrorId }}
                data-testid={`rule-${subType}-${rule.key}-end`}
              />
              {error && (
                <>
                  <Typography id={startErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (Start)
                  </Typography>
                  <Typography id={endErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (End)
                  </Typography>
                </>
              )}
            </Box>
          );
        case "enum":
          return (
            <Box sx={{ minHeight: 38 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditable} error={!!error}>
                <InputLabel>{rule.name}</InputLabel>
                <Select
                  value={value ?? ""}
                  onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                  label={rule.name}
                >
                  <MenuItem value="">None</MenuItem>
                  {rule.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error && <Typography id={errorId} variant="caption" color="error">{error}</Typography>}
              </FormControl>
            </Box>
          );
        default:
          return null;
      }
    })();

    return <Box>{input}</Box>;
  };

  return (
    <Card sx={{ py: 4, my: 4, width: "100%", maxWidth: 1200, mx: "auto", boxShadow: 4, borderRadius: 4 }}>
      <Box sx={{ mx: 4, mb: 4, display: "flex", gap: 4, flexDirection: "column" }}>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 10 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || "info"}
            sx={{ width: "100%", fontSize: "1.1rem", py: 2 }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Broker Accounts (Total: {accounts.length})
              {selectedSubBroker && ` [ Selected: ${selectedSubBroker.subAccountName} ]`}
            </Typography>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : accounts.length > 0 ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                {accounts.map((account) => (
                  <ListItem
                    key={account._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: account.pendingUpdate ? "#ccffcc" : "inherit",
                      border: account.pendingUpdate ? "1px solid #2e7d32" : "none",
                      borderRadius: 2,
                      mb: 2,
                      py: 2,
                      px: 3,
                      cursor: "pointer",
                      "&:hover": { bgcolor: account.pendingUpdate ? "#ccffcc" : "#f5f5f5" },
                    }}
                    onClick={() => handleSubBrokerSelection(account)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedSubBroker?._id === account._id}
                          disabled={!!(selectedSubBroker && selectedSubBroker._id !== account._id)}
                          color="primary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6">{account.subAccountName}</Typography>}
                        secondary={
                          <Typography variant="body1">
                            <strong>Broker:</strong> {account.brokerName} |{" "}
                            <strong>Market:</strong> {account.marketTypeId} |{" "}
                            <strong>Start:</strong>{" "}
                            {new Date(account.startDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>End:</strong>{" "}
                            {new Date(account.endDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>Status:</strong> {account.status}
                            {account.pendingUpdate && account.updateStart && account.updateEnd && (
                              <>
                                {" | "}
                                <strong>Update Window:</strong>{" "}
                                {new Date(account.updateStart).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })} to{" "}
                                {new Date(account.updateEnd).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </>
                            )}
                          </Typography>
                        }
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && !account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Request Update"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || !account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Update"
                        )}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No accounts available.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Edit Trading Rules {selectedSubBroker ? `for ${selectedSubBroker.subAccountName}` : ""}
            </Typography>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="Trading rules tabs"
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <StyledTab label="Cash" />
              <StyledTab label="Futures" />
              <StyledTab label="Options" />
            </Tabs>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleResetRules(["cash", "future", "option"][selectedTab] as "cash" | "future" | "option")}
                disabled={
                  !selectedSubBroker || !selectedSubBroker.pendingUpdate ||
                  !selectedSubBroker.updateStart ||
                  !selectedSubBroker.updateEnd ||
                  new Date() < new Date(selectedSubBroker.updateStart) ||
                  new Date() > new Date(selectedSubBroker.updateEnd)
                }
              >
                Reset {["Cash", "Futures", "Options"][selectedTab]} Rules
              </Button>
            </Box>
            <TabPanel value={selectedTab} index={0}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Cash Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "cash").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "cash")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Futures Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "future").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "future")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Options Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "option").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "option")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} mb={2}>
                Edit Terms
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={verifyRules}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setVerifyRules(!verifyRules);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I verified my entered rules properly
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={noRulesChange}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setNoRulesChange(!noRulesChange);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I don’t want to change rules ever
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={termsAccepted}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setTermsAccepted(!termsAccepted);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I agree to the <a href="#" style={{ color: "#1976d2" }}>Terms and Conditions</a>
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitRules}
                disabled={!!isSubmitting || !selectedSubBroker || !verifyRules || !termsAccepted}
                sx={{ mt: 2, fontSize: "1rem", py: 1, px: 3 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" />
                    Fetching Payment...
                  </>
                ) : (
                  "Update Trading Rules"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={showPaymentDashboard}
          onClose={handleClosePaymentDialog}
          maxWidth="xs"
          sx={{ "& .MuiDialog-paper": { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
            Penalty Payment
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {penaltyPayment ? (
              <>
                <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
                  <InputLabel>Select Currency</InputLabel>
                  <Select
                    value={selectedCurrency}
                    label="Currency"
                    onChange={handleCurrencyChange}
                  >
                    {Object.keys(currencySymbols).map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency} ({currencySymbols[currency]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      {penaltyPayment.name}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Price:</strong> {currencySymbols[selectedCurrency]}
                      {penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price].toFixed(2)}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>GST:</strong> {penaltyPayment.gstRate}%
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Total:</strong> {currencySymbols[selectedCurrency]}
                      {(
                        penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100)
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {penaltyPayment.description}
                    </Typography>
                  </CardContent>
                </Card>
                {penaltyPayment && selectedSubBroker && (
                  <PaymentGateway
                    planId={penaltyPayment._id}
                    couponCode=""
                    amount={Math.round(
                      penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100) *
                        100
                    )}
                    currency={selectedCurrency}
                    paymentType="penaltyPayment"
                    data={{ brokerAccountId: selectedSubBroker._id }}
                    onSuccess={submitRulesAfterPayment}
                  />
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Loading payment details...
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClosePaymentDialog}
              sx={{ fontSize: "1rem", py: 1, px: 2 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Card>
  );
}

*/














/*

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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from "@mui/material";
import UpdateTradingRulesService from "../../../../../../Services/api-services/dashboard-services/sections-services/my-account-services/update-broker-rules-service";
import PenaltyPlanService from "../../../../../../Services/api-services/plan-info-service/penalty-plan-service";
import PaymentGateway from "../../../../../../payment-gateways/currency-gateway/razorpay-gateway";
import { TradingRules, rules, Rule } from "../../broker/common-files/common-rules-data/trading-rules-config";

interface SubBrokerAccount {
  _id: string;
  marketTypeId: string;
  brokerId: string;
  brokerName: React.ReactNode;
  brokerKey: string;
  subAccountName: string;
  startDate: string;
  endDate: string;
  proxyServiceId: string;
  status: string;
  pendingUpdate: boolean;
  updateStart: string | null;
  updateEnd: string | null;
}

interface StatusMessage {
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface PenaltyPayment {
  _id: string;
  name: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  discountPercent: number;
  description: string;
  gstRate: number;
  status: string;
}

const RuleCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  minHeight: 80,
  width: "100%",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UpdateTradingRulesPage() {
  const [accounts, setAccounts] = useState<SubBrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [selectedSubBroker, setSelectedSubBroker] = useState<SubBrokerAccount | null>(null);
  const [verifyRules, setVerifyRules] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [noRulesChange, setNoRulesChange] = useState<boolean>(false);
  const [tradingRules, setTradingRules] = useState<TradingRules>({ cash: [], future: [], option: [] });
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [penaltyPayment, setPenaltyPayment] = useState<PenaltyPayment | null>(null);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");

  const DEFAULT_MARKET_TYPE = 'stockmarket';

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

  const getFilteredRules = (marketType: string, tradingType: string) => {
    return rules.filter(
      (rule) => rule.marketType === marketType.toLowerCase() && rule.tradingType === tradingType
    );
  };

  const initializeRules = () => {
    return rules.map((rule) => ({
      key: rule.key,
      value: rule.type === "boolean" ? false :
             rule.type === "number" ? "" :
             rule.type === "time" ? "" :
             rule.type === "timerange" ? { start: "", end: "" } :
             rule.type === "enum" ? "" : "",
      error: undefined,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          if (activeAccounts.length === 0) {
            setResponseMessage({ text: "No accounts found", type: "info" });
            setShowSnackbar(true);
          }
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          setResponseMessage({ text: activeResponse.message || "Failed to fetch accounts", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setResponseMessage({ text: "Failed to fetch accounts", type: "error" });
        setShowSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTradingRules({
      cash: initializeRules(),
      future: initializeRules(),
      option: initializeRules(),
    });
  }, []);

  const handleCurrencyChange = (e: SelectChangeEvent<string>) => {
    setSelectedCurrency(e.target.value);
  };

  const handleSubBrokerSelection = (account: SubBrokerAccount) => {
    if (selectedSubBroker?._id === account._id) {
      setSelectedSubBroker(null);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    } else {
      const now = new Date();
      const updateStart = account.updateStart ? new Date(account.updateStart) : null;
      const updateEnd = account.updateEnd ? new Date(account.updateEnd) : null;

      if (!account.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
        setResponseMessage({
          text: account.pendingUpdate
            ? `Trading rules for ${account.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
            : `No update request exists for ${account.subAccountName}. Request an update first.`,
          type: "warning",
        });
        setShowSnackbar(true);
        return;
      }

      setSelectedSubBroker(account);
      setVerifyRules(false);
      setTermsAccepted(false);
      setNoRulesChange(false);
      setSelectedTab(0);
      setPenaltyPayment(null);
      setShowPaymentDashboard(false);
    }
  };

  const handleRequestUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.requestUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request submitted successfully. Edit window opens in 5 days.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to request update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error requesting update:", error);
      setResponseMessage({ text: "Failed to request update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCancelUpdate = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response = await UpdateTradingRulesService.cancelUpdate(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Update request cancelled successfully.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
          if (selectedSubBroker?._id === accountId) {
            setSelectedSubBroker(null);
            setVerifyRules(false);
            setTermsAccepted(false);
            setNoRulesChange(false);
            setSelectedTab(0);
            setPenaltyPayment(null);
            setShowPaymentDashboard(false);
          }
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to cancel update", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error cancelling update:", error);
      setResponseMessage({ text: "Failed to cancel update", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const validateRule = (rule: Rule, value: any): string | undefined => {
    if (rule.type === "number" && (value === "" || isNaN(value) || Number(value) < 0)) {
      return "Must be a non-negative number";
    }
    if (rule.type === "time" && value !== "" && !/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return "Must be in HH:mm:ss format";
    }
    if (rule.type === "timerange") {
      if (!value || !value.start || !value.end || (value.start !== "" && !/^\d{2}:\d{2}$/.test(value.start)) || (value.end !== "" && !/^\d{2}:\d{2}$/.test(value.end))) {
        return "Must be valid HH:mm times";
      }
    }
    if (rule.type === "enum" && rule.options && value !== "" && !rule.options.includes(value)) {
      return "Invalid option selected";
    }
    return undefined;
  };

  const handleRuleChange = (subType: "cash" | "future" | "option", key: string, value: any) => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    setTradingRules((prev) => {
      const updatedRules = prev[subType].map((rule) => {
        if (rule.key !== key) return rule;
        const ruleDef = rules.find((r) => r.key === key);
        const error = ruleDef ? validateRule(ruleDef, value) : undefined;
        return { ...rule, value, error };
      });
      return { ...prev, [subType]: updatedRules };
    });
  };

  const handleResetRules = (subType: "cash" | "future" | "option") => {
    if (!selectedSubBroker) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }
    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    const marketType = selectedSubBroker.marketTypeId.toLowerCase();
    const filteredRules = getFilteredRules(marketType, subType);
    const initialRules = filteredRules.map((rule) => ({
      key: rule.key,
      value: rule.type === "boolean" ? false :
             rule.type === "number" ? "" :
             rule.type === "time" ? "" :
             rule.type === "timerange" ? { start: "", end: "" } :
             rule.type === "enum" ? "" : "",
      error: undefined,
    }));
    setTradingRules((prev) => ({
      ...prev,
      [subType]: initialRules,
    }));
    setResponseMessage({ text: `${subType.charAt(0).toUpperCase() + subType.slice(1)} rules reset`, type: "info" });
    setShowSnackbar(true);
  };

  const submitRulesAfterPayment = async (paymentData: { razorpayPaymentId: string; razorpayOrderId: string }) => {
    console.log('UpdateTradingRulesPage: submitRulesAfterPayment called with', paymentData);
    if (!selectedSubBroker) {
      console.error('UpdateTradingRulesPage: No broker selected');
      setResponseMessage({ text: "No broker account selected.", type: "error" });
      setShowSnackbar(true);
      setIsSubmitting(null);
      return;
    }

    const formattedRules = {
      cash: tradingRules.cash.map(({ key, value }) => ({
        key,
        value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
      })),
      future: tradingRules.future.map(({ key, value }) => ({
        key,
        value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
      })),
      option: tradingRules.option.map(({ key, value }) => ({
        key,
        value: value === "" || (typeof value === "object" && value.start === "" && value.end === "") ? null : value,
      })),
    };

    console.log('UpdateTradingRulesPage: Validating formatted rules', formattedRules);

    for (const subType of ["cash", "future", "option"] as const) {
      for (const rule of formattedRules[subType]) {
        const ruleDef = rules.find((r) => r.key === rule.key);
        if (!ruleDef || rule.value === null) continue;
        const error = validateRule(ruleDef, rule.value);
        if (error) {
          console.error(`UpdateTradingRulesPage: Validation error for ${ruleDef.name} in ${subType}: ${error}`);
          setResponseMessage({ text: `Invalid value for ${ruleDef.name} in ${subType}: ${error}`, type: "error" });
          setShowSnackbar(true);
          setIsSubmitting(null);
          return;
        }
      }
    }

    setIsSubmitting(selectedSubBroker._id);
    console.log('UpdateTradingRulesPage: Submitting rules to backend', {
      _id: selectedSubBroker._id,
      noRulesChange,
      tradingRuleData: formattedRules,
    });

    try {
      const response = await UpdateTradingRulesService.setTradingRules({
        _id: selectedSubBroker._id,
        noRulesChange,
        tradingRuleData: formattedRules,
      });
      console.log('UpdateTradingRulesPage: Backend response', response);

      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Trading rules updated successfully", type: "success" });
        setShowSnackbar(true);
        setSelectedSubBroker(null);
        setTradingRules({
          cash: initializeRules(),
          future: initializeRules(),
          option: initializeRules(),
        });
        setVerifyRules(false);
        setTermsAccepted(false);
        setNoRulesChange(false);
        setSelectedTab(0);
        setPenaltyPayment(null);
        setShowPaymentDashboard(false); // Close dialog
        const activeResponse = await UpdateTradingRulesService.getActiveSubBrokerAccount();
        console.log('UpdateTradingRulesPage: Fetched updated accounts', activeResponse);
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingUpdate === b.pendingUpdate ? 0 : a.pendingUpdate ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          console.error('UpdateTradingRulesPage: Failed to fetch updated accounts', activeResponse.message);
          setResponseMessage({ text: activeResponse.message || "Failed to refresh accounts", type: "error" });
          setShowSnackbar(true);
        }
      } else {
        console.error('UpdateTradingRulesPage: Backend error', response.message);
        setResponseMessage({ text: response.message || "Failed to update trading rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error: any) {
      console.error('UpdateTradingRulesPage: Error updating trading rules', error);
      setResponseMessage({ text: error.message || "Failed to update trading rules", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
      console.log('UpdateTradingRulesPage: Submission complete, isSubmitting reset');
    }
  };

  const handleSubmitRules = async () => {
    if (!selectedSubBroker || isSubmitting) {
      setResponseMessage({ text: "Please select a broker account first.", type: "error" });
      setShowSnackbar(true);
      return;
    }

    const now = new Date();
    const updateStart = selectedSubBroker.updateStart ? new Date(selectedSubBroker.updateStart) : null;
    const updateEnd = selectedSubBroker.updateEnd ? new Date(selectedSubBroker.updateEnd) : null;

    if (!selectedSubBroker.pendingUpdate || !updateStart || !updateEnd || now < updateStart || now > updateEnd) {
      setResponseMessage({
        text: selectedSubBroker.pendingUpdate
          ? `Trading rules for ${selectedSubBroker.subAccountName} cannot be edited outside the timeframe: ${updateStart?.toLocaleString()} to ${updateEnd?.toLocaleString()}`
          : `No update request exists for ${selectedSubBroker.subAccountName}. Request an update first.`,
        type: "error",
      });
      setShowSnackbar(true);
      return;
    }

    if (!verifyRules) {
      setResponseMessage({ text: "Please verify your entered rules", type: "error" });
      setShowSnackbar(true);
      return;
    }

    if (!termsAccepted) {
      setResponseMessage({ text: "Please accept the terms and conditions", type: "error" });
      setShowSnackbar(true);
      return;
    }

    setIsSubmitting(selectedSubBroker._id);

    try {
      const planResponse = await PenaltyPlanService.GetPlanByType("updatePenalty");
      if (planResponse.statusCode === 200 && planResponse.success && planResponse.data?.length > 0) {
        setPenaltyPayment(planResponse.data[0]);
        setShowPaymentDashboard(true);
      } else {
        setResponseMessage({ text: planResponse.message || "No penalty plan found for updating rules", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error fetching penalty payment:", error);
      setResponseMessage({ text: "Failed to fetch penalty payment", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleClosePaymentDialog = () => {
    setShowPaymentDashboard(false);
    setPenaltyPayment(null);
    setIsSubmitting(null);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderRuleInput = (rule: Rule, subType: "cash" | "future" | "option") => {
    const ruleValue = tradingRules[subType].find((r) => r.key === rule.key);
    const value = ruleValue?.value;
    const error = ruleValue?.error;
    const errorId = error ? `error-${subType}-${rule.key}` : undefined;
    const isEditable = selectedSubBroker && selectedSubBroker.pendingUpdate &&
      selectedSubBroker.updateStart && selectedSubBroker.updateEnd &&
      new Date() >= new Date(selectedSubBroker.updateStart) &&
      new Date() <= new Date(selectedSubBroker.updateEnd);

    const input = (() => {
      switch (rule.type) {
        case "boolean":
          return (
            <Box sx={{ minHeight: 40 }}>
              <Checkbox
                checked={value || false}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.checked)}
                disabled={!isEditable}
                color="primary"
                data-testid={`rule-${subType}-${rule.key}`}
              />
            </Box>
          );
        case "number":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="number"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value === "" ? "" : Number(e.target.value))}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ width: 100 }}
                error={!!error}
                helperText={error}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "time":
          return (
            <Box sx={{ minHeight: 38 }}>
              <TextField
                type="text"
                value={value ?? ""}
                onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm:ss"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error}
                inputProps={{ "aria-describedby": errorId }}
                data-testid={`rule-${subType}-${rule.key}`}
              />
              {error && (
                <Typography id={errorId} variant="caption" color="error" sx={{ display: "none" }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        case "timerange":
          const startErrorId = error ? `error-${subType}-${rule.key}-start` : undefined;
          const endErrorId = error ? `error-${subType}-${rule.key}-end` : undefined;
          const timerangeValue = value || { start: "", end: "" };
          return (
            <Box sx={{ display: "flex", gap: 0.5, minHeight: 38 }}>
              <TextField
                type="text"
                value={timerangeValue.start}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, start: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "Start"}
                inputProps={{ "aria-describedby": startErrorId }}
                data-testid={`rule-${subType}-${rule.key}-start`}
              />
              <TextField
                type="text"
                value={timerangeValue.end}
                onChange={(e) => handleRuleChange(subType, rule.key, { ...timerangeValue, end: e.target.value })}
                variant="outlined"
                size="small"
                disabled={!isEditable}
                placeholder="HH:mm"
                sx={{ width: 100 }}
                error={!!error}
                helperText={error && "End"}
                inputProps={{ "aria-describedby": endErrorId }}
                data-testid={`rule-${subType}-${rule.key}-end`}
              />
              {error && (
                <>
                  <Typography id={startErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (Start)
                  </Typography>
                  <Typography id={endErrorId} variant="caption" color="error" sx={{ display: "none" }}>
                    {error} (End)
                  </Typography>
                </>
              )}
            </Box>
          );
        case "enum":
          return (
            <Box sx={{ minHeight: 38 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditable} error={!!error}>
                <InputLabel>{rule.name}</InputLabel>
                <Select
                  value={value ?? ""}
                  onChange={(e) => handleRuleChange(subType, rule.key, e.target.value)}
                  label={rule.name}
                >
                  <MenuItem value="">None</MenuItem>
                  {rule.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error && <Typography id={errorId} variant="caption" color="error">{error}</Typography>}
              </FormControl>
            </Box>
          );
        default:
          return null;
      }
    })();

    return <Box>{input}</Box>;
  };

  return (
    <Card sx={{ py: 4, my: 4, width: "100%", maxWidth: 1200, mx: "auto", boxShadow: 4, borderRadius: 4 }}>
      <Box sx={{ mx: 4, mb: 4, display: "flex", gap: 4, flexDirection: "column" }}>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 10 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || "info"}
            sx={{ width: "100%", fontSize: "1.1rem", py: 2 }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Broker Accounts (Total: {accounts.length})
              {selectedSubBroker && ` [ Selected: ${selectedSubBroker.subAccountName} ]`}
            </Typography>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : accounts.length > 0 ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                {accounts.map((account) => (
                  <ListItem
                    key={account._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: account.pendingUpdate ? "#ccffcc" : "inherit",
                      border: account.pendingUpdate ? "1px solid #2e7d32" : "none",
                      borderRadius: 2,
                      mb: 2,
                      py: 2,
                      px: 3,
                      cursor: "pointer",
                      "&:hover": { bgcolor: account.pendingUpdate ? "#ccffcc" : "#f5f5f5" },
                    }}
                    onClick={() => handleSubBrokerSelection(account)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedSubBroker?._id === account._id}
                          disabled={!!(selectedSubBroker && selectedSubBroker._id !== account._id)}
                          color="primary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6">{account.subAccountName}</Typography>}
                        secondary={
                          <Typography variant="body1">
                            <strong>Broker:</strong> {account.brokerName} |{" "}
                            <strong>Market:</strong> {account.marketTypeId} |{" "}
                            <strong>Start:</strong>{" "}
                            {new Date(account.startDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>End:</strong>{" "}
                            {new Date(account.endDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })} |{" "}
                            <strong>Status:</strong> {account.status}
                            {account.pendingUpdate && account.updateStart && account.updateEnd && (
                              <>
                                {" | "}
                                <strong>Update Window:</strong>{" "}
                                {new Date(account.updateStart).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })} to{" "}
                                {new Date(account.updateEnd).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </>
                            )}
                          </Typography>
                        }
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && !account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Request Update"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelUpdate(account._id);
                        }}
                        disabled={isSubmitting === account._id || !account.pendingUpdate}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && account.pendingUpdate ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Update"
                        )}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No accounts available.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Edit Trading Rules {selectedSubBroker ? `for ${selectedSubBroker.subAccountName}` : ""}
            </Typography>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="Trading rules tabs"
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <StyledTab label="Cash" />
              <StyledTab label="Futures" />
              <StyledTab label="Options" />
            </Tabs>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleResetRules(["cash", "future", "option"][selectedTab] as "cash" | "future" | "option")}
                disabled={
                  !selectedSubBroker || !selectedSubBroker.pendingUpdate ||
                  !selectedSubBroker.updateStart ||
                  !selectedSubBroker.updateEnd ||
                  new Date() < new Date(selectedSubBroker.updateStart) ||
                  new Date() > new Date(selectedSubBroker.updateEnd)
                }
              >
                Reset {["Cash", "Futures", "Options"][selectedTab]} Rules
              </Button>
            </Box>
            <TabPanel value={selectedTab} index={0}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Cash Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "cash").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "cash")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Futures Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "future").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "future")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Options Trading Rules
              </Typography>
              <Grid container spacing={2}>
                {getFilteredRules(selectedSubBroker?.marketTypeId || DEFAULT_MARKET_TYPE, "option").map((rule, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <RuleCard>
                      <CardContent sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Tooltip title={rule.description}>
                            <Typography variant="body1" fontWeight={500}>
                              {rule.name}
                            </Typography>
                          </Tooltip>
                          {renderRuleInput(rule, "option")}
                        </Box>
                      </CardContent>
                    </RuleCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} mb={2}>
                Edit Terms
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={verifyRules}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setVerifyRules(!verifyRules);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I verified my entered rules properly
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={noRulesChange}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setNoRulesChange(!noRulesChange);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I don’t want to change rules ever
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={termsAccepted}
                    onChange={() => {
                      if (!selectedSubBroker) {
                        setResponseMessage({ text: "Please select a broker account first.", type: "error" });
                        setShowSnackbar(true);
                        return;
                      }
                      setTermsAccepted(!termsAccepted);
                    }}
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    I agree to the <a href="#" style={{ color: "#1976d2" }}>Terms and Conditions</a>
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitRules}
                disabled={!!isSubmitting || !selectedSubBroker || !verifyRules || !termsAccepted}
                sx={{ mt: 2, fontSize: "1rem", py: 1, px: 3 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" />
                    Fetching Payment...
                  </>
                ) : (
                  "Update Trading Rules"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={showPaymentDashboard}
          onClose={handleClosePaymentDialog}
          maxWidth="xs"
          sx={{ "& .MuiDialog-paper": { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
            Penalty Payment
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {penaltyPayment ? (
              <>
                <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
                  <InputLabel>Select Currency</InputLabel>
                  <Select
                    value={selectedCurrency}
                    label="Currency"
                    onChange={handleCurrencyChange}
                  >
                    {Object.keys(currencySymbols).map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency} ({currencySymbols[currency]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      {penaltyPayment.name}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Price:</strong> {currencySymbols[selectedCurrency]}
                      {penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price].toFixed(2)}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>GST:</strong> {penaltyPayment.gstRate}%
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      <strong>Total:</strong> {currencySymbols[selectedCurrency]}
                      {(
                        penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100)
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {penaltyPayment.description}
                    </Typography>
                  </CardContent>
                </Card>
                {penaltyPayment && selectedSubBroker && (
                  <PaymentGateway
                    planId={penaltyPayment._id}
                    couponCode=""
                    amount={Math.round(
                      penaltyPayment.price[selectedCurrency as keyof typeof penaltyPayment.price] *
                        (1 + penaltyPayment.gstRate / 100) *
                        100
                    )}
                    currency={selectedCurrency}
                    paymentType="penaltyPayment"
                    data={{ brokerAccountId: selectedSubBroker._id }}
                    onSuccess={submitRulesAfterPayment}
                  />
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Loading payment details...
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClosePaymentDialog}
              sx={{ fontSize: "1rem", py: 1, px: 2 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Card>
  );
}




*/