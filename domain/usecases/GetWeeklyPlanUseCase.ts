import type { WeeklyWorkoutPlanRepository } from '../repositories';
import type { WeeklyWorkoutPlanEntity } from '../entities';

export class GetWeeklyPlanUseCase {
    constructor(private repository: WeeklyWorkoutPlanRepository) {}

    async execute(): Promise<WeeklyWorkoutPlanEntity[]> {
        return this.repository.getAll();
    }
}
