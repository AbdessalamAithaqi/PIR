export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Game Master Controls</h1>
                    <p className="text-slate-400">Game Instance: #A8F92K (Rugby 2026 Cohort)</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner text-center">
                        <span className="text-slate-500 text-xs block uppercase tracking-wider font-semibold">Active Round</span>
                        <span className="text-cyan-400 font-mono font-bold text-lg">1 / 6</span>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {/* Teams Overview */}
                <div className="md:col-span-3 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h2 className="text-xl font-semibold">League Table & Status</h2>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950/50 text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Team Name</th>
                                        <th className="px-6 py-4 font-semibold">Decisions</th>
                                        <th className="px-6 py-4 font-semibold text-right">Points</th>
                                        <th className="px-6 py-4 font-semibold text-right">Money</th>
                                        <th className="px-6 py-4 font-semibold text-right">Fans</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'].map((team, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                {team}
                                            </td>
                                            <td className="px-6 py-4">
                                                {idx % 2 === 0 ?
                                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-semibold">Submitted</span> :
                                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-xs font-semibold">Pending</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-300">0</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-400">1,000,000</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-400">5,000</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 relative">
                                <span className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-50"></span>
                            </span>
                            Round Progression
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">Simulation can only run once all teams have locked their decisions, or if you force advance.</p>

                        <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/50 transition-all hover:scale-[1.02] mb-3">
                            Simulate Round
                        </button>
                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors border border-slate-700">
                            Force End Round
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold text-slate-200 mb-4">Initial Parameters</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Starting Money</span>
                                <span className="font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">1,000,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Starting Fans</span>
                                <span className="font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">5,000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
