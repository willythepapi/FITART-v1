
import type { SystemRepository } from '../../domain/repositories';
import { db } from '../database';

export class SystemRepositoryImpl implements SystemRepository {
  async clearAllData(): Promise<void> {
    await db.clear();
  }
}
