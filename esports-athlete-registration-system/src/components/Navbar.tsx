import { TabType, User } from '../types';
import { Shield, LogOut, Terminal, Download, Play, UserPlus, Home } from 'lucide-react';
import { synth } from './SynthAudio';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser }: NavbarProps) {
  const handleTabClick = (tab: TabType) => {
    synth.playClick();
    setActiveTab(tab);
  };

  const handleLogout = () => {
    synth.playClick();
    setCurrentUser(null);
    setActiveTab('home');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('home')}>
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
              ESPORTS REGISTRATION SYSTEM
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wider">ATHLETE PORTAL & AR ARENA</p>
          </div>
        </div>

        {/* Tab Controls */}
        <nav className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabClick('home')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'home'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 border border-transparent'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>หน้าแรก</span>
          </button>

          {!currentUser && (
            <button
              onClick={() => handleTabClick('register')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 border border-transparent'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>สมัครสมาชิก</span>
            </button>
          )}

          <button
            onClick={() => {
              if (!currentUser) {
                synth.playClick();
                alert('กรุณาล็อกอินเพื่อเข้าหน้าทดสอบเกม AR!');
                setActiveTab('home');
              } else {
                handleTabClick('game');
              }
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !currentUser ? 'opacity-60 cursor-not-allowed' : ''
            } ${
              activeTab === 'game'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 border border-transparent'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>หน้าเกม AR 🕹️</span>
          </button>

          <button
            onClick={() => handleTabClick('exporter')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'exporter'
                ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 border border-transparent'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดโค้ด PHP/XAMPP 💾</span>
          </button>
        </nav>

        {/* User Info & Session Controls */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="text-right">
                <div className="text-xs text-slate-500">นักกีฬาออนไลน์</div>
                <div className="text-sm font-bold text-slate-200 font-mono">{currentUser.fullname}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs text-slate-500 font-mono">
              <Terminal className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>GUEST_SESSION</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
