// utils/passwordValidator.js

export const validatePassword = (password) => {
    // Regular Expression for strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!password) {
        return { isValid: false, message: "Password is required." };
    }

    if (!strongPasswordRegex.test(password)) {
        return {
            isValid: false,
            message: "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
        };
    }

    return { isValid: true, message: "Password is valid and strong." };
};