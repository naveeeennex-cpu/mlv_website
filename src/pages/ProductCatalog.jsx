import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaShieldAlt, FaFingerprint, FaKey, FaWifi, FaBolt, FaArrowLeft, FaChevronRight, FaChevronDown, FaHome } from 'react-icons/fa';
import { getWhatsAppLink, getPricing } from '../data/products';

const FEATURE_ICONS = {
  Biometric: FaFingerprint,
  'Face Recognition': FaFingerprint,
  'PIN Code': FaKey,
  'Mechanical Key': FaKey,
  'RFID Card': FaShieldAlt,
  'Remote Control': FaWifi,
  'Built-in Bluetooth': FaWifi,
  'Built-in BLE': FaWifi,
  'Wi-Fi Connectivity': FaWifi,
  'Fire Rated': FaShieldAlt,
  'Tamper Alarm': FaBolt,
};

function ProductCard({ product }) {
  const pricing = getPricing(product);
  const inStock = product.inStock !== false;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-2xl border border-light-border overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col h-full"
    >
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square bg-light-bg overflow-hidden relative">
          <img
            src={product.image || 'https://gw-assets.assaabloy.com/is/image/assaabloy/yale-luna-pro-front-body_1x1-L'}
            alt={product.name}
            className={`w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 ${inStock ? '' : 'opacity-50 grayscale'}`}
            loading="lazy"
          />
          {!inStock && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full">Out of Stock</span>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-medium text-dark text-sm leading-tight hover:underline">{product.name}</h3>
          </Link>
          <div className="flex flex-col items-end whitespace-nowrap leading-tight">
            <span className="text-dark font-semibold text-sm">{pricing.priceLabel}</span>
            {pricing.hasDiscount && (
              <span className="text-dark/40 text-[11px] line-through">{pricing.strikeLabel}</span>
            )}
          </div>
        </div>

        {product.code && product.code !== product.name && (
          <p className="text-dark/40 text-xs mb-2">{product.code}</p>
        )}

        <p className="text-dark/60 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
            {product.features.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 text-[10px] bg-light-bg text-dark/70 px-2 py-0.5 rounded-full"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 4 && (
              <span className="text-[10px] text-dark/40 px-1 py-0.5">
                +{product.features.length - 4} more
              </span>
            )}
          </div>
        )}

        {product.finishes?.length > 0 && (
          <p className="text-[10px] text-dark/40 mb-3">
            Finish: {product.finishes.join(', ')}
          </p>
        )}

        {product.specs && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-dark/50 mb-4">
            {product.specs.doorThickness && (
              <span>Door: {product.specs.doorThickness}</span>
            )}
            {product.specs.dimensions && (
              <span>Size: {product.specs.dimensions}</span>
            )}
            {product.specs.weight && <span>Weight: {product.specs.weight}</span>}
            {product.specs.doorWidth && <span>Width: {product.specs.doorWidth}</span>}
          </div>
        )}

        {product.bundleIncludes && (
          <p className="text-[10px] text-dark/50 bg-light-bg rounded-lg px-2.5 py-1.5 mb-4">
            Includes: {product.bundleIncludes}
          </p>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          {inStock ? (
            <a
              href={getWhatsAppLink(product.name, pricing.priceLabel)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
            >
              <FaWhatsapp className="w-4 h-4" />
              Order
            </a>
          ) : (
            <span className="flex items-center justify-center flex-1 bg-gray-100 text-gray-400 text-sm font-medium py-2.5 rounded-xl cursor-not-allowed">
              Out of Stock
            </span>
          )}
          <Link
            to={`/products/${product.id}`}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-light-border text-dark/60 hover:text-dark hover:border-dark/30 text-xs transition-colors duration-200"
          >
            Details <FaChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Mega menu driven entirely by the DB hierarchy (groups -> sub-categories).
function MegaMenu({ groups, activeCategory, scrollToCategory }) {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);

  const handleMenuClick = (menuId) => {
    setOpenMobileMenu(openMobileMenu === menuId ? null : menuId);
  };

  const target = (group) => group.subcategories[0]?.id || group.id;

  return (
    <div className="sticky top-[64px] md:top-[72px] z-40 bg-white border-b border-light-border shadow-sm">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 relative">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center gap-16 lg:gap-24 w-full">
          {groups.map((group) => (
            <div
              key={group.id}
              className="py-5"
              onMouseEnter={() => setHoveredMenu(group.id)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => scrollToCategory(target(group))}
                className="flex items-center gap-2 text-sm font-semibold text-dark hover:text-black transition-colors"
              >
                {group.name}
                {group.subcategories.length > 0 && (
                  <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${hoveredMenu === group.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {hoveredMenu === group.id && group.subcategories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full bg-white border border-light-border shadow-2xl rounded-b-3xl p-8"
                  >
                    <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                      {group.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => { scrollToCategory(sub.id); setHoveredMenu(null); }}
                          className={`text-left text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                            activeCategory === sub.id
                              ? 'bg-dark text-white font-medium shadow-md'
                              : 'text-dark/80 hover:bg-light-bg hover:text-dark font-medium'
                          }`}
                        >
                          {sub.name}
                          <FaChevronRight className={`w-2.5 h-2.5 transition-transform duration-300 ${activeCategory === sub.id ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex flex-col py-2">
          {groups.map((group) => (
            <div key={group.id} className="border-b border-light-border last:border-0">
              <button
                onClick={() => (group.subcategories.length ? handleMenuClick(group.id) : scrollToCategory(group.id))}
                className="flex items-center justify-between w-full py-4 text-sm font-semibold text-dark"
              >
                {group.name}
                {group.subcategories.length > 0 && (
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${openMobileMenu === group.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {openMobileMenu === group.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 pb-4">
                      {group.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => { setOpenMobileMenu(null); setTimeout(() => scrollToCategory(sub.id), 350); }}
                          className={`text-left text-sm px-4 py-3 rounded-xl transition-colors ${
                            activeCategory === sub.id
                              ? 'bg-dark text-white font-medium'
                              : 'text-dark/80 hover:bg-light-bg font-medium'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setGroups(list);
        const firstSub = list.flatMap(g => g.subcategories)[0];
        if (firstSub) setActiveCategory(firstSub.id);

        setTimeout(() => {
          if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const el = document.getElementById(id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 160;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }
        }, 100);
      })
      .finally(() => setLoading(false));
  }, []);

  // Track which sub-category section is in view, for the mega-menu highlight.
  useEffect(() => {
    if (groups.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        }
      },
      { rootMargin: '-180px 0px -60% 0px', threshold: 0 }
    );
    const sectionIds = groups.flatMap(g => (g.subcategories.length ? g.subcategories.map(s => s.id) : [g.id]));
    for (const sid of sectionIds) {
      const el = document.getElementById(sid);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [groups]);

  const scrollToCategory = (catId) => {
    const el = document.getElementById(catId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <div className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 md:py-16">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <FaArrowLeft className="w-3 h-3" />
            Back to Home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-light italic tracking-tight mb-4"
          >
            Yale Product Catalog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-sm md:text-base max-w-2xl"
          >
            Explore our complete range of Yale smart locks, digital locks, safes, cameras, and accessories.
          </motion.p>
        </div>
      </div>

      {/* Mega Menu Navigation */}
      {!loading && groups.length > 0 && (
        <MegaMenu groups={groups} activeCategory={activeCategory} scrollToCategory={scrollToCategory} />
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="w-8 h-8 border-2 border-dark/20 border-t-dark rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark/40 text-sm">Loading products…</p>
        </div>
      )}

      {/* Product Sections */}
      {!loading && (
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
          {groups.map((group) => (
            <div key={group.id} className="mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-xs font-medium uppercase tracking-widest text-dark/40 mb-8 border-b border-light-border pb-3"
              >
                {group.name}
              </motion.h2>

              {group.subcategories.length === 0 ? (
                <section id={group.id} className="scroll-mt-48">
                  <div className="bg-light-bg rounded-3xl border border-light-border p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
                    <FaHome className="w-12 h-12 text-dark/20 mb-4" />
                    <h3 className="text-xl md:text-2xl font-light text-dark italic tracking-tight mb-2">{group.name} — Coming Soon</h3>
                    <p className="text-dark/50 text-sm max-w-md">{group.description || 'New products are on the way. Stay tuned!'}</p>
                  </div>
                </section>
              ) : (
                group.subcategories.map((sub) => (
                  <section key={sub.id} id={sub.id} className="mb-14 scroll-mt-48">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="mb-6"
                    >
                      <h3 className="text-2xl md:text-3xl font-light text-dark italic tracking-tight mb-2">
                        {sub.name}
                      </h3>
                      {sub.description && <p className="text-dark/50 text-sm">{sub.description}</p>}
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sub.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          ))}

          {groups.length === 0 && (
            <p className="text-center text-dark/40 py-20">No products available yet.</p>
          )}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-light-bg border-t border-light-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 text-center">
          <h3 className="text-2xl md:text-3xl font-light text-dark italic mb-3">Need Help Choosing?</h3>
          <p className="text-dark/50 text-base mb-8 max-w-lg mx-auto">
            Our experts can help you find the perfect Yale product for your home. Get in touch on WhatsApp for instant assistance.
          </p>
          <a
            href="https://wa.me/919087918939?text=Hi%2C%20I%20need%20help%20choosing%20a%20Yale%20product.%20Can%20you%20assist%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium px-8 py-4 rounded-full shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:-translate-y-1"
          >
            <FaWhatsapp className="w-5 h-5" />
            Chat with Us
          </a>
        </div>
      </div>
    </div>
  );
}
