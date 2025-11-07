import { useState, useEffect, useCallback } from 'react';
import { useAppUseCases } from '../usecase-provider';
import type { WeeklyWorkoutPlanEntity, WorkoutEntity } from '../../domain/entities';

// This hook fulfills the "getWeeklyPlanProvider" and "setWeeklyWorkoutForDayProvider" request
export const useWeeklyPlan = () => {
    const [plan, setPlan] = useState<WeeklyWorkoutPlanEntity[]>([]);
    const [workouts, setWorkouts] = useState<Record<string, WorkoutEntity>>({});
    const [isLoading, setIsLoading] = useState(true);
    const { getWeeklyPlan, getWorkouts, setWeeklyWorkoutForDay, clearWeeklyWorkoutForDay } = useAppUseCases();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [planData, allWorkouts] = await Promise.all([
                getWeeklyPlan.execute(),
                getWorkouts.execute()
            ]);
            setPlan(planData);
            const workoutMap = allWorkouts.reduce((acc, workout) => {
                acc[workout.id] = workout;
                return acc;
            }, {} as Record<string, WorkoutEntity>);
            setWorkouts(workoutMap);
        } catch(e) {
            console.error("Failed to fetch weekly plan", e);
        } finally {
            setIsLoading(false);
        }
    }, [getWeeklyPlan, getWorkouts]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setWorkout = async (dayOfWeek: number, workoutId: string) => {
        await setWeeklyWorkoutForDay.execute({ dayOfWeek, workoutId });
        // Refetch plan data without triggering global loading state for smoother UX
        const planData = await getWeeklyPlan.execute();
        setPlan(planData);
    };
    
    const clearWorkout = async (dayOfWeek: number) => {
        await clearWeeklyWorkoutForDay.execute(dayOfWeek);
        // Refetch plan data without triggering global loading state for smoother UX
        const planData = await getWeeklyPlan.execute();
        setPlan(planData);
    };

    return { plan, workouts, isLoading, setWorkout, clearWorkout, refetch: fetchData };
};

// This hook fulfills the "getTodayWorkoutProvider" request
export const useTodayWorkout = () => {
    const [workout, setWorkout] = useState<WorkoutEntity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { getTodayWorkout } = useAppUseCases();

    const fetchTodayWorkout = useCallback(async () => {
        setIsLoading(true);
        try {
            const todayWorkout = await getTodayWorkout.execute();
            setWorkout(todayWorkout);
        } catch (e) {
            console.error("Failed to fetch today's workout", e);
        } finally {
            setIsLoading(false);
        }
    }, [getTodayWorkout]);

    useEffect(() => {
        fetchTodayWorkout();
    }, [fetchTodayWorkout]);

    return { workout, isLoading, refetch: fetchTodayWorkout };
}