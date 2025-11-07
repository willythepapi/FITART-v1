import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

interface AppTextFieldProps extends Omit<InputProps & TextareaProps, 'onChange'> {
  label?: string;
  multiline?: boolean;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AppTextField: React.FC<AppTextFieldProps> = ({ label, multiline = false, className, ...props }) => {
  const baseClasses = `w-full bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary px-4 py-3 rounded-radius-input focus:outline-none focus:ring-1 focus:ring-accent/20 transition-shadow duration-base ${className}`;
  
  const Component = multiline ? 'textarea' : 'input';

  return (
    <div>
      {label && <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ml-1">{label}</label>}
      <Component {...props} className={baseClasses} />
    </div>
  );
};

export default AppTextField;