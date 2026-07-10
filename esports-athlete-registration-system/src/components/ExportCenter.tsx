import { useState } from 'react';
import { EXPORT_FILES, XAMPP_GUIDE_TH } from './ExportData';
import { FileCode, Clipboard, Check, BookOpen, ExternalLink, ShieldAlert, Cpu, Download } from 'lucide-react';
import { synth } from './SynthAudio';
import { motion } from 'motion/react';

export default function ExportCenter() {
  const [selectedFile, setSelectedFile] = useState(EXPORT_FILES[0]);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  const handleCopyCode = (content: string, fileName: string) => {
    synth.playClick();
    navigator.clipboard.writeText(content);
    setCopiedFileId(fileName);
    setTimeout(() => {
      setCopiedFileId(null);
    }, 2000);
  };

  const handleDownloadAll = () => {
    synth.playClick();
    
    // Create a zip-like setup or download each file iteratively, or simply download a script
    // To keep it simple, we can download the current selected file directly!
    const element = document.createElement("a");
    const file = new Blob([selectedFile.content], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-6 sm:p-8 rounded-2xl border border-emerald-500/15 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
            <Cpu className="w-3.5 h-3.5" />
            <span>XAMPP / PHP / MYSQL EXPORTER CENTER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ดาวน์โหลดโค้ดและคู่มือฉบับสมบูรณ์สำหรับรันบน XAMPP
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            คุณสามารถคัดลอกไฟล์โค้ด PHP, SQL, และ JavaScript ด้านล่างนี้เพื่อไปใช้รันจำลองระบบบนเครื่องของคุณเองด้วยโปรแกรม **XAMPP (Apache + MySQL)** 
            ทุกไฟล์ถูกเตรียมไว้อย่างเป็นระเบียบ ป้องกันการเจาะระบบ (SQL Injection ด้วย PDO) และสามารถดึงกล้องเล่นเกมได้เรียลไทม์เหมือนกัน 100%!
          </p>
        </div>
      </div>

      {/* Main Code View Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: File Explorer List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              📁 โครงสร้างไฟล์ PHP (XAMPP Codebase)
            </h3>
            <p className="text-slate-500 text-xs">คลิกที่แต่ละไฟล์เพื่อพรีวิว อ่านคำอธิบาย และก็อปปี้โค้ด</p>
            
            <div className="space-y-1.5 pt-2">
              {EXPORT_FILES.map(file => (
                <button
                  key={file.name}
                  onClick={() => {
                    synth.playClick();
                    setSelectedFile(file);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition duration-200 flex items-start space-x-3 group ${
                    selectedFile.name === file.name
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                    selectedFile.name === file.name ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <div className="space-y-1 overflow-hidden">
                    <span className="font-mono font-bold block">{file.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate leading-relaxed">
                      {file.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">💡 ข้อควรจำพิกัดเว็บแคม</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              สำหรับกล้องเว็บแคม เบราว์เซอร์ส่วนใหญ่จำกัดสิทธิ์ความปลอดภัยให้ใช้งานกล้องได้ผ่านลิงก์ที่เป็น <span className="text-slate-400 font-semibold font-mono">https://</span> หรือโฮสต์ที่เป็น <span className="text-slate-400 font-semibold font-mono">http://localhost/</span> เท่านั้น 
              เพราะฉะนั้นเมื่อรันบน XAMPP ต้องรันผ่านโฮสต์ <span className="text-emerald-400 font-bold font-mono">http://localhost/...</span> เสมอ!
            </p>
          </div>
        </div>

        {/* Right Side: Code Viewer and Copy */}
        <div className="lg:col-span-8 flex flex-col min-w-0">
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden flex-1 flex flex-col">
            {/* Tab header */}
            <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-slate-200 font-mono block">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedFile.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadAll}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 flex items-center space-x-1.5 transition"
                  title="ดาวน์โหลดไฟล์สคริปต์นี้ลงเครื่อง"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>

                <button
                  onClick={() => handleCopyCode(selectedFile.content, selectedFile.name)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition ${
                    copiedFileId === selectedFile.name
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {copiedFileId === selectedFile.name ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content body with custom coding panel */}
            <div className="p-4 bg-slate-950/80 flex-1 overflow-auto max-h-[500px]">
              <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre p-2 overflow-x-auto tab-size-4">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Complete XAMPP Installation / Setup Guide */}
      <div className="bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <BookOpen className="text-indigo-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">📝 คำแนะนำวิธีเปิดรันบน XAMPP แบบจับมือทำทีละขั้นตอน (Step-by-Step Guide)</h3>
            <p className="text-xs text-slate-500">สำหรับประกอบการเรียนการสอน ทำโครงงาน หรือเปิดรันเซิร์ฟเวอร์จำลองในเครื่องคอมพิวเตอร์ของคุณเอง</p>
          </div>
        </div>

        {/* Formatted Markdown-like guide */}
        <div className="prose prose-invert max-w-none text-slate-400 text-xs sm:text-sm leading-relaxed font-sans space-y-6">
          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-900/80 space-y-4">
            <h4 className="text-white font-extrabold text-base flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">1</span>
              เตรียมโฟลเดอร์สำหรับเก็บสคริปต์
            </h4>
            <p>
              สร้างโฟลเดอร์ขึ้นมาใหม่ภายใต้ที่อยู่ของ XAMPP htdocs เช่น: <br />
              <code className="text-cyan-400 bg-slate-950 px-2 py-1 rounded font-mono text-xs border border-slate-800">C:\xampp\htdocs\esports-system</code> <br />
              แล้วนำเอาโค้ดในแท็กข้างต้นทั้งหมดไปเซฟเป็นชื่อไฟล์ตามโครงสร้างดังกล่าว
            </p>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-900/80 space-y-4">
            <h4 className="text-white font-extrabold text-base flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">2</span>
              สร้างตารางและบันทึกสถิติมือลง phpMyAdmin
            </h4>
            <p>
              เปิดแผง XAMPP Control Panel กดปุ่ม Start ทั้ง Apache และ MySQL จากนั้นเปิดลิงก์ <a href="http://localhost/phpmyadmin" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center">http://localhost/phpmyadmin <ExternalLink className="w-3 h-3 ml-1" /></a> เพื่อสร้างดาต้าเบสใหม่ชื่อ <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">esports_db</code> <br />
              จากนั้นนำเข้าโค้ดสคริปต์ที่อยู่ในไฟล์ <code className="text-yellow-400 bg-slate-900 px-1 py-0.5 rounded">database.sql</code> ไปกดรันที่แท็บ SQL
            </p>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-900/80 space-y-4">
            <h4 className="text-white font-extrabold text-base flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">3</span>
              เปิดใช้งานโครงการและทดลองสัมผัสดาว AR
            </h4>
            <p>
              เปิดเข้าเบราว์เซอร์ไปที่ลิงก์โครงการของคุณ: <a href="http://localhost/esports-system/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline inline-flex items-center">http://localhost/esports-system/ <ExternalLink className="w-3 h-3 ml-1" /></a> <br />
              คุณจะเห็นหน้าตาเว็บไซต์ที่ออกแบบสวยงามพรีเมียมเหมือนกับที่พรีวิวบน AI Studio นี้! สมัครสมาชิก ล็อกอิน และสามารถเปิดรับกล้องเว็บแคมเพื่อเริ่มแข่งโบกมือเก็บคะแนนดาวเซฟสถิติลงฐานข้อมูล MySQL ทันที!
            </p>
          </div>

          {/* Warning notice */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs leading-relaxed flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">⚠️ คำเตือนเรื่องสิทธิ์กล้องเว็บแคมบน Google Chrome/Edge</span>
              <p className="mt-1">
                ในการทดสอบเกมที่หน้าหลังเป็น PHP, เบราว์เซอร์จะมีมาตรการรักษาความปลอดภัยอย่างเข้มงวด กล้องจะไม่เปิดและทำงานล้มเหลวหากรันด้วยเลขไอพีเครื่องภายนอก (เช่น 192.168.x.x) หรือ URL ที่ไม่ปลอดภัย แนะนำให้รันผ่านชื่อโฮสต์ <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">localhost</code> เท่านั้น หรือตั้งค่าอนุญาตสิทธิ์กล้องด้วยตนเองที่ตัวควบคุมเบราว์เซอร์มุมบนซ้ายของจอ!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
