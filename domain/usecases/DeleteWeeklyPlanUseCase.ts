import type { WeeklyWorkoutPlanRepository } from '../repositories';

export class DeleteWeeklyPlanUseCase {
    constructor(private repository: WeeklyWorkoutPlanRepository) {}

    async execute(day: number): Promise<void> {
        return this.repository.clearForDay(day);
    }
}
