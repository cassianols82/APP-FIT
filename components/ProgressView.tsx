import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Camera, Plus, X, Save, Activity, Scale, Heart } from 'lucide-react';
import { ProgressEntry, UserProfile } from '../types';

// Mock data generator for empty state
const generateMockData = (): ProgressEntry[] => {
    return [];
};

interface Props {
  user?: UserProfile;
}

const ProgressView: React.FC<Props> = ({ user }) => {
  const [history, setHistory] = useState<ProgressEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(user?.weight || 0);
  const [bodyFat, setBodyFat] = useState(user?.bodyFat || 0);
  const [leanMass, setLeanMass] = useState(0);
  const [visceralFat, setVisceralFat] = useState(0);
  const [metabolicAge, setMetabolicAge] = useState(user?.age || 0);
  
  // Initial Load from LocalStorage
  useEffect(() => {
      const stored = localStorage.getItem('cls_progress_history');
      if (stored) {
          setHistory(JSON.parse(stored));
      } else {
          // If no history, maybe add initial user data?
          if (user) {
             const initialEntry: ProgressEntry = {
                 id: Date.now().toString(),
                 date: new Date().toISOString().split('T')[0],
                 weight: user.weight,
                 bodyFat: user.bodyFat,
                 leanMass: user.weight * (1 - (user.bodyFat || 20)/100), // Estimate
                 visceralFat: 5, // Default estimate
                 metabolicAge: user.age,
                 bmi: user.weight / ((user.height/100) * (user.height/100))
             };
             // We don't auto-save this to avoid messing up real tracking, but we could.
          }
      }
  }, [user]);

  const saveEntry = () => {
      const heightInMeters = (user?.height || 170) / 100;
      const calculatedBMI = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

      const newEntry: ProgressEntry = {
          id: Date.now().toString(),
          date: entryDate,
          weight: parseFloat(weight.toString()),
          bodyFat: parseFloat(bodyFat.toString()),
          leanMass: parseFloat(leanMass.toString()),
          visceralFat: parseFloat(visceralFat.toString()),
          metabolicAge: parseFloat(metabolicAge.toString()),
          bmi: calculatedBMI
      };

      const newHistory = [...history, newEntry].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setHistory(newHistory);
      localStorage.setItem('cls_progress_history', JSON.stringify(newHistory));
      
      // Update User Profile weight as well
      if (user) {
          const updatedUser = { ...user, weight: newEntry.weight, bodyFat: newEntry.bodyFat };
          localStorage.setItem('fitcraft_user', JSON.stringify(updatedUser));
      }

      setShowModal(false);
  };

  const ChartCard = ({ title, dataKey, color, unit, type = 'area' }: any) => (
      <div className="bg-slate-900 p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-all">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">
            {title}
            <span className="text-white text-lg">{history.length > 0 ? history[history.length - 1][dataKey as keyof ProgressEntry] : '-'} <span className="text-xs text-gray-500">{unit}</span></span>
        </h3>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {type === 'area' ? (
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                        <YAxis stroke="#475569" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#94a3b8' }} />
                        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color${dataKey})`} />
                    </AreaChart>
                ) : (
                     <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                         <XAxis dataKey="date" stroke="#475569" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                        <YAxis stroke="#475569" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#94a3b8' }} />
                        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{r: 4, fill: color}} />
                     </LineChart>
                )}
            </ResponsiveContainer>
        </div>
      </div>
  );

  return (
    <div className="space-y-8 pb-10">
       <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">CLS <span className="text-neon-blue">Evolução</span></h2>
          <p className="text-gray-400 text-sm">Monitorização profissional de biometria.</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-neon-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-neon-blue/20"
        >
            <Plus className="w-5 h-5" /> Registar Avaliação
        </button>
      </div>

      {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-800 rounded-3xl bg-slate-900/30">
              <Activity className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500 font-medium mb-4">Ainda sem dados registados.</p>
              <button onClick={() => setShowModal(true)} className="text-neon-blue hover:underline">Adicionar a primeira avaliação</button>
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <ChartCard title="Peso Corporal" dataKey="weight" unit="kg" color="#0ea5e9" type="area" />
            <ChartCard title="Massa Gorda" dataKey="bodyFat" unit="%" color="#f59e0b" type="line" />
            <ChartCard title="Massa Magra" dataKey="leanMass" unit="kg" color="#10b981" type="area" />
            <ChartCard title="IMC (Índice)" dataKey="bmi" unit="" color="#8b5cf6" type="line" />
            <ChartCard title="Gordura Visceral" dataKey="visceralFat" unit="lvl" color="#ef4444" type="bar" />
            <ChartCard title="Idade Metabólica" dataKey="metabolicAge" unit="anos" color="#6366f1" type="line" />
          </div>
      )}

      {/* Entry Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-gray-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-fade-in">
                  <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                      <X className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Scale className="w-6 h-6 text-neon-blue" /> Nova Avaliação
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 uppercase font-bold">Data da Pesagem</label>
                        <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="w-full bg-slate-950 border border-gray-800 rounded-lg p-3 text-white focus:border-neon-blue outline-none mt-1" />
                      </div>

                      <div>
                        <label className="text-xs text-neon-blue uppercase font-bold">Peso (kg)</label>
                        <input type="number" step="0.1" value={weight} onChange={e => setWeight(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-gray-800 rounded-lg p-3 text-white focus:border-neon-blue outline-none mt-1 font-bold text-lg" />
                      </div>
                      
                       <div>
                        <label className="text-xs text-orange-500 uppercase font-bold">Massa Gorda (%)</label>
                        <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-gray-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none mt-1 font-bold text-lg" />
                      </div>

                      <div>
                        <label className="text-xs text-emerald-500 uppercase font-bold">Massa Magra (kg)</label>
                        <input type="number" step="0.1" value={leanMass} onChange={e => setLeanMass(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-gray-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none mt-1 font-bold text-lg" />
                      </div>

                      <div>
                        <label className="text-xs text-red-500 uppercase font-bold">Gordura Visceral</label>
                        <input type="number" step="0.5" value={visceralFat} onChange={e => setVisceralFat(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-gray-800 rounded-lg p-3 text-white focus:border-red-500 outline-none mt-1 font-bold text-lg" />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-indigo-500 uppercase font-bold">Idade Metabólica</label>
                         <input type="number" value={metabolicAge} onChange={e => setMetabolicAge(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-gray-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none mt-1 font-bold text-lg" />
                      </div>
                  </div>

                  <button 
                    onClick={saveEntry}
                    className="w-full mt-8 bg-neon-blue text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                      <Save className="w-5 h-5" /> Gravar Dados
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProgressView;