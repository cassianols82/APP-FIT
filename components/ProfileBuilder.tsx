import React, { useState } from 'react';
import { UserProfile, Goal, ExperienceLevel, DietType } from '../types';
import { ChevronRight, Check } from 'lucide-react';

interface Props {
  initialData: Partial<UserProfile>;
  onComplete: (data: UserProfile) => void;
}

// --- Helper Components moved outside to prevent re-renders & focus loss ---

const SectionTitle = ({ title, sub }: { title: string, sub: string }) => (
  <div className="mb-8 text-center animate-fade-in">
    <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic">{title}</h2>
    <p className="text-neon-blue font-medium">{sub}</p>
  </div>
);

const Input = ({ label, type = "text", value, onChange, suffix, placeholder }: any) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <input 
        type={type} 
        value={value} 
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-900 border-2 border-gray-800 rounded-xl px-4 py-4 text-white focus:ring-0 focus:border-neon-blue outline-none transition-all font-medium placeholder-gray-600 group-hover:border-gray-700"
      />
      {suffix && <span className="absolute right-4 top-4 text-gray-500 font-bold">{suffix}</span>}
    </div>
  </div>
);

const SelectCard = ({ selected, value, label, onClick }: any) => (
  <div 
    onClick={() => onClick(value)}
    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
      selected === value 
        ? 'bg-neon-blue/10 border-neon-blue text-white shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
        : 'bg-slate-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:bg-slate-800/80'
    }`}
  >
    <span className="font-bold text-lg">{label}</span>
    {selected === value && <Check className="w-6 h-6 text-neon-blue" />}
  </div>
);

const ProfileBuilder: React.FC<Props> = ({ initialData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize with EXPLICIT empty strings for text fields to prevent "undefined" or "None" showing up
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '', // Explicit empty string
    email: '',
    injuries: '',
    allergies: '',
    equipment: [],
    
    // Default enumerations
    goal: Goal.LoseWeight,
    experience: ExperienceLevel.Beginner,
    location: 'Gym',
    dietType: DietType.Standard,
    gender: 'Male',
    mealsPerDay: 4,
    activityLevel: 'Moderately Active',
    frequency: 3,
    budget: 'Medium',
    
    // Spread initial data if exists, but ensure we don't overwrite with undefined
    ...initialData
  });

  const update = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);
  
  const finish = () => {
    setIsSubmitting(true);
    
    // Validation
    if (!formData.name || !formData.age || !formData.weight || !formData.height) {
        setIsSubmitting(false);
        return alert("Por favor, preencha todos os dados de biometria (Nome, Idade, Altura, Peso).");
    }

    const finalProfile: UserProfile = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email || `user_${Date.now()}@example.com`,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        goal: formData.goal as Goal,
        activityLevel: formData.activityLevel || 'Moderately Active',
        experience: formData.experience as ExperienceLevel,
        frequency: formData.frequency || 4,
        location: formData.location as 'Gym' | 'Home' | 'Both',
        equipment: formData.equipment || [],
        injuries: formData.injuries || 'None',
        dietType: formData.dietType as DietType,
        allergies: formData.allergies || 'None',
        mealsPerDay: formData.mealsPerDay || 4,
        budget: formData.budget || 'Medium',
        isPremium: true,
        ...formData
    } as UserProfile;

    setTimeout(() => {
        onComplete(finalProfile);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="flex justify-center mb-8">
        <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-2 w-12 rounded-full transition-all ${step >= i ? 'bg-neon-blue' : 'bg-gray-800'}`}></div>
            ))}
        </div>
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="animate-fade-in">
          <SectionTitle title="Perfil do Atleta" sub="Dados biométricos essenciais." />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2">
                <Input 
                    label="Nome Completo" 
                    placeholder="Como queres ser tratado?"
                    value={formData.name} 
                    onChange={(v: string) => update('name', v)} 
                />
            </div>
            <Input label="Idade" type="number" value={formData.age || ''} onChange={(v: string) => update('age', parseInt(v))} />
            <Input label="Altura" type="number" suffix="cm" value={formData.height || ''} onChange={(v: string) => update('height', parseInt(v))} />
            <Input label="Peso Atual" type="number" suffix="kg" value={formData.weight || ''} onChange={(v: string) => update('weight', parseFloat(v))} />
            <div className="col-span-2 mt-2">
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Sexo Biológico</label>
                <div className="flex gap-4">
                    {['Male', 'Female'].map(g => (
                        <button 
                            key={g}
                            onClick={() => update('gender', g)}
                            className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${formData.gender === g ? 'bg-white text-slate-900 border-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            {g === 'Male' ? 'Masculino' : 'Feminino'}
                        </button>
                    ))}
                </div>
            </div>
          </div>
          <button onClick={next} className="w-full mt-10 bg-neon-blue text-white font-black py-5 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-2 uppercase tracking-wide">
            Continuar <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Step 2: Goals */}
      {step === 2 && (
        <div className="animate-fade-in">
          <SectionTitle title="Objetivo Principal" sub="Define o teu alvo." />
          <div className="space-y-3">
            {Object.values(Goal).map(g => (
              <SelectCard 
                key={g} 
                label={g} 
                value={g} 
                selected={formData.goal} 
                onClick={(v: any) => update('goal', v)} 
              />
            ))}
          </div>
          <div className="mt-8">
             <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Nível de Experiência</label>
             <div className="grid grid-cols-3 gap-3">
                {Object.values(ExperienceLevel).map(l => (
                    <button 
                        key={l}
                        onClick={() => update('experience', l)}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.experience === l ? 'border-neon-green text-neon-green bg-neon-green/5' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                    >
                        {l}
                    </button>
                ))}
             </div>
          </div>
           <div className="flex gap-4 mt-10">
            <button onClick={prev} className="flex-1 py-4 text-gray-500 font-bold hover:text-white transition-colors">Voltar</button>
            <button onClick={next} className="flex-[2] bg-white text-slate-900 font-black py-4 rounded-xl hover:bg-gray-200 uppercase">Seguinte</button>
          </div>
        </div>
      )}

      {/* Step 3: Logistics */}
      {step === 3 && (
        <div className="animate-fade-in">
           <SectionTitle title="Logística de Treino" sub="Adaptação à tua realidade." />
           <div className="space-y-6">
                <div>
                    <label className="text-gray-300 text-sm font-bold uppercase block mb-3">Onde vais treinar?</label>
                    <div className="flex gap-3">
                         {['Gym', 'Home', 'Both'].map(loc => (
                             <button key={loc} onClick={() => update('location', loc)} className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${formData.location === loc ? 'bg-slate-800 border-neon-blue text-white' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                                {loc === 'Gym' ? 'Ginásio' : loc === 'Home' ? 'Casa' : 'Híbrido'}
                             </button>
                         ))}
                    </div>
                </div>
                <Input 
                    label="Equipamento Disponível" 
                    placeholder="Ex: Halteres, Barra, Elásticos..."
                    value={formData.equipment?.join(', ') || ''} 
                    onChange={(v: string) => update('equipment', v.split(',').map(s => s.trim()))} 
                />
                <Input 
                    label="Lesões ou Limitações" 
                    placeholder="Ex: Hérnia discal, dor no joelho..."
                    value={formData.injuries} 
                    onChange={(v: string) => update('injuries', v)} 
                />
           </div>
           <div className="flex gap-4 mt-10">
            <button onClick={prev} className="flex-1 py-4 text-gray-500 font-bold hover:text-white">Voltar</button>
            <button onClick={next} className="flex-[2] bg-white text-slate-900 font-black py-4 rounded-xl hover:bg-gray-200 uppercase">Seguinte</button>
          </div>
        </div>
      )}

      {/* Step 4: Nutrition */}
      {step === 4 && (
        <div className="animate-fade-in">
            <SectionTitle title="Preferências Nutricionais" sub="Combustível premium." />
            <div className="space-y-6">
                 <div>
                    <label className="text-gray-300 text-sm font-bold uppercase block mb-3">Estilo Alimentar</label>
                    <select 
                        className="w-full bg-slate-900 border-2 border-gray-800 rounded-xl px-4 py-4 text-white font-medium focus:border-neon-blue outline-none"
                        value={formData.dietType}
                        onChange={(e) => update('dietType', e.target.value)}
                    >
                        {Object.values(DietType).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <Input label="Refeições por dia" type="number" value={formData.mealsPerDay || 4} onChange={(v: string) => update('mealsPerDay', parseInt(v))} />
                 <Input label="Alergias / Intolerâncias" placeholder="Ex: Lactose, Glúten, Amendoim..." value={formData.allergies} onChange={(v: string) => update('allergies', v)} />
            </div>
             <div className="flex gap-4 mt-10">
                <button onClick={prev} disabled={isSubmitting} className="flex-1 py-4 text-gray-500 font-bold hover:text-white">Voltar</button>
                <button onClick={finish} disabled={isSubmitting} className="flex-[2] bg-neon-blue text-white font-black py-4 rounded-xl hover:bg-blue-600 shadow-lg shadow-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide">
                    {isSubmitting ? 'A Gerar Perfil...' : 'Finalizar Registo'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBuilder;