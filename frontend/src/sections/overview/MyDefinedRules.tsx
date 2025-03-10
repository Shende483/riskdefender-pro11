import { useState } from "react";

import { useTheme } from '@mui/material/styles';
import { Box, Tab, Card, List, Tabs, ListItem, Typography, ListItemText } from "@mui/material";

const CardWrapper = (({ theme }: { theme: any }) => ({
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
}));

interface SubbrokerData {
    subbrokername?: string;
    cash?: Record<string, any>;
    future?: Record<string, any>;
    option?: Record<string, any>;
    [key: string]: any;
}

interface MyDefinedRulesProps {
    subbrokerData?: SubbrokerData;
}

export default function MyDefinedRules({ subbrokerData }: MyDefinedRulesProps) {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<string>('Cash');

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const getSegmentData = () => {
        const segment = activeTab.toLowerCase();
        return subbrokerData?.[segment] || {};
    };

    const ruleFields: string[] = [
        'QuickDefenderMode',
        'DailyRiskControlledPositionMode',
        'ConsecutiveEntryDuration',
        'EntryBlockPeriod',
        'ClosePositionButtonAndDuration',
        'MaxEntriesInSpecificSymbol',
        'EntrySide',
        'MarginType',
        'MaxEntryPerDay',
        'MaxRiskEntry',
        'SLAndTPTrailingDuration',
    ];

    return (
        <Card sx={{ ...CardWrapper({ theme }), height: '100%' }}>
            <Box sx={{ pt: 1, pl: 3 }}>
                <List sx={{ py: 0 }}>
                    <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                        <ListItemText
                            sx={{ py: 0, mt: 0.45, mb: 0.45 }}
                            primary={
                                <Typography variant="body1">My Defined Rules For {subbrokerData?.subbrokername || 'Subbroker'}</Typography>
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
                        {['Cash', 'Future', 'Option'].map((tab) => (
                            <Tab
                                key={tab}
                                label={tab}
                                value={tab}
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: theme.palette.primary.dark,
                                }}
                            />
                        ))}
                    </Tabs>

                    {ruleFields.map((field) => (
                        <Typography
                            key={field}
                            style={{
                                marginTop: '1px',
                                fontSize: '9px',
                                color: theme.palette.text.primary,
                                fontWeight: 'bold',
                            }}
                        >
                            {`${field.replace(/([A-Z])/g, ' $1').trim()}: ${getSegmentData()[field] || 'undefined'}`}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Card>
    );
}