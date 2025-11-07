
import { UserRepositoryImpl } from '../data/repositories/UserRepositoryImpl';
import { WorkoutRepositoryImpl } from '../data/repositories/WorkoutRepositoryImpl';
import { NutritionRepositoryImpl } from '../data/repositories/NutritionRepositoryImpl';
import { ProgressRepositoryImpl } from '../data/repositories/ProgressRepositoryImpl';
import { SystemRepositoryImpl } from '../data/repositories/SystemRepositoryImpl';
import { WeeklyWorkoutPlanRepositoryImpl } from '../data/repositories/WeeklyWorkoutPlanRepositoryImpl';
import { SettingsRepositoryImpl } from '../data/repositories/SettingsRepositoryImpl';
import { ProgressPhotoRepositoryImpl } from '../data/repositories/ProgressPhotoRepositoryImpl';

import { GetUserProfileUseCase } from '../domain/usecases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../domain/usecases/UpdateUserProfileUseCase';
import { GetWorkoutsUseCase } from '../domain/usecases/GetWorkoutsByLevelUseCase';
import { CompleteWorkoutUseCase } from '../domain/usecases/CompleteWorkoutUseCase';
import { AddMealEntryUseCase } from '../domain/usecases/AddMealEntryUseCase';
import { AddWaterIntakeUseCase } from '../domain/usecases/AddWaterIntakeUseCase';
import { GetDailyProgressUseCase } from '../domain/usecases/GetDailyProgressUseCase';
import { GetMealsByDateUseCase } from '../domain/usecases/GetMealsByDateUseCase';
import { AddWorkoutUseCase } from '../domain/usecases/AddWorkoutUseCase';
import { UpdateWorkoutUseCase } from '../domain/usecases/UpdateWorkoutUseCase';
import { ClearAllDataUseCase } from '../domain/usecases/ClearAllDataUseCase';
import { GetWeightHistoryUseCase } from '../domain/usecases/GetWeightHistoryUseCase';
import { GetProgressHistoryUseCase } from '../domain/usecases/GetProgressHistoryUseCase';
import { GetWeeklyPlanUseCase } from '../domain/usecases/GetWeeklyPlanUseCase';
import { GetPlanByDayUseCase } from '../domain/usecases/GetPlanByDayUseCase';
import { GetTodayWorkoutUseCase } from '../domain/usecases/GetTodayWorkoutUseCase';
import { SetWeeklyWorkoutForDayUseCase } from '../domain/usecases/SetWeeklyWorkoutForDayUseCase';
import { ClearWeeklyWorkoutForDayUseCase } from '../domain/usecases/ClearWeeklyWorkoutForDayUseCase';
import { GetAppSettingsUseCase } from '../domain/usecases/GetAppSettingsUseCase';
import { UpdateAppSettingsUseCase } from '../domain/usecases/UpdateAppSettingsUseCase';
import { CalculateDailyTargetsUseCase } from '../domain/usecases/CalculateDailyTargetsUseCase';
import { ExportUserDataUseCase } from '../domain/usecases/ExportUserDataUseCase';
// Fix: Import GetAICoachResponseUseCase to make it available for instantiation.
import { GetAICoachResponseUseCase } from '../domain/usecases/GetAICoachResponseUseCase';
import { AddProgressPhotoUseCase } from '../domain/usecases/AddProgressPhotoUseCase';
import { GetProgressPhotosUseCase } from '../domain/usecases/GetProgressPhotosUseCase';
import { UpdateMealEntryUseCase } from '../domain/usecases/UpdateMealEntryUseCase';
import { DeleteMealEntryUseCase } from '../domain/usecases/DeleteMealEntryUseCase';


// Instantiate Repositories
const userRepository = new UserRepositoryImpl();
const workoutRepository = new WorkoutRepositoryImpl();
const nutritionRepository = new NutritionRepositoryImpl();
const progressRepository = new ProgressRepositoryImpl();
const systemRepository = new SystemRepositoryImpl();
const weeklyWorkoutPlanRepository = new WeeklyWorkoutPlanRepositoryImpl();
const settingsRepository = new SettingsRepositoryImpl();
const progressPhotoRepository = new ProgressPhotoRepositoryImpl();

// Instantiate Use Cases
export const useCases = {
  getUserProfile: new GetUserProfileUseCase(userRepository),
  updateUserProfile: new UpdateUserProfileUseCase(userRepository),
  getWorkouts: new GetWorkoutsUseCase(workoutRepository),
  addWorkout: new AddWorkoutUseCase(workoutRepository),
  updateWorkout: new UpdateWorkoutUseCase(workoutRepository),
  completeWorkout: new CompleteWorkoutUseCase(progressRepository),
  addMealEntry: new AddMealEntryUseCase(nutritionRepository, progressRepository),
  updateMealEntry: new UpdateMealEntryUseCase(nutritionRepository, progressRepository),
  deleteMealEntry: new DeleteMealEntryUseCase(nutritionRepository, progressRepository),
  addWaterIntake: new AddWaterIntakeUseCase(progressRepository),
  getDailyProgress: new GetDailyProgressUseCase(progressRepository),
  getMealsByDate: new GetMealsByDateUseCase(nutritionRepository),
  clearAllData: new ClearAllDataUseCase(systemRepository),
  getWeightHistory: new GetWeightHistoryUseCase(userRepository),
  getProgressHistory: new GetProgressHistoryUseCase(progressRepository),
  getWeeklyPlan: new GetWeeklyPlanUseCase(weeklyWorkoutPlanRepository),
  getPlanByDay: new GetPlanByDayUseCase(weeklyWorkoutPlanRepository),
  getTodayWorkout: new GetTodayWorkoutUseCase(weeklyWorkoutPlanRepository, workoutRepository),
  setWeeklyWorkoutForDay: new SetWeeklyWorkoutForDayUseCase(weeklyWorkoutPlanRepository),
  clearWeeklyWorkoutForDay: new ClearWeeklyWorkoutForDayUseCase(weeklyWorkoutPlanRepository),
  getAppSettings: new GetAppSettingsUseCase(settingsRepository),
  updateAppSettings: new UpdateAppSettingsUseCase(settingsRepository),
  calculateDailyTargets: new CalculateDailyTargetsUseCase(),
  // Fix: Add GetAICoachResponseUseCase to the exported useCases object.
  getAICoachResponse: new GetAICoachResponseUseCase(),
  exportUserData: new ExportUserDataUseCase(workoutRepository, nutritionRepository, progressRepository),
  addProgressPhoto: new AddProgressPhotoUseCase(progressPhotoRepository),
  getProgressPhotos: new GetProgressPhotosUseCase(progressPhotoRepository),
};

export type AppUseCases = typeof useCases;
