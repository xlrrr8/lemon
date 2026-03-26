import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp, 
  History, 
  Medal, 
  Star, 
  ChevronLeft,
  Calendar,
  User,
  Users,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  Circle,
  BarChart3,
  Dna,
  Shield,
  Activity
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

const Profile = () => {
  const navigate = useNavigate();

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg skeuo-btn">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Back to Play</span>
          </button>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="flex items-center gap-2.5 rounded-full pl-1.5 pr-4 py-1.5 text-sm font-bold text-foreground group cursor-default skeuo-panel">
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
              className="rounded-3xl p-8 skeuo-panel"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="h-32 w-32 rounded-3xl skeuo-btn-primary p-1.5 flex items-center justify-center">
                    <div className="h-full w-full rounded-[1.2rem] overflow-hidden skeuo-inner">
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aaryan" 
                        alt="Avatar" 
                        className="w-full h-full object-cover scale-110 mt-2"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-11 w-11 rounded-xl skeuo-btn-primary flex items-center justify-center z-10 pointer-events-none">
                    <Medal className="w-5 h-5 fill-current" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight">Aaryan K.</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1 inline-flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20">WNM</span>
                  @aaryank · Joined Jan 2024
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                  {stats.map((s, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-background/50 p-3 text-left">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        {s.icon}
                        <span className="text-[9px] uppercase font-bold tracking-wider">{s.label}</span>
                      </div>
                      <p className="text-base font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity">
                  Edit Profile
                </button>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-6 skeuo-panel"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Win / Loss Ratio
              </h3>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="skeuoPieShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="4" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
                        <feDropShadow dx="-2" dy="-2" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.05" />
                      </filter>
                      {winLossData.map((entry, index) => (
                        <linearGradient key={`pieGrad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={entry.color} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                      style={{ filter: "url(#skeuoPieShadow)" }}
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#pieGrad-${index})`} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
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
              className="rounded-3xl p-6 skeuo-panel"
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

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-6 skeuo-panel hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Friends
                </h3>
                <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">2 Online</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Magnus_Clone', status: 'In a Match', isOnline: true, avatar: 'M' },
                  { name: 'Hikaru_Fan', status: 'Online', isOnline: true, avatar: 'H' },
                  { name: 'ChessNinja', status: 'Last seen 2h ago', isOnline: false, avatar: 'C' },
                  { name: 'TacticsMaster', status: 'Last seen yesterday', isOnline: false, avatar: 'T' },
                ].map((friend, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold text-sm ${friend.isOnline ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                          {friend.avatar}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${!friend.isOnline && 'text-muted-foreground'}`}>{friend.name}</p>
                        <p className={`text-[10px] font-semibold ${friend.isOnline && friend.status === 'In a Match' ? 'text-primary' : 'text-muted-foreground'}`}>
                          {friend.status}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 rounded-xl border border-dashed border-border text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                Add Friend
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
                  className="rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all skeuo-panel"
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
              className="rounded-3xl p-6 skeuo-panel"
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
              className="rounded-3xl p-8 skeuo-panel"
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
              className="rounded-3xl p-8 skeuo-panel"
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
                className="rounded-3xl p-8 skeuo-panel"
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
                className="rounded-3xl p-8 skeuo-panel"
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
