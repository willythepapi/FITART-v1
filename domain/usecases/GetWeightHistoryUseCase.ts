
import type { UserRepository } from '../repositories';
import type { WeightHistoryEntity } from '../entities';

export class GetWeightHistoryUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<WeightHistoryEntity[]> {
    return this.userRepository.getWeightHistory();
  }
}