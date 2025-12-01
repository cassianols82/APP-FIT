import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, WeeklyWorkoutPlan, NutritionPlan } from "../types";

const apiKey = process.env.API_KEY || ""; 

const ai = new GoogleGenAI({ apiKey });

// Helper to clean Markdown code blocks from JSON response
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  
  // Try to find JSON object structure
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  
  return cleaned;
};

export const generateWeeklyWorkoutPlan = async (user: UserProfile): Promise<WeeklyWorkoutPlan> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `You are an ELITE BODYBUILDING COACH creating a PERIODIZED MESOCYCLE.
  
  YOUR MISSION: Create a FULL 7-DAY WEEKLY TRAINING SPLIT.
  
  MANDATORY RULES (STRICT):
  1. WEEKLY STRUCTURE: Generate exactly 7 days (Monday to Sunday).
  2. SPLIT LOGIC: Use a professional split (e.g., PPL, Upper/Lower, Arnold Split) based on user frequency (${user.frequency} days/week).
  3. REST DAYS: If the user trains 4 days, you MUST generate 3 Rest Days. Label them clearly.
  4. VOLUME PER SESSION (Training Days):
     - PRIMARY Muscle Group: EXACTLY 4 to 5 exercises.
     - SECONDARY Muscle Group: EXACTLY 3 exercises.
     - TOTAL Exercises: Minimum 8 per session.
  5. PERIODIZATION: Provide a specific strategy for the next 4 weeks (e.g., "Week 1: RPE 7, Week 2: RPE 8, Week 3: RPE 9, Week 4: Deload").
  
  LANGUAGE: Portuguese (PT).
  OUTPUT: Raw JSON only.
  `;

  const prompt = `
    User Profile:
    - Goal: ${user.goal}
    - Experience: ${user.experience}
    - Frequency: ${user.frequency} days per week
    - Equipment: ${user.equipment?.join(', ') || 'Full Commercial Gym'}
    - Injuries: ${user.injuries || 'None'}
    
    TASK: Generate a WEEKLY PLAN (Microcycle 1).
    
    IMPORTANT:
    - Days must be: "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo".
    - For Rest Days: "isRestDay": true, "exercises": [].
    - For Training Days: Detailed exercises with links, sets, reps.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      periodizationGoal: { type: Type.STRING, description: "Focus of this month e.g. Hypertrophy Accumulation" },
      weeklyNotes: { type: Type.STRING, description: "How to progress loads over the next 4 weeks" },
      sessions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            isRestDay: { type: Type.BOOLEAN },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.NUMBER },
                  reps: { type: Type.STRING },
                  load: { type: Type.STRING },
                  rest: { type: Type.STRING },
                  cadence: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  muscleGroup: { type: Type.STRING }
                },
                required: ["name", "sets", "reps", "rest", "notes", "muscleGroup", "cadence", "load"]
              }
            }
          },
          required: ["day", "isRestDay", "name", "description", "exercises"]
        }
      }
    },
    required: ["name", "periodizationGoal", "weeklyNotes", "sessions"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini");
    
    const jsonString = cleanJson(text);
    const data = JSON.parse(jsonString) as WeeklyWorkoutPlan;
    
    data.id = Date.now().toString();
    data.createdAt = new Date().toISOString();
    return data;

  } catch (error) {
    console.error("Gemini Workout Error:", error);
    throw error;
  }
};

export const generateNutritionPlan = async (user: UserProfile): Promise<NutritionPlan> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are a 5-STAR MICHELIN CHEF and Sports Nutritionist.
  
  YOUR MISSION: Create a HIGH-END, APPETIZING, and PRECISE meal plan.
  
  CRITICAL RULES:
  1. NO LAZY MEALS. Do not generate "Oatmeal with water". Generate "Creamy Vanilla Oats with Caramelized Banana & Walnuts".
  2. PRECISION: Every single ingredient needs a weight in grams (g).
  3. COMPLEXITY: Instructions must teach the user how to cook properly (searing, roasting, seasoning).
  4. MACROS: Must hit the user's specific caloric needs for: ${user.goal}.
  
  LANGUAGE: Portuguese (PT).
  OUTPUT: Raw JSON only.
  `;

  const prompt = `
    Create a Full Day of Eating for:
    - Stats: ${user.height}cm, ${user.weight}kg, ${user.gender}.
    - Goal: ${user.goal}.
    - Diet Preference: ${user.dietType}.
    - Meals per day: ${user.mealsPerDay || 4}.
    
    REQUIREMENTS:
    - Meal Names: Must sound like a restaurant menu item.
    - Ingredients: List spices, cooking oils, and specific types of vegetables.
    - Instructions: Step-by-step culinary guide.
    - Rationale: Explain WHY this food helps their specific goal (e.g., "High leucine content for protein synthesis post-workout").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      totalCalories: { type: Type.NUMBER },
      totalProtein: { type: Type.NUMBER },
      totalCarbs: { type: Type.NUMBER },
      totalFats: { type: Type.NUMBER },
      rationale: { type: Type.STRING },
      shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } },
      meals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            prepTime: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING }
                },
                required: ["name", "amount"]
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "type", "calories", "ingredients", "instructions"]
        }
      }
    },
    required: ["name", "totalCalories", "meals", "rationale", "shoppingList"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data from Gemini");

    const jsonString = cleanJson(text);
    const data = JSON.parse(jsonString) as NutritionPlan;
    
    data.id = Date.now().toString();
    data.createdAt = new Date().toISOString();
    return data;
  } catch (error) {
    console.error("Gemini Nutrition Error:", error);
    throw error;
  }
};