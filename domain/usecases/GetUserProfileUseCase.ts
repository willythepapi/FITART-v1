
import type { UserRepository } from '../repositories';
import type { UserEntity } from '../entities';

export class GetUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<UserEntity | null> {
    return this.userRepository.getUser();
  }
}
