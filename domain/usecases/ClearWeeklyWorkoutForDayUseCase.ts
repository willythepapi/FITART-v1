import type { WeeklyWorkoutPlanRepository } from '../repositories';

export class ClearWeeklyWorkoutForDayUseCase {
    constructor(private repository: WeeklyWorkoutPlanRepository) {}

    async execute(dayOfWeek: number): Promise<void> {
        console.debug(`[WeeklyPlan] clear day=${dayOfWeek}`);
        return this.repository.clearForDay(dayOfWeek);
    }
}
