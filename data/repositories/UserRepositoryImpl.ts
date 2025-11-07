
import type { UserRepository } from '../../domain/repositories';
import type { UserEntity, WeightHistoryEntity } from '../../domain/entities';
import { db } from '../database';

export class UserRepositoryImpl implements UserRepository {
  async getUser(): Promise<UserEntity | null> {
    const users = db.getTable('users');
    return users.length > 0 ? { ...users[0] } : null;
  }

  async updateUser(user: UserEntity): Promise<UserEntity> {
    const updatedUser = db.update('users', (u) => u.id === user.id, user);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return { ...updatedUser };
  }

  async addWeightEntry(entry: Omit<WeightHistoryEntity, 'id'>): Promise<WeightHistoryEntity> {
    const newEntry: WeightHistoryEntity = {
      id: `wh-${Date.now()}`,
      ...entry,
    };
    db.insert('weight_history', newEntry);
    return newEntry;
  }

  async getWeightHistory(): Promise<WeightHistoryEntity[]> {
    const user = await this.getUser();
    if (!user) return [];
    const history = db.find('weight_history', (wh) => wh.userId === user.id);
    return JSON.parse(JSON.stringify(history));
  }
}