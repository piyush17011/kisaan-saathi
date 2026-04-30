import { useNavigate } from "react-router-dom"
 
export default function FeaturesSection() {
 const navigate = useNavigate()
  const features = [
    {
      icon: '🌦️',
      title: 'Smart Weather Monitoring',
      description:
        'Get real-time weather updates with farming-focused recommendations and alerts.',
    },
    {
      icon: '🤖',
      title: 'AI Farming Assistant',
      description:
        'Ask farming questions and receive AI-powered guidance instantly.',
    },
    // {
    //   icon: '🌱',
    //   title: 'Crop Health Analysis',
    //   description:
    //     'Analyze soil conditions and crop requirements for better productivity.',
    // },
    // {
    //   icon: '💧',
    //   title: 'Smart Irrigation',
    //   description:
    //     'Get irrigation suggestions based on weather and soil conditions.',
    // },
    {
      icon: '💰',
      title: 'Market Price Tracking',
      description:
        'Track live crop market prices and make smarter selling decisions.',
    },
    // {
    //   icon: '📈',
    //   title: 'Yield Optimization',
    //   description:
    //     'Receive AI recommendations to maximize crop yield and efficiency.',
    // },
  ]

  return (
    <section className="bg-[#f5f1e8] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <p className="font-bold uppercase tracking-[0.3em] text-[#4caf50]">
            Smart Agriculture
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#2f3e2c] md:text-5xl">
            Everything Farmers Need
            <span className="block text-[#4caf50]">In One Platform</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[#5f6f52]">
            Kisaan Saathi combines artificial intelligence, weather analytics,
            crop recommendations, and farming insights into one modern
            agriculture platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-[#d8e3cf] bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5e9] text-3xl transition group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-2xl font-black text-[#2f3e2c]">
                {feature.title}
              </h3>

              <p className="mt-4 leading-relaxed text-[#5f6f52]">
                {feature.description}
              </p>

              <button className="mt-6 font-bold text-[#4caf50] transition hover:translate-x-2"  onClick={() => navigate("/signup")}>
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
