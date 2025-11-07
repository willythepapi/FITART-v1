import type { FoodItemEntity } from '../domain/entities';

const foodData = {
  "chicken_breast": { "name": "Tavuk Göğsü", "protein": 31, "carbs": 0, "fat": 3.6, "calories": 165 },
  "turkey_breast": { "name": "Hindi Göğsü", "protein": 29, "carbs": 0, "fat": 1, "calories": 135 },
  "egg": { "name": "Yumurta", "protein": 13, "carbs": 1.1, "fat": 11, "calories": 155 },
  "egg_white": { "name": "Yumurta Beyazı", "protein": 11, "carbs": 0.7, "fat": 0.2, "calories": 52 },
  "egg_yolk": { "name": "Yumurta Sarısı", "protein": 16, "carbs": 3.6, "fat": 27, "calories": 322 },
  "oats": { "name": "Yulaf", "protein": 13, "carbs": 68, "fat": 7, "calories": 379 },
  "white_rice": { "name": "Beyaz Pirinç (Pişmiş)", "protein": 2.7, "carbs": 28, "fat": 0.3, "calories": 130 },
  "bulgur": { "name": "Bulgur (Pişmiş)", "protein": 3.1, "carbs": 18.6, "fat": 0.2, "calories": 83 },
  "pasta": { "name": "Makarna (Pişmiş)", "protein": 5, "carbs": 25, "fat": 1.1, "calories": 131 },
  "sweet_potato": { "name": "Tatlı Patates", "protein": 1.6, "carbs": 20, "fat": 0.1, "calories": 86 },
  "banana": { "name": "Muz", "protein": 1.1, "carbs": 23, "fat": 0.3, "calories": 96 },
  "apple": { "name": "Elma", "protein": 0.3, "carbs": 14, "fat": 0.2, "calories": 52 },
  "avocado": { "name": "Avokado", "protein": 2, "carbs": 9, "fat": 15, "calories": 160 },
  "almonds": { "name": "Badem", "protein": 21, "carbs": 22, "fat": 50, "calories": 579 },
  "peanut_butter": { "name": "Fıstık Ezmesi", "protein": 25, "carbs": 20, "fat": 50, "calories": 588 },
  "olive_oil": { "name": "Zeytinyağı", "protein": 0, "carbs": 0, "fat": 100, "calories": 884 },
  "salmon": { "name": "Somon", "protein": 20, "carbs": 0, "fat": 13, "calories": 208 },
  "beef_steak": { "name": "Dana Biftek", "protein": 26, "carbs": 0, "fat": 15, "calories": 250 },
  "minced_beef": { "name": "Dana Kıyma (%15 Yağlı)", "protein": 25, "carbs": 0, "fat": 15, "calories": 240 },
  "grilled_kofte": { "name": "Izgara Köfte", "protein": 17, "carbs": 3, "fat": 18, "calories": 250 },
  "chicken_doner": { "name": "Tavuk Döner", "protein": 18, "carbs": 2, "fat": 12, "calories": 190 },
  "protein_powder": { "name": "Whey Protein Tozu", "protein": 80, "carbs": 5, "fat": 6, "calories": 400 }
};

export const FOOD_DATABASE: FoodItemEntity[] = Object.entries(foodData).map(([id, data]) => ({
  id,
  name: data.name,
  protein: data.protein,
  carbs: data.carbs,
  fat: data.fat,
  calories_per_100g: data.calories,
}));


export function searchFoods(query: string): FoodItemEntity[] {
  if (!query) {
    return [];
  }
  const lowerCaseQuery = query.toLowerCase();
  return FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(lowerCaseQuery)
  ).slice(0, 50); // Limit results for performance
}