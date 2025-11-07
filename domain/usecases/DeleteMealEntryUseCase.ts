import type { NutritionRepository, ProgressRepository } from '../repositories';
import type { MealEntity } from '../entities';

export class DeleteMealEntryUseCase {
  constructor(
    private nutritionRepository: NutritionRepository,
    private progressRepository: ProgressRepository,
  ) {}

  async execute(date: string, mealId: string): Promise<void> {
    // Find the meal to get its macro values before deleting
    const mealToDelete = await this.nutritionRepository.getMealById(mealId);

    if (!mealToDelete) {
        console.warn(`Meal with id ${mealId} not found for deletion.`);
        return;
    }
    
    // Create negative values to subtract from daily progress
    const negativeMacros = {
        calories: -mealToDelete.calories,
        protein: -mealToDelete.protein,
        carbs: -mealToDelete.carbs,
        fat: -mealToDelete.fat,
    };

    // Update daily progress by subtracting the meal's macros
    await this.progressRepository.updateMacros(date, negativeMacros);
    
    // Delete the meal from the database
    await this.nutritionRepository.deleteMeal(mealId);
  }
}
