export enum Goal {
  LoseWeight = "Perder Peso",
  GainMuscle = "Ganhar Massa Muscular",
  Recomp = "Recomposição Corporal",
  Maintain = "Manter"
}

export enum ExperienceLevel {
  Beginner = "Iniciante",
  Intermediate = "Intermédio",
  Advanced = "Avançado"
}

export enum DietType {
  Standard = "Normal",
  Vegetarian = "Vegetariana",
  Vegan = "Vegan",
  Paleo = "Paleo",
  Keto = "Cetogénica"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  // Physical
  age: number;
  height: number; // cm
  weight: number; // kg
  bodyFat?: number; // %
  gender: 'Male' | 'Female' | 'Other';
  // Goals & Activity
  goal: Goal;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  experience: ExperienceLevel;
  frequency: number; // times per week
  location: 'Gym' | 'Home' | 'Both';
  equipment: string[];
  injuries: string;
  // Nutrition
  dietType: DietType;
  allergies: string;
  mealsPerDay: number;
  budget: 'Low' | 'Medium' | 'High';
  
  isPremium: boolean;
  avatar?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "10-12"
  load?: string; // e.g., "RPE 8" or "Moderate"
  rest: string; // e.g., "60s"
  cadence: string; // e.g., "3-0-1"
  notes: string;
  muscleGroup: string;
}

export interface WorkoutSession {
  day: string; // "Segunda", "Terça", etc.
  isRestDay: boolean;
  name: string; // "Push A" or "Descanso Ativo"
  description: string;
  exercises: Exercise[];
}

export interface WeeklyWorkoutPlan {
  id: string;
  name: string; // e.g. "Hypertrophy Phase 1"
  periodizationGoal: string; // e.g. "Accumulation Phase - Weeks 1-4"
  weeklyNotes: string; // Instructions for the month
  sessions: WorkoutSession[];
  createdAt: string;
}

export interface Ingredient {
  name: string;
  amount: string; // e.g., "150g"
}

export interface Meal {
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
}

export interface NutritionPlan {
  id: string;
  name: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: Meal[];
  shoppingList: string[];
  rationale: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  date: string; // ISO date string
  weight: number; // kg
  bodyFat?: number; // % (Massa Gorda)
  leanMass?: number; // kg (Massa Magra)
  visceralFat?: number; // level/index
  metabolicAge?: number; // years
  bmi?: number; // index
  notes?: string;
}