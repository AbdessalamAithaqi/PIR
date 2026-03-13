export default function PlayerDashboard() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Team Dashboard</h1>
                    <p className="text-slate-400">Round 1: Strategy Phase</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="text-slate-500 text-xs block uppercase tracking-wider font-semibold">Budget</span>
                        <span className="text-emerald-400 font-mono font-bold text-lg">€ 1,000,000</span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="text-slate-500 text-xs block uppercase tracking-wider font-semibold">Fans</span>
                        <span className="text-cyan-400 font-mono font-bold text-lg">5,000</span>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Left Column: Decisions */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">1</span>
                            Player Recruitment
                        </h2>
                        <p className="text-slate-400 mb-6 leading-relaxed">Review the current market and place your bids. The team with the highest bid at the end of the round wins the player.</p>

                        {/* Mock Player Selection */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-100">Antoine Dupont</h3>
                                            <p className="text-xs text-slate-400">Scrum-half</p>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs font-bold">Rating: 92</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2 items-center">
                                        <span className="text-sm font-mono text-slate-300">Bid:</span>
                                        <input type="number" placeholder="Enter €" className="bg-slate-900 flex-1 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">2</span>
                            Marketing Investment
                        </h2>
                        <div className="flex gap-6 items-center">
                            <div className="flex-1">
                                <p className="text-slate-400 leading-relaxed text-sm mb-4">Invest in marketing to increase the probability of acquiring new fans this cycle. Higher fans mean higher baseline income next round.</p>
                                <input type="range" className="w-full accent-emerald-500" />
                                <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
                                    <span>€0</span>
                                    <span>€200,000</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Status */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-900/50 p-6 rounded-2xl">
                        <h3 className="text-emerald-400 font-bold mb-2">Round Status</h3>
                        <p className="text-sm text-slate-300 mb-6">Open for submissions. Waiting for all teams to lock decisions.</p>
                        <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all hover:scale-[1.02]">
                            Submit Decisions
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="font-bold mb-4 text-slate-200">Current Roster</h3>
                        <ul className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <li key={i} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-800 transition-colors">
                                    <div>
                                        <span className="text-emerald-400 w-6 inline-block">1{i}</span>
                                        <span className="text-slate-300">Basic Defending Core</span>
                                    </div>
                                    <span className="text-slate-500 text-xs">Rating: 75</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
