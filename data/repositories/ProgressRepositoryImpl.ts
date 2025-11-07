
import type { ProgressRepository } from '../../domain/repositories';
import type { DailyProgressEntity } from '../../domain/entities';
import { db } from '../database';

export class ProgressRepositoryImpl implements ProgressRepository {
  private async getOrCreateProgress(date: string): Promise<DailyProgressEntity> {
    let progress = db.findOne('daily_progress', (p) => p.date === date);
    if (!progress) {
      const newProgress: DailyProgressEntity = {
        id: `progress-${date}`,
        date,
        caloriesEaten: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        waterIntake: 0,
        workoutsCompleted: [],
      };
      db.insert('daily_progress', newProgress);
      progress = newProgress;
    }
    return { ...progress };
  }

  async getDailyProgress(date: string): Promise<DailyProgressEntity | null> {
    const progress = db.findOne('daily_progress', (p) => p.date === date);
    return progress ? { ...progress } : this.getOrCreateProgress(date);
  }

  async getProgressHistory(startDate: string, endDate: string): Promise<DailyProgressEntity[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const history = db.find('daily_progress', p => {
        const pDate = new Date(p.date);
        return pDate >= start && pDate <= end;
    });
    return JSON.parse(JSON.stringify(history));
  }

  async addWater(date: string, amount: number): Promise<DailyProgressEntity> {
    const progress = await this.getOrCreateProgress(date);
    const updatedProgress = db.update('daily_progress', (p) => p.date === date, {
      waterIntake: progress.waterIntake + amount,
    });
    if (!updatedProgress) throw new Error('Failed to update water intake');
    return { ...updatedProgress };
  }

  async completeWorkout(date: string, workoutId: string): Promise<DailyProgressEntity> {
    const progress = await this.getOrCreateProgress(date);
    if (progress.workoutsCompleted.includes(workoutId)) {
        return progress; // Avoid duplicates
    }
    const updatedProgress = db.update('daily_progress', (p) => p.date === date, {
      workoutsCompleted: [...progress.workoutsCompleted, workoutId],
    });
    if (!updatedProgress) throw new Error('Failed to complete workout');
    return { ...updatedProgress };
  }

  async updateMacros(date: string, macros: { calories: number; protein: number; carbs: number; fat: number }): Promise<DailyProgressEntity> {
    const progress = await this.getOrCreateProgress(date);
    const updatedProgress = db.update('daily_progress', (p) => p.date === date, {
      caloriesEaten: progress.caloriesEaten + macros.calories,
      protein: progress.protein + macros.protein,
      carbs: progress.carbs + macros.carbs,
      fat: progress.fat + macros.fat,
    });
    if (!updatedProgress) throw new Error('Failed to update macros');
    return { ...updatedProgress };
  }
}
