import type { WorkoutRepository } from '../repositories';
import type { WorkoutEntity, ExerciseEntity } from '../entities';

export class AddWorkoutUseCase {
  constructor(private workoutRepository: WorkoutRepository) {}

  async execute(workoutData: Omit<WorkoutEntity, 'id' | 'exercises'> & { exercises: Omit<ExerciseEntity, 'id' | 'workoutId'>[] }): Promise<WorkoutEntity> {
    return this.workoutRepository.addWorkout(workoutData);
  }
}
