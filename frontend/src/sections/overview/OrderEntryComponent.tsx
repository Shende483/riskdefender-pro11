import type {SelectChangeEvent} from '@mui/material';

import React, { useState } from 'react';

import { Box ,
    Card,
    Button,
    Select,
    Slider,
    styled,
    MenuItem,
    TextField,
    Typography,
    CardContent,
    ButtonGroup,
    FormControl
} from '@mui/material';


const StyledButtonGroup = styled(ButtonGroup)({
    width: '100%',
    marginBottom: '8px',
    '& .MuiButton-root': {
        width: '50%',
        padding: '6px',
        color: 'black',
    },
});

const SubmitButton = styled(Button)({
    width: '100%',
    backgroundColor: '#0d6efd',
    color: 'white',
    padding: '8px',
    fontSize: '0.9rem',
    '&:hover': {
        backgroundColor: '#0b5ed7',
    },
});

interface OrderEntryComponentProps { }

const OrderEntryComponent: React.FC<OrderEntryComponentProps> = () => {
    const [orderType, setOrderType] = useState<string | null>(null);
    const [positionType, setPositionType] = useState<string>('ISOLATED');
    const [leverage, setLeverage] = useState<number>(7);
    const [risk, setRisk] = useState<number>(29.41);
    const [cardBgColor, setCardBgColor] = useState<string>('secondary.light');
    const [symbol, setSymbol] = useState<string>('');
    const [market, setMarket] = useState<string>('');
    const [stopLoss, setStopLoss] = useState<string>('');
    const [targetPrice, setTargetPrice] = useState<string>('');

    const handleOrderTypeClick = (type: string) => {
        setOrderType(type);
        if (type === 'SELL') {
            setCardBgColor('rgb(255, 133, 133)');
        } else if (type === 'BUY') {
            setCardBgColor('rgb(133, 255, 133)');
        } else {
            setCardBgColor('secondary.light');
        }
    };

    const handlePositionTypeClick = (type: string) => {
        setPositionType(type);
    };

    const handleSymbolChange = (event: SelectChangeEvent) => {
        setSymbol(event.target.value as string);
    };

    const handleMarketChange = (event: SelectChangeEvent) => {
        setMarket(event.target.value as string);
    };

    const handleStopLossChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStopLoss(event.target.value);
    };

    const handleTargetPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTargetPrice(event.target.value);
    };

    const handleLeverageChange = (event: Event, value: number | number[]) => {
        if (typeof value === 'number') {
            setLeverage(value);
        }
    };

    const handleRiskChange = (event: Event, value: number | number[]) => {
        if (typeof value === 'number') {
          setRisk(value);
        }
      };

    return (
        <Card sx={{ m: 2, top: 4, bgcolor: '#ede7f6' }}>
            <CardContent>
                <FormControl fullWidth sx={{ mb: 1 }}>
                    <Select
                        displayEmpty
                        value={symbol}
                        onChange={handleSymbolChange}
                        size="small"
                        sx={{ '& .MuiSelect-select': { color: 'black' } }}
                    >
                        <MenuItem value="">Select Symbol</MenuItem>
                        <MenuItem value="BTC">BTC</MenuItem>
                        <MenuItem value="ETH">ETH</MenuItem>
                    </Select>
                </FormControl>

                <StyledButtonGroup variant="outlined">
                    <Button
                        onClick={() => handleOrderTypeClick('SELL')}
                        sx={{
                            backgroundColor: orderType === 'SELL' ? 'red' : 'inherit',
                            color: 'black',
                            '&:hover': {
                                backgroundColor: orderType === 'SELL' ? 'darkred' : 'inherit',
                            },
                        }}
                        size="small"
                    >
                        SELL(SHORT)
                    </Button>
                    <Button
                        onClick={() => handleOrderTypeClick('BUY')}
                        sx={{
                            backgroundColor: orderType === 'BUY' ? 'green' : 'inherit',
                            color: 'black',
                            '&:hover': {
                                backgroundColor: orderType === 'BUY' ? 'darkgreen' : 'inherit',
                            },
                        }}
                        size="small"
                    >
                        BUY(LONG)
                    </Button>
                </StyledButtonGroup>

                <StyledButtonGroup variant="outlined" sx={{ mb: 1 }}>
                    <Button
                        onClick={() => handlePositionTypeClick('ISOLATED')}
                        sx={{
                            backgroundColor: positionType === 'ISOLATED' ? 'purple' : 'inherit',
                            color: 'black',
                            '&:hover': {
                                backgroundColor: positionType === 'ISOLATED' ? 'purple' : 'darkpurple',
                            },
                        }}
                        size="small"
                    >
                        ISOLATED
                    </Button>
                    <Button
                        onClick={() => handlePositionTypeClick('CROSSED')}
                        sx={{
                            backgroundColor: positionType === 'CROSSED' ? 'purple' : 'inherit',
                            color: 'black',
                            '&:hover': {
                                backgroundColor: positionType === 'CROSSED' ? 'purple' : 'darkpurple',
                            },
                        }}
                        size="small"
                    >
                        CROSSED
                    </Button>
                </StyledButtonGroup>

                <Box sx={{ mb: 1 }}>
                    <Typography fontSize='0.8rem' color='black'>
                        LEVERAGE(MAX 20x):
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Slider
                            value={leverage}
                            onChange={handleLeverageChange}
                            max={20}
                            valueLabelDisplay="off"
                            size="small"
                            sx={{ color: '#0d6efd', flexGrow: 1 }}
                        />
                        <Typography sx={{ ml: 1, fontWeight: 'bold' }}>{leverage}x</Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 1 }}>
                    <Typography fontSize='0.8rem' color='black'>
                        MAX RISK: %
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Slider
                            value={risk}
                            onChange={handleRiskChange}
                            max={100}
                            valueLabelDisplay="off"
                            size="small"
                            sx={{ color: '#0d6efd', flexGrow: 1 }}
                        />
                        <Typography sx={{ ml: 1, fontWeight: 'bold' }}>{risk.toFixed(2)}%</Typography>
                    </Box>
                </Box>

                <FormControl fullWidth sx={{ mb: 1 }}>
                    <Select
                        displayEmpty
                        value={market}
                        onChange={handleMarketChange}
                        size="small"
                        sx={{ '& .MuiSelect-select': { color: 'black' } }}
                    >
                        <MenuItem value="">Select Market</MenuItem>
                        <MenuItem value="USDT">USDT</MenuItem>
                        <MenuItem value="BUSD">BUSD</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    placeholder="Enter StopLoss Price"
                    sx={{ mb: 1, '& .MuiInputBase-input': { color: 'black' } }}
                    size="small"
                    value={stopLoss}
                    onChange={handleStopLossChange}
                />
                <TextField
                    fullWidth
                    placeholder="Enter Target Price"
                    sx={{ mb: 1, '& .MuiInputBase-input': { color: 'black' } }}
                    size="small"
                    value={targetPrice}
                    onChange={handleTargetPriceChange}
                />

                <SubmitButton variant="contained">SUBMIT ORDER</SubmitButton>
            </CardContent>
        </Card>
    );
};

export default OrderEntryComponent;