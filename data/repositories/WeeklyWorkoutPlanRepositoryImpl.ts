
import type { WeeklyWorkoutPlanRepository } from '../../domain/repositories';
import type { WeeklyWorkoutPlanEntity } from '../../domain/entities';
import { db } from '../database';

export class WeeklyWorkoutPlanRepositoryImpl implements WeeklyWorkoutPlanRepository {
    async getByDay(dayOfWeek: number): Promise<WeeklyWorkoutPlanEntity | null> {
        const plan = await db.findOne('weekly_workout_plans', p => p.dayOfWeek === dayOfWeek);
        return plan ? { ...plan } : null;
    }

    async setForDay(dayOfWeek: number, workoutId: string): Promise<void> {
        const existingPlan = await db.findOne('weekly_workout_plans', p => p.dayOfWeek === dayOfWeek);

        if (existingPlan) {
            await db.update('weekly_workout_plans', p => p.dayOfWeek === dayOfWeek, {
                workoutId,
            });
        } else {
            const newPlan: WeeklyWorkoutPlanEntity = {
                id: `wp-${Date.now()}`,
                dayOfWeek: dayOfWeek,
                workoutId: workoutId,
            };
            await db.insert('weekly_workout_plans', newPlan);
        }
    }

    async clearForDay(dayOfWeek: number): Promise<void> {
        await db.delete('weekly_workout_plans', p => p.dayOfWeek === dayOfWeek);
    }

    async getAll(): Promise<WeeklyWorkoutPlanEntity[]> {
        const plans = await db.getTable('weekly_workout_plans');
        return JSON.parse(JSON.stringify(plans));
    }
}
