import React from 'react';
import type { WorkoutEntity } from '../domain/entities';
import AppCard from './AppCard';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from '../context/LanguageContext';

interface WorkoutCardProps {
    workout: WorkoutEntity;
    onComplete: (id: string) => void;
    isCompleted: boolean;
    onViewDetails: (workout: WorkoutEntity) => void;
    onEdit: (workout: WorkoutEntity) => void;
}

const MINUTES_PER_SET = 2; // Assuming ~1 min work, 1 min rest
const WARMUP_COOLDOWN_MINS = 5;

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onComplete, isCompleted, onViewDetails, onEdit }) => {
    const { t } = useLanguage();
    
    const estTime = workout.exercises.reduce((total, ex) => total + (ex.sets * MINUTES_PER_SET), WARMUP_COOLDOWN_MINS);

    return (
        <AppCard 
            className="flex flex-col justify-between transition-transform duration-micro active:scale-[0.97] cursor-pointer bg-light-card dark:bg-dark-surface h-full"
            onClick={() => onViewDetails(workout)}
        >
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight pr-2 mb-1">{workout.name}</h3>
                <p className="text-sm font-semibold text-accent mb-4">{workout.category}</p>
                
                <div className="flex items-center gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <div className="flex items-center gap-1.5">
                        <Icon name="clock" className="w-4 h-4" />
                        <span className="font-medium">~{estTime} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Icon name="dumbbell" className="w-4 h-4" />
                        <span className="font-medium">{workout.exercises.length} {t('workouts_form_exercises')}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-[18px]">
                <Button
                    onClick={(e) => { e.stopPropagation(); onComplete(workout.id); }}
                    disabled={isCompleted}
                    variant={isCompleted ? 'primary' : 'ghost'}
                    iconName={isCompleted ? 'check' : undefined}
                    className="w-full text-sm py-2.5"
                >
                    {isCompleted ? t('workouts_completed') : t('workouts_mark_complete')}
                </Button>
                <Button 
                    onClick={(e) => { e.stopPropagation(); onEdit(workout); }} 
                    variant="ghost" 
                    shape="circle" 
                    iconOnly 
                    iconName="pencil" 
                    className="w-11 h-11 p-1.5 flex-shrink-0"
                />
            </div>
        </AppCard>
    );
};

export default WorkoutCard;