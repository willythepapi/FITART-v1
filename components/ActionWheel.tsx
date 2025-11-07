
import React, { useState, useEffect } from 'react';

// Animation constants
const DURATION_MS = 220; // Corresponds to Tailwind's `duration-base`
const DISTANCE_PX = 80;

interface ActionWheelProps {
    isOpen: boolean;
    onClose: () => void;
    onLogMeal: () => void;
    onLogWorkout: () => void;
    onTrackProgress: () => void;
}

interface ActionButtonProps {
    icon: string;
    label: string;
    angle: number; // in degrees
    show: boolean;
    onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, angle, show, onClick }) => {
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * DISTANCE_PX;
    const y = Math.sin(radians) * DISTANCE_PX;

    const style: React.CSSProperties = {
        transition: `transform ${DURATION_MS}ms ease-out, opacity ${DURATION_MS}ms ease-out`,
        transform: show ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0, 0) scale(0.5)',
        opacity: show ? 1 : 0,
    };

    return (
        <div 
            className="absolute flex flex-col items-center"
            style={style}
        >
            <button 
                onClick={onClick}
                className="w-12 h-12 bg-dark-surface rounded-full flex items-center justify-center text-xl shadow-lg transition-transform hover:scale-110 active:scale-95"
            >
                {icon}
            </button>
            <span className="mt-2 text-xs text-white/65 font-semibold">{label}</span>
        </div>
    );
};

const ActionWheel: React.FC<ActionWheelProps> = ({ isOpen, onClose, onLogMeal, onLogWorkout, onTrackProgress }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => setIsRendered(false), DURATION_MS);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendered) return null;

    return (
        <div className="fixed inset-0 z-40">
            {/* Overlay */}
            <div 
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-base ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Wheel Container at FAB position */}
            <div 
                className="fixed bottom-[90px] left-1/2 -translate-x-1/2 flex items-center justify-center"
            >
                {/* Central Circle - animates behind buttons */}
                <div 
                    className={`w-14 h-14 bg-fab-bg backdrop-blur-[12px] rounded-full transition-transform duration-base ease-out ${isOpen ? 'scale-100' : 'scale-0'}`}
                />

                {/* Buttons */}
                <ActionButton icon="🍽️" label="Log Meal" angle={-90} show={isOpen} onClick={onLogMeal} />
                <ActionButton icon="🏋️" label="Workout" angle={150} show={isOpen} onClick={onLogWorkout} />
                <ActionButton icon="📸" label="Progress" angle={30} show={isOpen} onClick={onTrackProgress} />
            </div>
        </div>
    );
};

export default ActionWheel;
