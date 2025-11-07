import type { WeeklyWorkoutPlanRepository } from '../repositories';

export class UpsertWeeklyPlanUseCase {
    constructor(private repository: WeeklyWorkoutPlanRepository) {}

    async execute(day: number, workoutId: string): Promise<void> {
        return this.repository.setForDay(day, workoutId);
    }
}
