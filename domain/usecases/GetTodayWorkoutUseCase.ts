import type { WorkoutRepository, WeeklyWorkoutPlanRepository } from '../repositories';
import type { WorkoutEntity } from '../entities';

export class GetTodayWorkoutUseCase {
    constructor(
        private weeklyPlanRepository: WeeklyWorkoutPlanRepository,
        private workoutRepository: WorkoutRepository,
    ) {}

    async execute(): Promise<WorkoutEntity | null> {
        const today = new Date();
        // JavaScript's getDay() returns 0 for Sunday, 1 for Monday, etc.
        // We need Monday = 1, ..., Sunday = 7.
        const dayOfWeekJS = today.getDay();
        const dayOfWeek = dayOfWeekJS === 0 ? 7 : dayOfWeekJS;

        const plan = await this.weeklyPlanRepository.getByDay(dayOfWeek);

        console.debug(`[WeeklyPlan] today=${dayOfWeek} -> plan=${plan?.workoutId}`);

        if (!plan) {
            return null;
        }

        const workout = await this.workoutRepository.getById(plan.workoutId);
        
        return workout;
    }
}
