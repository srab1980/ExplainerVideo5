'use client';

import React from 'react';
import Image from 'next/image';
import { CardProps } from '@/types';

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  image,
  imageAlt,
  footer,
  'data-testid': testId,
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden';
  const classes = `${baseClasses} ${className}`;

  return (
    <div className={classes} data-testid={testId}>
      {image && (
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={imageAlt || title || 'Card image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};