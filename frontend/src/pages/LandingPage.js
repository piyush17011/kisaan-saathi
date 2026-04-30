import FeaturesSection from "../components/FeaturesSection"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f5f1e8] text-[#2f3e2c]">

      {/* HERO */}
      <section className="relative min-h-screen w-full overflow-hidden">

        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/farm.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* NAV */}
        <nav className="relative z-20 flex items-center justify-between px-5 py-5 md:px-12 md:py-6">
          <div onClick={() => navigate("/")} className="flex items-end gap-2 cursor-pointer">
            <p className="font-condiment text-[#9be15d] text-4xl md:text-5xl leading-none">Kisaan</p>
            <h1 className="font-['Anton'] uppercase tracking-[0.2em] text-white text-xl md:text-2xl leading-none mb-1">SAATHI</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate("/login")}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[#9be15d] px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-black text-[#16210f] transition hover:brightness-110 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex min-h-[82vh] flex-col items-center justify-center px-5 text-center pb-12">
          <div className="max-w-4xl">

            <span className="mb-6 inline-block rounded-full border border-[#9be15d]/40 bg-[#9be15d]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#dfffc2] backdrop-blur-sm md:px-6 md:py-3 md:text-sm">
              AI Powered Smart Farming
            </span>

            <h1 className="mt-4 text-4xl font-black leading-[0.95] text-white md:text-6xl lg:text-7xl">
              Empowering Farmers
              <span className="block mt-1">With</span>
              <span className="block text-[#9be15d] mt-1">AI Intelligence</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-xl">
              Real-time weather insights, smart fertilizer recommendations,
              crop guidance, and market prices — all in one platform.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto rounded-2xl bg-[#9be15d] px-8 py-4 text-base font-black text-[#16210f] shadow-lg transition hover:brightness-110 active:scale-95 md:px-10 md:py-5 md:text-lg"
              >
                🌾 Start Analysis
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full sm:w-auto rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95 md:px-10 md:py-5 md:text-lg"
              >
                🤖 Talk To Farm AI
              </button>
            </div>

          </div>
        </div>

      </section>

      <FeaturesSection />

    </div>
  )
}