
import type { NutritionRepository } from '../repositories';
import type { MealEntity } from '../entities';

export class GetMealsByDateUseCase {
  constructor(private nutritionRepository: NutritionRepository) {}

  // Fix: Made date parameter optional to allow fetching all meals for insights screen.
  async execute(date?: string): Promise<MealEntity[]> {
    if (date) {
        return this.nutritionRepository.getMealsByDate(date);
    }
    return this.nutritionRepository.getAllMeals();
  }
}
