import React, { useState } from 'react';
import { UserProfile, NutritionPlan } from '../types';
import { generateNutritionPlan } from '../services/geminiService';
import { Utensils, Flame, Leaf, Droplet, ChefHat, RefreshCw, ShoppingCart, AlertCircle } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const NutritionView: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateNutritionPlan(user);
      if(!result || !result.meals) throw new Error("Dados de dieta incompletos.");
      setPlan(result);
    } catch (e: any) {
      console.error(e);
      let msg = "Erro ao gerar dieta.";
      if (e.message && e.message.includes("429")) msg = "Limite de pedidos atingido. Tente novamente em breve.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Nutrição de Precisão</h2>
          <p className="text-gray-400 text-sm">Macros calculadas para o teu metabolismo.</p>
        </div>
         <button
          onClick={handleGenerate}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            loading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 border border-neon-blue/50'
          }`}
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Utensils className="w-5 h-5" />}
          {loading ? 'A Cozinhar...' : plan ? 'Gerar Nova' : 'Criar Dieta'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!plan && !loading && !error && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
          <Leaf className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-500">Nenhuma dieta planeada para hoje.</p>
        </div>
      )}

      {loading && (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neon-blue font-medium animate-pulse">A calcular macronutrientes...</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Macro Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Flame className="w-12 h-12 text-orange-500" /></div>
                <p className="text-gray-400 text-xs uppercase font-bold">Calorias</p>
                <p className="text-2xl font-bold text-white">{plan.totalCalories}</p>
                <p className="text-xs text-orange-400">kcal</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-xs uppercase font-bold">Proteína</p>
                <p className="text-2xl font-bold text-white">{plan.totalProtein}g</p>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full"><div className="bg-neon-green h-1 rounded-full" style={{width: '100%'}}></div></div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-xs uppercase font-bold">Carbs</p>
                <p className="text-2xl font-bold text-white">{plan.totalCarbs}g</p>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full"><div className="bg-blue-400 h-1 rounded-full" style={{width: '60%'}}></div></div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-xs uppercase font-bold">Gordura</p>
                <p className="text-2xl font-bold text-white">{plan.totalFats}g</p>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full"><div className="bg-yellow-400 h-1 rounded-full" style={{width: '30%'}}></div></div>
            </div>
          </div>

          <div className="bg-neon-blue/5 border border-neon-blue/20 p-4 rounded-xl text-sm text-gray-300">
             <span className="font-bold text-neon-blue">Estratégia:</span> {plan.rationale}
          </div>

          <div className="space-y-4">
            {plan.meals.map((meal, idx) => (
              <div key={idx} className="bg-slate-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800 px-5 py-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{meal.type}: {meal.name}</h4>
                    <p className="text-xs text-gray-400">{meal.prepTime} • {meal.calories} kcal</p>
                  </div>
                  <ChefHat className="w-5 h-5 text-gray-500" />
                </div>
                <div className="p-5 grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Ingredientes</h5>
                    <ul className="space-y-1">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between text-sm text-gray-300 border-b border-gray-800 pb-1 last:border-0">
                          <span>{ing.name}</span>
                          <span className="font-mono text-neon-blue">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Preparação</h5>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                      {meal.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-gray-700">
             <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                <ShoppingCart className="w-5 h-5 text-neon-green" /> Lista de Compras
             </h3>
             <div className="flex flex-wrap gap-2">
                {plan.shoppingList.map((item, i) => (
                    <span key={i} className="bg-slate-900 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700">
                        {item}
                    </span>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionView;