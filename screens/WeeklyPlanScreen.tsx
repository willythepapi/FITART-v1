import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useWeeklyPlan } from '../application/hooks/useWeeklyHooks';
import AppCard from '../components/AppCard';
import Button from '../components/Button';
import type { WorkoutEntity } from '../domain/entities';

const WeeklyPlanScreen: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { t } = useLanguage();
    const { plan, workouts, isLoading, setWorkout, clearWorkout, refetch } = useWeeklyPlan();
    
    React.useEffect(() => {
        refetch();
    }, [refetch]);

    const days = [
        { id: 1, key: 'monday' }, { id: 2, key: 'tuesday' }, { id: 3, key: 'wednesday' },
        { id: 4, key: 'thursday' }, { id: 5, key: 'friday' }, { id: 6, key: 'saturday' },
        { id: 7, key: 'sunday' },
    ];
    
    // Fix: Add explicit types for sort parameters to resolve TypeScript error.
    const allWorkouts = useMemo(() => Object.values(workouts).sort((a: WorkoutEntity, b: WorkoutEntity) => a.name.localeCompare(b.name)), [workouts]);

    const handlePlanChange = (dayOfWeek: number, workoutId: string) => {
        if (workoutId === 'rest') {
            clearWorkout(dayOfWeek);
        } else {
            setWorkout(dayOfWeek, workoutId);
        }
    };

    return (
        <div className="p-5 space-y-6 animate-fadeInUp">
            <header className="flex justify-between items-center">
                <Button onClick={onClose} variant="ghost" shape="circle" iconOnly iconName="chevron-left" className="w-11 h-11" />
                <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-title">{t('workouts_weekly_plan_title')}</h1>
                <div className="w-11" /> {/* Spacer */}
            </header>

            {isLoading ? (
                <div className="text-center p-8 text-light-text-secondary dark:text-dark-text-secondary">{t('workouts_loading_plan')}</div>
            ) : (
                <div className="space-y-3">
                    {days.map((day, index) => {
                        const planForDay = plan.find(p => p.dayOfWeek === day.id);
                        const dayName = t(`workouts_day_${day.key}` as any);

                        return (
                            <AppCard key={day.id} className="flex items-center justify-between animate-fadeInUp" style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}>
                                <h4 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">{dayName}</h4>
                                <div className="relative">
                                    <select
                                        value={planForDay?.workoutId || 'rest'}
                                        onChange={(e) => handlePlanChange(day.id, e.target.value)}
                                        className="w-48 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary px-4 py-2.5 rounded-radius-input focus:outline-none focus:ring-1 focus:ring-accent/20 transition-shadow duration-base appearance-none text-sm font-semibold text-right pr-10"
                                        aria-label={`Workout for ${dayName}`}
                                    >
                                        <option value="rest">{t('workouts_rest_day')}</option>
                                        {allWorkouts.map(workout => (
                                            <option key={workout.id} value={workout.id}>
                                                {workout.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-light-text-secondary dark:text-dark-text-secondary">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </AppCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WeeklyPlanScreen;