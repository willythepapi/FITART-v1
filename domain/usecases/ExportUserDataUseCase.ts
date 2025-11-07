import type { WorkoutRepository, NutritionRepository, ProgressRepository } from '../repositories';
import type { MealEntity, WorkoutEntity, DailyProgressEntity } from '../entities';

export interface ExportOptions {
  meals: boolean;
  workouts: boolean;
  progress: boolean;
}

export interface ExportFile {
  filename: string;
  content: string;
  mimeType: string;
}

export class ExportUserDataUseCase {
  constructor(
    private workoutRepository: WorkoutRepository,
    private nutritionRepository: NutritionRepository,
    private progressRepository: ProgressRepository
  ) {}

  private escapeCsvField(field: any): string {
    const stringField = String(field ?? '');
    if (/[",\n\r]/.test(stringField)) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }

  async execute(options: ExportOptions): Promise<ExportFile[]> {
    const files: ExportFile[] = [];

    if (options.meals) {
      const meals = await this.nutritionRepository.getAllMeals();
      files.push({
        filename: 'meals.json',
        content: JSON.stringify(meals, null, 2),
        mimeType: 'application/json',
      });

      const mealHeaders = ['id', 'name', 'calories', 'protein', 'carbs', 'fat', 'timestamp'];
      const mealRows = meals.map(m =>
        mealHeaders.map(h => this.escapeCsvField(m[h as keyof MealEntity])).join(',')
      );
      files.push({
        filename: 'meals.csv',
        content: [mealHeaders.join(','), ...mealRows].join('\n'),
        mimeType: 'text/csv',
      });
    }

    if (options.workouts) {
      const workouts = await this.workoutRepository.getWorkouts();
      files.push({
        filename: 'workouts.json',
        content: JSON.stringify(workouts, null, 2),
        mimeType: 'application/json',
      });

      const workoutHeaders = ['workout_id', 'workout_name', 'exercise_name', 'sets', 'reps', 'video_url', 'description'];
      const workoutRows: string[] = [];
      workouts.forEach(w => {
        w.exercises.forEach(ex => {
          const row = [
            this.escapeCsvField(w.id),
            this.escapeCsvField(w.name),
            this.escapeCsvField(ex.name),
            this.escapeCsvField(ex.sets),
            this.escapeCsvField(ex.reps),
            this.escapeCsvField(ex.videoUrl),
            this.escapeCsvField(ex.description),
          ].join(',');
          workoutRows.push(row);
        });
      });
      files.push({
        filename: 'workouts.csv',
        content: [workoutHeaders.join(','), ...workoutRows].join('\n'),
        mimeType: 'text/csv',
      });
    }
    
    if (options.progress) {
      const startDate = new Date(0).toISOString().split('T')[0]; // From the beginning of time
      const endDate = new Date().toISOString().split('T')[0]; // Until today
      const progress = await this.progressRepository.getProgressHistory(startDate, endDate);
      files.push({
        filename: 'progress.json',
        content: JSON.stringify(progress, null, 2),
        mimeType: 'application/json',
      });
    }

    return files;
  }
}