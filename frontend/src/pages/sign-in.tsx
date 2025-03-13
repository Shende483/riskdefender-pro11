
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Grid,
  Paper,
  Button,
  Checkbox,
  Container,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  OutlinedInput,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { OTP_LENGTH, MOBILE_LENGTH, MAX_EMAIL_LENGTH } from '../layouts/Constant'; // Import LoginService
import LoginService from '../Services/LoginService';

interface UserCredentials {
  identifier: string;
  password: string;
  otp: string;
  rememberMe: boolean;
}

export default function Page() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserCredentials>({
    identifier: '',
    password: '',
    otp: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value,
    });
    validateField(name, name === 'rememberMe' ? checked : value);
  };

  const validateField = (name: string, value: any): boolean => {
    let isValid = true;
    const newErrors = { ...errors };
    switch (name) {
      case 'identifier':
        if (!value) {
          newErrors.identifier = 'Email or Mobile is required';
          isValid = false;
        } else if (/\S+@\S+\.\S+/.test(value) && value.length > MAX_EMAIL_LENGTH) {
          newErrors.identifier = 'Please enter a valid email address';
          isValid = false;
        } else if (/^\d+$/.test(value) && value.length !== MOBILE_LENGTH) {
          newErrors.identifier = 'Please enter a valid 10-digit mobile number';
          isValid = false;
        } else {
          delete newErrors.identifier;
        }
        break;
      case 'otp':
        if (otpSent) {
          if (!value) {
            newErrors.otp = 'OTP is required';
            isValid = false;
          } else if (!/^\d+$/.test(value) || value.length !== OTP_LENGTH) {
            newErrors.otp = 'Please enter a valid 6-digit OTP';
            isValid = false;
          } else {
            delete newErrors.otp;
          }
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
          isValid = false;
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSendOTP = async () => {
    if (validateField('identifier', formData.identifier)) {
      try {
        if (/\S+@\S+\.\S+/.test(formData.identifier)) {
          await LoginService.sendOtpEmail(formData.identifier);
        } else {
          await LoginService.sendOtpMobile(formData.identifier);
        }
        setOtpSent(true);
        startTimer();
      } catch (error) {
        setErrors({ ...errors, identifier: 'Failed to send OTP. Please try again.' });
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (validateField('otp', formData.otp)) {
      try {
        if (/\S+@\S+\.\S+/.test(formData.identifier)) {
          await LoginService.verifyOtpEmail(formData.identifier, formData.otp);
        } else {
          await LoginService.verifyOtpMobile(formData.identifier, formData.otp);
        }
        setOtpVerified(true);
      } catch (error) {
        setErrors({ ...errors, otp: 'Invalid OTP. Please try again.' });
      }
    }
  };

  const startTimer = () => {
    setTimer(300); // 5 minutes
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate all required fields
    const fieldsToValidate = ['identifier', 'password'];
    if (otpSent) fieldsToValidate.push('otp');

    fieldsToValidate.forEach((field) => {
      const value = field === 'rememberMe' ? formData.rememberMe : formData[field as keyof UserCredentials];
      if (!validateField(field, value)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      console.error('Form validation failed');
      return;
    }
  
    try {
      const loginUserDto = {
        email: /\S+@\S+\.\S+/.test(formData.identifier) ? formData.identifier : undefined,
        mobile: /^\d+$/.test(formData.identifier) ? formData.identifier : undefined,
        password: formData.password,
        otp: formData.otp,
      };
  
      const response = await LoginService.login(loginUserDto);
      console.log('Login successful:', response);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ ...errors, password: 'Invalid credentials. Please try again.' });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
          RiskdefenderAI.com
        </Typography>
        <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
          Hi, Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enter your credentials to continue
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <TextField
                variant="outlined"
                fullWidth
                id="identifier"
                label="Enter Email or Mobile"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                error={!!errors.identifier}
                helperText={errors.identifier}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendOTP}
                disabled={otpSent}
                fullWidth
                sx={{ height: '100%' }}
              >
                {otpSent ? `Resend (${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')})` : 'Send OTP'}
              </Button>
            </Grid>
            {otpSent && (
              <>
                <Grid item xs={9}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="otp"
                    label="Enter OTP"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    error={!!errors.otp}
                    helperText={errors.otp}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleVerifyOTP}
                    disabled={otpVerified}
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Verify
                  </Button>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  error={!!errors.password}
                />
                <FormHelperText error={!!errors.password}>{errors.password}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    name="rememberMe"
                    color="primary"
                  />
                }
                label="Remember me"
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
                Sign In
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don&apos;t have an account? <Link to="/sign-up">Sign Up</Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}