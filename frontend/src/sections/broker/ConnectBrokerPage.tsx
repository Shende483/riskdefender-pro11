import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import io from 'socket.io-client';
import { MarketData } from './json/MarketData';


const brokerOptions: Record<string, string[]> = {
  StockMarket: ['Zerodha', 'Fyres', 'AngelOne'],
  Forex: ['Exness', 'OctaFx', 'FXCM'],
  Cryptocurrency: ['Binance', 'DeltaExchange'],
};

interface TradeData {
  [key: string]: string | number | boolean;
}

export default function ConnectBrokerPage() {

  const socket = io('http://localhost:3039');
  const [formData, setFormData] = useState({
    subaccountName: "",
    marketType: "StockMarket",
    brokerName: "",
    subbrokerName: "",
    Apikey: "",
    ApiSecret: "",
    data: MarketData,
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    socket.emit('formData', formData);
  };

  return (
    <Card sx={{ p: 3, top: 10, bottom: 10, display: 'flex', flexDirection: 'column', }}>
      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel id="market-type-label">Select Market Type</InputLabel>
        <Select
          labelId="market-type-label"
          id="market-type"
          name="marketType"
          value={formData.marketType}
          onChange={handleSelectChange}
        >
          {Object.keys(MarketData).map((market, index) => (
            <MenuItem key={index} value={market}>
              {market}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formData.marketType && brokerOptions[formData.marketType] && (
        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel id="broker-name-label">Select Broker Name</InputLabel>
          <Select
            labelId="broker-name-label"
            id="broker-name"
            name="brokerName"
            value={formData.brokerName}
            onChange={handleSelectChange}
          >
            {brokerOptions[formData.marketType].map((broker) => (
              <MenuItem key={broker} value={broker}>
                {broker}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField label="Subbroker Name" name="subbrokerName" value={formData.subbrokerName} onChange={handleChange} />
      <br />
      <TextField label="API Key" name="Apikey" value={formData.Apikey} onChange={handleChange} />
      <br />
      <TextField label="API Secret" name="ApiSecret" value={formData.ApiSecret} onChange={handleChange} />

      <Grid container spacing={2} my={3}>
        {Object.entries((formData.data as any)[formData.marketType] as TradeData).map(
          ([tradeType, tradeData]) => (
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 2, backgroundColor: "lightblue" }} >
                <div key={tradeType}>
                  <Typography variant="h6" my={2}>
                    Set Rules for {formData.marketType} {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} Trading
                  </Typography>

                  {Object.entries(tradeData).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: "10px" }}>
                      <TextField
                        label={key}
                        variant="outlined"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 1 }}
                        value={value as string}
                        onChange={() => handleChange}
                      />
                    </div>
                  ))}

                </div>
              </Card>
            </Grid>
          )
        )}

      </Grid>


      <Button variant="contained" color="primary" style={{ marginTop: "20px" }} onClick={handleSubmit}>
        Submit
      </Button>

    </Card>
  );
}
