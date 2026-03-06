import { Link } from "react-router-dom";

export function Landing() {
    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background ambient glows */}
            <div className="glow-bg bg-emerald-500 w-[500px] h-[500px] top-[-20%] left-[-10%] mix-blend-screen"></div>
            <div className="glow-bg bg-blue-500 w-[600px] h-[600px] bottom-[-20%] right-[-10%] mix-blend-screen"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                {/* Hero Title */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 mt-12">
                    <span className="text-gradient">Know your </span>
                    <span className="text-gradient-emerald">true wealth</span>
                    <br className="hidden md:block" />
                    <span className="text-gradient"> at a glance.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
                    Get your net worth in under 5 minutes. Track your assets, liabilities, and path to FIRE. Built for how you actually invest.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Link
                        to="/register"
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-950 font-semibold text-lg hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                        Start free
                    </Link>
                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-8 py-4 rounded-full glass text-white font-semibold text-lg hover:bg-slate-800/50 transition-colors"
                    >
                        Log in to Dashboard
                    </Link>
                </div>

                {/* Feature Highlights */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-4xl">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-white font-semibold mb-2">Sign up in 10 seconds</h3>
                        <p className="text-slate-400 text-sm">Minimal friction. No complex setups. Get inside instantly.</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-white font-semibold mb-2">Add your assets</h3>
                        <p className="text-slate-400 text-sm">Track stocks, mutual funds, real estate, and PF easily.</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-white font-semibold mb-2">See your picture</h3>
                        <p className="text-slate-400 text-sm">A holistic view of your net worth and FIRE target.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
