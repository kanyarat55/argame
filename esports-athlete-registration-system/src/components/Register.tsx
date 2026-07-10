import React, { useState } from 'react';
import { User, TabType } from '../types';
import { ShieldCheck, UserPlus, ArrowLeft, Eye, EyeOff, Clipboard, Check } from 'lucide-react';
import { synth } from './SynthAudio';
import { motion } from 'motion/react';

interface RegisterProps {
  onRegisterSuccess: (newUser: User) => void;
  setActiveTab: (tab: TabType) => void;
}

export default function Register({ onRegisterSuccess, setActiveTab }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Success state simulation
  const [success, setSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    synth.playClick();

    if (!username || !password || !fullname || !email) {
      setError('กรุณากรอกข้อมูลในแบบฟอร์มให้ครบถ้วน!');
      return;
    }

    if (username.length < 4) {
      setError('ชื่อผู้ใช้งานต้องมีอย่างน้อย 4 ตัวอักษร!');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร!');
      return;
    }

    // Retrieve users from local storage
    const storedUsersJson = localStorage.getItem('esports_users');
    let localUsers: User[] = [];
    if (storedUsersJson) {
      try {
        localUsers = JSON.parse(storedUsersJson);
      } catch (err) {
        localUsers = [];
      }
    }

    // Check duplicate
    const isDuplicate = localUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (isDuplicate) {
      setError('ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ! โปรดลองตั้งชื่ออื่น');
      return;
    }

    // Create a new simulated user
    const newUser: User = {
      id: 'athlete_' + Math.random().toString(36).substr(2, 9),
      username: username,
      email: email,
      fullname: fullname,
      score: 0,
      createdAt: new Date().toISOString()
    };

    // Save
    localUsers.push(newUser);
    localStorage.setItem('esports_users', JSON.stringify(localUsers));

    // Update state
    setRegisteredData(newUser);
    setSuccess(true);
    onRegisterSuccess(newUser);
    synth.playWin();
  };

  const copyToClipboard = () => {
    if (!registeredData) return;
    synth.playClick();
    navigator.clipboard.writeText(registeredData.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      {success && registeredData ? (
        /* Success Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/80 p-8 rounded-2xl border border-emerald-500/30 text-center shadow-2xl backdrop-blur-md space-y-6 relative"
        >
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-3xl font-extrabold shadow-lg shadow-emerald-500/10">
            ✓
          </div>

          <div className="space-y-2 pt-4">
            <h2 className="text-2xl font-black text-emerald-400">สมัครสมาชิกนักกีฬาสำเร็จ!</h2>
            <p className="text-slate-400 text-xs">
              ข้อมูลของคุณได้รับการบันทึกลงจำลองฐานข้อมูล MySQL เรียบร้อยแล้ว
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-3 font-sans">
            <div className="text-xs text-slate-500 border-b border-slate-900 pb-2 flex justify-between items-center">
              <span>บันทึกชื่อผู้ใช้สำหรับลงแข่ง</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] uppercase font-bold tracking-wider">Candidate</span>
            </div>

            <div className="text-sm font-semibold flex justify-between items-center">
              <span className="text-slate-400">ชื่อล็อกอิน (Username):</span>
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400 font-mono text-base">{registeredData.username}</span>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                  title="Copy Username"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-sm font-semibold flex justify-between items-center">
              <span className="text-slate-400">ชื่อ-นามสกุลจริง:</span>
              <span className="text-slate-300">{registeredData.fullname}</span>
            </div>

            <div className="text-sm font-semibold flex justify-between items-center">
              <span className="text-slate-400">สถานะคัดเลือก:</span>
              <span className="text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">Esports Candidate</span>
            </div>
          </div>

          <button
            onClick={() => {
              synth.playClick();
              setActiveTab('home');
            }}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-950" />
            <span>กลับไปล็อกอินเข้าสู่ระบบ</span>
          </button>
        </motion.div>
      ) : (
        /* Registration Form */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md relative"
        >
          <button
            onClick={() => {
              synth.playClick();
              setActiveTab('home');
            }}
            className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition-all flex items-center space-x-1 text-xs font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>

          <div className="text-center mb-6 pt-2">
            <h2 className="text-2xl font-black text-white">ลงทะเบียนนักกีฬา</h2>
            <p className="text-xs text-slate-500 mt-1">กรอกข้อมูลผู้เข้าแข่งขันจริงเพื่อสะสมสถิติคัดเลือก</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 rotate-180 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                ชื่อผู้ใช้งาน (Username) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                pattern="[A-Za-z0-9_]{4,}"
                title="ชื่อผู้ใช้งานต้องเป็นภาษาอังกฤษหรือตัวเลขความยาว 4 ตัวอักษรขึ้นไป"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm font-mono"
                placeholder="อังกฤษหรือตัวเลข 4 ตัวขึ้นไป"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                รหัสผ่าน (Password) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  placeholder="รหัสผ่านล็อกอิน 6 ตัวอักษรขึ้นไป"
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

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                ชื่อ-นามสกุลจริง (Full Name) *
              </label>
              <input
                type="text"
                required
                value={fullname}
                onChange={e => setFullname(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                placeholder="เช่น นายปัญญา รักดี"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                ที่อยู่อีเมล (Email Address) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                placeholder="example@esports.com"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-wide rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 text-sm mt-6"
            >
              <UserPlus className="w-4.5 h-4.5 text-slate-950" />
              <span>ยืนยันการลงทะเบียนนักกีฬา</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            ลงทะเบียนเรียบร้อย? 
            <button
              onClick={() => {
                synth.playClick();
                setActiveTab('home');
              }}
              className="text-cyan-400 hover:underline font-bold ml-1.5 focus:outline-none"
            >
              ล็อกอินเข้าสู่ระบบ
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
