import type { SelectChangeEvent } from '@mui/material';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Paper, Button, Select, TextField, Typography } from '@mui/material';

import MarketTypeService from '../../../Services/MarketTypeService';

import type { MarketTypeDetails } from '../../../Types/MarketTypes';



const initialData: MarketTypeDetails = {
  id: 0,
  name: '',
  status: '',
};
export default function MarketTypeForm() {
  const [marketDetails, setMarketDetails] = useState<MarketTypeDetails>(initialData);
  const [error, setError] = useState<{ name?: string; status?: string }>({});
  const validateForm = () => {
    const tempErrors: { name?: string; status?: string } = {};
    if (!marketDetails.name.trim()) {
      tempErrors.name = 'Market Type is required';
    }
    if (!marketDetails.status?.trim()) {
      tempErrors.status = 'Status is required';
    }
    setError(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && marketDetails.name.trim() && marketDetails.status?.trim()) {
      try {
        await MarketTypeService.createMarketType(marketDetails);
        setMarketDetails({ id: 0, name: '', status: '' });
        setError({});
      } catch (catchError: any) {
        const errorMessage = catchError.response?.data?.message;
        console.error(errorMessage);
      }
    }
  };

  const handleChangeStatus = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setMarketDetails((preDetails: any) => ({ ...preDetails, status: value }));
    setError((prev) => ({ ...prev, status: '' }));
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMarketDetails((prev) => ({ ...prev, name: event.target.value }));
    setError((prev) => ({ ...prev, name: '' }));
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="50vh" bgcolor="#f5f5f5">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          minWidth: { xs: '90%', sm: '50%', md: '30%' },
          bgcolor: 'white',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Market Details
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Market Type"
            value={marketDetails.name}
            onChange={handleNameChange}
            error={Boolean(error.name)}
            helperText={error.name}
            variant="outlined"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Status</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={marketDetails.status}
              onChange={handleChangeStatus}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {error.status && <Typography color="error">{error.status}</Typography>}
          </FormControl>
        </Box>

        <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
          Submit
        </Button>
      </Paper>
    </Box>
  );
}