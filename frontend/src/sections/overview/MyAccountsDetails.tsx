import axios from 'axios';
import { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import { Tab, Card, Tabs, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import { getToken } from '../../utils/getTokenFn';
import MarketTypeService from '../../Services/MarketTypeService';

import type { MarketTypeList } from '../../Types/MarketTypes';

const CardWrapper = ({ theme }: { theme: any }) => ({
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.warning.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130,
  },
});

interface BrokerAccount {
  _id: string;
  brokerAccountName: string;
  brokerName: string;
}

interface TradingRulesData {
  brokerAccountName: string;
  cash: { key: string; value: string }[];
  option: { key: string; value: string }[];
  future: { key: string; value: string }[];
}

interface MyAccountsDetailsProps {
  onTradingRulesChange?: (data: TradingRulesData) => void;
}

export function MyAccountsDetails({ onTradingRulesChange }: MyAccountsDetailsProps) {
  const theme = useTheme();
  const [selectedBroker, setSelectedBroker] = useState('');
  const [selectedSubbroker, setSelectedSubbroker] = useState('');
  const [marketTypes, setMarketTypes] = useState<MarketTypeList[]>([]);
  const [brokers, setBrokers] = useState<
    Array<{
      _id: string;
      brokerAccountName: string;
      brokerName: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarketTypeId, setSelectedMarketTypeId] = useState('');

  const [selectedBrokerAccount, setSelectedBrokerAccount] = useState<BrokerAccount | null>(null);

  // Add this function to fetch trading rules
  const fetchTradingRules = async (brokerAccountId: string) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3040/brokerAccount/trading-rules/${brokerAccountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Parse the trading rules into the expected format
      const parsedRules = {
        ...response.data.data,
        option: response.data.data.option.map((rule: string) => {
          const [key, value] = rule.split(':').map(item => item.trim());
          return { key, value };
        }),
        future: response.data.data.future.map((rule: string) => {
          const [key, value] = rule.split(':').map(item => item.trim());
          return { key, value };
        }),
        cash: response.data.data.cash.map((rule: string) => {
          const [key, value] = rule.split(':').map(item => item.trim());
          return { key, value };
        })
      };
      
      return parsedRules;
    } catch (error) {
      console.error('Error fetching trading rules:', error);
      return null;
    }
  };

  const fetchMarketTypes = async () => {
    try {
      const response = await MarketTypeService.getAllActiveMarketTypes();
      console.log('API Response:', response.data);
      setMarketTypes(response.data);
    } catch (error) {
      console.error('Error fetching market types:', error);
    }
  };
  const fetchBrokersByMarketType = async (marketTypeId: string) => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `http://localhost:3040/brokerAccount/broker-details?marketTypeId=${marketTypeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('MyAccountDetails API Response:', response.data);

      // Ensure we're setting the data property if the response is wrapped
      const brokersData = response.data.data || response.data;
      setBrokers(Array.isArray(brokersData) ? brokersData : []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      setBrokers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const uniqueBrokers = Array.from(new Set(brokers.map((broker) => broker.brokerName)))
    .map((brokerName) => brokers.find((broker) => broker.brokerName === brokerName))
    .filter(
      (broker): broker is { _id: string; brokerAccountName: string; brokerName: string } =>
        broker !== undefined
    );

  const handleTabChange = (marketTypeId: string) => {
    setSelectedMarketTypeId(marketTypeId);
    fetchBrokersByMarketType(marketTypeId);
  };

  useEffect(() => {
    fetchMarketTypes();
  }, []);

  return (
    <Card sx={{ ...CardWrapper({ theme }), height: '100%' }}>
      <Tabs value={selectedMarketTypeId}>
        {marketTypes.map((marketType) => (
          <Tab
            key={marketType._id}
            label={<span style={{ fontWeight: 'bold' }}>{marketType.name}</span>}
            value={marketType._id}
            onClick={() => handleTabChange(marketType._id)}
            sx={{ gap: 8 }}
          />
        ))}
      </Tabs>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 120 }}>
          <InputLabel>Broker</InputLabel>
          <Select
            value={selectedBroker}
            onChange={(e) => setSelectedBroker(e.target.value)}
            disabled={loading || brokers.length === 0}
          >
            {uniqueBrokers.map((broker, index) => (
              <MenuItem key={index} value={broker.brokerName}>
                {broker.brokerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 140 }}>
          <InputLabel>Subbroker</InputLabel>
          <Select
            value={selectedSubbroker}
            onChange={async (e) => {
              const selectedAccount = brokers.find((b) => b.brokerAccountName === e.target.value);
              if (selectedAccount) {
                setSelectedSubbroker(e.target.value);
                setSelectedBrokerAccount(selectedAccount);
                const rules = await fetchTradingRules(selectedAccount._id);
                if (rules && onTradingRulesChange) {
                  // Check if onSubbrokerSelect exists
                  onTradingRulesChange({
                    brokerAccountName: selectedAccount.brokerAccountName,
                    cash: rules.cash,
                    option: rules.option,
                    future: rules.future,
                  });
                }
              }
            }}
            disabled={loading || brokers.length === 0 || !selectedBroker}
          >
            {brokers
              .filter((broker) => !selectedBroker || broker.brokerName === selectedBroker)
              .map((broker) => (
                <MenuItem key={broker._id} value={broker.brokerAccountName}>
                  {broker.brokerAccountName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>
    </Card>
  );
}
