import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useLanguage } from '../context/LanguageContext';

interface TimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (time: string) => void;
    initialTime: string; // "HH:mm"
    title: string;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({ isOpen, onClose, onSave, initialTime, title }) => {
    const { t } = useLanguage();
    const [hour, setHour] = useState('08');
    const [minute, setMinute] = useState('30');

    useEffect(() => {
        if (initialTime) {
            const [h, m] = initialTime.split(':');
            setHour(h || '08');
            setMinute(m || '30');
        }
    }, [initialTime, isOpen]);

    const handleSave = () => {
        onSave(`${hour}:${minute}`);
    };

    const footer = (
        <Button onClick={handleSave} className="w-full">
            {t('time_picker_save')}
        </Button>
    );

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);
    
    const selectClasses = "w-full bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary px-4 py-3 rounded-radius-input focus:outline-none focus:ring-1 focus:ring-accent/20 transition-shadow duration-base appearance-none text-center text-lg";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
            <div className="flex justify-center items-center gap-4">
                <div className="w-28">
                     <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ml-1 text-center">Hour</label>
                    <select value={hour} onChange={e => setHour(e.target.value)} className={selectClasses}>
                        {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div className="text-3xl font-semibold text-dark-text-secondary pb-1">:</div>
                <div className="w-28">
                     <label className="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 ml-1 text-center">Minute</label>
                    <select value={minute} onChange={e => setMinute(e.target.value)} className={selectClasses}>
                        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
        </Modal>
    );
};

export default TimePickerModal;