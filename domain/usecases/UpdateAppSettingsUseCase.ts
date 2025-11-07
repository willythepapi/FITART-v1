
import type { SettingsRepository } from '../repositories';
import type { AppSettingsEntity } from '../entities';

export class UpdateAppSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(settings: Partial<Omit<AppSettingsEntity, 'id'>>): Promise<AppSettingsEntity> {
    return this.settingsRepository.updateSettings(settings);
  }
}
