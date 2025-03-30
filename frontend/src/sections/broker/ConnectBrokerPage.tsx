import type { SelectChangeEvent } from '@mui/material';

import axios from 'axios';
import { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Card,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { getToken } from '../../utils/getTokenFn';
import MarketTypeService from '../../Services/MarketTypeService';

import type { MarketTypeList } from '../../Types/MarketTypes';

type TradingRuleData = {
  cash: string[];
  option: string[];
  future: string[];
};

type Plan = {
  _id: string;
  planName: string;
  numberOfBroker: number;
  createdAt: string;
  startDate: string;
};

type Broker = {
  _id: string;
  name: string;
};

export default function ConnectBrokerPage() {
  const [formData, setFormData] = useState({
    planName: '',
    marketType: '',
    subscriptionId: '',
    brokerId: '',
    brokerAccountName: '',
    apiKey: '',
    secretKey: '',
    status: 'active',
    tradingRuleData: {
      cash: [] as string[],
      option: [] as string[],
      future: [] as string[],
    },
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [marketTypes, setMarketTypes] = useState<MarketTypeList[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [tradingRules, setTradingRules] = useState<TradingRuleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch plans and market types on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [plansResponse, marketTypesResponse] = await Promise.all([
          axios.get('http://localhost:3040/subscription-details/get-user-subscriptions', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          MarketTypeService.getAllActiveMarketTypes(),
        ]);

        setPlans(plansResponse.data.data);
        setMarketTypes(marketTypesResponse.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleMarketTypeChange = async (event: SelectChangeEvent<string>) => {
    const marketTypeId = event.target.value;
    setFormData((prev) => ({
      ...prev,
      marketType: marketTypeId,
      brokerId: '',
      tradingRuleData: { cash: [], option: [], future: [] },
    }));

    try {
      setIsLoading(true);
      const token = getToken();

      // Fetch brokers and trading rules in parallel
      const [brokersResponse, rulesResponse] = await Promise.all([
        axios.get(`http://localhost:3040/broker/by-market-type?marketTypeId=${marketTypeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `http://localhost:3040/trading-rules/rulesByMarketTypeId?marketTypeId=${marketTypeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setBrokers(brokersResponse.data);

      // Process trading rules response
      let rulesData = rulesResponse.data;
      if (Array.isArray(rulesData)) {
        rulesData = rulesData.find((rule: any) => rule.marketTypeId === marketTypeId)?.rules;
      } else if (rulesData && typeof rulesData === 'object' && 'rules' in rulesData) {
        rulesData = rulesData.rules;
      }

      if (rulesData) {
        setTradingRules({
          cash: Array.isArray(rulesData.cash) ? rulesData.cash : [],
          option: Array.isArray(rulesData.option) ? rulesData.option : [],
          future: Array.isArray(rulesData.future) ? rulesData.future : [],
        });
      } else {
        setTradingRules(null);
      }
    } catch (error) {
      console.error('Error fetching market type data:', error);
      setBrokers([]);
      setTradingRules(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = (event: SelectChangeEvent<string>) => {
    const planId = event.target.value;
    setFormData((prev) => ({
      ...prev,
      planName: planId,
      subscriptionId: planId,
      marketType: '',
      brokerId: '',
      tradingRuleData: { cash: [], option: [], future: [] },
    }));
    setBrokers([]);
    setTradingRules(null);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const token = getToken();

      const payload = {
        brokerAccountName: formData.brokerAccountName,
        marketTypeId: formData.marketType,
        brokerId: formData.brokerId,
        subscriptionId: formData.planName,
        apiKey: formData.apiKey,
        secretKey: formData.secretKey,
        status: formData.status,
        tradingRuleData: {
          cash: formData.tradingRuleData.cash.filter((rule) => rule.trim() !== ''),
          option: formData.tradingRuleData.option.filter((rule) => rule.trim() !== ''),
          future: formData.tradingRuleData.future.filter((rule) => rule.trim() !== ''),
        },
      };

      const response = await axios.post(
        'http://localhost:3040/brokerAcc/createBrokerAcc',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Broker account created:', response.data);
      alert('Broker account created successfully!');

      // Reset form
      setFormData({
        planName: '',
        marketType: '',
        subscriptionId: '',
        brokerId: '',
        brokerAccountName: '',
        apiKey: '',
        secretKey: '',
        status: 'active',
        tradingRuleData: { cash: [], option: [], future: [] },
      });
      setTradingRules(null);
    } catch (error: any) {
      console.error('Error creating broker account:', error);
      alert(error.response?.data?.message || 'Failed to create broker account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuleChange = (tradeType: keyof TradingRuleData, index: number, value: string) => {
    setFormData((prev) => {
      const newRules = [...prev.tradingRuleData[tradeType]];
      newRules[index] = value;
      return {
        ...prev,
        tradingRuleData: {
          ...prev.tradingRuleData,
          [tradeType]: newRules,
        },
      };
    });
  };
  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Broker Account
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="plan-label">Select Plan</InputLabel>
          <Select
            labelId="plan-label"
            id="plan"
            value={formData.planName}
            onChange={handlePlanChange}
            label="Select Plan"
            disabled={isLoading}
          >
            {plans.map((plan) => (
              <MenuItem key={plan._id} value={plan._id}>
                <Box>
                  <Typography>{plan.planName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Brokers: {plan.numberOfBroker} | Start:{' '}
                    {new Date(plan.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="market-type-label">Market Type</InputLabel>
          <Select
            labelId="market-type-label"
            id="market-type"
            value={formData.marketType}
            onChange={handleMarketTypeChange}
            label="Market Type"
            disabled={!formData.planName || isLoading}
          >
            {marketTypes.map((market) => (
              <MenuItem key={market._id} value={market._id}>
                {market.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="broker-label">Broker</InputLabel>
          <Select
            labelId="broker-label"
            id="broker"
            value={formData.brokerId}
            onChange={(e) => setFormData((prev) => ({ ...prev, brokerId: e.target.value }))}
            label="Broker"
            disabled={!formData.marketType || isLoading}
          >
            {brokers.map((broker) => (
              <MenuItem key={broker._id} value={broker._id}>
                {broker.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Broker Account Name"
          value={formData.brokerAccountName}
          onChange={(e) => setFormData((prev) => ({ ...prev, brokerAccountName: e.target.value }))}
          sx={{ mb: 3 }}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="API Key"
          value={formData.apiKey}
          onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
          sx={{ mb: 3 }}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="API Secret"
          value={formData.secretKey}
          onChange={(e) => setFormData((prev) => ({ ...prev, secretKey: e.target.value }))}
          sx={{ mb: 3 }}
          disabled={isLoading}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            label="Status"
            disabled={isLoading}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Card>

      {/* Trading Rules Section */}
      {tradingRules && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Trading Rules
          </Typography>

          <Grid container spacing={3}>
            {(Object.entries(tradingRules) as [keyof TradingRuleData, string[]][])
              .filter(([_, fields]) => fields.length > 0)
              .map(([tradeType, ruleTemplates]) => (
                <Grid item xs={12} md={4} key={tradeType}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      {tradeType.toUpperCase()} Rules
                    </Typography>

                    {ruleTemplates.map((template, index) => {
                      const [fieldName] = template.split(':').map((s) => s.trim());
                      return (
                        <TextField
                          key={`${tradeType}-${index}`}
                          fullWidth
                          label={fieldName}
                          value={formData.tradingRuleData[tradeType][index] || ''}
                          onChange={(e) => handleRuleChange(tradeType, index, e.target.value)}
                          sx={{ mb: 2 }}
                          disabled={isLoading}
                        />
                      );
                    })}
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Card>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading || !formData.brokerId || !formData.marketType || !formData.planName}
        >
          {isLoading ? 'Creating...' : 'Create Broker Account'}
        </Button>
      </Box>
    </Box>
  );
}