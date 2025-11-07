
import type { UserRepository } from '../repositories';
import type { UserEntity } from '../entities';

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(user: UserEntity): Promise<UserEntity> {
    const oldUser = await this.userRepository.getUser();
    const updatedUser = await this.userRepository.updateUser(user);
    
    if (oldUser && oldUser.weight !== updatedUser.weight) {
      await this.userRepository.addWeightEntry({
        userId: updatedUser.id,
        weight: updatedUser.weight,
        date: new Date().toISOString().split('T')[0]
      });
    }

    return updatedUser;
  }
}