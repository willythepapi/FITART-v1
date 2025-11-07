
import type { SystemRepository } from '../repositories';

export class ClearAllDataUseCase {
  constructor(private systemRepository: SystemRepository) {}

  async execute(): Promise<void> {
    return this.systemRepository.clearAllData();
  }
}
