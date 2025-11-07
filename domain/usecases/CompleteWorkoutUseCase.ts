
import type { ProgressRepository } from '../repositories';
import type { DailyProgressEntity } from '../entities';

export class CompleteWorkoutUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(date: string, workoutId: string): Promise<DailyProgressEntity> {
    return this.progressRepository.completeWorkout(date, workoutId);
  }
}
