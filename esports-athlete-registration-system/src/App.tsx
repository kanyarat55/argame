import { useState, useEffect } from 'react';
import { User, TabType } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import GameAR from './components/GameAR';
import ExportCenter from './components/ExportCenter';
import { synth } from './components/SynthAudio';
import { Shield, Sparkles, Terminal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Sample prefilled users for simulation
const DEFAULT_USERS: User[] = [
  {
    id: 'athlete_1',
    username: 'esports_pro',
    email: 'pro@example.com',
    fullname: 'สมชาย ใจกล้า',
    score: 28,
    createdAt: new Date().toISOString()
  },
  {
    id: 'athlete_2',
    username: 'demo_gamer',
    email: 'gamer@example.com',
    fullname: 'วิชัย รักดี',
    score: 15,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Synchronize users database from local storage
  useEffect(() => {
    const stored = localStorage.getItem('esports_users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          return;
        }
      } catch (err) {
        console.error('Failed to parse stored users:', err);
      }
    }
    // Set fallback default users
    localStorage.setItem('esports_users', JSON.stringify(DEFAULT_USERS));
    setUsers(DEFAULT_USERS);
  }, []);

  // Update user score
  const handleUpdateScore = (userId: string, newScore: number) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        // Save score only if it is a new personal highscore
        const maxScore = Math.max(user.score, newScore);
        return { ...user, score: maxScore };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorage.setItem('esports_users', JSON.stringify(updatedUsers));

    // Update current session too
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => {
        if (!prev) return null;
        return { ...prev, score: Math.max(prev.score, newScore) };
      });
    }
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('game');
  };

  // Register success auto login or redirect handler
  const handleRegisterSuccess = (newUser: User) => {
    // Refresh user state list
    const stored = localStorage.getItem('esports_users');
    if (stored) {
      try {
        setUsers(JSON.parse(stored));
      } catch (e) {}
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Dynamic Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Home
                users={users}
                onLoginSuccess={handleLoginSuccess}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'game' && currentUser && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <GameAR
                currentUser={currentUser}
                onUpdateScore={handleUpdateScore}
                users={users}
              />
            </motion.div>
          )}

          {activeTab === 'exporter' && (
            <motion.div
              key="exporter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ExportCenter />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Page Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row justify-center items-center gap-2">
        <div className="flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-cyan-500/80" />
          <span>Esports Athlete Portal &copy; 2026.</span>
        </div>
        <span>•</span>
        <span>Built with React + Tailwind + Motion</span>
        <span>•</span>
        <div className="flex items-center space-x-1 text-slate-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>XAMPP Compliant PHP Stack</span>
        </div>
      </footer>
    </div>
  );
}
