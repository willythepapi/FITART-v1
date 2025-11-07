
import type { NutritionRepository, ProgressRepository } from '../repositories';
import type { MealEntity } from '../entities';

export class AddMealEntryUseCase {
  constructor(
    private nutritionRepository: NutritionRepository,
    private progressRepository: ProgressRepository,
  ) {}

  async execute(date: string, mealData: Omit<MealEntity, 'id' | 'timestamp'>): Promise<MealEntity> {
    const newMeal = await this.nutritionRepository.addMeal(mealData);
    await this.progressRepository.updateMacros(date, { 
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
    });
    return newMeal;
  }
}
