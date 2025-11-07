interface CalculateTargetsParams {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'low' | 'medium' | 'high';
}

interface CalculatedTargets {
  calorieGoal: number;
  waterGoal: number; // ml
}

export class CalculateDailyTargetsUseCase {
  execute(params: CalculateTargetsParams): CalculatedTargets {
    const { weight, height, age, gender, activityLevel } = params;

    // Return 0 if essential data is missing to prevent NaN results
    if (!weight || !height || !age) {
        return { calorieGoal: 0, waterGoal: 0 };
    }

    let bmr: number;
    if (gender === 'male') {
      // Mifflin-St Jeor for men
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Mifflin-St Jeor for women
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers = {
      low: 1.2,
      medium: 1.55,
      high: 1.9,
    };
    const multiplier = activityMultipliers[activityLevel];
    const calorieGoal = Math.round(bmr * multiplier);
    
    // Water goal based on weight (e.g., 35ml per kg)
    const waterGoal = Math.round(weight * 35);

    return { calorieGoal, waterGoal };
  }
}
