import { useTheme } from '@mui/material/styles';
import { Box, Card, Typography } from "@mui/material";

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

export default function AlertingDetails() {
    const theme = useTheme();

    return (
        <Card sx={{ ...CardWrapper({ theme }), height: '100%' }}>
            <Box sx={{ p: 10, height: '100%' }}>
                <Typography>MyDefinedRules</Typography>
            </Box>
        </Card>
    );
}