import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Tab, Card, Tabs, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const CardWrapper = (({ theme }: { theme: any }) => ({
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
    right: -180
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

export function MyAccountsDetails() {
  const theme = useTheme();
  const [selectedBroker, setSelectedBroker] = useState("");
  const [selectedSubbroker, setSelectedSubbroker] = useState("");
  const tabs = ["StockMarket", "Forex", "Cryptocurrency"];

  return (
    <Card sx={{ ...CardWrapper({ theme }), height: '100%' }}>
      <Tabs value="" sx={{ mt: 1 }}>
        {tabs.map((tab) => (
          <Tab key={tab} label={<span style={{ fontWeight: "bold" }}>{tab}</span>}
            value={tab} sx={{ padding: "0 2px" }}
          />
        ))}
      </Tabs>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 120 }}>
          <InputLabel>Broker</InputLabel>
          <Select value={selectedBroker} onChange={(e) => setSelectedBroker(e.target.value)}>
            <MenuItem value="Select Broker"> Select Broker </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 140 }}>
          <InputLabel>Subbroker</InputLabel>
          <Select value={selectedSubbroker} onChange={(e) => setSelectedSubbroker(e.target.value)}>
            <MenuItem value="Select Subbroker"> Select Subbroker </MenuItem>
          </Select>
        </FormControl>
      </div>

    </Card>
  );
}
