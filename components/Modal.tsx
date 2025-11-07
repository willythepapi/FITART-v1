import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
  hideHeader?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className = '', hideHeader = false, footer }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/55 z-50 flex justify-center items-end animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[rgba(20,23,26,0.85)] backdrop-blur-md rounded-t-radius-modal border border-dark-border shadow-elevation-lg flex flex-col max-h-[80vh] animate-fadeScaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <header className="relative flex justify-center items-center p-4 flex-shrink-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-dark-border rounded-full" />
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-title text-center">{title}</h2>
            <Button onClick={onClose} variant="ghost" shape="circle" iconOnly iconName="close" className="!absolute top-3 right-3 w-11 h-11" />
          </header>
        )}
        <div className={`overflow-y-auto overscroll-contain px-[22px] pt-7 pb-8 ${className}`}>
          {children}
        </div>
        {footer && (
            <footer className="p-4 border-t border-modal-border flex-shrink-0">
                {footer}
            </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;