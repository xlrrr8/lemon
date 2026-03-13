import { Link } from 'react-router-dom';
import { Swords, Brain, Crown, ArrowRight, Timer, Users, Trophy, Flame, Play, Zap, Clock, Target } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const KnightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}><path d="M96 464v16c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32v-16c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32zm85.8-93.5c15.7 3.2 31.8 4.6 48 4.6l-50.5-86.8c-10.3-17.7-18-36.9-22.9-56.9L129.5 258c-.6 42.1 6.5 83.5 20.6 122.9 8.2 23 23.3 43.1 43.8 56.6C213 450.4 233 448 248.5 448h18.3l-85-77.5zm19.5-224.9c-8.9 9.3-19.1 17.5-30.2 24.3l85.2 81.6 37.1 63.8c7.3 12.6 19.3 22 33.3 26.2V416h32V240.2c0-8.1-1.3-16.1-3.7-23.7l-47.3-149C304.5 24.6 261.3 0 215.1 0 172.9 0 133.4 20.3 107.5 54.3L36 145.4C14.1 173.3 17 213.9 42.5 238.6c13.7 13.3 32.5 20.6 52.3 20.6 30 0 57.2-18 69.8-46.1l17.7-39.7z" /></svg>
);

const PawnIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" {...props}><path d="M215.5 224c29.2-18.4 48.5-50.9 48.5-88 0-57.4-46.6-104-104-104S56 78.6 56 136c0 37.1 19.4 69.6 48.5 88H96c-17.7 0-32 14.3-32 32v16c0 17.7 14.3 32 32 32h128c17.7 0 32-14.3 32-32v-16c0-17.7-14.3-32-32-32h-8.5zM32 464v16c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32v-16c0-17.7-14.3-32-32-32H64c-17.7 0-32 14.3-32 32zm70.8-96h114.4c21.8 0 40-16.3 43.1-37.9L283 189.2c1.7-11.7-7-21.2-18.7-21.2H55.7c-11.7 0-20.4 9.5-18.7 21.2l22.7 140.9c3 21.6 21.3 37.9 43.1 37.9z" /></svg>
);

const RookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}><path d="M432 32h-64V0h-32v32H112V0H80v32H16c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h11.2l39 240H56c-13.3 0-24 10.7-24 24v32c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-32c0-13.3-10.7-24-24-24h-30.2l39-240H432c8.8 0 16-7.2 16-16V48c0-8.8-7.2-16-16-16zM64 432v-16h320v16H64z" /></svg>
);

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

        {/* Subtle Matte Checkered Board */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)`,
            backgroundSize: `80px 80px`,
            backgroundPosition: `0 0, 0 40px, 40px -40px, -40px 0px`
          }}
        ></div>

        {/* Scattered Dark Matte Chess Pieces */}
        <KnightIcon className="absolute left-[-2%] top-[5%] w-[40vh] h-[40vh] opacity-15 -rotate-[15deg] blur-[2px] text-muted-foreground/30" />
        <RookIcon className="absolute right-[-5%] top-[50%] w-[45vh] h-[45vh] opacity-20 rotate-[10deg] blur-[3px] text-muted-foreground/20" />
        <PawnIcon className="absolute left-[70%] top-[10%] w-[25vh] h-[25vh] opacity-10 rotate-[-25deg] blur-[1.5px] text-orange-950/40" />
        <KnightIcon className="absolute left-[20%] bottom-[-10%] w-[50vh] h-[50vh] opacity-10 rotate-[35deg] blur-[4px] text-muted-foreground/30" />

        {/* Cinematic Orange Shades & Glows (Matte Feel) */}
        <div className="absolute left-1/3 top-[20%] h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/15 blur-[120px]"></div>
        <div className="absolute right-[10%] bottom-[10%] h-[30rem] w-[30rem] rounded-full bg-orange-700/15 blur-[100px]"></div>
        <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,121,24,0.15),_rgba(255,121,24,0)_70%)]"></div>
        <div className="absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(180deg,rgba(0,0,0,0),hsl(var(--background))_55%,hsl(var(--background))_100%)] transition-colors duration-300"></div>

        {/* Matte Noise Overlay (smooths the contrast) */}
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px] transition-colors duration-300"></div>
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 pb-16 pt-7 sm:px-10 lg:gap-20 lg:px-12">
        <header className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/15 text-orange-300">
              <Crown className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">Orange.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <button
              onClick={() => setIsSignedIn(!isSignedIn)}
              className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground transition hover:border-orange-400/40 hover:text-orange-200"
            >
              {isSignedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </header>

        <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center pt-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
            <Flame className="h-3.5 w-3.5" />
            The New Standard Of Chess
          </p>
          <h1 className="text-6xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Play beautiful <span className="text-orange-400">chess.</span>
          </h1>
          <p className="max-w-4xl text-xl text-muted-foreground sm:text-2xl">
            Orange is built for pure competition: clean visuals, precise clocks, intelligent matchmaking, and a board that keeps your focus on the next move.
          </p>

          <div className={`grid w-full gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3`}>
            {isSignedIn && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="group rounded-2xl border border-border/80 bg-card/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-400/45 hover:bg-card">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                        <Swords className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground/80">Ranked</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">Play Online</p>
                    <div className="mt-2 flex items-center justify-between text-base text-muted-foreground">
                      <span>Bullet, Blitz, Rapid</span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-orange-300" />
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md bg-background border-border shadow-2xl rounded-3xl p-8 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full w-full text-foreground">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-left text-2xl font-bold tracking-tight text-foreground">Play Online</DialogTitle>
                    <p className="text-sm font-medium text-muted-foreground text-left">Choose your time control.</p>
                  </DialogHeader>

                  <div className="flex flex-col gap-8 w-full mt-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Bullet</h4>
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
                            className={`py-3 px-1 rounded-xl border flex justify-center items-center transition-all ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted/80'}`}
                          >
                            <span className="font-semibold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Blitz</h4>
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
                            className={`py-3 px-1 rounded-xl border flex justify-center items-center transition-all ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted/80'}`}
                          >
                            <span className="font-semibold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Rapid</h4>
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
                            className={`py-3 px-1 rounded-xl border flex justify-center items-center transition-all ${selectedOnlineTime?.t === t && selectedOnlineTime?.inc === inc ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted/80'}`}
                          >
                            <span className="font-semibold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedOnlineTime && (
                      <Link to={`/play?time=${selectedOnlineTime.t}&inc=${selectedOnlineTime.inc}`} className="w-full mt-4">
                        <button className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
                          <Play className="w-4 h-4" /> Start Match
                        </button>
                      </Link>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <button className="group rounded-2xl border border-border/80 bg-card/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-400/45 hover:bg-card">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                      <Brain className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground/80">Training</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">Play Computer</p>
                  <div className="mt-2 flex items-center justify-between text-base text-muted-foreground">
                    <span>Adaptive AI sparring</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-orange-300" />
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md bg-background border-border shadow-2xl rounded-3xl p-8 max-h-[85vh] overflow-y-auto text-foreground w-full">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-left text-2xl font-bold tracking-tight text-foreground">Match Config</DialogTitle>
                  <p className="text-sm font-medium text-muted-foreground text-left">Set up your perfect local game.</p>
                </DialogHeader>

                <div className="flex flex-col gap-8 w-full mt-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Time Control</h4>
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
                          className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${compTime === t ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted/80'}`}
                        >
                          <span className="text-sm font-bold">{val}</span>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground/80">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI Difficulty</h4>
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
                          className={`py-3 px-4 rounded-xl border flex justify-between items-center transition-all ${compLevel === l ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-border bg-card/50 text-foreground/80 hover:bg-muted/80'}`}
                        >
                          <span className="font-semibold text-sm">{name}</span>
                          <span className="text-xs text-muted-foreground font-medium">{elo}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link to={`/play?mode=computer&level=${compLevel}&time=${compTime}`} className="w-full mt-4">
                    <button className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
                      <Play className="w-4 h-4" /> Start Match
                    </button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>

            <Link to="/puzzle">
              <button className="group w-full h-full rounded-2xl border border-border/80 bg-card/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-400/45 hover:bg-card">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                    <Crown className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground/80">Daily</span>
                </div>
                <p className="text-2xl font-bold text-foreground">Daily Puzzle</p>
                <div className="mt-2 flex items-center justify-between text-base text-muted-foreground">
                  <span>Sharpen tactics in 5 mins</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-orange-300" />
                </div>
              </button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-border/70 bg-card/45 p-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Players online</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">18,402</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Games today</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">231,908</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Avg queue</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">3.8s</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border/70 bg-card/55 p-6 transform transition hover:-translate-y-1">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-300">
              <Timer className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Focus-first board</h2>
            <p className="mt-3 text-muted-foreground">Minimal UI, clear move highlights, and distraction-free clocks built for deep calculation.</p>
          </article>
          <article className="rounded-3xl border border-border/70 bg-card/55 p-6 transform transition hover:-translate-y-1">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-300">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Fair matchmaking</h2>
            <p className="mt-3 text-muted-foreground">Smart pairing by strength and form so each game feels competitive from move one.</p>
          </article>
          <article className="rounded-3xl border border-border/70 bg-card/55 p-6 transform transition hover:-translate-y-1">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-300">
              <Trophy className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Season ladders</h2>
            <p className="mt-3 text-muted-foreground">Climb monthly ladders, earn titles, and unlock signature board themes as you rank up.</p>
          </article>
        </section>

        <section className="grid items-stretch gap-4">
          <article className="rounded-3xl border border-border/70 bg-card/55 p-6 md:w-2/3 md:mx-auto lg:w-1/2">
            <h2 className="text-2xl font-semibold text-foreground">Live events</h2>
            <p className="mt-2 text-muted-foreground">Jump into active arenas and weekend tournaments.</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Night Blitz Arena</p>
                  <p className="text-sm text-muted-foreground/80">1,248 players</p>
                </div>
                <p className="text-sm font-medium text-orange-400">Starts in 09:14</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Orange Rapid Cup</p>
                  <p className="text-sm text-muted-foreground/80">736 players</p>
                </div>
                <p className="text-sm font-medium text-orange-400">Starts in 41:03</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-4">
                <div>
                  <p className="font-medium text-foreground">Weekend Championship</p>
                  <p className="text-sm text-muted-foreground/80">Open registration</p>
                </div>
                <p className="text-sm font-medium text-emerald-400">Tomorrow, 7:00 PM</p>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Index;
