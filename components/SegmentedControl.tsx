import React from 'react';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onValueChange: (value: T) => void;
}

const SegmentedControl = <T extends string>({ options, selectedValue, onValueChange }: SegmentedControlProps<T>) => (
  <div className="flex bg-light-surface dark:bg-dark-modal-bg p-1 rounded-full">
    {options.map(option => (
      <button
        key={option.value}
        onClick={() => onValueChange(option.value)}
        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-full transition-all duration-base active:scale-[0.97] ${
            selectedValue === option.value 
            ? 'bg-accent text-dark-bg shadow-elevation-md' 
            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;