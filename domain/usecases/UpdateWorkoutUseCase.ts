
import type { WorkoutRepository } from '../repositories';
import type { WorkoutEntity } from '../entities';

export class UpdateWorkoutUseCase {
  constructor(private workoutRepository: WorkoutRepository) {}

  async execute(workout: WorkoutEntity): Promise<WorkoutEntity> {
    return this.workoutRepository.updateWorkout(workout);
  }
}