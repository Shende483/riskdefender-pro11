import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material';
import {
    Box,
    Grid,
    Paper,
    Button,
    Select,
    Checkbox,
    MenuItem,
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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { COUNTRIES, OTP_LENGTH, MOBILE_LENGTH, MAX_EMAIL_LENGTH } from '../layouts/Constant';
import {
    sendOtpEmail,
    sendOtpMobile,
    verifyOtpEmail,
    verifyOtpMobile,
    registerUser,
} from '../Apis/AuthApi/registerApi';

interface UserCredentials {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    password: string;
    emailOtp: string;
    mobileOtp: string;
    country: string;
    countryCode: string;
    agreeTnC: boolean;
}

export default function ProfileUpdate() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<UserCredentials>({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        emailOtp: '',
        mobileOtp: '',
        country: 'in',
        countryCode: '+91',
        agreeTnC: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [emailVerified, setEmailVerified] = useState<boolean>(false);
    const [mobileSent, setMobileSent] = useState<boolean>(false);
    const [mobileVerified, setMobileVerified] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'agreeTnC' ? checked : value,
        }));

        validateField(name, name === 'agreeTnC' ? checked : value);
    };

    const handleCountryChange = (event: SelectChangeEvent<string>) => {
        const countryValue = event.target.value as string;
        const selectedCountry = COUNTRIES.find((country) => country.value === countryValue);

        setFormData((prevData) => ({
            ...prevData,
            country: countryValue,
            countryCode: selectedCountry?.code || '+91',
        }));
    };

    const validateField = (name: string, value: any): boolean => {
        let isValid = true;
        const newErrors = { ...errors };

        switch (name) {
            case 'firstName':
                if (!value || value.trim() === '') {
                    newErrors.firstName = 'First name is required';
                    isValid = false;
                } else {
                    delete newErrors.firstName;
                }
                break;

            case 'lastName':
                if (!value || value.trim() === '') {
                    newErrors.lastName = 'Last name is required';
                    isValid = false;
                } else {
                    delete newErrors.lastName;
                }
                break;

            case 'email':
                if (!value) {
                    newErrors.email = 'Email is required';
                    isValid = false;
                } else if (!/\S+@\S+\.\S+/.test(value) || value.length > MAX_EMAIL_LENGTH) {
                    newErrors.email = 'Please enter a valid email address';
                    isValid = false;
                } else {
                    delete newErrors.email;
                }
                break;

            case 'mobile':
                if (!value) {
                    newErrors.mobile = 'Mobile number is required';
                    isValid = false;
                } else if (!/^\d+$/.test(value) || value.length !== MOBILE_LENGTH) {
                    newErrors.mobile = 'Please enter a valid 10-digit mobile number';
                    isValid = false;
                } else {
                    delete newErrors.mobile;
                }
                break;

            case 'emailOtp':
                if (!value) {
                    newErrors.emailOtp = 'Email OTP is required';
                    isValid = false;
                } else if (!/^\d+$/.test(value) || value.length !== OTP_LENGTH) {
                    newErrors.emailOtp = 'Please enter a valid 6-digit OTP';
                    isValid = false;
                } else {
                    delete newErrors.emailOtp;
                }
                break;

            case 'mobileOtp':
                if (!value) {
                    newErrors.mobileOtp = 'Mobile OTP is required';
                    isValid = false;
                } else if (!/^\d+$/.test(value) || value.length !== OTP_LENGTH) {
                    newErrors.mobileOtp = 'Please enter a valid 6-digit OTP';
                    isValid = false;
                } else {
                    delete newErrors.mobileOtp;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                    isValid = false;
                } else if (value.length < 8) {
                    newErrors.password = 'Password must be at least 8 characters';
                    isValid = false;
                } else {
                    delete newErrors.password;
                }
                break;

            case 'agreeTnC':
                if (!value) {
                    newErrors.agreeTnC = 'You must agree to Terms & Conditions';
                    isValid = false;
                } else {
                    delete newErrors.agreeTnC;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return isValid;
    };

    const validateForm = (): boolean => {
        let isValid = true;

        const fieldsToValidate = ['firstName', 'lastName', 'email', 'mobile', 'password', 'agreeTnC'];

        if (emailSent) fieldsToValidate.push('emailOtp');
        if (mobileSent) fieldsToValidate.push('mobileOtp');

        fieldsToValidate.forEach((field) => {
            const value = field === 'agreeTnC' ? formData.agreeTnC : formData[field as keyof UserCredentials];
            if (!validateField(field, value)) {
                isValid = false;
            }
        });

        return isValid;
    };

    const handleSendEmailOTP = async () => {
        if (validateField('email', formData.email)) {
            try {
                const response = await sendOtpEmail(formData.email);
                console.log('Email OTP sent:', response);
                setEmailSent(true);
                startTimer();
            } catch (error) {
                console.error('Error sending email OTP:', error);
                setErrors({ ...errors, email: 'Failed to send OTP. Please try again.' });
            }
        }
    };

    const handleVerifyEmailOTP = async () => {
        if (validateField('emailOtp', formData.emailOtp)) {
            try {
                const response = await verifyOtpEmail(formData.email, formData.emailOtp);
                console.log('Email OTP verified:', response);
                setEmailVerified(true);
            } catch (error) {
                console.error('Error verifying email OTP:', error);
                setErrors({ ...errors, emailOtp: 'Invalid OTP. Please try again.' });
            }
        }
    };

    const handleSendMobileOTP = async () => {
        if (validateField('mobile', formData.mobile)) {
            try {
                const response = await sendOtpMobile(formData.mobile);
                console.log('Mobile OTP sent:', response);
                setMobileSent(true);
                startTimer();
            } catch (error) {
                console.error('Error sending mobile OTP:', error);
                setErrors({ ...errors, mobile: 'Failed to send OTP. Please try again.' });
            }
        }
    };

    const handleVerifyMobileOTP = async () => {
        if (validateField('mobileOtp', formData.mobileOtp)) {
            try {
                const response = await verifyOtpMobile(formData.mobile, formData.mobileOtp);
                console.log('Mobile OTP verified:', response);
                setMobileVerified(true);
            } catch (error) {
                console.error('Error verifying mobile OTP:', error);
                setErrors({ ...errors, mobileOtp: 'Invalid OTP. Please try again.' });
            }
        }
    };

    const startTimer = () => {
        setTimer(300);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                const createUserDto = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    mobile: formData.mobile,
                    password: formData.password,
                    country: formData.country,
                    countryCode: formData.countryCode,
                    agreeTnC: formData.agreeTnC,
                };

                const response = await registerUser(createUserDto);
                console.log('User registered:', response);

                alert('Account created successfully!');
                navigate('/sign-in');
            } catch (error) {
                console.error('Error registering user:', error);
                alert('Registration failed. Please try again.');
            }
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: 8,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
            >
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                    RiskdefenderAI.com
                </Typography>

                <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                    Update Profile
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Enter your credentials to continue
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="firstName"
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}
                            />
                        </Grid>

                        <Grid item xs={9}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="email"
                                label="Enter Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={emailVerified}
                                sx={{
                                    bgcolor: emailVerified ? '#fff' : '#fffde7',
                                    borderRadius: 1,
                                    '& input': {
                                        textAlign: 'center',
                                        letterSpacing: '1px',
                                    },
                                }}
                                inputProps={{
                                    maxLength: MAX_EMAIL_LENGTH,
                                    placeholder: 'example@gmail.com',
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={handleSendEmailOTP}
                                disabled={emailVerified || timer > 0 || !formData.email}
                                sx={{ height: '56px' }}
                            >
                                {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Send OTP'}
                            </Button>
                        </Grid>

                        <Grid item xs={9}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="emailOtp"
                                label="Enter Email OTP"
                                name="emailOtp"
                                value={formData.emailOtp}
                                onChange={handleChange}
                                error={!!errors.emailOtp}
                                helperText={errors.emailOtp}
                                disabled={!emailSent || emailVerified}
                                sx={{
                                    bgcolor: '#f9f9f9',
                                    borderRadius: 1,
                                    '& input': {
                                        textAlign: 'center',
                                        letterSpacing: '9px',
                                    },
                                }}
                                inputProps={{
                                    maxLength: OTP_LENGTH,
                                    placeholder: '_ _ _ _ _ _',
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={handleVerifyEmailOTP}
                                disabled={!emailSent || emailVerified || !formData.emailOtp}
                                sx={{ height: '56px' }}
                            >
                                Verify OTP
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Select Country</InputLabel>
                                <Select
                                    value={formData.country}
                                    onChange={handleCountryChange}
                                    input={<OutlinedInput label="Select Country" />}
                                    sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}
                                >
                                    {COUNTRIES.map((country) => (
                                        <MenuItem key={country.value} value={country.value}>
                                            {country.flag} {country.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={9}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="mobile"
                                label="Enter Mobile Number"
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={!!errors.mobile}
                                helperText={errors.mobile}
                                disabled={mobileVerified}
                                sx={{
                                    bgcolor: mobileVerified ? '#fff' : '#f9f9f9',
                                    borderRadius: 1,
                                    '& input': {
                                        textAlign: 'center',
                                        letterSpacing: '7px',
                                    },
                                }}
                                inputProps={{
                                    maxLength: MOBILE_LENGTH,
                                    pattern: '\\d*',
                                    placeholder: '9556xxx567',
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={handleSendMobileOTP}
                                disabled={mobileVerified || timer > 0 || !formData.mobile}
                                sx={{ height: '56px' }}
                            >
                                {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Send OTP'}
                            </Button>
                        </Grid>

                        <Grid item xs={9}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="mobileOtp"
                                label="Enter Mobile OTP"
                                name="mobileOtp"
                                value={formData.mobileOtp}
                                onChange={handleChange}
                                error={!!errors.mobileOtp}
                                helperText={errors.mobileOtp}
                                disabled={!mobileSent || mobileVerified}
                                sx={{
                                    bgcolor: '#f9f9f9',
                                    borderRadius: 1,
                                    '& input': {
                                        textAlign: 'center',
                                        letterSpacing: '9px',
                                    },
                                }}
                                inputProps={{
                                    maxLength: OTP_LENGTH,
                                    pattern: '\\d*',
                                    placeholder: '_ _ _ _ _ _',
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={handleVerifyMobileOTP}
                                disabled={!mobileSent || mobileVerified || !formData.mobileOtp}
                                sx={{ height: '56px' }}
                            >
                                Verify OTP
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel htmlFor="password">Enter Password</InputLabel>
                                <OutlinedInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Enter Password"
                                    sx={{
                                        bgcolor: '#fffde7',
                                        borderRadius: 1,
                                        '& input': {
                                            textAlign: 'center',
                                            letterSpacing: '2px',
                                        },
                                    }}
                                />
                                {errors.password && (
                                    <FormHelperText error>{errors.password}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="agreeTnC"
                                        color="primary"
                                        checked={formData.agreeTnC}
                                        onChange={handleChange}
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        I Agree with{' '}
                                        <Link to="#" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                                            Terms & Conditions.
                                        </Link>
                                    </Typography>
                                }
                            />
                            {errors.agreeTnC && (
                                <FormHelperText error>{errors.agreeTnC}</FormHelperText>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{
                                    mt: 1,
                                    mb: 2,
                                    height: '48px',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    textTransform: 'none',
                                }}
                            >
                                Update Profile
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}