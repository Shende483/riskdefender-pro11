import { useState, useEffect } from 'react';
import { Tab, Tabs, Select, MenuItem, InputLabel, FormControl, Typography, List, ListItem, ListItemText, Grid } from '@mui/material';
import BrokerService, { BrokerAccount, TradingType } from '../../../../../../../Services/api-services/dashboard-services/sections-services/trading-dashboard-services/my-account-details-service';
import AlertingDetails from './AlertingDetails';
import CardWrapper from '../../../../../../../components/common-cards/card-wrapper';
import { MARKET_TYPES, TRADING_TYPES } from '../../../../../common-tyeps/market-and-trading-types';
import TradingJournal from './tradingJournal';

type TradingRulesData = {
  subBrokerName: string;
  marketTypeId: string;
  brokerId: string;
  subBrokerId: string;
  tradingRules: TradingRule[];
  planDetails?: PlanDetails;
};

export interface TradingRule {
  key: string;
  value: string | object;
}

export interface PlanDetails {
  endDate: string;
  daysLeft: number;
  hoursLeft: number;
  planExpiryMessage?: string;
  deletionMessage?: string;
  extraDaysMessage?: string;
}

interface MyAccountsDetailsProps {
  onTradingRulesChange?: (data: TradingRulesData) => void;
}

export function MyAccountsDetails({ onTradingRulesChange }: MyAccountsDetailsProps) {
  const [selectedMarketTypeId, setSelectedMarketTypeId] = useState('');
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [selectedSubBrokerId, setSelectedSubBrokerId] = useState('');
  const [brokers, setBrokers] = useState<BrokerAccount[]>([]);
  const [subBrokers, setSubBrokers] = useState<BrokerAccount[]>([]);
  const [selectedTradingType, setSelectedTradingType] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBrokerAccount, setSelectedBrokerAccount] = useState<BrokerAccount | null>(null);
  const [tradingRules, setTradingRules] = useState<TradingRule[]>([]);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBrokersByMarketType = async (marketType: string) => {
    setLoading(true);
    try {
      const response = await BrokerService.getBrokerDetails({ marketTypeId: marketType });
      const brokersData = response.data || [];
      setBrokers(Array.isArray(brokersData) ? brokersData : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      setBrokers([]);
      setError('Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubBrokers = async (marketTypeId: string, brokerId: string) => {
    setLoading(true);
    try {
      const response = await BrokerService.getSubBrokerDetails({
        marketTypeId,
        brokerId,
      });
      const subBrokersData = response.data || [];
      setSubBrokers(Array.isArray(subBrokersData) ? subBrokersData : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching sub-brokers:', error);
      setSubBrokers([]);
      setError('Failed to fetch sub-brokers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingRules = async (subBrokerId: string, tradingType: string) => {
    try {
      const response = await BrokerService.getTradingRules({
        subBrokerId,
        tradingType,
      });
      const rulesData = response.data?.data?.tradingRules || [];
      const planDetails = response.data?.data?.planDetails || null;
      setTradingRules(Array.isArray(rulesData) ? rulesData : []);
      setPlanDetails(planDetails);
      setError(null);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching trading rules:', error);
      setTradingRules([]);
      setPlanDetails(null);
      setError('Failed to fetch trading rules');
      return null;
    }
  };

  const uniqueBrokers = Array.from(new Set(brokers.map((broker) => broker.brokerName)))
    .map((brokerName) => brokers.find((broker) => broker.brokerName === brokerName))
    .filter((broker): broker is BrokerAccount => broker !== undefined);

  const handleTabChange = (marketType: string) => {
    setSelectedMarketTypeId(marketType);
    setBrokers([]);
    setSubBrokers([]);
    setSelectedBrokerId('');
    setSelectedSubBrokerId('');
    setSelectedTradingType('');
    setSelectedBrokerAccount(null);
    setTradingRules([]);
    setPlanDetails(null);
    setError(null);
    fetchBrokersByMarketType(marketType);
  };

  const handleTradingTypeTabChange = (tradingType: string) => {
    setSelectedTradingType(tradingType);
    if (selectedBrokerId && selectedSubBrokerId) {
      setError(null);
      fetchTradingRules(selectedSubBrokerId, tradingType).then((rulesData) => {
        if (rulesData && onTradingRulesChange && selectedBrokerAccount) {
          onTradingRulesChange({
            subBrokerName: selectedBrokerAccount.subBrokerName || 'Unknown Sub-Broker',
            marketTypeId: selectedMarketTypeId,
            brokerId: selectedBrokerId,
            subBrokerId: selectedSubBrokerId,
            tradingRules: rulesData.tradingRules || [],
            planDetails: rulesData.planDetails,
          });
        }
      });
    }
  };

  // Stringify complex values for display
  const formatRuleValue = (value: string | object): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value as string;
  };

  // Format rule as "key: value"
  const formatRuleDisplay = (rule: TradingRule): string => {
    return `${rule.key}: ${formatRuleValue(rule.value)}`;
  };

  useEffect(() => {
    if (MARKET_TYPES.length > 0 && !selectedMarketTypeId) {
      setSelectedMarketTypeId(MARKET_TYPES[0].shortName);
      fetchBrokersByMarketType(MARKET_TYPES[0].shortName);
    }
  }, [selectedMarketTypeId]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <CardWrapper sx={{ height: '400px', width: '100%' }}>
          <Tabs value={selectedMarketTypeId}>
            {MARKET_TYPES.map((marketType) => (
              <Tab
                key={marketType.shortName}
                label={<span style={{ fontWeight: 'bold' }}>{marketType.name}</span>}
                value={marketType.shortName}
                onClick={() => handleTabChange(marketType.shortName)}
                sx={{ gap: 8 }}
              />
            ))}
          </Tabs>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            <FormControl fullWidth variant="filled" sx={{ minWidth: 200 }}>
              <InputLabel>Broker</InputLabel>
              <Select
                value={selectedBrokerId}
                onChange={(e) => {
                  const selectedBroker = brokers.find((b) => b.brokerId === e.target.value);
                  if (selectedBroker) {
                    setSelectedBrokerId(e.target.value);
                    setSubBrokers([]);
                    setSelectedSubBrokerId('');
                    setSelectedTradingType('');
                    setTradingRules([]);
                    setPlanDetails(null);
                    setError(null);
                    fetchSubBrokers(selectedMarketTypeId, e.target.value);
                  }
                }}
                disabled={loading || brokers.length === 0}
              >
                <MenuItem value="">
                  <em>Select Broker</em>
                </MenuItem>
                {uniqueBrokers.map((broker) => (
                  <MenuItem key={broker._id} value={broker.brokerId}>
                    {broker.brokerName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="filled" sx={{ minWidth: 200 }}>
              <InputLabel>Sub-broker</InputLabel>
              <Select
                value={selectedSubBrokerId}
                onChange={(e) => {
                  const selectedAccount = subBrokers.find((b) => b.subBrokerId === e.target.value);
                  if (selectedAccount) {
                    setSelectedSubBrokerId(e.target.value);
                    setSelectedBrokerAccount(selectedAccount);
                    setSelectedTradingType('future');
                    setTradingRules([]);
                    setPlanDetails(null);
                    setError(null);
                    fetchTradingRules(e.target.value, 'future').then((rulesData) => {
                      if (rulesData && onTradingRulesChange) {
                        onTradingRulesChange({
                          subBrokerName: selectedAccount.subBrokerName || 'Unknown Sub-Broker',
                          marketTypeId: selectedMarketTypeId,
                          brokerId: selectedBrokerId,
                          subBrokerId: e.target.value,
                          tradingRules: rulesData.tradingRules || [],
                          planDetails: rulesData.planDetails,
                        });
                      }
                    });
                  }
                }}
                disabled={loading || subBrokers.length === 0 || !selectedBrokerId}
              >
                <MenuItem value="">
                  <em>Select Sub-broker</em>
                </MenuItem>
                {subBrokers.map((broker) => (
                  <MenuItem key={broker.subBrokerId} value={broker.subBrokerId}>
                    {broker.subBrokerName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          
            {planDetails?.planExpiryMessage && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                {planDetails.planExpiryMessage}
              </Typography>
            )}
            {planDetails?.deletionMessage && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 1 }}>
                {planDetails.deletionMessage}
              </Typography>
            )}
            {planDetails?.extraDaysMessage && (
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                {planDetails.extraDaysMessage}
              </Typography>
            )}
          </div>
        </CardWrapper>
      </Grid>

      <Grid item xs={12} sm={4}>
        <CardWrapper sx={{ height: '400px', width: '100%' }}>
          {error ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : tradingRules.length > 0 ? (
            <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '8px' }}>
               <Tabs value={selectedTradingType}>
              {TRADING_TYPES.map((type) => (
                <Tab
                  key={type.id}
                  label={<span style={{ fontWeight: 'bold' }}>{type.name}</span>}
                  value={type.id}
                  onClick={() => handleTradingTypeTabChange(type.id)}
                  sx={{ gap: 8 }}
                  disabled={loading || !selectedSubBrokerId}
                />
              ))}
            </Tabs> 
              <List sx={{ padding: 0 }}>
                {tradingRules.map((rule, index) => (
                  <ListItem key={index} sx={{ padding: '1px 0' }}>
                    <ListItemText
                      primary={formatRuleDisplay(rule)}
                      primaryTypographyProps={{ fontSize: '11px' }}
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No trading rules available. Please select a trading type.
            </Typography>
          )}
        </CardWrapper>
      </Grid>

      <Grid item xs={12} sm={4}>
        <AlertingDetails />
        <TradingJournal />
      </Grid>
    </Grid>
  );
}