// Email validation using regex
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

