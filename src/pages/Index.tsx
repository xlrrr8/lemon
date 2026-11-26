import { Link } from 'react-router-dom';
import { Swords, Brain, Crown, ArrowRight, User, Flame, Play, Zap, Clock, Target } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const [compTime, setCompTime] = useState(0);
  const [compLevel, setCompLevel] = useState(4);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [selectedOnlineTime, setSelectedOnlineTime] = useState<{ t: number, inc: number } | null>({ t: 10, inc: 0 });

  return (
    <div className="relative flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-background text-foreground select-none">
      {/* Matte Dark Chess Board & Pieces Background */}
      <div className="pointer-events-none absolute inset-0 bg-background overflow-hidden transition-colors duration-300">
        {/* Chess Board Pattern Background */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `conic-gradient(hsl(var(--chess-light-square)) 90deg, hsl(var(--chess-dark-square)) 90deg 180deg, hsl(var(--chess-light-square)) 180deg 270deg, hsl(var(--chess-dark-square)) 270deg)`,
            backgroundSize: `80px 80px`,
            backgroundPosition: `center top`,
            maskImage: `radial-gradient(ellipse at top, black 30%, transparent 80%)`,
            WebkitMaskImage: `radial-gradient(ellipse at top, black 30%, transparent 80%)`,
          }}
        ></div>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,rgba(0,0,0,0),hsl(var(--background))_55%,hsl(var(--background))_100%)] transition-colors duration-300"></div>
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-6 py-4 sm:px-10 sm:py-5 lg:px-12 lg:py-6 z-10 overflow-hidden">
        <header className="flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/15 text-orange-300 shadow-md">
              <Crown className="h-5 w-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">Orange.</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeSwitcher />
            {isSignedIn && (
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3.5 py-1 text-sm sm:text-base font-bold text-foreground transition hover:border-primary/40 hover:bg-card/60 group skeuo-btn"
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary"></div>
                </div>
                <span className="tracking-tight">Aaryan K.</span>
              </Link>
            )}
            <button
              onClick={() => setIsSignedIn(!isSignedIn)}
              className="skeuo-btn rounded-full px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-foreground transition hover:text-orange-300"
            >
              {isSignedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-auto items-center relative z-10">
          
          {/* Left Column - Hero Content & Stats */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-5 lg:gap-7">
            <div className="flex flex-col items-start gap-4 lg:gap-5 text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
                <Flame className="h-3.5 w-3.5" />
                The New Standard Of Chess
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-foreground font-display">
                Play beautiful <br/><span className="text-orange-400">chess.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-[440px] leading-relaxed">
                Orange is built for pure competition: clean visuals, precise clocks, intelligent matchmaking, and a board that keeps your focus on the next move.
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Online</span>
                <span className="text-2xl sm:text-3xl font-bold text-foreground font-display">18.4K</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Today</span>
                <span className="text-2xl sm:text-3xl font-bold text-foreground font-display">231K</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Queue</span>
                <span className="text-2xl sm:text-3xl font-bold text-foreground font-display">3.8s</span>
              </div>
            </div>
          </div>

          {/* Right Column - Bento Actions */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 lg:gap-4 auto-rows-min">
            
            {isSignedIn && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="sm:col-span-2 group overflow-hidden relative rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left transition hover:border-orange-500/50 shadow-md skeuo-panel">
                    <Swords className="absolute -right-6 -bottom-10 sm:right-[15%] sm:-top-10 h-48 w-48 rotate-[15deg] opacity-[0.03] text-foreground transition-all duration-300 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:opacity-[0.05] pointer-events-none" />

                    <div className="flex flex-col gap-1.5 relative z-10">
                       <div className="flex items-center gap-2.5">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-400">
                            <Swords className="h-5 w-5" />
                         </div>
                         <span className="rounded-full border border-orange-500/20 bg-orange-500/5 px-2.5 py-0.5 text-[11px] font-bold text-orange-400/90 tracking-wide">COMPETITIVE</span>
                       </div>
                       <div className="mt-1">
                         <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight font-display">Play Online</p>
                         <p className="text-sm text-muted-foreground mt-0.5 max-w-[320px]">Match instantly with players of your exact skill level.</p>
                       </div>
                    </div>
                    <div className="hidden sm:flex rounded-full p-4 text-black transition-all duration-300 group-hover:scale-110 bg-primary relative z-10 shadow-md">
                       <Play className="h-6 w-6 ml-0.5 fill-current" />
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl bg-background border-border shadow-2xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full w-full text-foreground transition-all duration-300 skeuo-panel">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-left text-3xl font-bold tracking-tight text-foreground font-display">Play Online</DialogTitle>
                    <p className="text-base font-medium text-muted-foreground text-left">Choose your time control.</p>
                  </DialogHeader>

                  <div className="flex flex-col gap-5 w-full mt-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bullet</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: '1 min', t: 1, inc: 0 },
                          { label: '1 + 1', t: 1, inc: 1 },
                          { label: '2 + 1', t: 2, inc: 1 },
                        ].map(({ label, t, inc }) => (
                          <button
                            key={label}
                            onClick={() => setSelectedOnlineTime({ t, inc })}
                            className={`py-3.5 px-3 rounded-xl border flex justify-center items-center transition-all duration-200 ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                          >
                            <span className="font-bold text-base">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Blitz</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: '3 min', t: 3, inc: 0 },
                          { label: '3 + 2', t: 3, inc: 2 },
                          { label: '5 min', t: 5, inc: 0 },
                          { label: '5 + 5', t: 5, inc: 5 },
                          { label: '5 + 2', t: 5, inc: 2 },
                        ].map(({ label, t, inc }) => (
                          <button
                            key={label}
                            onClick={() => setSelectedOnlineTime({ t, inc })}
                            className={`py-3.5 px-3 rounded-xl border flex justify-center items-center transition-all duration-200 ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                          >
                            <span className="font-bold text-base">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rapid</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: '10 min', t: 10, inc: 0 },
                          { label: '15 + 10', t: 15, inc: 10 },
                          { label: '30 min', t: 30, inc: 0 },
                          { label: '10 + 5', t: 10, inc: 5 },
                          { label: '20 min', t: 20, inc: 0 },
                          { label: '60 min', t: 60, inc: 0 },
                        ].map(({ label, t, inc }) => (
                          <button
                            key={label}
                            onClick={() => setSelectedOnlineTime({ t, inc })}
                            className={`py-3.5 px-3 rounded-xl border flex justify-center items-center transition-all duration-200 ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                          >
                            <span className="font-bold text-base">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedOnlineTime && (
                      <Link to={`/play?time=${selectedOnlineTime.t}&inc=${selectedOnlineTime.inc}`} className="w-full mt-4">
                        <button className="w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all duration-200 skeuo-btn-primary">
                          <Play className="w-5 h-5 fill-current" /> Start Match
                        </button>
                      </Link>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <button className="group flex flex-col justify-between rounded-2xl p-4 sm:p-5 text-left transition hover:-translate-y-1 relative overflow-hidden min-h-[8.5rem] sm:min-h-[9rem] skeuo-panel">
                  <div className="flex justify-start items-center gap-2.5 relative z-10 w-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                      <Brain className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground tracking-wide uppercase">PRACTICE</span>
                  </div>
                  <Brain className="absolute -right-4 -top-2 h-32 w-32 rotate-[15deg] opacity-[0.03] text-foreground transition-all duration-300 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:opacity-[0.05]" />

                  <div className="relative z-10">
                    <p className="text-2xl font-bold text-foreground font-display">Computer</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Adaptive AI sparring</p>
                  </div>
                  <ArrowRight className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 h-7 w-7 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-orange-400" />
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-xl bg-background border-border shadow-2xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto text-foreground w-full transition-all duration-300 skeuo-panel">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-left text-3xl font-bold tracking-tight text-foreground font-display">Match Config</DialogTitle>
                  <p className="text-base font-medium text-muted-foreground text-left">Set up your perfect local game.</p>
                </DialogHeader>

                <div className="flex flex-col gap-5 w-full mt-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time Control</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { t: 0, label: 'None', val: '∞' },
                        { t: 1, label: 'Bullet', val: '1m' },
                        { t: 3, label: 'Blitz', val: '3m' },
                        { t: 10, label: 'Rapid', val: '10m' },
                      ].map(({ t, label, val }) => (
                        <button
                          key={t}
                          onClick={() => setCompTime(t)}
                          className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 ${compTime === t ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                        >
                          <span className="text-lg font-black">{val}</span>
                          <span className="text-xs uppercase font-bold text-muted-foreground/60 tracking-wider font-mono">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Difficulty</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l: 1, name: 'Squire', elo: '800' },
                        { l: 4, name: 'Knight', elo: '1200' },
                        { l: 7, name: 'Warlord', elo: '1800' },
                        { l: 10, name: 'Grandmaster', elo: '2800' },
                      ].map(({ l, name, elo }) => (
                        <button
                          key={l}
                          onClick={() => setCompLevel(l)}
                          className={`py-3.5 px-5 rounded-xl border flex justify-between items-center transition-all duration-200 ${compLevel === l ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                        >
                          <span className="font-bold text-base">{name}</span>
                          <span className="text-sm text-muted-foreground/60 font-mono font-bold tracking-tighter">{elo}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link to={`/play?mode=computer&level=${compLevel}&time=${compTime}`} className="w-full mt-4">
                    <button className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 skeuo-btn-primary">
                      <Play className="w-5 h-5 fill-current" /> Start Match
                    </button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>

            <Link to="/puzzle" className="group flex flex-col justify-between rounded-2xl p-4 sm:p-5 text-left transition hover:-translate-y-1 relative overflow-hidden min-h-[8.5rem] sm:min-h-[9rem] skeuo-panel">
              <div className="flex justify-start items-center gap-2.5 relative z-10 w-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 tracking-wide uppercase">NEW DAILY</span>
              </div>
              <Crown className="absolute -right-6 -top-4 h-36 w-36 rotate-12 opacity-[0.03] text-foreground transition-all duration-300 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:opacity-[0.05]" />

              <div className="relative z-10">
                <p className="text-2xl font-bold text-foreground font-display">Daily Puzzle</p>
                <p className="text-sm text-muted-foreground mt-0.5">Sharpen tactics in 5 mins</p>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 h-7 w-7 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-orange-400" />
            </Link>

            <div className="sm:col-span-2 rounded-2xl skeuo-panel overflow-hidden flex flex-col">
               <div className="border-b border-white/5 bg-background/50 px-5 py-2.5 flex justify-between items-center">
                   <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Events</h2>
                   <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                     <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[11px] font-bold text-emerald-400 uppercase">Live</span>
                   </div>
               </div>
               <div className="p-2 sm:p-2.5 grid gap-1.5">
                  <div className="flex items-center justify-between rounded-xl bg-background/40 hover:bg-background/80 transition px-3.5 py-2 border border-transparent hover:border-border cursor-pointer">
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-foreground">Night Blitz Arena</p>
                      <p className="text-[11px] text-muted-foreground/80">1,248 players entered</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-orange-400 font-mono">09:14</p>
                       <p className="text-[10px] uppercase font-bold text-muted-foreground">Starting In</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-background/40 hover:bg-background/80 transition px-3.5 py-2 border border-transparent hover:border-border cursor-pointer">
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-foreground">Orange Rapid Cup</p>
                      <p className="text-[11px] text-muted-foreground/80">736 players registered</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-orange-400 font-mono">41:03</p>
                       <p className="text-[10px] uppercase font-bold text-muted-foreground">Starting In</p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
