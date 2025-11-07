
import type { ProgressRepository } from '../repositories';
import type { DailyProgressEntity } from '../entities';

export class AddWaterIntakeUseCase {
  constructor(private progressRepository: ProgressRepository) {}

  async execute(date: string, amount: number): Promise<DailyProgressEntity> {
    return this.progressRepository.addWater(date, amount);
  }
}
