import { CodeFile } from '../types';

export const EXPORT_FILES: CodeFile[] = [
  {
    name: 'database.sql',
    language: 'sql',
    description: 'คำสั่ง SQL สำหรับสร้างฐานข้อมูลและตารางผู้ใช้ใน phpMyAdmin',
    content: `-- 1. สร้างฐานข้อมูลใหม่ (หรือข้ามขั้นตอนนี้หากไปสร้างใน phpMyAdmin เอง)
CREATE DATABASE IF NOT EXISTS esports_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE esports_db;

-- 2. สร้างตารางเก็บข้อมูลผู้ใช้ (ตาราง Users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. เพิ่มข้อมูลตัวอย่าง (Optional)
INSERT INTO users (username, password, email, fullname, score) VALUES
('esports_pro', '$2y$10$Wf40eDskgM8B0Bq0tYHeWe3Z6tV4P9gO8O8e3.6jYxL/y9g17G61O', 'pro@example.com', 'สมชาย ใจกล้า', 25)
ON DUPLICATE KEY UPDATE username=username;
-- หมายเหตุ: รหัสผ่านของไอดี esports_pro ด้านบนคือ "123456" (ถูกเข้ารหัสผ่าน bcrypt ไว้)`
  },
  {
    name: 'config.php',
    language: 'php',
    description: 'ไฟล์เชื่อมต่อฐานข้อมูล MySQL ด้วย PDO (PHP Data Objects) ซึ่งปลอดภัยและทันสมัย',
    content: `<?php
// กำหนดรายละเอียดการเชื่อมต่อฐานข้อมูล
$db_host = 'localhost';
$db_user = 'root';
$db_pass = ''; // ค่าเริ่มต้นของ XAMPP ไม่มีรหัสผ่าน
$db_name = 'esports_db';

try {
    // เชื่อมต่อฐานข้อมูลด้วย PDO พร้อมตั้งค่าภาษา UTF-8
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    
    // ตั้งค่าแสดงผลข้อผิดพลาดเมื่อรันคิวรี่พัง
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // หากเกิดข้อผิดพลาดในการเชื่อมต่อ
    die("เชื่อมต่อฐานข้อมูลล้มเหลว: " . $e->getMessage());
}
?>`
  },
  {
    name: 'index.php',
    language: 'php',
    description: 'หน้าแรก (Home) ของเว็บไซต์อีสปอร์ต มีบทนำสั้นๆ และฟอร์มล็อกอินเข้าสู่ระบบ',
    content: `<?php
session_start();
require_once 'config.php';

// หากล็อกอินอยู่แล้ว ให้ข้ามไปหน้าเกมทันที
if (isset($_SESSION['user_id'])) {
    header("Location: game.php");
    exit();
}

$error = "";

// ตรวจสอบการกดปุ่มล็อกอิน
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    if (!empty($username) && !empty($password)) {
        try {
            // ค้นหาชื่อผู้ใช้
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();
            
            // ตรวจสอบรหัสผ่าน (ใช้การถอดรหัส bcrypt)
            if ($user && password_verify($password, $user['password'])) {
                // เก็บค่าใน Session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['fullname'] = $user['fullname'];
                
                header("Location: game.php");
                exit();
            } else {
                $error = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!";
            }
        } catch (PDOException $e) {
            $error = "เกิดข้อผิดพลาด: " . $e->getMessage();
        }
    } else {
        $error = "กรุณากรอกข้อมูลให้ครบถ้วน!";
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esports Athlete System - Home</title>
    <!-- ใช้ Tailwind CSS จาก CDN เพื่อความสวยงาม -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Chakra Petch', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between text-gray-100">

    <!-- Header Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    ⚔️ ESPORTS PORTAL
                </span>
            </div>
            <div>
                <a href="register.php" class="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 transition rounded-lg border border-slate-700 text-cyan-400">
                    สมัครสมาชิกนักกีฬา
                </a>
            </div>
        </div>
    </header>

    <!-- Main Content Grid -->
    <main class="max-w-6xl mx-auto px-4 py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
        
        <!-- Left Side: Esports Intro -->
        <div class="lg:w-1/2 space-y-6">
            <span class="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/20">
                🚀 เว็บไซต์ระบบรับสมัครนักกีฬาอีสปอร์ต
            </span>
            <h1 class="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                ก้าวสู่การเป็น <br>
                <span class="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    นักกีฬา ESPORTS มืออาชีพ
                </span>
            </h1>
            <p class="text-slate-400 text-lg leading-relaxed">
                ศูนย์กลางรวบรวมและคัดเลือกผู้เล่นอีสปอร์ตระดับท็อปของประเทศ สมัครสมาชิกเพื่อบันทึกประวัติ 
                และทดสอบทักษะการตอบสนองความเร็วด้วยระบบจำลอง **AR Star-Catcher Game** 
                ที่พัฒนาด้วยเทคโนโลยีประมวลผลวิดีโอเรียลไทม์ผ่านกล้องเว็บแคมของคุณ!
            </p>
            <div class="flex items-center space-x-4 pt-4 text-sm text-slate-500">
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                    <span>ระบบลงทะเบียนเปิดอยู่</span>
                </div>
                <span>•</span>
                <span>รองรับ Webcam ทุกอุปกรณ์</span>
            </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="w-full lg:w-96">
            <div class="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
                <h2 class="text-2xl font-bold mb-6 text-center text-white">เข้าสู่ระบบนักกีฬา</h2>
                
                <?php if (!empty($error)): ?>
                    <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <form action="index.php" method="POST" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                        <input type="text" name="username" required 
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                               placeholder="กรอกชื่อผู้ใช้">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">รหัสผ่าน (Password)</label>
                        <input type="password" name="password" required 
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                               placeholder="กรอกรหัสผ่าน">
                    </div>

                    <button type="submit" 
                            class="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all transform active:scale-[0.98]">
                        ล็อกอินเข้าสู่ระบบ
                    </button>
                </form>

                <div class="mt-6 text-center text-sm text-slate-500">
                    ยังไม่มีบัญชีนักกีฬา? 
                    <a href="register.php" class="text-cyan-400 hover:underline ml-1 font-medium">สมัครสมาชิกที่นี่</a>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-6 text-center text-sm text-slate-500 bg-slate-950">
        <p>© 2026 Esports Athlete Registration & AR System. พัฒนาด้วย PHP + MySQL + Vanilla JS</p>
    </footer>

</body>
</html>`
  },
  {
    name: 'register.php',
    language: 'php',
    description: 'หน้าสมัครสมาชิก (Register) บันทึกข้อมูลลงฐานข้อมูล MySQL พร้อมรหัสผ่านแฮชความปลอดภัยสูง',
    content: `<?php
session_start();
require_once 'config.php';

// หากล็อกอินอยู่แล้ว ให้ข้ามไปหน้าเกม
if (isset($_SESSION['user_id'])) {
    header("Location: game.php");
    exit();
}

$error = "";
$success = false;
$registered_username = "";

// ตรวจสอบการกดปุ่มสมัครสมาชิก
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $email    = trim($_POST['email']);
    $fullname = trim($_POST['fullname']);
    
    if (!empty($username) && !empty($password) && !empty($email) && !empty($fullname)) {
        try {
            // 1. ตรวจสอบว่ามีชื่อผู้ใช้นี้อยู่แล้วในฐานข้อมูลหรือไม่
            $check_stmt = $conn->prepare("SELECT id FROM users WHERE username = :username");
            $check_stmt->execute([':username' => $username]);
            
            if ($check_stmt->rowCount() > 0) {
                $error = "ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ!";
            } else {
                // 2. เข้ารหัสผ่านเพื่อความปลอดภัยขั้นสูง (Bcrypt)
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                
                // 3. บันทึกลงฐานข้อมูล
                $insert_stmt = $conn->prepare("INSERT INTO users (username, password, email, fullname, score) VALUES (:username, :password, :email, :fullname, 0)");
                $insert_stmt->execute([
                    ':username' => $username,
                    ':password' => $hashed_password,
                    ':email'    => $email,
                    ':fullname' => $fullname
                ]);
                
                $success = true;
                $registered_username = $username;
            }
        } catch (PDOException $e) {
            $error = "เกิดข้อผิดพลาดเกี่ยวกับระบบฐานข้อมูล: " . $e->getMessage();
        }
    } else {
        $error = "กรุณากรอกข้อมูลในแบบฟอร์มสมัครให้ครบถ้วน!";
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esports Athlete System - Register</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Chakra Petch', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between text-gray-100">

    <!-- Header Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <a href="index.php" class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition">
                    ⚔️ ESPORTS PORTAL
                </a>
            </div>
            <div>
                <a href="index.php" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                    กลับหน้าแรก / ล็อกอิน
                </a>
            </div>
        </div>
    </header>

    <!-- Main Register Container -->
    <main class="max-w-md mx-auto px-4 py-12 flex-1 flex flex-col justify-center w-full">
        
        <?php if ($success): ?>
            <!-- Success Screen -->
            <div class="bg-slate-900/80 p-8 rounded-2xl border border-green-500/30 text-center shadow-2xl backdrop-blur-md space-y-6">
                <div class="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400 text-3xl">
                    ✓
                </div>
                <div class="space-y-2">
                    <h2 class="text-2xl font-bold text-green-400">สมัครสมาชิกสำเร็จ!</h2>
                    <p class="text-slate-400 text-sm">ข้อมูลนักกีฬาของคุณได้รับการบันทึกลง MySQL เรียบร้อยแล้ว</p>
                </div>
                
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2">
                    <div class="text-xs text-slate-500">ใช้รหัสผู้ใช้งานด้านล่างนี้ในหน้าหลักเพื่อเข้าแข่งขัน</div>
                    <div class="text-sm font-semibold flex justify-between">
                        <span class="text-slate-400">ชื่อล็อกอิน:</span>
                        <span class="text-cyan-400 font-mono"><?php echo htmlspecialchars($registered_username); ?></span>
                    </div>
                    <div class="text-sm font-semibold flex justify-between">
                        <span class="text-slate-400">สิทธิ์ผู้ใช้งาน:</span>
                        <span class="text-blue-400">Esports Athlete Candidates</span>
                    </div>
                </div>

                <a href="index.php" class="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/20">
                    ไปที่หน้าล็อกอินเพื่อเข้าสู่ระบบ
                </a>
            </div>
        <?php else: ?>
            <!-- Registration Form -->
            <div class="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
                <h2 class="text-2xl font-bold mb-2 text-center text-white">ลงทะเบียนนักกีฬา</h2>
                <p class="text-sm text-slate-400 text-center mb-6">กรอกข้อมูลจริงเพื่อบันทึกประวัติการคัดเลือก</p>
                
                <?php if (!empty($error)): ?>
                    <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <form action="register.php" method="POST" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">ชื่อผู้ใช้งาน (Username) *</label>
                        <input type="text" name="username" required 
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                               placeholder="ภาษาอังกฤษหรือตัวเลข 4 ตัวอักษรขึ้นไป"
                               pattern="[A-Za-z0-9_]{4,}" title="ต้องเป็นภาษาอังกฤษหรือตัวเลขความยาว 4 ตัวขึ้นไป">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">รหัสผ่าน (Password) *</label>
                        <input type="password" name="password" required 
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                               placeholder="รหัสผ่านสำหรับล็อกอิน"
                               minlength="6">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">ชื่อ-นามสกุลจริง (Full Name) *</label>
                        <input type="text" name="fullname" required 
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                               placeholder="เช่น นายสมชาย ใจกล้า">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">ที่อยู่อีเมล (Email) *</label>
                        <input type="email" name="email" required 
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                               placeholder="example@esports.com">
                    </div>

                    <button type="submit" 
                            class="w-full py-3 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all transform active:scale-[0.98]">
                        ลงทะเบียนนักกีฬาเรียบร้อย
                    </button>
                </form>

                <div class="mt-6 text-center text-xs text-slate-500">
                    การคลิกลงทะเบียนแสดงว่าคุณยอมรับข้อตกลง <br>
                    มีบัญชีอยู่แล้ว? 
                    <a href="index.php" class="text-cyan-400 hover:underline font-medium">เข้าสู่ระบบที่นี่</a>
                </div>
            </div>
        <?php endif; ?>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-6 text-center text-sm text-slate-500 bg-slate-950">
        <p>© 2026 Esports Athlete Registration & AR System. พัฒนาด้วย PHP + MySQL + Vanilla JS</p>
    </footer>

</body>
</html>`
  },
  {
    name: 'game.php',
    language: 'php',
    description: 'หน้าหลักของเกมส์ AR คัดเลือกนักกีฬา ป้องกันการเข้าถึงหากไม่ล็อกอิน พร้อมระบบจับความเคลื่อนไหวด้วยกล้องเว็บแคม',
    content: `<?php
session_start();
require_once 'config.php';

// บังคับล็อกอิน หากไม่มี ID ใน Session ให้ดีดไปหน้า index.php
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$score = 0;

try {
    // โหลดคะแนนสูงสุดล่าสุดของผู้ใช้
    $stmt = $conn->prepare("SELECT score, email, fullname FROM users WHERE id = :id");
    $stmt->execute([':id' => $user_id]);
    $user = $stmt->fetch();
    if ($user) {
        $score = $user['score'];
        $fullname = $user['fullname'];
    }
} catch (PDOException $e) {
    // ละไว้ในฐานที่เข้าใจ
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esports Athlete System - AR Aim Test Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Chakra Petch', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        }
        /* ทำกระจกมองหลังให้กล้องเว็บแคม */
        #webcam {
            transform: scaleX(-1);
        }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between text-gray-100">

    <!-- Header Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <span class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ⚔️ ESPORTS GAMESTAGE
            </span>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-slate-300">
                    นักกีฬา: <span class="text-cyan-400 font-semibold"><?php echo htmlspecialchars($fullname); ?></span>
                </span>
                <a href="logout.php" class="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition">
                    ออกจากระบบ
                </a>
            </div>
        </div>
    </header>

    <!-- Main Arena Container -->
    <main class="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Left panel: Info & Actions -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                    🏆 โปรไฟล์แข่งขัน
                </h2>
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">บัญชีผู้ใช้:</span>
                        <span class="text-slate-300 font-mono"><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">คะแนนสูงสุดเดิม:</span>
                        <span class="text-green-400 font-bold font-mono" id="saved-highscore"><?php echo htmlspecialchars($score); ?> แต้ม</span>
                    </div>
                </div>

                <div class="space-y-2 text-xs text-slate-400">
                    <span class="text-cyan-400 font-semibold text-sm block">🎮 กติกาการทดสอบปฏิกิริยา AR</span>
                    <ol class="list-decimal list-inside space-y-1 pl-1">
                        <li>กดอนุญาตสิทธิ์การเข้าถึงกล้องเว็บแคม</li>
                        <li>กดปุ่ม <span class="text-cyan-400">"เริ่มการทดสอบ"</span></li>
                        <li><b>โบกมือหรือขยับมือสัมผัสโดน "ดาวสีเหลือง"</b> ที่ปรากฏตัวบนจอเพื่อสะสมแต้ม</li>
                        <li>จับเวลา 30 วินาที เมื่อหมดเวลาสามารถกดปุ่มบันทึกคะแนนสูงสุดลง MySQL ได้ทันที!</li>
                    </ol>
                </div>
            </div>

            <!-- Dashboard Button Panel -->
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <div class="text-center">
                    <span class="text-xs text-slate-500">สถานะตัวตรวจจับการเคลื่อนไหว</span>
                    <span id="detector-status" class="block font-bold text-red-500 mt-1 text-sm">กล้องยังไม่พร้อม</span>
                </div>
                <button id="btn-toggle-camera" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-slate-700 transition">
                    เปิด/ปิดกล้องเว็บแคม
                </button>
            </div>
        </div>

        <!-- Right Arena panel: The Canvas Game Stage -->
        <div class="lg:col-span-3 space-y-4 flex flex-col">
            <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex-1 flex flex-col">
                <!-- Game Header Controls -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center space-x-4">
                        <div class="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                            <span class="text-xs text-slate-500 block">SCORE</span>
                            <span id="current-score" class="text-2xl font-black text-cyan-400 font-mono">0</span>
                        </div>
                        <div class="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                            <span class="text-xs text-slate-500 block">TIME LEFT</span>
                            <span id="time-left" class="text-2xl font-black text-yellow-400 font-mono">30s</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button id="btn-start-game" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95">
                            เริ่มเล่นเกมส์ 🕹️
                        </button>
                        <button id="btn-save-score" disabled class="px-5 py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl border border-slate-700 cursor-not-allowed transition">
                            บันทึกคะแนนลง MySQL 💾
                        </button>
                    </div>
                </div>

                <!-- Web Camera and Canvas Container Overlay -->
                <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    
                    <!-- 1. Real Webcam Video Tag (Hidden visually, but active) -->
                    <video id="webcam" autoplay playsinline muted width="640" height="480" class="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"></video>
                    
                    <!-- 2. Display and Interactive Game Canvas -->
                    <canvas id="game-canvas" width="640" height="480" class="absolute inset-0 w-full h-full object-cover z-10"></canvas>
                    
                    <!-- 3. Permission Call-to-Action Layer -->
                    <div id="camera-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6 z-20 transition-opacity">
                        <span class="text-5xl mb-4">📷</span>
                        <h3 class="text-lg font-bold">ต้องการสิทธิ์เข้าใช้งานกล้อง</h3>
                        <p class="text-slate-400 text-sm max-w-sm mt-1 mb-4">โปรดตรวจสอบว่าอุปกรณ์เชื่อมต่อเว็บแคม และกดรับสิทธิ์แชร์กล้องเพื่อเล่นเกมจับวัตถุ AR</p>
                        <button id="btn-grant-camera" class="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition">
                            อนุญาตกล้องเลย
                        </button>
                    </div>
                </div>

                <!-- Live Notification Log Bar -->
                <div class="mt-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-sm flex justify-between" id="status-bar">
                    <span class="text-slate-500" id="game-status-text">ระบบพร้อมสำหรับผู้แข่งขันความเร็ว</span>
                    <span class="text-xs text-slate-500 font-mono">ระบบ AR ไร้ Library ภายนอก | Frame-Differencing API</span>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-6 text-center text-sm text-slate-500 bg-slate-950">
        <p>© 2026 Esports Athlete Registration & AR System. พัฒนาด้วย PHP + MySQL + Vanilla JS</p>
    </footer>

    <!-- Script สำหรับเกม AR Motion Detection แบบไม่ต้องเพิ่ง Library ภายนอก รันได้ทันที -->
    <script>
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // UI Elements
    const btnGrantCamera = document.getElementById('btn-grant-camera');
    const btnToggleCamera = document.getElementById('btn-toggle-camera');
    const btnStartGame = document.getElementById('btn-start-game');
    const btnSaveScore = document.getElementById('btn-save-score');
    const overlay = document.getElementById('camera-overlay');
    const scoreVal = document.getElementById('current-score');
    const timerVal = document.getElementById('time-left');
    const detectorStatus = document.getElementById('detector-status');
    const gameStatusText = document.getElementById('game-status-text');
    const savedHighscore = document.getElementById('saved-highscore');

    let localStream = null;
    let isPlaying = false;
    let score = 0;
    let timeLeft = 30;
    let timerInterval = null;
    
    // ระบบเคลื่อนไหวเปรียบเทียบพิกเซล (Webcam Frame Differencing)
    let previousFrameData = null;
    let star = { x: 320, y: 240, r: 25, active: false };
    let scoreSaved = false;

    // เริ่มสตรีมกล้องเว็บแคม
    async function startCamera() {
        try {
            const constraints = { video: { width: 640, height: 480 } };
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = localStream;
            
            // รอจนกว่าวิดีโอจะสตรีมจริง
            video.onloadedmetadata = () => {
                overlay.classList.add('opacity-0', 'pointer-events-none');
                detectorStatus.innerText = "กล้องทำงานปกติ";
                detectorStatus.className = "block font-bold text-green-400 mt-1 text-sm";
                gameStatusText.innerText = "กล้องพร้อมแล้ว กดเริ่มเกมได้ทันที!";
                requestAnimationFrame(processFrame);
            };
        } catch (err) {
            alert("ไม่สามารถเข้าถึงกล้องเว็บแคมได้! กรุณาตรวจสอบการอนุญาตสิทธิ์กล้อง\\nรายละเอียดความผิดพลาด: " + err.message);
        }
    }

    btnGrantCamera.addEventListener('click', startCamera);
    btnToggleCamera.addEventListener('click', () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
            video.srcObject = null;
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            detectorStatus.innerText = "กล้องปิดอยู่";
            detectorStatus.className = "block font-bold text-red-500 mt-1 text-sm";
        } else {
            startCamera();
        }
    });

    // เริ่มเล่นเกมส์
    btnStartGame.addEventListener('click', () => {
        if (!localStream) {
            alert("กรุณาเปิดสิทธิ์ใช้กล้องเว็บแคมก่อนเริ่มเล่นเกม!");
            return;
        }
        
        isPlaying = true;
        score = 0;
        timeLeft = 30;
        scoreSaved = false;
        scoreVal.innerText = score;
        timerVal.innerText = timeLeft + "s";
        btnStartGame.disabled = true;
        btnStartGame.className = "px-6 py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl border border-slate-700 cursor-not-allowed transition";
        btnSaveScore.disabled = true;
        btnSaveScore.className = "px-5 py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl border border-slate-700 cursor-not-allowed transition";
        gameStatusText.innerText = "โบกมือปัดพิกเซลเหนือดาวเหลืองเพื่อรับคะแนน!";
        
        spawnStar();

        // ตัวนับเวลาถอยหลัง
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerVal.innerText = timeLeft + "s";
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    });

    // ฟังก์ชันสร้างพิกัดดาวสุ่มขึ้นมาบนจอ
    function spawnStar() {
        // จำกัดสุ่มให้อยู่ห่างจากขอบจอ
        star.x = Math.floor(Math.random() * (canvas.width - 100)) + 50;
        star.y = Math.floor(Math.random() * (canvas.height - 100)) + 50;
        star.active = true;
    }

    function endGame() {
        isPlaying = false;
        clearInterval(timerInterval);
        timerVal.innerText = "0s";
        gameStatusText.innerText = "จบการทดสอบ! คะแนนที่คุณทำได้คือ: " + score + " แต้ม";
        
        // เปิดปุ่มบันทึกคะแนน
        btnStartGame.disabled = false;
        btnStartGame.className = "px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black rounded-xl shadow-lg transition-all transform active:scale-95";
        
        btnSaveScore.disabled = false;
        btnSaveScore.className = "px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition cursor-pointer";
    }

    // เซฟคะแนนเข้าฐานข้อมูล MySQL โดยยิง AJAX (Fetch) หลังบ้าน PHP
    btnSaveScore.addEventListener('click', async () => {
        if (scoreSaved) return;
        
        try {
            gameStatusText.innerText = "กำลังบันทึกคะแนนลง MySQL...";
            const response = await fetch('save_score.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score: score })
            });

            const result = await response.json();
            if (result.success) {
                gameStatusText.innerText = "✓ บันทึกคะแนนเข้า MySQL สำเร็จเรียบร้อยแล้ว!";
                savedHighscore.innerText = result.new_highscore + " แต้ม";
                scoreSaved = true;
                btnSaveScore.disabled = true;
                btnSaveScore.className = "px-5 py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl border border-slate-700 cursor-not-allowed transition";
            } else {
                alert("เกิดข้อผิดพลาด: " + result.message);
                gameStatusText.innerText = "เกิดความผิดพลาดในการเซฟข้อมูล";
            }
        } catch (error) {
            console.error(error);
            alert("ล้มเหลวในการเชื่อมต่อเซิร์ฟเวอร์ PHP");
        }
    });

    // วาดรูปดาว 5 แฉกบนแคนวาส
    function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

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
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // ฟังก์ชันประมวลผลวิดีโอ จับ Motion Detection แบบพิกเซล
    function processFrame() {
        if (!localStream) return;

        // 1. วาดรูปกล้อง Mirror ลงใน Canvas
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 2. ตรวจสอบการเคลื่อนไหว (Motion Frame-Differencing)
        const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (previousFrameData && isPlaying && star.active) {
            const currentPixels = currentFrameData.data;
            const prevPixels = previousFrameData.data;
            
            // ขอบเขตความกว้างรอบๆ ดาวเพื่อดักจับการสั่นไหวของพิกเซล (Star Collide Area)
            let diffPixelsDetected = 0;
            const checkRadius = star.r + 15;
            
            // วนลูปสแกนกลุ่มพิกเซลดาว
            for (let y = star.y - checkRadius; y < star.y + checkRadius; y += 4) {
                for (let x = star.x - checkRadius; x < star.x + checkRadius; x += 4) {
                    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
                    
                    const index = (y * canvas.width + x) * 4;
                    
                    // คำนวณหาค่าความสว่างของสีกรอบปัจจุบันและก่อนหน้า
                    const rDiff = Math.abs(currentPixels[index] - prevPixels[index]);
                    const gDiff = Math.abs(currentPixels[index+1] - prevPixels[index+1]);
                    const bDiff = Math.abs(currentPixels[index+2] - prevPixels[index+2]);
                    
                    // หากมีการสั่นไหวของสีพิกเซลเกินค่า threshold (กำหนดไว้ที่ 45)
                    if (rDiff + gDiff + bDiff > 45) {
                        diffPixelsDetected++;
                    }
                }
            }

            // ถ้ามีพิกเซลเปลี่ยนสีเกิน 25 พิกเซลในรัศมีรอบดวงดาว แปลว่ามีการสะบัดมือโดนดาว!
            if (diffPixelsDetected > 25) {
                score++;
                scoreVal.innerText = score;
                star.active = false;
                
                // เอฟเฟกต์สะท้อนโดนจุดระเบิด (วาดวงแหวนแฟลชสั้นๆ)
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r + 30, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
                ctx.fill();

                // สร้างเสียง Pop บี๊บสั้นๆ ด้วยเสียงสังเคราะห์ (Web Audio API)
                playPopSound();
                
                // สุ่มสร้างตำแหน่งดาวดวงใหม่ต่อไป
                setTimeout(spawnStar, 300);
            }
        }

        // เก็บเฟรมปัจจุบันไว้เปรียบเทียบในรอบหน้า
        previousFrameData = currentFrameData;

        // 3. วาดดาวสีทองและวงแหวนตำแหน่งเป้าหมายถ้าเกมกำลังดำเนินอยู่
        if (isPlaying && star.active) {
            // วงกลมสแกนเนอร์รอบดวงดาวเพื่อแนะผู้เล่น
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r + 15, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]); // เส้นประกะพริบ
            ctx.stroke();
            ctx.setLineDash([]); // รีเซ็ต

            // วาดวัตถุดาวสีทอง
            drawStar(star.x, star.y, 5, star.r, star.r / 2.2, '#fbbf24');
        }

        // ทำการประมวลผลต่อในเฟรมถัดไป
        requestAnimationFrame(processFrame);
    }

    // ฟังก์ชันสร้างเสียงบี๊บป๊อปเวลาเก็บแต้ม (ไม่ต้องพึ่งพิงไฟล์เสียงเสริม)
    function playPopSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.08);
            
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.11);
        } catch(e) {
            // เสียงเฟลเงียบๆ
        }
    }
    </script>
</body>
</html>`
  },
  {
    name: 'save_score.php',
    language: 'php',
    description: 'ไฟล์ Endpoint สำหรับรับคะแนนจากหน้า Game ด้วย JSON POST คัดกรองความปลอดภัยแล้วบันทึกลง MySQL',
    content: `<?php
session_start();
require_once 'config.php';

// บังคับให้รับส่งในรูปแบบ JSON
header('Content-Type: application/json');

// ตรวจสอบล็อกอิน
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'คุณยังไม่ได้ล็อกอินเข้าสู่ระบบ'
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];

// รับข้อมูลดิบที่เป็น JSON จาก Fetch API 
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (isset($data['score'])) {
    $incoming_score = intval($data['score']);
    
    try {
        // 1. ดึงคะแนนปัจจุบันเพื่อมาเปรียบเทียบเซฟเฉพาะ New Highscore
        $stmt = $conn->prepare("SELECT score FROM users WHERE id = :id");
        $stmt->execute([':id' => $user_id]);
        $user = $stmt->fetch();
        
        $current_highscore = $user ? intval($user['score']) : 0;
        $new_highscore = $current_highscore;
        
        if ($incoming_score > $current_highscore) {
            // อัปเดตคะแนนสูงสุดอันใหม่ลง MySQL
            $update_stmt = $conn->prepare("UPDATE users SET score = :score WHERE id = :id");
            $update_stmt->execute([
                ':score' => $incoming_score,
                ':id' => $user_id
            ]);
            $new_highscore = $incoming_score;
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'บันทึกคะแนนเรียบร้อยแล้ว',
            'current_score' => $incoming_score,
            'new_highscore' => $new_highscore
        ]);
        exit();
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'ฐานข้อมูลเกิดข้อผิดพลาด: ' . $e->getMessage()
        ]);
        exit();
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'ข้อมูลคะแนนไม่สมบูรณ์'
    ]);
    exit();
}
?>`
  },
  {
    name: 'logout.php',
    language: 'php',
    description: 'หน้าสำหรับออกจากระบบ เคลียร์ Session ทั้งหมดใน PHP และรีไดเรกต์กลับหน้าแรก',
    content: `<?php
session_start();

// เคลียร์และทำลาย Session
$_SESSION = array();
session_destroy();

// รีไดเรกต์ไปหน้าแรก
header("Location: index.php");
exit();
?>`
  }
];

export const XAMPP_GUIDE_TH = `
### 🛠️ วิธีการรันระบบนี้บนโปรแกรม XAMPP (สำหรับ Apache และ MySQL)

ทำตามขั้นตอนด้านล่างนี้ทีละเสต็ปเพื่อนำโค้ดไปรันในเครื่องคอมพิวเตอร์ของคุณแบบละเอียด:

---

#### ขั้นตอนที่ 1: ติดตั้งโปรแกรม XAMPP
1. ไปที่เว็บไซต์ทางการ [Apache Friends (https://www.apachefriends.org)](https://www.apachefriends.org) และดาวน์โหลด **XAMPP สำหรับ Windows / macOS** แนะนำให้ใช้เวอร์ชันล่าสุดที่รองรับ PHP 8.x
2. ติดตั้งโปรแกรม XAMPP ในคอมพิวเตอร์ของคุณ โดยทั่วไปโฟลเดอร์หลักจะอยู่ที่ \`C:\\xampp\` บน Windows

---

#### ขั้นตอนที่ 2: สร้างโฟลเดอร์โปรเจกต์
1. เปิดเข้าไปที่โฟลเดอร์ \`C:\\xampp\\htdocs\` 
2. สร้างโฟลเดอร์ใหม่ชื่อว่า \`esports-system\` เพื่อใช้เก็บโค้ดทั้งหมดของโปรเจกต์นี้

---

#### ขั้นตอนที่ 3: บันทึกไฟล์โค้ดลงในโฟลเดอร์
คัดลอกโค้ดจากแท็บเมนูด้านบน หรือคลิกปุ่ม **"Copy Code"** นำไปสร้างไฟล์ในโปรแกรมแก้ไขโค้ด เช่น **Visual Studio Code (VS Code)** หรือ Notepad และเซฟชื่อไฟล์ไว้ในโฟลเดอร์ \`C:\\xampp\\htdocs\\esports-system\` ตามรายชื่อดังนี้:
1. \`database.sql\` *(ไฟล์สร้างตาราง)*
2. \`config.php\` *(ไฟล์ตั้งค่าเชื่อมต่อฐานข้อมูล)*
3. \`index.php\` *(หน้าหลัก และล็อกอิน)*
4. \`register.php\` *(หน้าสมัครสมาชิก)*
5. \`game.php\` *(หน้าสนามประลองเกมส์ AR Webcam)*
6. \`save_score.php\` *(หน้ารองรับเซฟแต้มผ่าน API)*
7. \`logout.php\` *(หน้าสำหรับออกจากระบบ)*

---

#### ขั้นตอนที่ 4: สตาร์ท Apache และ MySQL
1. เปิดโปรแกรม **XAMPP Control Panel** ขึ้นมา
2. กดปุ่ม **"Start"** ที่แถวของ **Apache** (เว็บเซิร์ฟเวอร์จำลอง)
3. กดปุ่ม **"Start"** ที่แถวของ **MySQL** (ระบบจัดการฐานข้อมูล)
*สังเกตเห็นตัวอักษรกลายเป็นแถบสีเขียว แปลว่าเซิร์ฟเวอร์จำลองเริ่มทำงานแล้ว!*

---

#### ขั้นตอนที่ 5: นำเข้าฐานข้อมูล SQL
1. เปิดเบราว์เซอร์ (Chrome / Edge / Firefox) และเข้าลิงก์: **[http://localhost/phpmyadmin](http://localhost/phpmyadmin)**
2. คลิกปุ่ม **"New"** ที่เมนูด้านซ้ายเพื่อสร้างฐานข้อมูลใหม่
3. ตั้งชื่อฐานข้อมูลว่า \`esports_db\` และตั้งค่า Collation เป็น \`utf8mb4_unicode_ci\` จากนั้นกดปุ่ม **"Create"**
4. เมื่อสร้างฐานข้อมูลเสร็จแล้ว ให้คลิกที่ชื่อฐานข้อมูล \`esports_db\` นั้น จากนั้นเลือกแท็บด้านบนที่เขียนว่า **"SQL"**
5. คัดลอกโค้ดจากไฟล์ \`database.sql\` ในหน้านี้ทั้งหมดมาวางใส่ในช่องกล่องข้อความ SQL จากนั้นกดปุ่ม **"Go"** (อยู่ที่มุมขวาล่างของจอ)
*คุณจะสังเกตเห็นตารางชื่อ \`users\` ปรากฏขึ้นมาในฐานข้อมูลเรียบร้อย!*

---

#### ขั้นตอนที่ 6: เปิดใช้งานและทดสอบระบบในเครื่อง
1. เปิดเบราว์เซอร์ไปที่ลิงก์โครงการของคุณ: **[http://localhost/esports-system/](http://localhost/esports-system/)**
2. คุณจะเห็นหน้าแรกที่สวยงาม มีข้อมูลแนะนำอีสปอร์ต และฟอร์มล็อกอิน
3. คลิกปุ่ม **"สมัครสมาชิกที่นี่"** เพื่อไปยังหน้าสมัคร สังเกตเมื่อลงทะเบียนสมัครสมาชิก ข้อมูลทั้งหมดจะถูกส่งไปเขียนลงในฐานข้อมูล MySQL และจะปรากฏรายละเอียดบอกว่าชื่อไอดีของคุณคืออะไร
4. นำบัญชีนั้นมาล็อกอินในหน้าหลัก ระบบจะพาเข้าสู่หน้า **game.php** ทันที
5. เพื่อสิทธิ์การเล่นเกม AR สว่างๆ:
   - กดอนุญาตให้เบราว์เซอร์เข้าถึง **กล้องเว็บแคม (Webcam)** ของคุณ
   - กดปุ่ม **"เริ่มเล่นเกมส์ 🕹️"** เพื่อเริ่มนับเวลาถอยหลัง 30 วินาที
   - โบกมือปัดไปมาบนอากาศในระยะกล้องให้โดนพิกเซล **"วัตถุรูปดาวสีเหลือง"** เพื่อทำคะแนน
   - เมื่อหมดเวลา กดปุ่ม **"บันทึกคะแนนลง MySQL 💾"** ข้อมูลคะแนนจะอัปเดตและเซฟสูงสุดลงดาต้าเบส MySQL ของ XAMPP ทันที!
`;
