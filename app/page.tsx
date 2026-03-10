import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-50 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Glow Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[100px]" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 lg:pt-40 flex flex-col items-center">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer group">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse" />
          <span className="text-sm font-medium tracking-wide text-neutral-300 group-hover:text-white transition-colors">Platform v3.0 Early Access</span>
          <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter leading-[1.1] mb-8">
          Redefining Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400">
            Global Horizons
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg md:text-xl text-neutral-400 text-center mb-12 font-light leading-relaxed">
          Embark on hyper-personalized journeys powered by next-generation curation. Immerse yourself in authentic local experiences across the globe, designed for the modern explorer.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center justify-center">
          <Link
            href="/feed"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            <span className="relative z-10 font-semibold tracking-wide">Start Exploring</span>
          </Link>
        </div>

        {/* Bento Box Features / Preview */}
        <div className="w-full mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group relative rounded-3xl bg-white/[0.03] border border-white/[0.05] p-8 overflow-hidden backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-wide">Hyper-Local Curation</h3>
            <p className="text-neutral-400 font-light text-sm leading-relaxed">
              AI-driven matching connects you instantly with the most avant-garde venues and hidden local secrets.
            </p>
          </div>

          {/* Feature 2 (Spans 2 columns) */}
          <div className="group relative rounded-3xl bg-white/[0.03] border border-white/[0.05] p-6 lg:p-10 overflow-hidden backdrop-blur-sm md:col-span-2 transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(217,70,239,0.15)] flex flex-col justify-end min-h-[320px]">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-40 mix-blend-overlay grayscale group-hover:grayscale-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=2000&q=80')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mb-5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Live Experience</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Tokyo Neon Nights</h3>
              <p className="text-neutral-300 font-light max-w-lg mb-6 text-lg">
                Navigate the cyber-punk alleys of Shinjuku with a local digital artist.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#030712] bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-${90 - i * 20}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-400 tracking-wide">+1.2k exploring now</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
