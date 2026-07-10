import React, { useRef, useState, useEffect } from 'react';
import { User } from '../types';
import { Camera, Gamepad2, Trophy, Volume2, VolumeX, Save, Sparkles, Play, RotateCcw, AlertTriangle, ListOrdered, CheckCircle } from 'lucide-react';
import { synth } from './SynthAudio';
import { motion } from 'motion/react';

interface GameARProps {
  currentUser: User;
  onUpdateScore: (userId: string, newScore: number) => void;
  users: User[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

export default function GameAR({ currentUser, onUpdateScore, users }: GameARProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Reference properties for game loop
  const starRef = useRef({ x: 320, y: 240, r: 28, active: false });
  const prevFrameRef = useRef<ImageData | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const flashRingRef = useRef<{ x: number; y: number; r: number; alpha: number } | null>(null);
  const gameLoopId = useRef<number | null>(null);
  const timerIntervalId = useRef<any>(null);

  // Initialize and request Web camera
  const initWebcam = async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Webcam initialization failed:', err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    if (gameLoopId.current) {
      cancelAnimationFrame(gameLoopId.current);
    }
    if (timerIntervalId.current) {
      clearInterval(timerIntervalId.current);
    }
  };

  // Sound muting trigger
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    synth.setMuted(nextMute);
    synth.playClick();
  };

  // Spawn star inside safely bounded space
  const spawnStar = (canvasWidth: number, canvasHeight: number) => {
    const pad = 80;
    starRef.current = {
      x: Math.floor(Math.random() * (canvasWidth - pad * 2)) + pad,
      y: Math.floor(Math.random() * (canvasHeight - pad * 2)) + pad,
      r: 25,
      active: true
    };
  };

  const createStarParticles = (x: number, y: number) => {
    const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#22d3ee', '#ffffff'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particlesRef.current.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Start actual match
  const startGame = () => {
    if (!cameraActive) {
      alert('กรุณาเปิดสิทธิ์เชื่อมต่อกล้องเว็บแคมเพื่อเล่นเกม!');
      return;
    }
    synth.playClick();
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setScoreSaved(false);
    setSaveSuccess(false);
    particlesRef.current = [];
    flashRingRef.current = null;

    if (canvasRef.current) {
      spawnStar(canvasRef.current.width, canvasRef.current.height);
    }

    // Interval Timer countdown
    if (timerIntervalId.current) clearInterval(timerIntervalId.current);
    timerIntervalId.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalId.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setIsPlaying(false);
    starRef.current.active = false;
    synth.playWin();
  };

  const handleSaveScore = () => {
    synth.playClick();
    onUpdateScore(currentUser.id, score);
    setScoreSaved(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Main Canvas Render and Motion Processing Loop
  useEffect(() => {
    if (!cameraActive) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const cw = canvas.width;
        const ch = canvas.height;

        // 1. Draw MIRRORED camera frame
        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, cw, ch);
        ctx.restore();

        // Get pixel image info for analysis
        const currentFrame = ctx.getImageData(0, 0, cw, ch);
        const currentPixels = currentFrame.data;

        // 2. Perform motion detection (Frame Differencing)
        if (prevFrameRef.current && isPlaying && starRef.current.active) {
          const prevPixels = prevFrameRef.current.data;
          const star = starRef.current;
          
          let motionSum = 0;
          // Subsample check area radius around target star
          const checkRadius = star.r + 20;

          for (let y = star.y - checkRadius; y < star.y + checkRadius; y += 4) {
            for (let x = star.x - checkRadius; x < star.x + checkRadius; x += 4) {
              if (x < 0 || x >= cw || y < 0 || y >= ch) continue;

              const idx = (y * cw + x) * 4;

              // Color differences
              const dr = Math.abs(currentPixels[idx] - prevPixels[idx]);
              const dg = Math.abs(currentPixels[idx + 1] - prevPixels[idx + 1]);
              const db = Math.abs(currentPixels[idx + 2] - prevPixels[idx + 2]);

              if (dr + dg + db > 48) {
                motionSum++;
              }
            }
          }

          // If motion threshold triggers, score high!
          if (motionSum > 28) {
            setScore(s => s + 1);
            synth.playPop();
            createStarParticles(star.x, star.y);
            flashRingRef.current = { x: star.x, y: star.y, r: star.r + 5, alpha: 0.8 };
            star.active = false;
            
            // Spawn next target
            setTimeout(() => {
              if (isPlaying) {
                spawnStar(cw, ch);
              }
            }, 250);
          }
        }

        // Cache this frame's raw pixel buffer
        prevFrameRef.current = currentFrame;

        // 3. Draw particles explosions
        particlesRef.current.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // little gravity
          p.alpha -= 0.025;
          p.size = Math.max(0.2, p.size - 0.05);

          if (p.alpha <= 0) {
            particlesRef.current.splice(idx, 1);
            return;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        });

        // 4. Draw interactive star
        if (isPlaying && starRef.current.active) {
          const star = starRef.current;
          
          // Outer beacon locator ring (pulsing)
          ctx.save();
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r + 15 + Math.sin(Date.now() / 100) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.restore();

          // Gold star item
          drawStarElement(ctx, star.x, star.y, 5, star.r, star.r / 2.2, '#f59e0b');
        }

        // 5. Draw hit flash feedback circle
        if (flashRingRef.current) {
          const ring = flashRingRef.current;
          ctx.save();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251, 191, 36, ${ring.alpha})`;
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.restore();

          ring.r += 3;
          ring.alpha -= 0.05;
          if (ring.alpha <= 0) {
            flashRingRef.current = null;
          }
        }

        // Add instructions text directly inside canvas boundaries
        if (!isPlaying) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.fillRect(40, ch - 60, cw - 80, 45);
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
          ctx.lineWidth = 1;
          ctx.strokeRect(40, ch - 60, cw - 80, 45);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🎮 ระบบพร้อมแล้ว กดปุ่ม "เริ่มเกมส์ 🕹️" เพื่อจับเวลากวาดคะแนนดาวจำลอง', cw / 2, ch - 34);
        }
      }

      gameLoopId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
    };
  }, [cameraActive, isPlaying]);

  // Handle cleanup on unmount
  useEffect(() => {
    initWebcam();
    return () => {
      stopWebcam();
    };
  }, []);

  // Helper routine to draw star vectors
  const drawStarElement = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  // Sort candidates to compute rankings
  const rankedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
      {/* Sidebar: Athlete Profile & Rules */}
      <div className="lg:col-span-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <Trophy className="text-cyan-400 w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">โปรไฟล์ผู้สมัครคัดเลือก</h3>
              <p className="text-xs text-slate-500 font-mono">STATUS: CANDIDATE_ONLINE</p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/80 space-y-2.5 font-sans">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ชื่อนักกีฬา:</span>
              <span className="text-slate-300 font-bold">{currentUser.fullname}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">บัญชีล็อกอิน:</span>
              <span className="text-cyan-400 font-mono">@{currentUser.username}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">คะแนนสูงสุดเซฟลง DB:</span>
              <span className="text-emerald-400 font-black font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {currentUser.score} แต้ม
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">🕹️ คู่มือการทดสอบความเร็ว AR</span>
            <ul className="text-xs text-slate-400 space-y-2 pl-4 list-decimal leading-relaxed">
              <li>เปิดอนุญาตสิทธิ์การใช้งานกล้องเว็บแคม</li>
              <li>ยืนห่างจากกล้องระยะเหมาะสม (เห็นช่วงหัวหรือครึ่งตัว)</li>
              <li>กดปุ่ม <span className="text-cyan-400 font-semibold">"เริ่มเล่นเกมส์"</span> เพื่อสตาร์ทสวิงเวลานับถอยหลัง 30 วินาที</li>
              <li><b>โบกมือหรือเคลื่อนไหวร่างกายให้บังโดนวัตถุ "ดาวเหลือง"</b> ที่สุ่มขึ้นบนหน้าจอ</li>
              <li>เมื่อจับเป้าหมายได้ พิกเซลจะเปลี่ยนสี ระบบสะสม 1 คะแนนและสร้างดาวเป้าหมายใหม่</li>
              <li>เมื่อหมดเวลาหรือได้คะแนนจุใจ กดปุ่ม <span className="text-emerald-400 font-semibold">"บันทึกคะแนนลง MySQL"</span> เพื่อเซฟสถิติ</li>
            </ul>
          </div>
        </div>

        {/* Local Leaderboard Ranking */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5 text-yellow-400" />
            <h3 className="font-extrabold text-white text-base">อันดับผู้ท้าชิงทั้งหมด (Leaderboard)</h3>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {rankedUsers.map((u, index) => (
              <div
                key={u.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                  u.id === currentUser.id
                    ? 'bg-cyan-500/5 border-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-slate-950' :
                    index === 1 ? 'bg-slate-300 text-slate-950' :
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-300 block">{u.fullname}</span>
                    <span className="text-[10px] text-slate-500 font-mono">@{u.username}</span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-cyan-400 bg-slate-900/60 px-2 py-1 rounded">
                  {u.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel: The WebCam Game Stage */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Game Stats & Start Panel */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">SCORE</span>
                <span className="text-3xl font-black text-cyan-400 font-mono">{score}</span>
              </div>
              <div className="bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">TIME LEFT</span>
                <span className={`text-3xl font-black font-mono ${timeLeft <= 8 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Sound toggle button */}
              <button
                onClick={toggleMute}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-100 transition"
                title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Start game trigger */}
              <button
                onClick={startGame}
                disabled={isPlaying || !cameraActive}
                className={`px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/10 transition-all transform flex items-center space-x-2 text-sm ${
                  isPlaying || !cameraActive
                    ? 'opacity-40 cursor-not-allowed scale-100'
                    : 'hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-500/25 active:scale-95'
                }`}
              >
                <Play className="w-4.5 h-4.5 fill-slate-950 text-slate-950" />
                <span>เริ่มเล่นเกมส์ 🕹️</span>
              </button>

              {/* Save score to Local simulated DB */}
              <button
                onClick={handleSaveScore}
                disabled={isPlaying || score === 0 || scoreSaved}
                className={`px-5 py-3.5 bg-slate-950 text-slate-400 font-bold border rounded-xl flex items-center space-x-2 text-sm transition ${
                  isPlaying || score === 0 || scoreSaved
                    ? 'opacity-40 border-slate-900 text-slate-600 cursor-not-allowed'
                    : 'border-cyan-500/30 hover:bg-slate-900 hover:text-white cursor-pointer active:scale-95 text-cyan-400'
                }`}
              >
                <Save className="w-4.5 h-4.5" />
                <span>บันทึกคะแนนสูงสุด 💾</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic camera / Canvas layer container */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex-1 flex flex-col items-center justify-center relative">
          
          {/* Status logs */}
          <div className="absolute top-6 left-6 z-30 flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-900/60 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-400">
              {cameraActive ? 'WEB_CAMERA_ACTIVE_64F' : 'WEB_CAMERA_OFFLINE'}
            </span>
          </div>

          <div className="relative w-full aspect-video max-w-2xl bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner flex items-center justify-center">
            
            {/* 1. Hidden Webcam Video Component */}
            <video
              ref={videoRef}
              id="webcam"
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* 2. Primary Game Canvas rendering and interactions */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover z-10"
            />

            {/* 3. Camera Request Overlay */}
            {(!cameraActive || cameraError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-center p-6 z-20">
                {cameraError ? (
                  <div className="space-y-4 max-w-sm">
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-white">ไม่สามารถเชื่อมต่อกล้องเว็บแคมได้!</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ระบบต้องการใช้กล้องถ่ายวิดีโอเพื่อทำงานเป็นเซ็นเซอร์จับมือเล่นเกม AR กรุณากดปุ่มเปิดกล้องด้านล่างเพื่ออนุญาตหรือเชื่อมต่อกล้อง
                      </p>
                    </div>
                    <button
                      onClick={initWebcam}
                      className="px-4 py-2.5 bg-red-500 text-slate-950 font-black rounded-lg text-xs hover:bg-red-400 transition"
                    >
                      ลองเชื่อมต่อกล้องอีกครั้ง
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm">
                    <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-white">ต้องการสิทธิ์กล้องสำหรับตรวจจับ AR</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        โปรเจกต์นี้มีไฮไลต์คือการนำกล้องถ่ายวิดีโอทั่วไปมาเปรียบเทียบค่าสีเฟรมพิกเซลเพื่อดักจับการสั่นไหวของมือ ทำให้สามารถเล่นเกมเก็บวัตถุได้โดยไม่ต้องมีเซ็นเซอร์พิเศษใดๆ
                      </p>
                    </div>
                    <button
                      onClick={initWebcam}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black rounded-xl text-xs hover:from-cyan-400 hover:to-blue-400 transition"
                    >
                      อนุญาตสิทธิ์กล้องเว็บแคม 📷
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Notification log bars */}
          <div className="w-full mt-4 flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 font-mono gap-2">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>เทคโนโลยี: HTML5 Frame-Differencing Engine (ไม่ต้องใช้ GPU ดาวน์โหลดโมเดลเพิ่ม)</span>
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  synth.playClick();
                  if (cameraActive) stopWebcam();
                  else initWebcam();
                }}
                className="text-cyan-400 hover:underline hover:text-cyan-300"
              >
                {cameraActive ? '🔴 สลับปิดกล้อง' : '🟢 สลับเปิดกล้อง'}
              </button>
              <span>|</span>
              <span>สถานะ: {isPlaying ? '🎮 กำลังท้าชิง...' : '☕ พักสนามแข่ง'}</span>
            </div>
          </div>
        </div>

        {/* Success Score Save Notification Toast */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block">บันทึกสถิติคะแนนเข้าระบบสำเร็จ!</span>
              <p className="text-[10px] text-emerald-500/80 mt-0.5">
                คะแนนล่าสุดของคุณ ({score} แต้ม) ได้บันทึกลงจำลอง MySQL ทับสถิติเดิมเรียบร้อยแล้ว
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
