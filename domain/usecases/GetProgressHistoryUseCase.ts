
import type { ProgressRepository } from '../repositories';
import type { DailyProgressEntity } from '../entities';

export class GetProgressHistoryUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(startDate: string, endDate: string): Promise<DailyProgressEntity[]> {
    return this.progressRepository.getProgressHistory(startDate, endDate);
  }
}