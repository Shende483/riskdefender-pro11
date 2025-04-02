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

export function MyAccountsDetails() {
  const theme = useTheme();
  const [selectedBroker, setSelectedBroker] = useState('');
  const [selectedSubbroker, setSelectedSubbroker] = useState('');
  const [marketTypes, setMarketTypes] = useState<MarketTypeList[]>([]);
  const [brokers, setBrokers] = useState<Array<{
    brokerAccountName: string;
    brokerName: string;
  }>>([]);  const [loading, setLoading] = useState(false);
  const [selectedMarketTypeId, setSelectedMarketTypeId] = useState('');

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
        `http://localhost:3040/broker/broker-details?marketTypeId=${marketTypeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("MyAccountDetails API Response:", response.data);
      
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
            {brokers.map((broker, index) => (
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
            onChange={(e) => setSelectedSubbroker(e.target.value)}
            disabled={loading || brokers.length === 0}
          >
            {brokers.map((broker, index) => (
              <MenuItem key={index} value={broker.brokerAccountName}>
                {broker.brokerAccountName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </Card>
  );
}
