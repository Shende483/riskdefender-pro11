// src/services/api.ts



  const API_BASE_URL = `http://${import.meta.env.VITE_BACKEND_IP}:${import.meta.env.VITE_BACKEND_PORT}`;
  
/**
 * Send OTP to the provided email
 * @param email - User's email address
 */
export const sendOtpEmail = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to send OTP to email.');
  }

  return response.json();
};

/**
 * Send OTP to the provided mobile number
 * @param mobileNo - User's mobile number
 */
export const sendOtpMobile = async (mobileNo: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/verify-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: mobileNo }),
  });

  if (!response.ok) {
    throw new Error('Failed to send OTP to mobile.');
  }

  return response.json();
};

/**
 * Verify the OTP sent to the email
 * @param email - User's email address
 * @param otp - OTP entered by the user
 */
export const verifyOtpEmail = async (email: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/verify-otp-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify email OTP.');
  }

  return response.json();
};

/**
 * Verify the OTP sent to the mobile number
 * @param mobile - User's mobile number
 * @param otp - OTP entered by the user
 */
export const verifyOtpMobile = async (mobile: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/verify-otp-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify mobile OTP.');
  }

  return response.json();
};

/**
 * Register a new user
 * @param createUserDto - User registration data
 */
export const registerUser = async (createUserDto: {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  country: string;
  countryCode: string;
  agreeTnC: boolean;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createUserDto),
  });

  if (!response.ok) {
    throw new Error('Failed to register user.');
  }

  return response.json();
};