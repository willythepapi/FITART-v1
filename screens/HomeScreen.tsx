import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAppUseCases } from '../application/usecase-provider';
import type { UserEntity, WorkoutEntity, DailyProgressEntity, MealEntity } from '../domain/entities';
import Icon from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import AppCard from '../components/AppCard';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import { useTodayWorkout } from '../application/hooks/useWeeklyHooks';
import Button from '../components/Button';
import type { NavItem } from '../types';

// Helper function
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- New UI Components for HomeScreen ---

// Easing function for smooth animation
const easeOutQuad = (t: number) => t * (2 - t);

const DailyProgressRing: React.FC<{ percent: number }> = ({ percent }) => {
    const [displayPercent, setDisplayPercent] = useState(0);
    const prevPercentRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const animationDuration = 800; // ms
        let startTime: number | null = null;
        const startPercent = prevPercentRef.current;
        const endPercent = Math.min(Math.max(percent, 0), 100);

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const progressRatio = Math.min(progress / animationDuration, 1);
            const easedProgress = easeOutQuad(progressRatio);
            const currentPercent = startPercent + (endPercent - startPercent) * easedProgress;
            
            setDisplayPercent(currentPercent);

            if (progress < animationDuration) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                prevPercentRef.current = endPercent;
            }
        };

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            prevPercentRef.current = endPercent;
        };
    }, [percent]);

    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (displayPercent / 100) * circumference;
    const size = radius * 2;

    return (
        <div className="flex justify-center items-center">
            <div className="relative animate-breathing-glow rounded-full" style={{ width: size, height: size }}>
                <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <defs>
                        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#7FB7FF', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#9DC8FF', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <circle
                        className="text-dark-surface"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="url(#glowGradient)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-dark-text-primary tracking-tight">
                        {Math.round(displayPercent)}%
                    </span>
                    <span className="text-xs font-medium text-dark-text-secondary px-4 mt-1">
                        Small steps every day.
                    </span>
                </div>
            </div>
        </div>
    );
};


const DailyMacrosCard: React.FC<{
    progress: DailyProgressEntity | null;
    user: UserEntity | null;
    meals: MealEntity[];
    onViewMeals: () => void;
}> = ({ progress, user, meals, onViewMeals }) => {
    const calories = progress?.caloriesEaten ?? 0;
    const calorieGoal = user?.calorieGoal ?? 0;
    const remaining = Math.max(0, calorieGoal - calories);

    const macroTotals = useMemo(() => {
        return meals.reduce((acc, meal) => {
            acc.protein += meal.protein;
            acc.carbs += meal.carbs;
            acc.fat += meal.fat;
            return acc;
        }, { protein: 0, carbs: 0, fat: 0 });
    }, [meals]);

    return (
        <AppCard>
            <div className="flex justify-around items-center pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                    <div>
                        <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{Math.round(macroTotals.protein)}g</p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Protein</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-macro-carbs" />
                    <div>
                        <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{Math.round(macroTotals.carbs)}g</p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Carbs</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-macro-fat" />
                    <div>
                        <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{Math.round(macroTotals.fat)}g</p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Fat</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center">
                 <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Remaining: <span className="font-bold text-accent">{Math.round(remaining)}</span>
                 </p>
                 <button onClick={onViewMeals} className="text-sm font-semibold text-accent hover:text-accent-dark">
                    View Meals &rarr;
                </button>
            </div>
        </AppCard>
    );
};

// --- Main HomeScreen Component ---

interface HomeScreenProps {
  setActiveTab: (tab: NavItem) => void;
  onViewMeals: () => void;
  dataVersion: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab, onViewMeals, dataVersion }) => {
    const [user, setUser] = useState<UserEntity | null>(null);
    const [todaysMeals, setTodaysMeals] = useState<MealEntity[]>([]);
    const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntity | null>(null);
    const [dailyProgress, setDailyProgress] = useState<DailyProgressEntity | null>(null);
    const { getUserProfile, getDailyProgress, getMealsByDate } = useAppUseCases();
    const { t } = useLanguage();
    const { workout: todayWorkout, isLoading: isWorkoutLoading } = useTodayWorkout();

    const fetchData = useCallback(async () => {
        const today = getTodayDateString();
        const [
            userProfile, 
            dailyProgressData,
            mealsData,
        ] = await Promise.all([
            getUserProfile.execute(),
            getDailyProgress.execute(today),
            getMealsByDate.execute(today),
        ]);
        setUser(userProfile);
        setDailyProgress(dailyProgressData);
        setTodaysMeals(mealsData);
    }, [getUserProfile, getDailyProgress, getMealsByDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData, dataVersion]);

    const progressPercent = useMemo(() => {
        if (!dailyProgress || !user || !user.calorieGoal || user.calorieGoal === 0) return 0;
        return (dailyProgress.caloriesEaten / user.calorieGoal) * 100;
    }, [dailyProgress, user]);

    if (!user) {
        return <div className="p-5 text-center">{t('home_loading')}</div>;
    }
    
    return (
        <div className="min-h-screen">
            <div className="px-[22px] pt-[22px] pb-32 space-y-6">
                <header className="animate-fadeInUp">
                    <h1 className="text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-display">{t('nav_home')}</h1>
                </header>
                
                <div className="animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
                    <DailyProgressRing percent={progressPercent} />
                </div>
                
                <section className="animate-fadeInUp" style={{ animationDelay: '300ms', opacity: 0 }}>
                    <h2 className="font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-wide uppercase text-sm mb-3">{t('home_todays_workout')}</h2>
                    {isWorkoutLoading ? (
                        <AppCard><div className="h-20 animate-pulse bg-light-surface dark:bg-dark-surface rounded-md"></div></AppCard>
                    ) : todayWorkout ? (
                        <AppCard>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">{todayWorkout.name}</h3>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{t('workouts_exercises_count', { count: todayWorkout.exercises.length })}</p>
                                </div>
                                <Button onClick={() => setSelectedWorkout(todayWorkout)} shape="pill" className="h-11 px-5 text-sm">Start</Button>
                            </div>
                        </AppCard>
                    ) : (
                        <AppCard className="text-center">
                            <p className="font-medium text-light-text-primary dark:text-dark-text-primary">No workout scheduled today.</p>
                            <button onClick={() => setActiveTab('Workouts')} className="text-sm font-semibold text-accent hover:text-accent-dark mt-2">
                                Plan Workout &rarr;
                            </button>
                        </AppCard>
                    )}
                </section>
                
                <section className="animate-fadeInUp" style={{ animationDelay: '400ms', opacity: 0 }}>
                    <h2 className="font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-wide uppercase text-sm mb-3">Daily Macros</h2>
                    <DailyMacrosCard progress={dailyProgress} user={user} meals={todaysMeals} onViewMeals={onViewMeals} />
                </section>
            </div>
            
            <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />

        </div>
    );
};

export default HomeScreen;
