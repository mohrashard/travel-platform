import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col pt-16">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2800&q=80')" }}
        />

        {/* Gradient Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
          <span className="inline-block py-1 px-3 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium tracking-wide">
            Your Journey Starts Here
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg leading-tight">
            Discover Unique <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Local Experiences</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light drop-shadow-md">
            Connect with passionate locals and explore destinations through authentic, unforgettable journeys curated just for you. Escape the ordinary.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/feed"
              className="px-8 py-4 text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform hover:-translate-y-1"
            >
              Explore Experiences
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 text-lg font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
