import type { WeeklyWorkoutPlanRepository } from '../repositories';
import type { WeeklyWorkoutPlanEntity } from '../entities';

export class GetPlanByDayUseCase {
    constructor(private repository: WeeklyWorkoutPlanRepository) {}

    async execute(day: number): Promise<WeeklyWorkoutPlanEntity | null> {
        return this.repository.getByDay(day);
    }
}
