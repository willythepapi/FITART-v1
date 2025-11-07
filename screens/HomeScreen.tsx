import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { styled } from 'nativewind';
import { useAppUseCases } from '../application/usecase-provider';
import type { UserEntity, WorkoutEntity, DailyProgressEntity, MealEntity } from '../domain/entities';
import Icon from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';
import AppCard from '../components/AppCard';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import { useTodayWorkout } from '../application/hooks/useWeeklyHooks';
import Button from '../components/Button';
import type { NavItem } from '../types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

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
        <StyledView className="flex justify-center items-center">
            <StyledView className="relative" style={{ width: size, height: size }}>
                <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }]}}>
                    <Defs>
                        <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#7FB7FF" />
                            <Stop offset="100%" stopColor="#9DC8FF" />
                        </LinearGradient>
                    </Defs>
                    <Circle
                        stroke="rgba(26, 29, 33, 1)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <Circle
                        stroke="url(#glowGradient)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </Svg>
                <StyledView className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <StyledText className="text-2xl font-bold text-dark-text-primary tracking-tight">
                        {Math.round(displayPercent)}%
                    </StyledText>
                    <StyledText className="text-xs font-medium text-dark-text-secondary px-4 mt-1">
                        Small steps every day.
                    </StyledText>
                </StyledView>
            </StyledView>
        </StyledView>
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
            <StyledView className="flex-row justify-around items-center pt-2">
                <StyledView className="flex-row items-center gap-2">
                    <StyledView className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                    <StyledView>
                        <StyledText className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{Math.round(macroTotals.protein)}g</StyledText>
                        <StyledText className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Protein</StyledText>
                    </StyledView>
                </StyledView>
                <StyledView className="flex-row items-center gap-2">
                    <StyledView className="w-2.5 h-2.5 rounded-full bg-macro-carbs" />
                    <StyledView>
                        <StyledText className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{Math.round(macroTotals.carbs)}g</StyledText>
                        <StyledText className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Carbs</StyledText>
                    </StyledView>
                </StyledView>
                <StyledView className="flex-row items-center gap-2">
                    <StyledView className="w-2.5 h-2.5 rounded-full bg-macro-fat" />
                    <StyledView>
                        <StyledText className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{Math.round(macroTotals.fat)}g</StyledText>
                        <StyledText className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Fat</StyledText>
                    </StyledView>
                </StyledView>
            </StyledView>
            <StyledView className="mt-4 pt-4 border-t border-dark-border flex-row justify-between items-center">
                 <StyledText className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Remaining: <StyledText className="font-bold text-accent">{Math.round(remaining)}</StyledText>
                 </StyledText>
                 <StyledTouchableOpacity onPress={onViewMeals}>
                    <StyledText className="text-sm font-semibold text-accent">
                        View Meals &rarr;
                    </StyledText>
                </StyledTouchableOpacity>
            </StyledView>
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
        return <StyledView className="p-5 items-center justify-center"><StyledText className="text-dark-text-primary">{t('home_loading')}</StyledText></StyledView>;
    }
    
    return (
        <StyledView className="min-h-screen">
            <StyledView className="px-[22px] pt-[22px] pb-32 space-y-6">
                <StyledView>
                    <StyledText className="text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-display">{t('nav_home')}</StyledText>
                </StyledView>
                
                <StyledView>
                    <DailyProgressRing percent={progressPercent} />
                </StyledView>
                
                <StyledView className="space-y-3">
                    <StyledText className="font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-wide uppercase text-sm">{t('home_todays_workout')}</StyledText>
                    {isWorkoutLoading ? (
                        <AppCard><StyledView className="h-20 bg-light-surface dark:bg-dark-surface rounded-md"></StyledView></AppCard>
                    ) : todayWorkout ? (
                        <AppCard>
                            <StyledView className="flex-row justify-between items-center">
                                <StyledView>
                                    <StyledText className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">{todayWorkout.name}</StyledText>
                                    <StyledText className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{t('workouts_exercises_count', { count: todayWorkout.exercises.length })}</StyledText>
                                </StyledView>
                                {/* Fix: Changed onPress to onClick to match the Button component's expected props. */}
                                <Button onClick={() => setSelectedWorkout(todayWorkout)} shape="pill" className="h-11 px-5 text-sm">Start</Button>
                            </StyledView>
                        </AppCard>
                    ) : (
                        <AppCard className="items-center">
                            <StyledText className="font-medium text-light-text-primary dark:text-dark-text-primary">No workout scheduled today.</StyledText>
                            <StyledTouchableOpacity onPress={() => setActiveTab('Workouts')} className="mt-2">
                                <StyledText className="text-sm font-semibold text-accent">
                                    Plan Workout &rarr;
                                </StyledText>
                            </StyledTouchableOpacity>
                        </AppCard>
                    )}
                </StyledView>
                
                <StyledView className="space-y-3">
                    <StyledText className="font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-wide uppercase text-sm">Daily Macros</StyledText>
                    <DailyMacrosCard progress={dailyProgress} user={user} meals={todaysMeals} onViewMeals={onViewMeals} />
                </StyledView>
            </StyledView>
            
            <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />

        </StyledView>
    );
};

export default HomeScreen;