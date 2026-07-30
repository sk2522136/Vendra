import React from 'react';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: 'Starter (Free)',
      price: '$0',
      period: '7 DAY FREE TRIAL',
      desc: 'Perfect for local small retail stores starting up.',
      features: [    
          'Unlimited Stores/Tenants',
          'Unlimited Products',
          'Real-time Stock & Analytics',
          'Full Feature Access for 7 Days'],
      buttonText: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Growth (Pro)',
      price: '$29',
      period: 'per month',
      desc: 'Ideal for expanding businesses needing full control.',
      features: [
         'Unlimited Stores/Tenants',
          'Unlimited Products & Assets',
          'Real-time Stock & Live Analytics',
          'Automated Secure Backups',
          '24/7 Priority Support'
      ],
      buttonText: 'Get Start PRO',
      popular: true,
    },
  ];

  const handleredirect = () =>{
    navigate('/signup')

  }

  return (
    <div className="min-h-screen bg-bg-body text-text font-mona selection:bg-bg-primary selection:text-white">
      
      <nav className="sticky top-0 z-50 bg-bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <div className="w-9 h-9 rounded-xl bg-bg-primary flex items-center justify-center text-white font-black text-xl shadow-md shadow-bg-primary/20">
              V
            </div>
            <span className="text-xl font-bold text-text">endra</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-text/80">
            <a href="#" className="hover:text-bg-primary transition-colors">Home</a>
            <a href="#features" className="hover:text-bg-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-bg-primary transition-colors">Pricing</a>
            <a href="#about" className="hover:text-bg-primary transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-semibold text-text/80 hover:text-bg-primary transition-colors">
              Sign In
            </a>
            <a 
              href="/Signup" 
              className="px-4 py-2 text-sm font-semibold text-white bg-bg-primary hover:bg-bg-secondary rounded-xl shadow-md transition-all active:scale-95"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-b from-border/30 via-bg-card to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-border text-bg-primary mb-6">
            ✨ Smart Retail Made Simple
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text max-w-4xl mx-auto leading-tight">
            Your Complete <span className="text-bg-primary">Retail Operating System</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            The all-in-one solution trusted by 5,000+ stores worldwide. Inventory management, payments, analytics, and AI-powered support—all in one platform.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a 
              href="/Signup" 
              className="px-8 py-4 text-base font-semibold text-white bg-bg-primary hover:bg-bg-secondary rounded-xl shadow-lg shadow-bg-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Free Trial Now
              <FaArrowRight size={14} />
            </a>
            <a 
              href="#pricing" 
              className="px-8 py-4 text-base font-semibold text-text bg-bg-card hover:bg-hover rounded-xl border border-border shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Everything Modern Retailers Need
            </h2>
            <p className="mt-4 text-muted">
              From small shops to enterprise chains, Vendra handles it all with precision and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-bg-body border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-border text-bg-primary flex items-center justify-center font-bold text-xl mb-6">🏢</div>
              <h3 className="text-xl font-bold text-text mb-2">Secure Multi-Tenancy</h3>
              <p className="text-muted text-sm leading-relaxed">
                Logically separated database partitions with custom encryption ensure tenant stores stay fully secure and fully private.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-bg-body border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-border text-bg-primary flex items-center justify-center font-bold text-xl mb-6">⚡</div>
              <h3 className="text-xl font-bold text-text mb-2">Live Sync POS</h3>
              <p className="text-muted text-sm leading-relaxed">
                Integrated reactive WebSockets update stock levels across global nodes instantly upon checkout without latency.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-bg-body border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-border text-bg-primary flex items-center justify-center font-bold text-xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold text-text mb-2">Automated Fail-safes</h3>
              <p className="text-muted text-sm leading-relaxed">
                Scheduled cron operations create encrypted transactional point-in-time state records to prevent zero data loss.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-bg-body border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-border text-bg-primary flex items-center justify-center font-bold text-xl mb-6">🎤</div>
              <h3 className="text-xl font-bold text-text mb-2">Voice Commands</h3>
              <p className="text-muted text-sm leading-relaxed">
                Hands-free operations with voice recognition. Add items, checkout, and manage inventory without touching a button.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-bg-body border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-border text-bg-primary flex items-center justify-center font-bold text-xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-text mb-2">Real-time Analytics</h3>
              <p className="text-muted text-sm leading-relaxed">
                AI-powered insights into sales trends, customer behavior, and inventory optimization in real-time dashboards.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-bg-body border border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-border text-bg-primary flex items-center justify-center font-bold text-xl mb-6">🤖</div>
              <h3 className="text-xl font-bold text-text mb-2">AI Chat Assistant</h3>
              <p className="text-muted text-sm leading-relaxed">
                Smart AI assistant answers customer questions, handles order inquiries, and provides instant support 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-bg-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Transparent, Flexible Plans
            </h2>
            <p className="mt-4 text-muted">
              Deploy Vendra locally or connect full organization chains using modular Stripe subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-3xl bg-bg-card flex flex-col justify-between transition-all duration-300 border ${
                  plan.popular 
                    ? 'shadow-xl bg-gradient-to-b from-bg-card to-border/10 border-bg-primary/50' 
                    : 'border-border shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-bg-primary text-white tracking-wide uppercase">
                    ⭐ RECOMMENDED
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-text">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted min-h-[40px]">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-text">{plan.price}</span>
                    <span className="text-muted text-sm">/{plan.period}</span>
                  </div>
                  <ul className="mt-8 space-y-4 border-t border-border pt-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-text/90">
                        <FaCheck className="text-bg-primary font-bold mt-0.5 flex-shrink-0" size={14} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
]                    <button onClick={handleredirect} className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular 
                        ? 'bg-bg-primary text-white hover:bg-bg-secondary shadow-md shadow-bg-primary/10' 
                        : 'bg-hover text-text hover:bg-border/60'
                    }`}>
                      {plan.buttonText}
                      <FaArrowRight size={12} />
                    </button>
                  
                    </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="about" className="bg-bg-secondary text-muted py-12 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-0.5 mb-4">
                <div className="w-6 h-6 rounded bg-bg-primary flex items-center justify-center text-white font-bold text-sm">
                  V
                </div>
                <span className="text-base font-bold text-white">endra</span>
              </div>
              <p className="text-sm text-muted/70">Smart retail operating system for modern businesses.</p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted hover:text-bg-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted hover:text-bg-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">About</a></li>
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-muted hover:text-bg-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-muted/70">&copy; {new Date().getFullYear()} Vendra Cloud. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" target="_blank" className="text-muted hover:text-bg-primary transition-colors">Twitter</a>
              <a href="https:www.linkedin.com/in/sahil-kumar35" target="_blank" className="text-muted hover:text-bg-primary transition-colors">LinkedIn</a>
              <a href="https://github.com/sk2522136" target="_blank" className="text-muted hover:text-bg-primary transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;