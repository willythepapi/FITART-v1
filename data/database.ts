
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserEntity, WorkoutEntity, ExerciseEntity, MealEntity, DailyProgressEntity, WeightHistoryEntity, WeeklyWorkoutPlanEntity, AppSettingsEntity, ProgressPhotoEntity } from '../domain/entities';

const DB_KEY = 'zenithfit_db';

interface DatabaseSchema {
  users: UserEntity[];
  workouts: WorkoutEntity[];
  exercises: ExerciseEntity[];
  meals: MealEntity[];
  daily_progress: DailyProgressEntity[];
  weight_history: WeightHistoryEntity[];
  weekly_workout_plans: WeeklyWorkoutPlanEntity[];
  app_settings: AppSettingsEntity[];
  progress_photos: ProgressPhotoEntity[];
}

const getSeedData = (): DatabaseSchema => ({
  users: [
    { 
      id: 'user-1', 
      name: 'Alex Ryder', 
      age: 28,
      gender: 'male',
      height: 180, 
      weight: 75,
      targetWeight: 72,
      activityLevel: 'medium',
      goal: 'lose_weight',
      calorieGoal: 2500,
      waterGoal: 3000,
      workoutGoal: 3,
      stepsTarget: 8000,
      photoDataUrl: undefined,
    }
  ],
  workouts: [],
  exercises: [],
  meals: [],
  daily_progress: [],
  weight_history: [],
  weekly_workout_plans: [],
  app_settings: [
    {
      id: 'singleton-settings',
      mealReminderTime: '08:30',
      workoutReminderTime: '18:00',
      waterReminderInterval: 30,
    }
  ],
  progress_photos: [],
});

class AsyncStorageDatabase {
  private db: DatabaseSchema | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
        const storedDb = await AsyncStorage.getItem(DB_KEY);
        if (storedDb) {
            this.db = JSON.parse(storedDb);
            await this.runMigrations();
        } else {
            this.db = getSeedData();
            await this.save();
        }
        this.hydrateWorkouts();
        this.isInitialized = true;
    } catch (e) {
        console.error("Failed to initialize database:", e);
        // Fallback to seed data if there's a parsing error
        this.db = getSeedData();
        await this.save();
        this.isInitialized = true;
    }
  }
  
  private async checkInit() {
      if (!this.isInitialized || !this.db) {
          await this.init();
      }
      if (!this.db) {
          throw new Error("Database is not initialized.");
      }
  }

  private async runMigrations() {
      if (!this.db) return;
      let needsSave = false;

      // Migration for older versions
      if (this.db.users[0]) {
        const user = this.db.users[0] as any; // Use any for easier migration
        const defaults = getSeedData().users[0];
        if (user.calorieGoal === undefined) { user.calorieGoal = defaults.calorieGoal; needsSave = true; }
        if (user.waterGoal === undefined) { user.waterGoal = defaults.waterGoal; needsSave = true; }
        if (user.workoutGoal === undefined) { user.workoutGoal = defaults.workoutGoal; needsSave = true; }
        if (user.gender === undefined) { user.gender = defaults.gender; needsSave = true; }
        if (user.targetWeight === undefined) { user.targetWeight = defaults.targetWeight; needsSave = true; }
        if (user.activityLevel === undefined) { user.activityLevel = defaults.activityLevel; needsSave = true; }
        if (user.stepsTarget === undefined) { user.stepsTarget = defaults.stepsTarget; needsSave = true; }
      }
      if (!this.db.weight_history) { this.db.weight_history = []; needsSave = true; }
      if (!this.db.weekly_workout_plans) { this.db.weekly_workout_plans = []; needsSave = true; }
      if (!this.db.app_settings) { this.db.app_settings = getSeedData().app_settings; needsSave = true; }
      if (this.db.app_settings[0] && this.db.app_settings[0].waterReminderInterval === undefined) {
          this.db.app_settings[0].waterReminderInterval = getSeedData().app_settings[0].waterReminderInterval;
          needsSave = true;
      }
      if (!this.db.progress_photos) { this.db.progress_photos = []; needsSave = true; }
      
      const plans = this.db.weekly_workout_plans as any[];
      if (plans.length > 0 && plans[0].createdAt !== undefined) {
        this.db.weekly_workout_plans = plans.map(({ id, dayOfWeek, workoutId }) => ({ id, dayOfWeek, workoutId }));
        needsSave = true;
      }

      if (this.db.daily_progress) {
          this.db.daily_progress.forEach(p => {
              if (p.protein === undefined) { p.protein = 0; needsSave = true; }
              if (p.carbs === undefined) { p.carbs = 0; needsSave = true; }
              if (p.fat === undefined) { p.fat = 0; needsSave = true; }
          });
      }

      if (this.db.workouts) {
        this.db.workouts.forEach(w => {
            if (!(w as any).category) {
                (w as any).category = 'Full Body';
                needsSave = true;
            }
        });
      }

      if (needsSave) {
          await this.save();
      }
  }

  private hydrateWorkouts() {
    if (this.db && this.db.workouts) {
      this.db.workouts.forEach(workout => {
        workout.exercises = this.db!.exercises.filter(ex => ex.workoutId === workout.id);
      });
    }
  }

  private async save() {
    if (!this.db) return;
    const dbToSave = JSON.parse(JSON.stringify(this.db));
    if (dbToSave.workouts) {
      dbToSave.workouts.forEach((w: WorkoutEntity) => { w.exercises = []; });
    }
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(dbToSave));
  }
  
  public async getTable<T extends keyof DatabaseSchema>(tableName: T): Promise<DatabaseSchema[T]> {
    await this.checkInit();
    return this.db![tableName];
  }

  public async insert<T extends keyof DatabaseSchema>(tableName: T, record: DatabaseSchema[T][0]): Promise<DatabaseSchema[T][0]> {
    await this.checkInit();
    this.db![tableName].push(record as any);
    await this.save();
    return record;
  }
  
  public async findOne<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean): Promise<DatabaseSchema[T][0] | null> {
    await this.checkInit();
    const result = this.db![tableName].find(predicate);
    return result || null;
  }

  public async find<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean): Promise<DatabaseSchema[T]> {
    await this.checkInit();
    return this.db![tableName].filter(predicate) as DatabaseSchema[T];
  }

  public async update<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean, updates: Partial<DatabaseSchema[T][0]>): Promise<DatabaseSchema[T][0] | null> {
    await this.checkInit();
    const index = this.db![tableName].findIndex(predicate);
    if (index > -1) {
      this.db![tableName][index] = { ...this.db![tableName][index], ...updates };
      await this.save();
      return this.db![tableName][index];
    }
    return null;
  }

  public async delete<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean): Promise<void> {
    await this.checkInit();
    const initialLength = this.db![tableName].length;
    (this.db![tableName] as any[]) = this.db![tableName].filter(item => !predicate(item));
    if (this.db![tableName].length < initialLength) {
      await this.save();
    }
  }

  public async clear(): Promise<void> {
    await AsyncStorage.removeItem(DB_KEY);
    this.db = getSeedData();
    this.isInitialized = true; // Re-initialized with seed data
  }
}

export const db = new AsyncStorageDatabase();
