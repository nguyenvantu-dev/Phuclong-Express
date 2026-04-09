'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-cyan-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormInput({ label, error, hint, ...props }: FormInputProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={props.required}>
      <input
        {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-cyan-200 bg-white hover:border-cyan-300'
        }`}
      />
    </FormField>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  hint?: string;
}

export function FormSelect({ label, options, error, hint, ...props }: FormSelectProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={props.required}>
      <select
        {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-cyan-200 bg-white hover:border-cyan-300'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormTextarea({ label, error, hint, ...props }: FormTextareaProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={props.required}>
      <textarea
        {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
          error ? 'border-red-300 bg-red-50' : 'border-cyan-200 bg-white hover:border-cyan-300'
        }`}
      />
    </FormField>
  );
}
