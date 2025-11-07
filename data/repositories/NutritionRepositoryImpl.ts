import type { NutritionRepository } from '../../domain/repositories';
import type { MealEntity } from '../../domain/entities';
import { db } from '../database';

export class NutritionRepositoryImpl implements NutritionRepository {
  async addMeal(mealData: Omit<MealEntity, 'id' | 'timestamp'>): Promise<MealEntity> {
    const newMeal: MealEntity = {
      ...mealData,
      id: `meal-${Date.now()}`,
      timestamp: Date.now(),
    };
    db.insert('meals', newMeal);
    return { ...newMeal };
  }

  async getMealById(mealId: string): Promise<MealEntity | null> {
      const meal = db.findOne('meals', (m) => m.id === mealId);
      return meal ? { ...meal } : null;
  }

  async getMealsByDate(date: string): Promise<MealEntity[]> {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);
    const meals = db.find('meals', (m) => m.timestamp >= startOfDay && m.timestamp <= endOfDay);
    return JSON.parse(JSON.stringify(meals.sort((a,b) => b.timestamp - a.timestamp)));
  }

  async getAllMeals(): Promise<MealEntity[]> {
    const meals = db.getTable('meals');
    return JSON.parse(JSON.stringify(meals));
  }

  async updateMeal(meal: MealEntity): Promise<MealEntity> {
      const updatedMeal = db.update('meals', m => m.id === meal.id, meal);
      if (!updatedMeal) {
          throw new Error('Meal not found for update');
      }
      return { ...updatedMeal };
  }

  async deleteMeal(mealId: string): Promise<void> {
      db.delete('meals', m => m.id === mealId);
  }
}
