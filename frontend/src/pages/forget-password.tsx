import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
    Box,
    Grid,
    Paper,
    Button,
    Checkbox,
    TextField,
    Container,
    Typography,
    IconButton,
    InputAdornment,
    FormControlLabel,
} from '@mui/material';

const ForgetPassword: React.FC = () => {
    const [emailOrMobile, setEmailOrMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Password reset submitted', { emailOrMobile, newPassword, rememberMe });
    };

    const handleSendOTP = () => {
        if (emailOrMobile) {
            console.log('OTP sent to', emailOrMobile);
            setOtpSent(true);
        }
    };

    const handleVerifyOTP = () => {
        if (otp) {
            console.log('OTP verified', otp);
            setOtpVerified(true);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    sx={{ mb: 3, color: 'primary.main', fontWeight: 'medium' }}
                >
                    Reset Password
                </Typography>

                <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
                    Enter your credentials to continue
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="emailOrMobile"
                                label="Email Address or Mobile Number"
                                name="emailOrMobile"
                                autoComplete="email"
                                value={emailOrMobile}
                                onChange={(e) => setEmailOrMobile(e.target.value)}
                                placeholder="Enter your email or mobile number"
                                sx={{ mb: 2, bgcolor: 'rgba(255, 255, 200, 0.3)' }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSendOTP}
                                disabled={!emailOrMobile || otpVerified}
                                fullWidth
                                sx={{ height: '56px' }}
                            >
                                Send OTP
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="otp"
                                label="OTP"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP sent to email/mobile"
                                disabled={!otpSent || otpVerified}
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleVerifyOTP}
                                disabled={!otp || !otpSent || otpVerified}
                                fullWidth
                                sx={{ height: '56px' }}
                            >
                                Verify OTP
                            </Button>
                        </Grid>
                    </Grid>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="newPassword"
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!otpVerified}
                        sx={{ mb: 2, bgcolor: 'rgba(255, 255, 200, 0.3)' }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Remember me"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={!newPassword || !otpVerified}
                        sx={{
                            mt: 3,
                            mb: 2,
                            py: 1.5,
                            bgcolor: 'purple',
                            '&:hover': {
                                bgcolor: 'darkpurple',
                            },
                        }}
                    >
                        Reset Password
                    </Button>

                    <Typography variant="body2" align="center" sx={{ mt: 2, color: 'primary.main' }}>
                        Don&apos;t have an account? <Link to="/sign-up">Sign Up</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgetPassword;