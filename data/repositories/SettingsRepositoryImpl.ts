
import type { SettingsRepository } from '../../domain/repositories';
import type { AppSettingsEntity } from '../../domain/entities';
import { db } from '../database';

export class SettingsRepositoryImpl implements SettingsRepository {
  private async getOrCreateSettings(): Promise<AppSettingsEntity> {
    let settings = db.findOne('app_settings', (s) => s.id === 'singleton-settings');
    if (!settings) {
      const newSettings: AppSettingsEntity = {
        id: 'singleton-settings',
        mealReminderTime: '08:30',
        workoutReminderTime: '18:00',
        waterReminderInterval: 30,
      };
      db.insert('app_settings', newSettings);
      settings = newSettings;
    }
    return { ...settings };
  }

  async getSettings(): Promise<AppSettingsEntity> {
    return this.getOrCreateSettings();
  }

  async updateSettings(updates: Partial<Omit<AppSettingsEntity, 'id'>>): Promise<AppSettingsEntity> {
    const updatedSettings = db.update('app_settings', (s) => s.id === 'singleton-settings', updates);
    if (!updatedSettings) {
      // This should theoretically not happen due to getOrCreateSettings logic
      throw new Error('Settings not found for update');
    }
    return { ...updatedSettings };
  }
}
