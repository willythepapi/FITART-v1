import type { NutritionRepository, ProgressRepository } from '../repositories';
import type { MealEntity } from '../entities';

export class UpdateMealEntryUseCase {
  constructor(
    private nutritionRepository: NutritionRepository,
    private progressRepository: ProgressRepository,
  ) {}

  async execute(date: string, oldMeal: MealEntity, updatedMealData: MealEntity): Promise<MealEntity> {

    // Calculate the difference in macros
    const macroDelta = {
        calories: updatedMealData.calories - oldMeal.calories,
        protein: updatedMealData.protein - oldMeal.protein,
        carbs: updatedMealData.carbs - oldMeal.carbs,
        fat: updatedMealData.fat - oldMeal.fat,
    };
    
    // Update the daily progress with the difference
    await this.progressRepository.updateMacros(date, macroDelta);

    // Update the meal itself in the database
    const updatedMeal = await this.nutritionRepository.updateMeal(updatedMealData);
    
    return updatedMeal;
  }
}
