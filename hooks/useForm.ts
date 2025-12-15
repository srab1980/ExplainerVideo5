import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T) => (value: unknown) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  reset: () => void;
  validate: () => boolean;
}

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, validate, onSubmit } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    if (!validate) return true;
    
    const newErrors = validate(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validate]);

  const handleChange = useCallback((field: keyof T) => {
    return (value: unknown) => {
      setValues(prev => ({ ...prev, [field]: value }));
      
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
  }, [errors]);

  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({ ...prev, [field]: true }));
      
      // Validate field on blur if validation function exists
      if (validate) {
        const fieldErrors = validate({ ...values, [field]: values[field] });
        if (fieldErrors[field]) {
          setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
        }
      }
    };
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    try {
      const isValid = validateForm();
      
      if (isValid && onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when value changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, touchedValue = true) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Calculate if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    reset,
    validate: validateForm,
  };
}