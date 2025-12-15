import React from 'react';
import { InputProps } from '@/types';

export const Input: React.FC<InputProps> = ({
  className = '',
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  error,
  required = false,
  label,
  onChange,
  onFocus,
  onBlur,
  'data-testid': testId,
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400';
    
  const darkClasses = 'dark:bg-gray-800 dark:text-white dark:placeholder-gray-400';
  
  const classes = `${baseClasses} ${variants} ${darkClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={classes}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        data-testid={testId}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};