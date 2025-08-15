export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

// Password validation function
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  // Password requirements:
  // 1. At least 6 characters
  // 2. At least one uppercase letter
  // 3. At least one lowercase letter
  // 4. At least one number
  // 5. At least one special character

  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }

  return {
    valid: true,
    message: "Password meets all requirements",
  };
};

// Helper function to detect private browsing mode
export const isPrivateBrowsingMode = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const yes = () => resolve(true);
    const no = () => resolve(false);

    // Try to use localStorage as a test (often disabled in private mode)
    try {
      const testKey = "test";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      no();
    } catch (e) {
      // If localStorage fails, it might be private mode
      yes();
    }
  });
};
