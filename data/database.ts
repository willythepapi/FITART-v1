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


class LocalStorageDatabase {
  private db: DatabaseSchema;

  constructor() {
    const storedDb = localStorage.getItem(DB_KEY);
    if (storedDb) {
      this.db = JSON.parse(storedDb);
      // Migration for older versions
      if (this.db.users[0]) {
        const user = this.db.users[0] as any; // Use any for easier migration
        const defaults = getSeedData().users[0];
        if (user.calorieGoal === undefined) user.calorieGoal = defaults.calorieGoal;
        if (user.waterGoal === undefined) user.waterGoal = defaults.waterGoal;
        if (user.workoutGoal === undefined) user.workoutGoal = defaults.workoutGoal;
        if (user.gender === undefined) user.gender = defaults.gender;
        if (user.targetWeight === undefined) user.targetWeight = defaults.targetWeight;
        if (user.activityLevel === undefined) user.activityLevel = defaults.activityLevel;
        if (user.stepsTarget === undefined) user.stepsTarget = defaults.stepsTarget;
      }
      if (!this.db.weight_history) this.db.weight_history = [];
      if (!this.db.weekly_workout_plans) this.db.weekly_workout_plans = [];
      if (!this.db.app_settings) this.db.app_settings = getSeedData().app_settings;
      if (this.db.app_settings[0] && this.db.app_settings[0].waterReminderInterval === undefined) {
          this.db.app_settings[0].waterReminderInterval = getSeedData().app_settings[0].waterReminderInterval;
      }
      if (!this.db.progress_photos) this.db.progress_photos = [];
      
      // Migration for weekly_workout_plans to remove timestamps
      const plans = this.db.weekly_workout_plans as any[];
      if (plans.length > 0 && plans[0].createdAt !== undefined) {
        this.db.weekly_workout_plans = plans.map(({ id, dayOfWeek, workoutId }) => ({ id, dayOfWeek, workoutId }));
      }

      // Migration for daily_progress to add macros
      if (this.db.daily_progress) {
          this.db.daily_progress.forEach(p => {
              if (p.protein === undefined) p.protein = 0;
              if (p.carbs === undefined) p.carbs = 0;
              if (p.fat === undefined) p.fat = 0;
          });
      }

      // Migration for workout category
      if (this.db.workouts) {
        this.db.workouts.forEach(w => {
            if (!(w as any).category) {
                (w as any).category = 'Full Body';
            }
        });
      }

      this.save();
    } else {
      this.db = this.seed();
    }
    this.hydrateWorkouts();
  }

  private seed(): DatabaseSchema {
    const data = getSeedData();
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    return data;
  }

  private hydrateWorkouts() {
    if (this.db.workouts) {
      this.db.workouts.forEach(workout => {
        workout.exercises = this.db.exercises.filter(ex => ex.workoutId === workout.id);
      });
    }
  }

  private save() {
    // Dehydrate exercises before saving to avoid data duplication
    const dbToSave = JSON.parse(JSON.stringify(this.db));
    if (dbToSave.workouts) {
      dbToSave.workouts.forEach((w: WorkoutEntity) => { w.exercises = []; });
    }
    localStorage.setItem(DB_KEY, JSON.stringify(dbToSave));
  }
  
  public getTable<T extends keyof DatabaseSchema>(tableName: T): DatabaseSchema[T] {
    return this.db[tableName];
  }

  public insert<T extends keyof DatabaseSchema>(tableName: T, record: DatabaseSchema[T][0]): DatabaseSchema[T][0] {
    this.db[tableName].push(record as any);
    this.save();
    return record;
  }
  
  public findOne<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean): DatabaseSchema[T][0] | null {
    const result = this.db[tableName].find(predicate);
    return result || null;
  }

  public find<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean): DatabaseSchema[T] {
    return this.db[tableName].filter(predicate) as DatabaseSchema[T];
  }

  public update<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean, updates: Partial<DatabaseSchema[T][0]>): DatabaseSchema[T][0] | null {
    const index = this.db[tableName].findIndex(predicate);
    if (index > -1) {
      this.db[tableName][index] = { ...this.db[tableName][index], ...updates };
      this.save();
      return this.db[tableName][index];
    }
    return null;
  }

  public delete<T extends keyof DatabaseSchema>(tableName: T, predicate: (item: DatabaseSchema[T][0]) => boolean): void {
    const initialLength = this.db[tableName].length;
    this.db[tableName] = this.db[tableName].filter(item => !predicate(item)) as any;
    if (this.db[tableName].length < initialLength) {
      this.save();
    }
  }

  public clear(): void {
    localStorage.removeItem(DB_KEY);
    this.db = getSeedData();
  }
}

export const db = new LocalStorageDatabase();