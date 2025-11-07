
import type { WorkoutRepository, WorkoutFilters } from '../../domain/repositories';
import type { WorkoutEntity, ExerciseEntity } from '../../domain/entities';
import { db } from '../database';

export class WorkoutRepositoryImpl implements WorkoutRepository {
  async getWorkouts(filters?: WorkoutFilters): Promise<WorkoutEntity[]> {
    let workouts = await db.getTable('workouts');

    if (filters?.exerciseName && filters.exerciseName.trim() !== '') {
      const searchTerm = filters.exerciseName.toLowerCase();
      workouts = workouts.filter(w => 
        w.exercises.some(ex => ex.name.toLowerCase().includes(searchTerm))
      );
    }
    
    return JSON.parse(JSON.stringify(workouts));
  }

  async getById(id: string): Promise<WorkoutEntity | null> {
    const workout = await db.findOne('workouts', w => w.id === id);
    return workout ? JSON.parse(JSON.stringify(workout)) : null;
  }

  async addWorkout(workoutData: Omit<WorkoutEntity, 'id' | 'exercises'> & { exercises: Omit<ExerciseEntity, 'id' | 'workoutId'>[] }): Promise<WorkoutEntity> {
    const newWorkout: WorkoutEntity = {
      ...workoutData,
      id: `workout-${Date.now()}`,
      exercises: [],
    };
    
    await db.insert('workouts', newWorkout);
    
    const newExercises: ExerciseEntity[] = workoutData.exercises.map((ex, index) => ({
      ...ex,
      id: `ex-${Date.now()}-${index}`,
      workoutId: newWorkout.id,
    }));

    for (const ex of newExercises) {
        await db.insert('exercises', ex);
    }
    
    newWorkout.exercises = newExercises;
    
    return JSON.parse(JSON.stringify(newWorkout));
  }

  async updateWorkout(workout: WorkoutEntity): Promise<WorkoutEntity> {
    const workoutInDb = await db.findOne('workouts', w => w.id === workout.id);
    if (!workoutInDb) {
      throw new Error('Workout not found for update');
    }

    await db.update('workouts', w => w.id === workout.id, { name: workout.name, category: workout.category });

    await db.delete('exercises', ex => ex.workoutId === workout.id);

    const newExercises: ExerciseEntity[] = workout.exercises.map((ex, index) => ({
      ...ex,
      id: `ex-${Date.now()}-${index}`,
      workoutId: workout.id,
    }));

    for (const ex of newExercises) {
        await db.insert('exercises', ex);
    }

    workoutInDb.exercises = newExercises;
    workoutInDb.name = workout.name;
    workoutInDb.category = workout.category;

    return JSON.parse(JSON.stringify(workoutInDb));
  }
}
