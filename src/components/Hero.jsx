import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative bg-white">
      <section id="home" className="relative px-4 md:px-8 pt-20 lg:pt-24">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&fit=crop"
              alt="Modern home with elegant entrance door"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-tight italic tracking-tight">
                Modern Solutions for
                <br />
                Comfortable &amp; Safe Living
              </h1>
              <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                We provide high-quality smart locks and security solutions that have
                been trusted by homes, apartments, and commercial projects across India.
              </p>
              <div className="pt-4">
                <a
                  href="#booking"
                  className="inline-block bg-dark text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-dark/80 transition-all duration-200"
                >
                  Book Installation
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AboutOverlap />
    </div>
  );
}

function AboutOverlap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      className="relative z-20 -mt-24 md:-mt-28 px-6 lg:px-10 pb-8"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl shadow-black/8 p-8 md:p-12 lg:p-14 border border-light-border/50">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <span className="text-dark-muted text-xs tracking-widest uppercase">
              / About Us
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-dark mt-3 leading-snug">
              Smart solutions for
              <br />
              modern households
            </h2>
          </div>
          <div>
            <p className="text-light-muted text-sm leading-relaxed">
              MLV Enterprises is a professional company that focuses on the supply
              and installation of smart locks for homes and everyday life. Our main
              products include premium fingerprint locks, WiFi-connected deadbolts,
              and commercial access systems — all installed by trained technicians
              with full after-sales support.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
