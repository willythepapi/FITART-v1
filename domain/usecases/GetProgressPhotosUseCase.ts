import type { ProgressPhotoRepository } from '../repositories';
import type { ProgressPhotoEntity } from '../entities';

export class GetProgressPhotosUseCase {
  constructor(private progressPhotoRepository: ProgressPhotoRepository) {}

  async execute(): Promise<ProgressPhotoEntity[]> {
    return this.progressPhotoRepository.getAllProgressPhotos();
  }
}
