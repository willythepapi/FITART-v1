import type { ProgressPhotoRepository } from '../repositories';
import type { ProgressPhotoEntity } from '../entities';

export class AddProgressPhotoUseCase {
  constructor(private progressPhotoRepository: ProgressPhotoRepository) {}

  async execute(photoData: { imageDataUrl: string; note?: string }): Promise<ProgressPhotoEntity> {
    const photo: Omit<ProgressPhotoEntity, 'id'> = {
      ...photoData,
      createdAt: Date.now(),
    };
    return this.progressPhotoRepository.addProgressPhoto(photo);
  }
}
