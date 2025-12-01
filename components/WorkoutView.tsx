import React, { useState } from 'react';
import { UserProfile, WeeklyWorkoutPlan, WorkoutSession } from '../types';
import { generateWeeklyWorkoutPlan } from '../services/geminiService';
import { Dumbbell, Clock, PlayCircle, RefreshCw, AlertCircle, Calendar, Zap, BedDouble } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const WorkoutView: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      console.log("Generating weekly workout for:", user.goal);
      const result = await generateWeeklyWorkoutPlan(user);
      console.log("Workout generated:", result);
      
      if (!result || !result.sessions || result.sessions.length === 0) {
        throw new Error("O plano gerado não contém sessões válidas.");
      }
      setWeeklyPlan(result);
      setSelectedDayIndex(0); // Reset to Monday
    } catch (e: any) {
      console.error(e);
      let msg = "Falha ao criar treino. Tente novamente.";
      if (e.message && e.message.includes("429")) msg = "Muitos pedidos. Aguarde um pouco.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeLink = (exerciseName: string) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " exercise technique proper form")}`;
  };

  const currentSession: WorkoutSession | undefined = weeklyPlan?.sessions[selectedDayIndex];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Planeamento Semanal</h2>
          <p className="text-gray-400 text-sm">Microciclo e Periodização Mensal.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            loading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30 border border-neon-green/50'
          }`}
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
          {loading ? 'A Estruturar Semana...' : weeklyPlan ? 'Gerar Novo Ciclo' : 'Criar Plano Semanal'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!weeklyPlan && !loading && !error && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
          <Dumbbell className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-500">Nenhum ciclo ativo.</p>
          <button onClick={handleGenerate} className="mt-2 text-neon-blue hover:underline">
            Gerar Plano Completo (Segunda a Domingo)
          </button>
        </div>
      )}

      {loading && (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neon-green font-medium animate-pulse text-center">
            A construir Microciclo de 7 dias...<br/>
            <span className="text-sm text-gray-500 font-normal">Calculando volume, periodização e descanso.</span>
          </p>
        </div>
      )}

      {weeklyPlan && !loading && (
        <div className="space-y-6">
          
          {/* Periodization Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="w-32 h-32 text-neon-green" /></div>
             <div className="relative z-10">
                <span className="text-xs font-bold text-neon-green uppercase tracking-widest border border-neon-green/30 px-2 py-1 rounded mb-2 inline-block">
                    Estratégia Mensal
                </span>
                <h3 className="text-2xl font-bold text-white mb-1">{weeklyPlan.periodizationGoal}</h3>
                <p className="text-gray-300 text-sm max-w-2xl">{weeklyPlan.weeklyNotes}</p>
             </div>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
            {weeklyPlan.sessions.map((session, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`min-w-[100px] flex-1 py-3 px-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                  selectedDayIndex === idx
                    ? 'bg-neon-blue/10 border-neon-blue text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-gray-800 text-gray-500 hover:bg-slate-800/80 hover:border-gray-600'
                }`}
              >
                <span className={`text-xs font-bold uppercase ${selectedDayIndex === idx ? 'text-neon-blue' : ''}`}>
                    {session.day}
                </span>
                <span className="text-sm font-medium truncate w-full text-center">
                    {session.isRestDay ? 'Descanso' : 'Treino'}
                </span>
              </button>
            ))}
          </div>

          {/* Active Session Display */}
          {currentSession && (
            <div className="animate-fade-in">
                {currentSession.isRestDay ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 rounded-2xl border border-gray-800">
                        <BedDouble className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Dia de Descanso</h3>
                        <p className="text-gray-400 max-w-md text-center">
                            A recuperação é onde o músculo cresce. Dorme bem, hidrata-te e prepara-te para destruir o treino de amanhã.
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-end mb-4 px-2">
                             <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-neon-green">Treino de Hoje:</span> {currentSession.name}
                                </h3>
                                <p className="text-gray-400 text-sm">{currentSession.description}</p>
                             </div>
                             <span className="bg-slate-800 text-xs px-3 py-1 rounded-full border border-gray-700">
                                {currentSession.exercises.length} Exercícios
                             </span>
                        </div>

                        <div className="grid gap-4">
                            {currentSession.exercises.map((ex, idx) => (
                            <div key={idx} className="bg-slate-900/80 backdrop-blur-sm border border-gray-800 p-5 rounded-xl hover:border-gray-600 transition-colors group relative overflow-hidden">
                                {/* Visual Accent for Muscle Group */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-blue to-transparent"></div>

                                <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-100 group-hover:text-neon-green transition-colors flex items-center gap-2">
                                    <span className="text-gray-600 text-sm font-mono">0{idx + 1}</span>
                                    {ex.name}
                                    </h4>
                                    <span className="text-xs text-neon-blue uppercase tracking-wider font-bold mt-1 block">{ex.muscleGroup}</span>
                                </div>
                                <a 
                                    href={getYoutubeLink(ex.name)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-red-600 hover:text-white text-gray-400 px-3 py-2 rounded-lg transition-all text-xs font-bold border border-gray-700 hover:border-red-500"
                                    title="Ver técnica no YouTube"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                    VER VÍDEO
                                </a>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pl-3">
                                <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-800/50">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Séries</p>
                                    <p className="font-bold text-white text-lg">{ex.sets}</p>
                                </div>
                                <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-800/50">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Reps</p>
                                    <p className="font-bold text-white text-lg">{ex.reps}</p>
                                </div>
                                <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-800/50">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Carga</p>
                                    <p className="font-bold text-neon-blue text-sm pt-1">{ex.load || 'Ajustável'}</p>
                                </div>
                                <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-800/50">
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Descanso</p>
                                    <div className="flex items-center justify-center gap-1 text-gray-300">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-sm">{ex.rest}</span>
                                    </div>
                                </div>
                                </div>

                                <div className="bg-slate-800/30 p-3 rounded-lg text-sm text-gray-300 ml-3 border-l-2 border-neon-green/50">
                                <p className="mb-1"><span className="text-neon-green font-semibold text-xs uppercase mr-2">Técnica:</span> {ex.notes}</p>
                                <p className="text-xs text-gray-500">Cadência: {ex.cadence}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutView;