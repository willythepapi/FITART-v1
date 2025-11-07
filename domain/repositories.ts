import type { UserEntity, WorkoutEntity, MealEntity, DailyProgressEntity, ExerciseEntity, WeightHistoryEntity, WeeklyWorkoutPlanEntity, AppSettingsEntity, ProgressPhotoEntity } from './entities';

export type WorkoutFilters = {
    exerciseName?: string;
}

export interface UserRepository {
  getUser(): Promise<UserEntity | null>;
  updateUser(user: UserEntity): Promise<UserEntity>;
  addWeightEntry(entry: Omit<WeightHistoryEntity, 'id'>): Promise<WeightHistoryEntity>;
  getWeightHistory(): Promise<WeightHistoryEntity[]>;
}

export interface WorkoutRepository {
  getWorkouts(filters?: WorkoutFilters): Promise<WorkoutEntity[]>;
  getById(id: string): Promise<WorkoutEntity | null>;
  addWorkout(workout: Omit<WorkoutEntity, 'id' | 'exercises'> & { exercises: Omit<ExerciseEntity, 'id' | 'workoutId'>[] }): Promise<WorkoutEntity>;
  updateWorkout(workout: WorkoutEntity): Promise<WorkoutEntity>;
}

export interface NutritionRepository {
  addMeal(meal: Omit<MealEntity, 'id' | 'timestamp'>): Promise<MealEntity>;
  getMealById(mealId: string): Promise<MealEntity | null>;
  getMealsByDate(date: string): Promise<MealEntity[]>;
  getAllMeals(): Promise<MealEntity[]>;
  updateMeal(meal: MealEntity): Promise<MealEntity>;
  deleteMeal(mealId: string): Promise<void>;
}

export interface ProgressRepository {
  getDailyProgress(date: string): Promise<DailyProgressEntity | null>;
  getProgressHistory(startDate: string, endDate: string): Promise<DailyProgressEntity[]>;
  addWater(date: string, amount: number): Promise<DailyProgressEntity>;
  completeWorkout(date: string, workoutId: string): Promise<DailyProgressEntity>;
  updateMacros(date: string, macros: { calories: number; protein: number; carbs: number; fat: number }): Promise<DailyProgressEntity>;
}

export interface ProgressPhotoRepository {
  addProgressPhoto(photo: Omit<ProgressPhotoEntity, 'id'>): Promise<ProgressPhotoEntity>;
  getAllProgressPhotos(): Promise<ProgressPhotoEntity[]>;
}

export interface SystemRepository {
  clearAllData(): Promise<void>;
}

export interface WeeklyWorkoutPlanRepository {
  getByDay(dayOfWeek: number): Promise<WeeklyWorkoutPlanEntity | null>;
  setForDay(dayOfWeek: number, workoutId: string): Promise<void>; // upsert
  clearForDay(dayOfWeek: number): Promise<void>;
  getAll(): Promise<WeeklyWorkoutPlanEntity[]>;
}

export interface SettingsRepository {
    getSettings(): Promise<AppSettingsEntity>;
    updateSettings(settings: Partial<Omit<AppSettingsEntity, 'id'>>): Promise<AppSettingsEntity>;
}
