import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, User, LogOut, Menu, X, CheckCircle, Crown } from 'lucide-react';
import { UserProfile } from './types';
import ProfileBuilder from './components/ProfileBuilder';
import WorkoutView from './components/WorkoutView';
import NutritionView from './components/NutritionView';
import ProgressView from './components/ProgressView';

// --- Components (Inline for brevity within file limit context where appropriate, or structural) ---

const Logo = () => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 tracking-tighter">
        <span className="text-3xl font-black text-white italic" style={{fontFamily: 'Montserrat, sans-serif'}}>CLS</span>
        <div className="h-6 w-[2px] bg-neon-blue rotate-12"></div>
        <span className="text-sm font-bold text-gray-400 uppercase leading-none">Fitness<br/><span className="text-neon-blue">Coach</span></span>
    </div>
  </div>
);

const SidebarItem = ({ to, icon: Icon, label }: any) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        active 
          ? 'bg-gradient-to-r from-neon-blue/20 to-transparent text-neon-blue border-l-4 border-neon-blue' 
          : 'text-gray-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-neon-blue' : 'group-hover:text-gray-200'}`} />
      <span className="font-bold tracking-wide">{label}</span>
    </Link>
  );
};

const DashboardHome = ({ user }: { user: UserProfile }) => (
  <div className="space-y-8 animate-fade-in">
    <header className="flex justify-between items-end border-b border-gray-800 pb-6">
       <div>
         <h1 className="text-4xl font-black text-white italic tracking-tight uppercase">Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">{user.name.split(' ')[0]}</span></h1>
         <p className="text-gray-400 mt-2 font-medium">Estás pronto para superar os teus limites hoje?</p>
       </div>
       <div className="hidden md:block text-right">
         <p className="text-xs text-gray-500 uppercase font-bold mb-1">Objetivo Atual</p>
         <span className="bg-slate-800 border border-neon-blue/30 px-4 py-2 rounded-full text-sm text-white font-bold shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            {user.goal}
         </span>
       </div>
    </header>

    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-gray-700 relative overflow-hidden group hover:border-neon-blue transition-all cursor-pointer shadow-lg">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500"><Dumbbell className="w-32 h-32 text-white" /></div>
         <h3 className="text-neon-blue text-xs font-black uppercase tracking-widest mb-3">Plano de Treino</h3>
         <p className="text-3xl font-black text-white mb-6 italic">HOJE</p>
         <Link to="/workout" className="inline-flex items-center bg-neon-blue text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-600 transition-colors">Ver Treino &rarr;</Link>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-gray-700 relative overflow-hidden group hover:border-neon-green transition-all cursor-pointer shadow-lg">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500"><Utensils className="w-32 h-32 text-white" /></div>
         <h3 className="text-neon-green text-xs font-black uppercase tracking-widest mb-3">Nutrição</h3>
         <p className="text-3xl font-black text-white mb-6 italic">MACROS</p>
         <Link to="/nutrition" className="inline-flex items-center bg-neon-green text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors">Ver Dieta &rarr;</Link>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
         <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-3">Membro Elite</h3>
         <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse-slow" />
            <span className="text-2xl font-black text-white italic">CLS PRO</span>
         </div>
         <p className="text-sm text-gray-400 font-medium">Acesso total à Inteligência Artificial e planos personalizados.</p>
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Simulate fetching user from local storage
    const stored = localStorage.getItem('fitcraft_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleRegister = (data: UserProfile) => {
    const newUser = { ...data, id: 'u1', isPremium: true };
    setUser(newUser);
    localStorage.setItem('fitcraft_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('fitcraft_user');
    setUser(null);
  };

  if (loading) return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-neon-blue font-bold tracking-widest animate-pulse">CARREGANDO CLS...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="p-8 flex justify-center items-center">
            <Logo />
        </header>
        <ProfileBuilder initialData={{}} onComplete={handleRegister} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex overflow-hidden selection:bg-neon-blue selection:text-white">
        
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center">
            <Logo />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-gray-800 transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block`}>
          <div className="h-full flex flex-col p-8">
            <div className="mb-12 hidden md:block pl-2"><Logo /></div>
            
            <nav className="flex-1 space-y-3 mt-16 md:mt-0">
              <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/workout" icon={Dumbbell} label="Treino" />
              <SidebarItem to="/nutrition" icon={Utensils} label="Nutrição" />
              <SidebarItem to="/progress" icon={TrendingUp} label="Evolução" />
            </nav>

            <div className="pt-8 border-t border-gray-800">
               <div className="flex items-center gap-3 mb-6 px-2 bg-slate-800/50 p-3 rounded-xl border border-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-neon-blue to-neon-green flex items-center justify-center font-black text-slate-900 text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-neon-blue font-bold uppercase tracking-wider">CLS Athlete</p>
                  </div>
               </div>
               <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white text-sm font-bold w-full text-left rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-wide">
                 <LogOut className="w-4 h-4" /> Terminar Sessão
               </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen pt-24 md:pt-0 p-4 md:p-10 relative scroll-smooth">
           {/* Background decorative elements */}
           <div className="absolute top-0 left-0 w-full h-[500px] bg-neon-blue/5 rounded-full blur-[150px] pointer-events-none transform -translate-y-1/2"></div>

           <div className="max-w-6xl mx-auto relative z-10 pb-24">
             <Routes>
               <Route path="/" element={<DashboardHome user={user} />} />
               <Route path="/workout" element={<WorkoutView user={user} />} />
               <Route path="/nutrition" element={<NutritionView user={user} />} />
               <Route path="/progress" element={<ProgressView user={user} />} />
               <Route path="*" element={<Navigate to="/" />} />
             </Routes>
           </div>
        </main>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        )}
      </div>
    </Router>
  );
};

export default App;