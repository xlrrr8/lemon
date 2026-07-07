import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp, 
  History, 
  Star, 
  ChevronLeft,
  User,
  Users,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  BarChart3,
  Dna,
  Shield,
  Activity,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { motion } from 'framer-motion';

// Mock data for the profile
const ratingData = [
  { name: 'Jan', bullet: 1200, blitz: 1450, rapid: 1600 },
  { name: 'Feb', bullet: 1250, blitz: 1420, rapid: 1620 },
  { name: 'Mar', bullet: 1300, blitz: 1480, rapid: 1650 },
  { name: 'Apr', bullet: 1280, blitz: 1520, rapid: 1680 },
  { name: 'May', bullet: 1350, blitz: 1550, rapid: 1700 },
  { name: 'Jun', bullet: 1400, blitz: 1600, rapid: 1750 },
  { name: 'Jul', bullet: 1420, blitz: 1580, rapid: 1780 },
];

const winLossData = [
  { name: 'Wins', value: 695, color: 'hsl(var(--primary))' },
  { name: 'Draws', value: 124, color: 'hsl(var(--muted-foreground))' },
  { name: 'Losses', value: 465, color: 'hsl(var(--foreground))' },
];

const achievements = [
  { id: 1, title: 'Road to Grandmaster', icon: <Trophy className="w-5 h-5" />, status: 'In Progress', progress: 65, color: 'text-primary' },
  { id: 2, title: 'Tactical Genius', icon: <Target className="w-5 h-5" />, status: 'Completed', progress: 100, color: 'text-primary' },
  { id: 3, title: 'Speed Demon', icon: <Zap className="w-5 h-5" />, status: 'Completed', progress: 100, color: 'text-primary' },
  { id: 4, title: 'Endgame Specialist', icon: <Clock className="w-5 h-5" />, status: 'In Progress', progress: 40, color: 'text-muted-foreground' },
  { id: 5, title: 'Veteran Soul', icon: <Shield className="w-5 h-5" />, status: 'In Progress', progress: 85, color: 'text-muted-foreground' },
];

const stats = [
  { label: 'Total Games', value: '1,284', icon: <History className="w-4 h-4" /> },
  { label: 'Win Rate', value: '54.2%', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Best Win', value: '2405', icon: <Star className="w-4 h-4" /> },
  { label: 'Current Streak', value: '7', icon: <Flame className="w-4 h-4" /> },
  { label: 'Global Rank', value: '#12,402', icon: <Activity className="w-4 h-4" /> },
  { label: 'Puzzle Rating', value: '2,140', icon: <Dna className="w-4 h-4" /> },
];

const formats = [
  { 
    type: 'Bullet', 
    rating: 1420, 
    peak: 1450, 
    games: 452, 
    color: 'text-primary', 
    record: '230W / 185L / 37D'
  },
  { 
    type: 'Blitz', 
    rating: 1580, 
    peak: 1620, 
    games: 612, 
    color: 'text-primary', 
    record: '342W / 210L / 60D'
  },
  { 
    type: 'Rapid', 
    rating: 1780, 
    peak: 1810, 
    games: 220, 
    color: 'text-primary', 
    record: '123W / 70L / 27D'
  },
];

const LemonAvatar = () => {
  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full flex items-center justify-center overflow-visible">
      {/* 1. Outer Ring */}
      <div className="absolute inset-0 rounded-full border border-dashed border-primary/25" />
      
      {/* 2. Inner Ring with Tick Marks */}
      <div className="absolute inset-2 rounded-full border border-primary/10 border-t-primary/35 border-b-primary/35" />
      
      {/* Main avatar area with glowing backdrop */}
      <div className="w-[85%] h-[85%] rounded-full overflow-hidden bg-gradient-to-b from-[#18110b] to-[#0a0706] relative flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
        {/* SVG Illustration (Citrus Cyber Knight) */}
        <svg viewBox="0 0 200 200" className="w-full h-full select-none p-2">
          <defs>
            {/* Background Citrus Radial Glow */}
            <radialGradient id="avatarBgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Metallic Gradient for Knight's Face/Body */}
            <linearGradient id="cyberMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e2520" />
              <stop offset="50%" stopColor="#1a1412" />
              <stop offset="100%" stopColor="#0a0706" />
            </linearGradient>

            {/* Glowing Citrus/Orange Gradients for the Mane & Crest */}
            <linearGradient id="citrusWarm" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffb03a" />
              <stop offset="50%" stopColor="#ff761b" />
              <stop offset="100%" stopColor="#d83b00" />
            </linearGradient>

            <linearGradient id="citrusBright" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffea79" />
              <stop offset="60%" stopColor="#ff8f1c" />
              <stop offset="100%" stopColor="#e54e00" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonOrangeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dotted Grid Background */}
          <circle cx="100" cy="100" r="85" fill="url(#avatarBgGlow)" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" strokeDasharray="3 6" />

          {/* Outer Glass Ring */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="url(#citrusBright)" strokeWidth="1.5" opacity="0.4" />

          {/* ─── Chess Knight Figure ─── */}
          {/* Back Mane: Stylized Glowing Citrus Wedges */}
          {/* Wedge 1 (Top/Ear area) */}
          <path d="M 98 38 C 112 34, 134 46, 130 62 C 127 75, 114 74, 102 68 Z" fill="url(#citrusBright)" filter="url(#neonOrangeGlow)" opacity="0.9" />
          {/* Wedge 2 */}
          <path d="M 106 63 C 122 62, 138 78, 132 94 C 127 106, 115 102, 106 94 Z" fill="url(#citrusWarm)" filter="url(#neonOrangeGlow)" opacity="0.85" />
          {/* Wedge 3 */}
          <path d="M 110 90 C 126 92, 136 112, 126 126 C 117 136, 108 128, 106 118 Z" fill="url(#citrusWarm)" filter="url(#neonOrangeGlow)" opacity="0.8" />

          {/* Inner slice lines for the citrus mane */}
          <path d="M 108 52 L 122 51 M 112 59 L 124 57" stroke="#ffffff" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
          <path d="M 114 77 L 128 80 M 116 85 L 128 88" stroke="#ffffff" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
          <path d="M 116 106 L 126 112 M 114 114 L 122 120" stroke="#ffffff" strokeWidth="1" opacity="0.5" strokeLinecap="round" />

          {/* Knight Main Body (Dark Metallic/Glass) */}
          <path 
            d="M 52 165 C 52 145, 60 120, 68 110 C 64 96, 62 82, 68 72 C 74 62, 86 56, 96 64 C 94 70, 96 78, 98 84 C 90 92, 88 104, 94 116 C 98 124, 102 132, 102 146 C 102 155, 108 160, 114 165 Z" 
            fill="url(#cyberMetal)" 
            stroke="hsl(var(--primary) / 0.3)" 
            strokeWidth="1.5"
          />

          {/* Knight Muzzle / Mouth overlay */}
          <path d="M 52 95 C 56 90, 68 85, 78 88 C 76 96, 70 102, 64 104 Z" fill="#231b18" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />

          {/* Glowing Cyber Line Details on Neck */}
          <path d="M 76 118 Q 86 128, 84 144" fill="none" stroke="url(#citrusBright)" strokeWidth="2" strokeLinecap="round" filter="url(#neonOrangeGlow)" />
          <path d="M 86 114 Q 96 122, 94 136" fill="none" stroke="url(#citrusBright)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <circle cx="84" cy="144" r="2.5" fill="#ffffff" filter="url(#eyeGlow)" />
          <circle cx="94" cy="136" r="1.5" fill="#ffea79" />

          {/* Chess Base of the Knight */}
          <path d="M 44 165 C 44 160, 120 160, 120 165 Z" fill="#201815" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1.5" />
          <path d="M 40 171 L 124 171 L 120 165 L 44 165 Z" fill="url(#cyberMetal)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
          <rect x="36" y="171" width="92" height="6" rx="2" fill="url(#citrusWarm)" />

          {/* Glowing Eye */}
          <polygon points="76,82 86,81 83,86 75,85" fill="#ffffff" filter="url(#eyeGlow)" />
          {/* Secondary Eye Core */}
          <polygon points="78,83 84,82 82,85" fill="#ffeb3b" />
        </svg>
      </div>

      {/* Bottom-Right Badge (verified champion icon) */}
      <div className="absolute bottom-1.5 right-1.5 w-11 h-11 rounded-full bg-primary border-2 border-background flex items-center justify-center z-20">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9zm-1 2.08A7.003 7.003 0 0 0 5.27 11h5.73V5.08zm2 0V11h5.73A7.003 7.003 0 0 0 13 5.08zM12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9zm1-2.08V13h5.73A7.003 7.003 0 0 0 13 18.92zm-2 0a7.003 7.003 0 0 0-5.73-5.92H11v5.92z" />
        </svg>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Generate matchmaking invite or profile link
    const inviteUrl = `${window.location.origin}/play?invite=aaryank`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Back to Play</span>
          </button>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="flex items-center gap-2.5 rounded-full pl-1.5 pr-4 py-1.5 text-sm font-bold text-foreground group cursor-default border border-border bg-card">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"></div>
              </div>
              <span className="tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">Aaryan K.</span>
            </div>
          </div>
        </header>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar - User Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-8 border border-border bg-card"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <LemonAvatar />
                </div>

                <h1 className="text-2xl font-bold tracking-tight">Aaryan K.</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1 inline-flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20 font-bold">WNM</span>
                  @aaryank · Joined Jan 2024
                </p>

                <div className="grid grid-cols-2 gap-3.5 w-full mt-8">
                  {stats.map((s, i) => (
                    <div 
                      key={i} 
                      className="rounded-2xl border border-border bg-muted/30 p-3 text-left hover:border-primary/20 transition-all duration-300 hover:bg-muted/50 hover:scale-[1.02] group cursor-default"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors mb-1.5">
                        <span className="text-muted-foreground/80 group-hover:text-primary transition-colors">{s.icon}</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">{s.label}</span>
                      </div>
                      <p className="text-lg font-black tracking-tight">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 w-full mt-6">
                  <button className="flex-1 py-3.5 rounded-xl font-bold text-sm text-foreground border border-border bg-card hover:bg-muted hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 active:scale-95">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 border ${
                      showQR 
                        ? 'bg-primary/10 text-primary border-primary/30' 
                        : 'text-muted-foreground border-border bg-card hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Share Chess ID
                  </button>
                </div>

                {/* Collapsible QR Code Widget */}
                {showQR && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    className="w-full mt-4 p-5 rounded-2xl border border-primary/20 bg-primary/5/30 backdrop-blur-md overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex flex-col items-center gap-4 relative z-0">
                      {/* Premium QR Code SVG */}
                      <div className="relative p-3 bg-white rounded-2xl shadow-lg shadow-black/40">
                        <svg className="w-36 h-36" viewBox="0 0 100 100">
                          {/* Finder Pattern Top-Left */}
                          <rect x="0" y="0" width="28" height="28" rx="5" fill="#1e1816" />
                          <rect x="4" y="4" width="20" height="20" rx="3" fill="#ffffff" />
                          <rect x="8" y="8" width="12" height="12" rx="2" fill="hsl(var(--primary))" />
                          
                          {/* Finder Pattern Top-Right */}
                          <rect x="72" y="0" width="28" height="28" rx="5" fill="#1e1816" />
                          <rect x="76" y="4" width="20" height="20" rx="3" fill="#ffffff" />
                          <rect x="80" y="8" width="12" height="12" rx="2" fill="hsl(var(--primary))" />
                          
                          {/* Finder Pattern Bottom-Left */}
                          <rect x="0" y="72" width="28" height="28" rx="5" fill="#1e1816" />
                          <rect x="4" y="76" width="20" height="20" rx="3" fill="#ffffff" />
                          <rect x="8" y="80" width="12" height="12" rx="2" fill="hsl(var(--primary))" />

                          {/* Alignment Pattern Bottom-Right */}
                          <rect x="76" y="76" width="16" height="16" rx="3" fill="#1e1816" />
                          <rect x="80" y="80" width="8" height="8" rx="1.5" fill="#ffffff" />
                          <rect x="83" y="83" width="2" height="2" fill="hsl(var(--primary))" />

                          {/* Data dots representation */}
                          <rect x="36" y="0" width="4" height="4" rx="1" fill="#1e1816" />
                          <rect x="44" y="0" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="60" y="0" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="36" y="8" width="4" height="8" rx="1" fill="#1e1816" />
                          <rect x="48" y="8" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="56" y="8" width="4" height="4" rx="1" fill="#1e1816" />
                          <rect x="64" y="8" width="4" height="4" rx="1" fill="#1e1816" />
                          <rect x="36" y="20" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="48" y="20" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="60" y="20" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="40" y="28" width="4" height="4" rx="1" fill="#1e1816" />
                          <rect x="52" y="28" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="64" y="28" width="4" height="8" rx="1" fill="#1e1816" />

                          {/* Left-Right spacing and middle row patterns */}
                          <rect x="0" y="36" width="8" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="12" y="36" width="4" height="4" rx="1" fill="#1e1816" />
                          <rect x="24" y="36" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="68" y="36" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="80" y="36" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="88" y="36" width="8" height="4" rx="1" fill="#1e1816" />

                          <rect x="4" y="44" width="4" height="8" rx="1" fill="#1e1816" />
                          <rect x="16" y="44" width="8" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="28" y="44" width="4" height="4" rx="1" fill="#1e1816" />
                          <rect x="68" y="44" width="4" height="12" rx="1" fill="#1e1816" />
                          <rect x="76" y="44" width="8" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="88" y="44" width="4" height="4" rx="1" fill="#1e1816" />

                          <rect x="0" y="56" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="8" y="56" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="20" y="56" width="4" height="8" rx="1" fill="#1e1816" />
                          <rect x="28" y="56" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="76" y="56" width="4" height="8" rx="1" fill="hsl(var(--primary))" />
                          <rect x="84" y="56" width="8" height="4" rx="1" fill="#1e1816" />

                          <rect x="36" y="68" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="44" y="68" width="4" height="8" rx="1" fill="#1e1816" />
                          <rect x="52" y="68" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="64" y="68" width="4" height="4" rx="1" fill="#1e1816" />
                          
                          <rect x="36" y="80" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="48" y="80" width="4" height="4" rx="1" fill="hsl(var(--primary))" />
                          <rect x="56" y="80" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="68" y="80" width="4" height="12" rx="1" fill="#1e1816" />

                          <rect x="40" y="92" width="4" height="8" rx="1" fill="hsl(var(--primary))" />
                          <rect x="48" y="92" width="8" height="4" rx="1" fill="#1e1816" />
                          <rect x="60" y="92" width="4" height="4" rx="1" fill="#1e1816" />

                          {/* Center Cutout space */}
                          <rect x="37" y="37" width="26" height="26" rx="6" fill="#ffffff" />
                          {/* Stylized Citrus slice center logo */}
                          <circle cx="50" cy="50" r="9" fill="hsl(var(--primary))" />
                          <circle cx="50" cy="50" r="7.5" fill="#ffffff" />
                          <path d="M50 43 L50 57 M43 50 L57 50 M45 45 L55 55 M45 55 L55 45" stroke="hsl(var(--primary))" strokeWidth="1" />
                          <circle cx="50" cy="50" r="2.5" fill="hsl(var(--primary))" />
                        </svg>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold tracking-tight text-foreground">Chess Passport</p>
                        <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                          Scan to invite @aaryank to a match, or view real-time stats.
                        </p>
                      </div>

                      <button
                        onClick={handleCopyLink}
                        className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border border-border bg-card/80 hover:bg-muted text-foreground active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Invite Link Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            Copy Challenge Link
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-6 border border-border bg-card"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Win / Loss Ratio
              </h3>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                      strokeWidth={0}
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {winLossData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{d.name}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-6 border border-border bg-card"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Achievements
              </h3>
              <div className="space-y-4">
                {achievements.map((a) => (
                  <div key={a.id} className="group relative">
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`h-10 w-10 rounded-xl ${a.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'} flex items-center justify-center border border-current/10`}>
                        {a.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold">{a.title}</p>
                          <span className="text-[10px] text-muted-foreground font-bold">{a.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${a.status === 'Completed' ? 'bg-primary' : 'bg-primary/40'} transition-all`} 
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group">
                View All Achievements
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.section>

          </div>

          {/* Main Content - Stats & Graphs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Format Rating Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formats.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all border border-border bg-card"
                >
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {f.type === 'Bullet' ? <Zap className="w-24 h-24" /> : f.type === 'Blitz' ? <Flame className="w-24 h-24" /> : <Clock className="w-24 h-24" />}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {f.type === 'Bullet' ? <Zap className={`w-4 h-4 ${f.color}`} /> : f.type === 'Blitz' ? <Flame className={`w-4 h-4 ${f.color}`} /> : <Clock className={`w-4 h-4 ${f.color}`} />}
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{f.type}</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black">{f.rating}</p>
                    <p className="text-xs font-bold text-primary">+12</p>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground/60 mt-1">{f.record}</p>
                  <div className="mt-4 flex justify-between text-[11px] font-bold text-muted-foreground/80">
                    <span>Peak: {f.peak}</span>
                    <span>{f.games} games</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Friends Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-3xl p-6 border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Friends List
                </h3>
                <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">2 Online</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Magnus_Clone', status: 'Playing a Rapid Match', isOnline: true, avatar: 'M' },
                  { name: 'Hikaru_Fan', status: 'Online', isOnline: true, avatar: 'H' },
                  { name: 'ChessNinja', status: 'Last seen 2h ago', isOnline: false, avatar: 'C' },
                  { name: 'TacticsMaster', status: 'Last seen yesterday', isOnline: false, avatar: 'T' },
                ].map((friend, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer p-3 rounded-2xl bg-background/40 hover:bg-muted/40 transition-colors border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`h-12 w-12 flex items-center justify-center rounded-xl font-bold text-base ${friend.isOnline ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                          {friend.avatar}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        )}
                      </div>
                      <div>
                        <p className={`text-base font-bold ${!friend.isOnline && 'text-muted-foreground'}`}>{friend.name}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${friend.isOnline && friend.status.includes('Play') ? 'text-primary' : 'text-muted-foreground'}`}>
                          {friend.status}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-border/60 text-sm font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                Find / Add Friends
              </button>
            </motion.section>

            {/* Rating Graph */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-8 border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Rating Progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">Growth across all time formats</p>
                </div>
                <div className="flex gap-2">
                  {['ALL', '1Y', '6M', '1M'].map((t) => (
                    <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${t === 'ALL' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ratingData}>
                    <defs>
                      <linearGradient id="colorBullet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBlitz" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRapid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Area type="monotone" dataKey="bullet" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorBullet)" />
                    <Area type="monotone" dataKey="blitz" stroke="hsl(var(--foreground))" strokeWidth={3} fillOpacity={1} fill="url(#colorBlitz)" />
                    <Area type="monotone" dataKey="rapid" stroke="hsl(var(--muted-foreground))" strokeWidth={3} fillOpacity={1} fill="url(#colorRapid)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs font-semibold">Bullet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground"></div>
                  <span className="text-xs font-semibold">Blitz</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs font-semibold">Rapid</span>
                </div>
              </div>
            </motion.section>

            {/* Recent Best Games */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl p-8 border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Brilliant Performances</h3>
                <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View Game Archive</button>
              </div>

              <div className="space-y-4">
                {[
                  { vs: 'Magnus_Clone', elo: 1845, result: 'Win', accuracy: '96.4%', date: '2h ago', type: 'Blitz' },
                  { vs: 'DeepBlue_v2', elo: 1720, result: 'Win', accuracy: '94.1%', date: 'Yesterday', type: 'Rapid' },
                  { vs: 'Speedy_G', elo: 1680, result: 'Draw', accuracy: '89.2%', date: '3d ago', type: 'Bullet' },
                ].map((game, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-border bg-background/50 hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-xs ${game.result === 'Win' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {game.result === 'Win' ? '1-0' : '½-½'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">vs {game.vs}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">{game.elo}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{game.type} · {game.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Accuracy</p>
                        <p className="text-sm font-black text-primary">{game.accuracy}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-3xl p-8 border border-border bg-card"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Favorite Openings
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Sicilian Defense', games: 142, winRate: '58%' },
                    { name: 'Ruy Lopez', games: 98, winRate: '52%' },
                    { name: "Queen's Gambit", games: 76, winRate: '61%' },
                  ].map((opening, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50">
                      <div>
                        <p className="text-sm font-bold">{opening.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{opening.games} games</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">{opening.winRate}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Win Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-3xl p-8 border border-border bg-card"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Tactical Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background/40 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Avg Accuracy</p>
                    <p className="text-2xl font-black text-foreground">84.2%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/40 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Blunder Rate</p>
                    <p className="text-2xl font-black text-foreground">1.2</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/40 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Best Streak</p>
                    <p className="text-2xl font-black text-foreground">12</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/40 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Time Mgmt</p>
                    <p className="text-2xl font-black text-foreground">Great</p>
                  </div>
                </div>
              </motion.section>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
