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
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full border-4 border-card bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-xl overflow-visible">
      {/* Simple, Iconic Chess Knight SVG */}
      <svg viewBox="0 0 100 100" className="w-[62%] h-[62%] fill-white select-none">
        {/* Chess Knight Path */}
        <path d="M30 80 
                 C30 80, 28 66, 36 55 
                 C32 52, 31 48, 34 43 
                 C37 38, 44 26, 62 26 
                 C59 31, 60 37, 63 41 
                 C66 45, 64 50, 60 54 
                 C57 58, 59 66, 61 80 Z" />
        <path d="M26 84 L65 84 L61 80 L30 80 Z" />
        {/* Eye cut-out */}
        <circle cx="51" cy="38" r="2.5" fill="#f97316" />
      </svg>

      {/* Bottom-Right Verified Badge */}
      <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary border-4 border-card flex items-center justify-center z-20 shadow-lg">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
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
            className="group flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl skeuo-btn text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-base font-semibold">Back to Play</span>
          </button>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="flex items-center gap-3 rounded-full pl-2 pr-5 py-2 text-base font-bold text-foreground group cursor-default skeuo-panel">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors group-hover:text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary"></div>
              </div>
              <span className="tracking-tight text-foreground font-display text-lg">Aaryan K.</span>
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
              className="rounded-3xl p-8 skeuo-panel"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <LemonAvatar />
                </div>

                <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Aaryan K.</h1>
                <p className="text-muted-foreground text-base font-medium mt-1.5 inline-flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs border border-primary/20 font-bold">WNM</span>
                  @aaryank · Joined Jan 2024
                </p>

                <div className="grid grid-cols-2 gap-3.5 w-full mt-8">
                  {stats.map((s, i) => (
                    <div 
                      key={i} 
                      className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 text-left hover:border-primary/30 transition-all duration-300 hover:bg-muted/40 hover:scale-[1.02] group cursor-default shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors mb-1.5">
                        <span className="text-muted-foreground/80 group-hover:text-primary transition-colors">{s.icon}</span>
                        <span className="text-sm uppercase font-bold tracking-wider text-muted-foreground/75">{s.label}</span>
                      </div>
                      <p className="text-xl font-bold font-display tracking-tight text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 w-full mt-6">
                  <button className="flex-1 py-3.5 rounded-xl font-bold text-base text-foreground skeuo-btn flex items-center justify-center gap-2 active:scale-95">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
                      showQR 
                        ? 'bg-primary/15 text-primary border border-primary/40 shadow-inner' 
                        : 'skeuo-btn text-muted-foreground hover:text-foreground'
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
                        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                          Scan to invite @aaryank to a match, or view real-time stats.
                        </p>
                      </div>

                      <button
                        onClick={handleCopyLink}
                        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 skeuo-btn text-foreground active:scale-95"
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
              className="rounded-3xl p-6 skeuo-panel"
            >
              <h3 className="text-lg font-bold font-display uppercase tracking-wider text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
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
              <div className="flex justify-center gap-5 mt-3">
                {winLossData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{d.name}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-6 skeuo-panel"
            >
              <h3 className="text-lg font-bold font-display uppercase tracking-wider text-foreground mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Achievements
              </h3>
              <div className="space-y-4">
                {achievements.map((a) => (
                  <div key={a.id} className="group relative">
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`h-11 w-11 rounded-xl ${a.status === 'Completed' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/60 text-muted-foreground border border-border'} flex items-center justify-center`}>
                        {a.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-base font-semibold text-foreground">{a.title}</p>
                          <span className="text-sm text-muted-foreground font-bold">{a.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
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
              <button className="w-full mt-6 py-3 rounded-xl skeuo-btn flex items-center justify-center gap-2 text-base font-bold text-muted-foreground hover:text-foreground transition-colors group">
                View All Achievements
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.section>

          </div>

          {/* Main Content - Stats & Graphs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Format Rating Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {formats.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all skeuo-panel"
                >
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {f.type === 'Bullet' ? <Zap className="w-24 h-24" /> : f.type === 'Blitz' ? <Flame className="w-24 h-24" /> : <Clock className="w-24 h-24" />}
                  </div>
                  <div className="flex items-center gap-2.5 mb-4">
                    {f.type === 'Bullet' ? <Zap className={`w-5 h-5 ${f.color}`} /> : f.type === 'Blitz' ? <Flame className={`w-5 h-5 ${f.color}`} /> : <Clock className={`w-5 h-5 ${f.color}`} />}
                    <h3 className="text-base font-bold font-display uppercase tracking-widest text-muted-foreground">{f.type}</h3>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <p className="text-4xl sm:text-5xl font-black font-display tracking-tight text-foreground">{f.rating}</p>
                    <p className="text-sm font-bold text-primary">+12</p>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mt-1.5">{f.record}</p>
                  <div className="mt-5 flex justify-between text-sm font-bold text-muted-foreground pt-3 border-t border-border/40">
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
              className="rounded-3xl p-6 skeuo-panel"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-display uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Friends List
                </h3>
                <span className="text-sm font-bold bg-muted px-2.5 py-1 rounded-full text-foreground/80">2 Online</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Magnus_Clone', status: 'Playing a Rapid Match', isOnline: true, avatar: 'M' },
                  { name: 'Hikaru_Fan', status: 'Online', isOnline: true, avatar: 'H' },
                  { name: 'ChessNinja', status: 'Last seen 2h ago', isOnline: false, avatar: 'C' },
                  { name: 'TacticsMaster', status: 'Last seen yesterday', isOnline: false, avatar: 'T' },
                ].map((friend, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer p-3.5 rounded-2xl bg-background/50 hover:bg-muted/40 transition-colors border border-border/60 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`h-12 w-12 flex items-center justify-center rounded-xl font-bold text-lg font-display ${friend.isOnline ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}>
                          {friend.avatar}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500"></div>
                        )}
                      </div>
                      <div>
                        <p className={`text-base font-bold ${!friend.isOnline ? 'text-muted-foreground' : 'text-foreground'}`}>{friend.name}</p>
                        <p className={`text-sm font-semibold mt-0.5 ${friend.isOnline && friend.status.includes('Play') ? 'text-primary' : 'text-muted-foreground'}`}>
                          {friend.status}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3.5 rounded-xl skeuo-btn text-base font-bold text-muted-foreground hover:text-foreground transition-all">
                Find / Add Friends
              </button>
            </motion.section>

            {/* Rating Graph */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-8 skeuo-panel"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold font-display text-foreground">Rating Progress</h3>
                  <p className="text-base text-muted-foreground mt-1">Growth across all time formats</p>
                </div>
                <div className="flex gap-2">
                  {['ALL', '1Y', '6M', '1M'].map((t) => (
                    <button key={t} className={`px-3.5 py-2 rounded-lg text-sm font-bold border transition-colors ${t === 'ALL' ? 'bg-foreground text-background border-foreground font-semibold' : 'skeuo-btn text-muted-foreground'}`}>
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

              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-sm"></div>
                  <span className="text-sm font-semibold">Bullet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-foreground shadow-sm"></div>
                  <span className="text-sm font-semibold">Blitz</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-muted-foreground shadow-sm"></div>
                  <span className="text-sm font-semibold">Rapid</span>
                </div>
              </div>
            </motion.section>

            {/* Recent Best Games */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl p-8 skeuo-panel"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold font-display text-foreground">Brilliant Performances</h3>
                <button className="text-base font-bold text-primary hover:text-primary/80 transition-colors">View Game Archive</button>
              </div>

              <div className="space-y-4">
                {[
                  { vs: 'Magnus_Clone', elo: 1845, result: 'Win', accuracy: '96.4%', date: '2h ago', type: 'Blitz' },
                  { vs: 'DeepBlue_v2', elo: 1720, result: 'Win', accuracy: '94.1%', date: 'Yesterday', type: 'Rapid' },
                  { vs: 'Speedy_G', elo: 1680, result: 'Draw', accuracy: '89.2%', date: '3d ago', type: 'Bullet' },
                ].map((game, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors cursor-pointer shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm font-display ${game.result === 'Win' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}>
                        {game.result === 'Win' ? '1-0' : '½-½'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base text-foreground">vs {game.vs}</p>
                          <span className="text-sm px-2.5 py-0.5 rounded bg-muted/80 text-muted-foreground font-bold">{game.elo}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{game.type} · {game.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accuracy</p>
                        <p className="text-lg font-black font-display text-primary">{game.accuracy}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                className="rounded-3xl p-8 skeuo-panel"
              >
                <h3 className="text-xl font-bold font-display text-foreground mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Favorite Openings
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Sicilian Defense', games: 142, winRate: '58%' },
                    { name: 'Ruy Lopez', games: 98, winRate: '52%' },
                    { name: "Queen's Gambit", games: 76, winRate: '61%' },
                  ].map((opening, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border/60">
                      <div>
                        <p className="text-base font-bold text-foreground">{opening.name}</p>
                        <p className="text-sm text-muted-foreground font-semibold">{opening.games} games</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black font-display text-primary">{opening.winRate}</p>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Win Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-3xl p-8 skeuo-panel"
              >
                <h3 className="text-xl font-bold font-display text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Tactical Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 tracking-wider">Avg Accuracy</p>
                    <p className="text-2xl font-black font-display text-foreground">84.2%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 tracking-wider">Blunder Rate</p>
                    <p className="text-2xl font-black font-display text-foreground">1.2</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 tracking-wider">Best Streak</p>
                    <p className="text-2xl font-black font-display text-foreground">12</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1 tracking-wider">Time Mgmt</p>
                    <p className="text-2xl font-black font-display text-foreground">Great</p>
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
