// Email validation using regex
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (supports international formats)
export const isValidPhone = (phone) => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it's a valid phone number (7-15 digits is standard)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

// Check if input is email or phone
export const isEmailOrPhone = (input) => {
  if (!input) return { type: null, valid: false };
  
  if (isValidEmail(input)) {
    return { type: 'email', valid: true };
  }
  
  if (isValidPhone(input)) {
    return { type: 'phone', valid: true };
  }
  
  return { type: null, valid: false };
};

// Password validation - must contain:
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - At least 1 special character
// - Minimum 6 characters
export const isValidPassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('At least 6 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('One number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('One special character');
  }

  if (errors.length > 0) {
    const bulletPoints = errors.map(error => `• ${error}`).join('\n');
    return { 
      valid: false, 
      message: `Password must contain:\n${bulletPoints}` 
    };
  }

  return { valid: true, message: '' };
};

