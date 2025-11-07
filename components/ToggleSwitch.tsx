import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, description }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  const hasLabel = label || description;

  return (
    <div className={`flex items-center ${hasLabel ? 'justify-between' : 'justify-center'}`}>
        {hasLabel && (
            <div className="flex-1 pr-4">
                {label && <span className="text-light-text-primary dark:text-dark-text-primary font-semibold">{label}</span>}
                {description && <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{description}</p>}
            </div>
        )}
        <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex items-center h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-base ease-out-expo focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-dark-card ${
                checked ? 'bg-accent' : 'bg-light-surface dark:bg-dark-modal-bg'
            }`}
            role="switch"
            aria-checked={checked}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-base ease-out-expo ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </div>
  );
};

export default ToggleSwitch;