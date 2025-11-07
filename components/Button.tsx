import React from 'react';
import Icon from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'danger';
    shape?: 'default' | 'pill' | 'circle';
    iconName?: React.ComponentProps<typeof Icon>['name'];
    iconOnly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    shape = 'default',
    iconName,
    iconOnly = false,
    ...props
}) => {
    const baseClasses = 'font-semibold transition-all duration-base inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/80 dark:focus:ring-offset-dark-bg active:scale-[0.97]';

    const variantClasses = {
        primary: 'bg-accent text-dark-bg hover:bg-accent-dark shadow-elevation-md hover:shadow-elevation-lg',
        ghost: 'bg-transparent border border-accent-translucent text-accent hover:bg-accent/[.12]',
        danger: 'bg-danger text-white hover:bg-danger-dark shadow-elevation-md hover:shadow-elevation-lg',
    };

    const shapeClasses = {
        default: iconOnly ? 'w-[52px]' : 'px-6',
        pill: iconOnly ? 'w-[52px]' : 'px-6',
        circle: 'w-[52px]',
    };

    const radiusClasses = {
        default: 'rounded-radius-btn',
        pill: 'rounded-full',
        circle: 'rounded-full',
    }

    const iconSize = iconOnly ? 'w-6 h-6' : 'w-5 h-5';
    
    // The h-[52px] class sets the standard height for action buttons.
    // Explicit height/width classes in `className` prop can override this for special cases.
    return (
        <button
            {...props}
            className={`${baseClasses} h-[52px] ${variantClasses[variant]} ${shapeClasses[shape]} ${radiusClasses[shape]} ${className}`}
        >
            {iconName && <Icon name={iconName} className={iconSize} />}
            {!iconOnly && children}
        </button>
    );
};

export default Button;