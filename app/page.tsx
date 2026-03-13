import Link from 'next/link';
import { Gamepad2, Medal, UserCog } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-200">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900 rounded-full blur-[140px] opacity-40 mix-blend-screen pointer-events-none" />

      <div className="z-10 text-center max-w-4xl px-4 space-y-12">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium text-emerald-400 mb-6 backdrop-blur-sm">
            <Gamepad2 size={16} />
            Serious Game Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Rugby Manager <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pro</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Take control of your rugby team in an immersive 6-round simulation. Make strategic decisions, buy players, build your fanbase, and secure the championship.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12 w-full">
          {/* Player Login Card */}
          <Link href="/dashboard/player" className="group">
            <div className="h-full flex flex-col items-center p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-emerald-500/20 rounded-2xl mb-6 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all">
                <Medal size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Player Portal</h2>
              <p className="text-slate-400 text-sm text-center">Join your team, manage your roster, and submit your round decisions.</p>
            </div>
          </Link>

          {/* Admin Login Card */}
          <Link href="/dashboard/admin" className="group">
            <div className="h-full flex flex-col items-center p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-cyan-500/20 rounded-2xl mb-6 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all">
                <UserCog size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Game Master</h2>
              <p className="text-slate-400 text-sm text-center">Create games, assign teams, and control the simulation progression.</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
