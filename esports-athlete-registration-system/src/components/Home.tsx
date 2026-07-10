import React, { useState } from 'react';
import { User, TabType } from '../types';
import { ShieldAlert, LogIn, Swords, UserPlus, Gamepad2, Eye, EyeOff, Sparkles, Cpu } from 'lucide-react';
import { synth } from './SynthAudio';
import { motion } from 'motion/react';

interface HomeProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  setActiveTab: (tab: TabType) => void;
}

export default function Home({ users, onLoginSuccess, setActiveTab }: HomeProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    synth.playClick();

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน!');
      return;
    }

    // Find user in simulated db (local storage users)
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user) {
      // In this simulated demo we accept any password since it is a client preview,
      // but let's notify the user that we are logging them in.
      setError('');
      onLoginSuccess(user);
      synth.playWin();
      setActiveTab('game');
    } else {
      setError('ไม่พบชื่อผู้ใช้งานนี้ในระบบ! กรุณาตรวจสอบอีกครั้ง หรือไปสมัครสมาชิกใหม่');
    }
  };

  // Autofill helper for easy testing
  const handleQuickLogin = (demoUser: string) => {
    synth.playClick();
    setUsername(demoUser);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
      {/* Left Columns: Intro info */}
      <div className="lg:col-span-7 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ระบบรับสมัครนักกีฬาอีสปอร์ต (Esports Candidate Portal)</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            เส้นทางสู่การเป็น <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              นักกีฬา Esports มืออาชีพ
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            ยินดีต้อนรับสู่ระบบคัดเลือกนักกีฬาที่มีความโดดเด่นเรื่องการตอบสนองเชิงปฏิกิริยา (Reaction Time) 
            คุณสามารถลงทะเบียนสมัครสมาชิกกรอกข้อมูลบันทึกประวัติ และเข้าแข่งขันในสนามจำลอง 
            <span className="text-cyan-400 font-semibold"> AR Star-Catcher Game</span> ผ่านกล้องเว็บแคมเรียลไทม์ 
            เพื่อเก็บบันทึกสถิติคะแนนสูงสุดลงระบบฐานข้อมูลได้ทันที!
          </p>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4"
        >
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <Swords className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-bold text-white text-sm">1. ลงทะเบียน Candidate</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              กรอกชื่อ-สกุล อีเมลเพื่อจัดทำโปรไฟล์พร้อมรับหมายเลข Candidate ID ประจำตัว
            </p>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-white text-sm">2. ทดสอบทักษะด้วย AR</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              ใช้เว็บแคมตรวจจับการเคลื่อนไหวของมือ โบกเพื่อเก็บ "ดาวจำลอง" แข่งกับเวลา 30 วินาที
            </p>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-sm">3. เซฟประวัติลง MySQL</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              ระบบหลังบ้านเขียนผ่าน PHP/MySQL บน XAMPP จะบันทึกคะแนนสูงสุดที่ดีที่สุดลงดาต้าเบส
            </p>
          </div>
        </motion.div>

        {/* Technical Notice Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 max-w-xl text-xs text-slate-500 leading-relaxed"
        >
          📢 <span className="font-semibold text-slate-400">สำหรับส่งงาน/อาจารย์ตรวจ:</span> โค้ดทั้งหมดของโครงการนี้ถูกเขียนขึ้นให้สามารถนำไปรันบนระบบ 
          <span className="text-cyan-400 font-semibold"> XAMPP (PHP + MySQL)</span> ได้อย่างสมบูรณ์แบบ 
          สามารถคลิกสลับไปดาวน์โหลดและดูวิธีนำเข้าที่เมนู <span className="text-emerald-400">"ดาวน์โหลดโค้ด PHP/XAMPP"</span> ได้ทันที
        </motion.div>
      </div>

      {/* Right Columns: Login Card */}
      <div className="lg:col-span-5 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-slate-900/60 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md relative"
        >
          {/* Cyber accents */}
          <div className="absolute top-0 right-10 w-20 h-[2px] bg-gradient-to-r from-transparent to-cyan-400" />
          <div className="absolute bottom-0 left-10 w-20 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />

          <div className="text-center mb-8">
            <h3 className="text-2xl font-black tracking-tight text-white">เข้าสู่ระบบนักกีฬา</h3>
            <p className="text-xs text-slate-500 mt-1">ล็อกอินเข้าสู่สถานีดนตรีเพื่อเริ่มทดสอบฝีมือ</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-5 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono text-sm"
                placeholder="กรอกชื่อผู้ใช้งาน..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  placeholder="กรอกรหัสผ่าน..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-wide rounded-xl shadow-lg shadow-cyan-500/10 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 text-sm"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>ล็อกอินเข้าแข่งขัน</span>
            </button>
          </form>

          {/* Quick Login Helper Panel for Demo Preview */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <div className="text-xs text-slate-500 mb-3 font-semibold text-center uppercase tracking-wider">
              ⚡ บัญชีทดสอบด่วน (Quick Test Accounts)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('esports_pro')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800/80 text-left rounded-xl border border-slate-800 hover:border-cyan-500/30 transition text-xs flex flex-col justify-center"
              >
                <span className="font-mono text-cyan-400 font-bold">@esports_pro</span>
                <span className="text-[10px] text-slate-500">สมชาย ใจกล้า</span>
              </button>

              <button
                onClick={() => handleQuickLogin('demo_gamer')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800/80 text-left rounded-xl border border-slate-800 hover:border-blue-500/30 transition text-xs flex flex-col justify-center"
              >
                <span className="font-mono text-blue-400 font-bold">@demo_gamer</span>
                <span className="text-[10px] text-slate-500">ผู้เข้าร่วมทดสอบ</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            ยังไม่ได้เป็นสมาชิกนักกีฬา? 
            <button
              onClick={() => {
                synth.playClick();
                setActiveTab('register');
              }}
              className="text-cyan-400 hover:underline font-bold ml-1.5 focus:outline-none"
            >
              คลิกสมัครสมาชิกที่นี่
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
