import type { SelectChangeEvent } from '@mui/material';

import React, { useState, useEffect } from 'react';

import {
  Button,
  Select,
  MenuItem,
  Snackbar,
  Container,
  TextField,
  InputLabel,
  FormControl,
} from '@mui/material';

import MarketTypeService from '../../../Services/MarketTypeService';
import BrokerManagmentService from '../../../Services/BrokerManagementService';



interface BrokerManagement {
  id: number;
  name: string;
  status: string;
  marketTypeId: string;
  createdDate: string;
  modifiedDate: string;
}

interface MarketType {
  _id: string;
  name: string;
}

const initialData: BrokerManagement = {
  id: 0,
  name: '',
  status: '',
  marketTypeId: '',
  createdDate: '',
  modifiedDate: '',
};

export default function BrokerManagementForm() {
  const [broker, setBroker] = useState<BrokerManagement>(initialData);
  const [marketTypes, setMarketTypes] = useState<MarketType[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMarketTypes = async () => {
      try {
        const response = await MarketTypeService.getAllActiveMarketTypes();
        if (response?.data) {
          setMarketTypes(response.data); 
        } else {
          throw new Error("Invalid API Response");
        }
      } catch (err: any) {
        console.error("Error fetching market types:", err.response?.data?.message || err.message);
      }
    };
    fetchMarketTypes();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!broker.name.trim()) errors.name = 'Broker Name is required.';
    if (!broker.marketTypeId) errors.marketTypeId = 'Market Type is required.';
    setError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBroker({ ...broker, [event.target.name]: event.target.value });
    setError((prev) => ({ ...prev, [event.target.name]: '' }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { value, name } = event.target;
    console.log(`Select Change - Name: ${name}, Value: ${value}`); 

    setBroker((prev) => ({
      ...prev,
      [name]: value || "", 
    }));
    setError((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    
    if (validateForm()) {
        console.log("Submitting Broker Data:", broker);

      try {
        const response = await BrokerManagmentService.createBroker(broker);
        console.log("API Response:", response);
        setBroker(initialData);
        setError({});
        setMessage('Broker created successfully!');
      } catch (err: any) {
        console.error("Error creating broker:", err.response?.data?.message);
        setMessage(err.response?.data?.message || "Failed to create broker.");
      }
    }
  };

  return (
    <Container>
      <h2>Create Broker</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Broker Name"
          name="name"
          fullWidth
          value={broker.name}
          onChange={handleInputChange}
          error={!!error.name}
          helperText={error.name}
        />

        <FormControl fullWidth sx={{ py: 2 }} error={!!error.marketTypeId}>
          <InputLabel>Market Type</InputLabel>
          <Select
            name="marketTypeId"
            value={broker.marketTypeId  || ""}
            onChange={handleSelectChange}
          >
            {marketTypes.map((type) => (
              <MenuItem key={type._id} value={String(type._id)}>
                {type.name} 
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ py: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={broker.status}
            onChange={handleSelectChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <Button type="submit" variant="contained">
          Submit
        </Button>
      </form>

      <Snackbar
        open={!!message}
        message={message}
        autoHideDuration={3000}
        onClose={() => setMessage('')}
      />
    </Container>
  );
}