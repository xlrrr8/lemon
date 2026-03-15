import { Link } from 'react-router-dom';
import { Swords, Brain, Crown, ArrowRight, Timer, User, Users, Trophy, Flame, Play, Zap, Clock, Target } from 'lucide-react';
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
  const [customTime, setCustomTime] = useState(0);
  const [customInc, setCustomInc] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
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



        {/* Cinematic Orange Shades & Glows (Matte Feel) */}
        <div className="absolute left-1/3 top-[20%] h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/15 blur-[120px]"></div>
        <div className="absolute right-[10%] bottom-[10%] h-[30rem] w-[30rem] rounded-full bg-orange-700/15 blur-[100px]"></div>
        <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,121,24,0.15),_rgba(255,121,24,0)_70%)]"></div>
        <div className="absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(180deg,rgba(0,0,0,0),hsl(var(--background))_55%,hsl(var(--background))_100%)] transition-colors duration-300"></div>

        {/* Matte Noise Overlay (smooths the contrast) */}
        <div className="absolute inset-0 bg-background/30 transition-colors duration-300"></div>
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/15 text-orange-300">
              <Crown className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">Orange.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {isSignedIn && (
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-full border border-border bg-card/40 pl-1.5 pr-4 py-1.5 text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-card/60 group"
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"></div>
                </div>
                <span className="tracking-tight">Aaryan K.</span>
              </Link>
            )}
            <button
              onClick={() => setIsSignedIn(!isSignedIn)}
              className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground transition hover:border-orange-400/40 hover:text-orange-200"
            >
              {isSignedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mt-6 lg:mt-12 items-start relative z-10">
          
          {/* Left Column - Hero Content & Stats */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="flex flex-col items-start gap-6 text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                <Flame className="h-3.5 w-3.5" />
                The New Standard Of Chess
              </p>
              <h1 className="text-6xl font-bold leading-[0.9] tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem]">
                Play beautiful <br/><span className="text-orange-400">chess.</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-[420px] leading-relaxed">
                Orange is built for pure competition: clean visuals, precise clocks, intelligent matchmaking, and a board that keeps your focus on the next move.
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-6 pt-6 border-t border-border/50">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Online</span>
                <span className="text-3xl font-bold text-foreground">18.4K</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Today</span>
                <span className="text-3xl font-bold text-foreground">231K</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Queue</span>
                <span className="text-3xl font-bold text-foreground">3.8s</span>
              </div>
            </div>
          </div>

          {/* Right Column - Bento Actions */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
            
            {isSignedIn && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="sm:col-span-2 group overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card/80 to-background/50 p-6 sm:p-8 flex items-center justify-between text-left transition hover:border-orange-500/50 shadow-sm shadow-black/20">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                         <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-400">
                            <Swords className="h-6 w-6" />
                         </div>
                         <span className="rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1 text-xs font-bold text-orange-400/90 tracking-wide">COMPETITIVE</span>
                       </div>
                       <div className="mt-4">
                         <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Play Online</p>
                         <p className="text-base text-muted-foreground mt-1">Match instantly with players of your exact skill level.</p>
                       </div>
                    </div>
                    <div className="hidden sm:flex rounded-full bg-orange-500/10 p-5 text-orange-400 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-black group-hover:scale-110">
                       <Play className="h-8 w-8 ml-1" />
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl bg-background border-border shadow-2xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full w-full text-foreground transition-all duration-300">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-left text-2xl font-bold tracking-tight text-foreground">Play Online</DialogTitle>
                    <p className="text-sm font-medium text-muted-foreground text-left">Choose your time control.</p>
                  </DialogHeader>

                  <div className="flex flex-col gap-5 w-full mt-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Bullet</h4>
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
                            className={`py-3 px-2 rounded-xl border flex justify-center items-center transition-all duration-200 ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                          >
                            <span className="font-bold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Blitz</h4>
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
                            className={`py-3 px-2 rounded-xl border flex justify-center items-center transition-all duration-200 ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                          >
                            <span className="font-bold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Rapid</h4>
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
                            className={`py-3 px-2 rounded-xl border flex justify-center items-center transition-all duration-200 ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                          >
                            <span className="font-bold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedOnlineTime && (
                      <Link to={`/play?time=${selectedOnlineTime.t}&inc=${selectedOnlineTime.inc}`} className="w-full mt-4">
                        <button className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-bold text-base flex items-center justify-center gap-3 hover:bg-orange-600 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-orange-500/20">
                          <Play className="w-4 h-4 fill-current" /> Start Match
                        </button>
                      </Link>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <button className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-orange-400/45 hover:bg-card relative overflow-hidden min-h-[16rem]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300 relative z-10">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-2xl font-bold text-foreground">Computer</p>
                    <p className="text-sm text-muted-foreground mt-1">Adaptive AI sparring</p>
                  </div>
                  <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-orange-400" />
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-xl bg-background border-border shadow-2xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto text-foreground w-full transition-all duration-300">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-left text-2xl font-bold tracking-tight text-foreground">Match Config</DialogTitle>
                  <p className="text-sm font-medium text-muted-foreground text-left">Set up your perfect local game.</p>
                </DialogHeader>

                <div className="flex flex-col gap-5 w-full mt-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Time Control</h4>
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
                          className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 ${compTime === t ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                        >
                          <span className="text-base font-black">{val}</span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider font-mono">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">AI Difficulty</h4>
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
                          className={`py-3 px-5 rounded-xl border flex justify-between items-center transition-all duration-200 ${compLevel === l ? 'border-orange-500/50 bg-orange-500/10 text-orange-400 ring-2 ring-orange-500/20' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted font-medium'}`}
                        >
                          <span className="font-bold text-sm">{name}</span>
                          <span className="text-[13px] text-muted-foreground/60 font-mono font-bold tracking-tighter">{elo}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link to={`/play?mode=computer&level=${compLevel}&time=${compTime}`} className="w-full mt-4">
                    <button className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-bold text-base flex items-center justify-center gap-3 hover:bg-orange-600 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-orange-500/20">
                      <Play className="w-4 h-4 fill-current" /> Start Match
                    </button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>

            <Link to="/puzzle" className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card/60 p-6 text-left transition hover:-translate-y-1 hover:border-orange-400/45 hover:bg-card relative overflow-hidden min-h-[16rem]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300 relative z-10">
                <Crown className="h-5 w-5" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold text-foreground">Daily Puzzle</p>
                <p className="text-sm text-muted-foreground mt-1">Sharpen tactics in 5 mins</p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-orange-400" />
            </Link>

            <div className="sm:col-span-2 rounded-3xl border border-border/70 bg-card/45 overflow-hidden flex flex-col">
               <div className="border-b border-border/60 bg-background/50 px-6 py-4 flex justify-between items-center">
                   <h2 className="text-sm font-bold text-foreground uppercase tracking-widest text-muted-foreground">Live Events</h2>
                   <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                     <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-bold text-emerald-400 uppercase">Live</span>
                   </div>
               </div>
               <div className="p-3 grid gap-2">
                  <div className="flex items-center justify-between rounded-2xl bg-background/40 hover:bg-background/80 transition p-4 border border-transparent hover:border-border cursor-pointer">
                    <div>
                      <p className="font-semibold text-foreground">Night Blitz Arena</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">1,248 players entered</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-orange-400">09:14</p>
                       <p className="text-[10px] uppercase font-bold text-muted-foreground">Starting In</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-background/40 hover:bg-background/80 transition p-4 border border-transparent hover:border-border cursor-pointer">
                    <div>
                      <p className="font-semibold text-foreground">Orange Rapid Cup</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">736 players registered</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-orange-400">41:03</p>
                       <p className="text-[10px] uppercase font-bold text-muted-foreground">Starting In</p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-3 mt-8 pt-10 border-t border-border/50 relative z-10">
          <article className="rounded-3xl p-6 bg-transparent">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-300">
              <Timer className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Focus-first board</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Minimal UI, clear move highlights, and distraction-free clocks built for deep calculation.</p>
          </article>
          <article className="rounded-3xl p-6 bg-transparent">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-300">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Fair matchmaking</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Smart pairing by strength and form so each game feels competitive from move one.</p>
          </article>
          <article className="rounded-3xl p-6 bg-transparent">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-300">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Season ladders</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Climb monthly ladders, earn titles, and unlock signature board themes as you rank up.</p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Index;
