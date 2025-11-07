import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import AppTextField from './AppTextField';
import { useAppUseCases } from '../application/usecase-provider';
import type { WorkoutEntity } from '../domain/entities';
import Icon from './Icon';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (workoutId: string) => void;
}

const WorkoutSelectorModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
    const { t } = useLanguage();
    const [workouts, setWorkouts] = useState<WorkoutEntity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { getWorkouts } = useAppUseCases();

    useEffect(() => {
        if (isOpen) {
            getWorkouts.execute().then(setWorkouts);
        } else {
            // Clear search term when modal closes for better UX
            setSearchTerm('');
        }
    }, [isOpen, getWorkouts]);

    const filteredWorkouts = useMemo(() => 
        workouts.filter(w => 
            w.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [workouts, searchTerm]);

    const handleSelect = (workoutId: string) => {
        onSelect(workoutId);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('workouts_selector_title')}>
            <AppTextField
                placeholder={t('workouts_selector_search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <ul className="mt-4 space-y-2 max-h-[50vh] sm:max-h-80 overflow-y-auto -mr-3 pr-2">
                {filteredWorkouts.length > 0 ? (
                    filteredWorkouts.map((workout, index) => (
                        <li key={workout.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 40}ms`, opacity: 0 }}>
                            <button
                                className="w-full text-left p-4 rounded-radius-sm transition-colors duration-fast bg-light-bg dark:bg-dark-bg hover:bg-light-surface dark:hover:bg-dark-surface flex justify-between items-center"
                                onClick={() => handleSelect(workout.id)}
                            >
                                <div className="flex-1 pr-2">
                                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{workout.name}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{t('workouts_exercises_count', { count: workout.exercises.length })}</p>
                                </div>
                                <Icon name="plus" className="w-5 h-5 text-accent flex-shrink-0"/>
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-8">{t('workouts_selector_empty')}</p>
                )}
            </ul>
        </Modal>
    );
};

export default WorkoutSelectorModal;
