export interface UserEntity {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number;
  activityLevel: 'low' | 'medium' | 'high';
  goal: 'lose_weight' | 'gain_muscle' | 'maintain';
  calorieGoal: number;
  waterGoal: number; // in ml
  workoutGoal: number; // sessions per week
  stepsTarget: number;
  photoDataUrl?: string;
}

export interface ExerciseEntity {
  id: string;
  workoutId: string;
  name: string;
  sets: number;
  reps: string; // e.g., "8-12"
  videoUrl?: string;
  description?: string;
}

export type WorkoutCategory = 'Full Body' | 'Upper' | 'Lower' | 'Push' | 'Pull' | 'Legs';

export interface WorkoutEntity {
  id: string;
  name: string;
  category: WorkoutCategory;
  exercises: ExerciseEntity[];
}

export interface MealEntity {
  id: string;
  foodId: string;
  grams: number;
  name: string; // e.g., "Chicken Breast (150g)"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface DailyProgressEntity {
  id: string;
  date: string; // YYYY-MM-DD
  caloriesEaten: number;
  protein: number;
  carbs: number;
  fat: number;
  waterIntake: number; // in ml
  workoutsCompleted: string[]; // array of workout IDs
}

export interface WeightHistoryEntity {
  id:string;
  userId: string;
  weight: number; // in kg
  date: string; // YYYY-MM-DD
}

export interface WeeklyWorkoutPlanEntity {
  id: string;
  dayOfWeek: number; // 1=Mon ... 7=Sun
  workoutId: string;
}

export interface AppSettingsEntity {
  id: 'singleton-settings';
  mealReminderTime: string; // "HH:mm"
  workoutReminderTime: string; // "HH:mm"
  waterReminderInterval: number; // in minutes, 0 for off
}

export interface ProgressPhotoEntity {
  id: string;
  imageDataUrl: string;
  note?: string;
  createdAt: number;
}

export interface FoodItemEntity {
  id: string;
  name: string;
  calories_per_100g: number;
  protein: number;
  carbs: number;
  fat: number;
}