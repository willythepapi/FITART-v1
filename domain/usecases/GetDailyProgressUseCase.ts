
import type { ProgressRepository } from '../repositories';
import type { DailyProgressEntity } from '../entities';

export class GetDailyProgressUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(date: string): Promise<DailyProgressEntity | null> {
    return this.progressRepository.getDailyProgress(date);
  }
}
