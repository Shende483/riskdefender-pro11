
import { Box, Typography } from '@mui/material';
import CardWrapper from '../../../../../../../components/common-cards/card-wrapper';
import { useEffect, useState } from 'react';
import AlertService from '../../../../../../../Services/api-services/dashboard-services/sections-services/alert-services/alert.service';
// Adjust the import path

export default function AlertingDetails() {
  const [alertLimit, setAlertLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlertLimit = async () => {
      try {
        const response = await AlertService.getAlertLimits();
        if (response.success && response.data.length > 0) {
          setAlertLimit(response.data[0].alertLimit);
        } else {
          setError(response.message || 'No alert data found');
        }
      } catch (err) {
        setError('Failed to fetch alert limit');
      }
    };

    fetchAlertLimit();
  }, []);

  return (
    <CardWrapper sx={{ height: '200px', width: '100%' }}>
      <Box sx={{ p: 10, height: '100%' }}>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Typography>
            Alert Limit: {alertLimit !== null ? alertLimit : 'Loading...'}
          </Typography>
        )}
      </Box>
    </CardWrapper>
  );
}