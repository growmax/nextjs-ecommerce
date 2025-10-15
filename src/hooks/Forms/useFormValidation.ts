"use client";

import { useState } from "react";

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone)
      ? null
      : "Phone number must be exactly 10 digits";
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const validateRequired = (value: string): string | null => {
    return value.trim() ? null : "This field is required";
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const validateOTP = (otp: string): string | null => {
    if (!otp) return "OTP is required";
    if (otp.length !== 6) return "OTP must be exactly 6 digits";
    return null;
  };

  const validateField = (
    fieldName: string,
    value: string,
    rules: ValidationRule
  ): string | null => {
    // Required validation
    if (rules.required && !value.trim()) {
      return "This field is required";
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rules.required) {
      return null;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `Invalid ${fieldName} format`;
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must not exceed ${rules.maxLength} characters`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  };

  const setFieldError = (fieldName: string, error: string | null) => {
    setErrors(prev => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string) => {
    setFieldError(fieldName, null);
  };

  const hasErrors = Object.keys(errors).length > 0;

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  return {
    errors,
    validatePhone,
    validateEmail,
    validateRequired,
    validatePassword,
    validateOTP,
    validateField,
    setFieldError,
    clearErrors,
    clearFieldError,
    hasErrors,
    getFieldError,
  };
}
