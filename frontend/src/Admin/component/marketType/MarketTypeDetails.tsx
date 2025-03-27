import { useState, useEffect } from 'react';

import {
  Box,
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import MarketTypeService from '../../../Services/MarketTypeService';

import type { MarketTypeList } from '../../../Types/MarketTypes';

export default function Marketdetail() {
  const [marketData, setMarketData] = useState<MarketTypeList[]>([]);

  const fetchMarketTypes = async () => {
    try {
      const response = await MarketTypeService.getAllActiveMarketTypes();
      console.log('API Response:', response.data);
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market types:', error);
    }
  };

  useEffect(() => {
    fetchMarketTypes();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <TableContainer component={Paper} sx={{ mt: 4, mx: 'auto', maxWidth: '1200px' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ py: 2 }}>
          Active Market Types
        </Typography>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketData.map((market, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                <TableCell>{market.name}</TableCell>
                <TableCell>{market.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
