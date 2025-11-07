
import type { WorkoutRepository, WorkoutFilters } from '../repositories';
import type { WorkoutEntity } from '../entities';

export class GetWorkoutsUseCase {
  constructor(private workoutRepository: WorkoutRepository) {}

  async execute(filters?: WorkoutFilters): Promise<WorkoutEntity[]> {
    return this.workoutRepository.getWorkouts(filters);
  }
}