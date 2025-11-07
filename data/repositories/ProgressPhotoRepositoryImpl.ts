import type { ProgressPhotoRepository } from '../../domain/repositories';
import type { ProgressPhotoEntity } from '../../domain/entities';
import { db } from '../database';

export class ProgressPhotoRepositoryImpl implements ProgressPhotoRepository {
  async addProgressPhoto(photoData: Omit<ProgressPhotoEntity, 'id'>): Promise<ProgressPhotoEntity> {
    const newPhoto: ProgressPhotoEntity = {
      ...photoData,
      id: `pp-${Date.now()}`,
    };
    db.insert('progress_photos', newPhoto);
    return { ...newPhoto };
  }

  async getAllProgressPhotos(): Promise<ProgressPhotoEntity[]> {
    const photos = db.getTable('progress_photos');
    // Sort by newest first
    return JSON.parse(JSON.stringify(photos)).sort((a: ProgressPhotoEntity, b: ProgressPhotoEntity) => b.createdAt - a.createdAt);
  }
}
