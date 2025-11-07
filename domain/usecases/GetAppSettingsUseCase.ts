
import type { SettingsRepository } from '../repositories';
import type { AppSettingsEntity } from '../entities';

export class GetAppSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(): Promise<AppSettingsEntity> {
    return this.settingsRepository.getSettings();
  }
}
