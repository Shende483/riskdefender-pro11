import { Card, FormControl,Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import React from "react";

export default function UserBalanceCard() {
    const [symbol, setSymbol] = React.useState('');
    
    return (
        <Card sx={{ bgcolor: '#ede7f6', m: 2 }}>
            <Grid container sx={{ p: 2, pb: 0, color: '#fff' }}>
                <Grid item xs={12}>
                    <Grid container display='flex' alignItems="center">
                        <Grid item>
                            <Typography variant="subtitle1" sx={{ color: 'secondary.dark' }}>
                                Avbl Balance :
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" sx={{ color: 'grey.800' }}>
                                $1839 USDT
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Grid container display='flex' alignItems="center" mb={1}>
                        <Grid item>
                            <Typography variant="subtitle1" sx={{ color: 'secondary.dark' }}>
                                Today Entries Count :
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" sx={{ color: 'grey.800' }}>
                                18
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

                <FormControl fullWidth variant="filled" sx={{ mb: 2, py: 0, minWidth: 120 }}>
                    <InputLabel sx={{ color: 'grey.800' }}>Entry Count in symbol</InputLabel>
                    <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                        <MenuItem value="Select Broker"> Select symbol </MenuItem>
                    </Select>
                </FormControl>

            </Grid>

        </Card>
    );
}