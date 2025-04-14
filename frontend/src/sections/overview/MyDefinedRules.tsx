import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Tab, Card, List, Tabs, ListItem, Typography, ListItemText } from '@mui/material';

const CardWrapper = ({ theme }: { theme: any }) => ({
  overflow: 'hidden',
  position: 'relative',
  height: '240px',
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

interface TradingRule {
  key: string;
  value: string;
}

interface TradingRulesData {
  brokerAccountName: string;
  cash: TradingRule[];
  option: TradingRule[];
  future: TradingRule[];
}
interface MyDefinedRulesProps {
  tradingRules?: TradingRulesData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MyDefinedRules({
  tradingRules,
  activeTab,
  setActiveTab,
}: MyDefinedRulesProps) {
  const theme = useTheme();
  // const [activeTab, setActiveTab] = useState<string>('cash');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const getRuleFieldsForTab = () => {
    if (!tradingRules) return [];
    const segment = tradingRules[activeTab as keyof TradingRulesData];
    if (!Array.isArray(segment)) return [];
    return segment.map((rule) => rule.key);
  };

  const findRuleValue = (key: string): string => {
    if (!tradingRules) return 'Not defined';
    const segment = tradingRules[activeTab as keyof TradingRulesData];
    if (!Array.isArray(segment)) return 'Not defined';

    const rule = segment.find((r) => r.key === key);
    return rule ? rule.value : 'Not defined';
  };
  return (
    <Card sx={{ ...CardWrapper({ theme }), height: '100%', mb: 1 }}>
      <Box sx={{ pt: 1, pl: 3 }}>
        <List sx={{ py: 0 }}>
          <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
            <ListItemText
              primary={
                <Typography variant="body1">
                  My Defined Rules For {tradingRules?.brokerAccountName || 'Select a Subbroker'}
                </Typography>
              }
            />
          </ListItem>
        </List>
        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
          >
            {['cash', 'future', 'option'].map((tab) => (
              <Tab
                key={tab}
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                value={tab}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: theme.palette.primary.dark,
                }}
              />
            ))}
          </Tabs>
          {getRuleFieldsForTab().length === 0 ? (
            <Typography sx={{ mt: 2, fontSize: '12px', textAlign: 'center' }}>
              No trading rules defined for {activeTab} segment
            </Typography>
          ) : (
            getRuleFieldsForTab().map((field) => (
              <Typography
                key={field}
                style={{
                  marginTop: '1px',
                  fontSize: '9px',
                  color: theme.palette.text.primary,
                  fontWeight: 'bold',
                }}
              >
                {`${field.replace(/([A-Z])/g, ' $1').trim()}: ${findRuleValue(field)}`}
              </Typography>
            ))
          )}
        </Box>
      </Box>
    </Card>
  );
}
