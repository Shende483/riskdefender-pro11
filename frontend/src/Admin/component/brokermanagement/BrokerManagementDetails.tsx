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

import BrokerManagmentService from '../../../Services/BrokerManagementService';

import type { BrokerManagmentdetails } from '../../../Types/BrokerManagementTypes';



export default function BrokerManagementDetails() {
  const [brokers, setBrokers] = useState<BrokerManagmentdetails[]>([]);

  const fetchBrokers = async () => {
    try {
      const response = await BrokerManagmentService.getBrokers();
      
      console.log("Full API Response:", response); 
      
      if (Array.isArray(response)) {
        setBrokers(response);
      } else if (Array.isArray(response.data)) {
        setBrokers(response.data);
      } else {
        console.error("Unexpected API response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching brokers:", error);
    }
  };
  
  useEffect(() => {
    fetchBrokers();
  }, []);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, p: 2 }}>
      <TableContainer component={Paper} sx={{ mt: 4, mx: 'auto', maxWidth: '1200px' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ py: 2 }}>
          Active Brokers
        </Typography>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
              <TableCell>
                <b>Market Type</b>
              </TableCell>
              <TableCell>
                <b>Created Date</b>
              </TableCell>
              <TableCell>
                <b>Modified Date</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brokers.length > 0 ? (
              brokers.map((broker, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell>{broker.name}</TableCell>
                  <TableCell>{broker.status}</TableCell>
                  <TableCell>{broker.marketTypeId}</TableCell>
                  <TableCell>{broker.createdDate}</TableCell>
                  <TableCell>{broker.modifiedDate}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No active brokers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
