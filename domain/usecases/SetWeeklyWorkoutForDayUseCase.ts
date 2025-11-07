import type { WeeklyWorkoutPlanRepository } from '../repositories';

export class SetWeeklyWorkoutForDayUseCase {
    constructor(private repository: WeeklyWorkoutPlanRepository) {}

    async execute({ dayOfWeek, workoutId }: { dayOfWeek: number, workoutId: string }): Promise<void> {
        console.debug(`[WeeklyPlan] set day=${dayOfWeek} workoutId=${workoutId}`);
        return this.repository.setForDay(dayOfWeek, workoutId);
    }
}
