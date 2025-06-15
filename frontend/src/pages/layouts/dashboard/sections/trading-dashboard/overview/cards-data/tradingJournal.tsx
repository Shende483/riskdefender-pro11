import { Box, Typography } from '@mui/material';
import CardWrapper from '../../../../../../../components/common-cards/card-wrapper';
import { useEffect, useState } from 'react';
import TradingJournalService from '../../../../../../../Services/api-services/dashboard-services/sections-services/trading-journal-services/trading-journal-renew.service';



export default function TradingJournal() {
  const [journalLimit, setJournalLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJournalLimit = async () => {
      try {
        const response = await TradingJournalService.getTradingJournalLimits();
        if (response.success && response.data.length > 0) {
          setJournalLimit(response.data[0].tradingJournalLimit);
        } else {
          setError(response.message || 'No trading journal data found');
        }
      } catch (err) {
        setError('Failed to fetch trading journal limit');
      }
    };

    fetchJournalLimit();
  }, []);

  return (
    <CardWrapper sx={{ height: '200px', width: '100%' }}>
      <Box sx={{ p: 10, height: '100%' }}>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Typography>
            Trading Journal Limit: {journalLimit !== null ? journalLimit : 'Loading...'}
          </Typography>
        )}
      </Box>
    </CardWrapper>
  );
}