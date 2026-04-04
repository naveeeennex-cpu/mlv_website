import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaShieldAlt, FaFingerprint, FaKey, FaWifi, FaBolt, FaArrowLeft } from 'react-icons/fa';
import { PRODUCT_CATEGORIES, getWhatsAppLink } from '../data/products';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-2xl border border-light-border overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
    >
      <div className="aspect-square bg-light-bg overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <FaShieldAlt className="w-12 h-12 text-dark/15 mx-auto mb-3" />
              <p className="text-dark/30 text-xs">Image coming soon</p>
            </div>
          </div>
        )}
        {product.specs?.warranty && (
          <span className="absolute top-3 right-3 bg-dark text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
            {product.specs.warranty} Warranty
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-dark text-sm leading-tight">{product.name}</h3>
          <span className="text-dark font-semibold text-sm whitespace-nowrap">{product.mrp}</span>
        </div>

        {product.code && product.code !== product.name && (
          <p className="text-dark/40 text-xs mb-2">{product.code}</p>
        )}

        <p className="text-dark/60 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
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

        <a
          href={getWhatsAppLink(product.name, product.mrp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
        >
          <FaWhatsapp className="w-4 h-4" />
          Order on WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export default function ProductCatalog() {
  const [activeCategory, setActiveCategory] = useState(PRODUCT_CATEGORIES[0].id);
  const sectionRefs = useRef({});
  const navRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );

    for (const cat of PRODUCT_CATEGORIES) {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector(`[data-cat="${activeCategory}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const scrollToCategory = (catId) => {
    const el = document.getElementById(catId);
    if (el) {
      const offset = 140;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <div className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 md:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
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
            Explore our complete range of Yale smart locks, digital locks, safes, cameras, and accessories. Price list effective February 2026.
          </motion.p>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-light-border shadow-sm">
        <div
          ref={navRef}
          className="max-w-6xl mx-auto px-4 lg:px-10 flex gap-1 overflow-x-auto scrollbar-hide py-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              data-cat={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-dark text-white'
                  : 'bg-light-bg text-dark/60 hover:bg-dark/10 hover:text-dark'
              }`}
            >
              {cat.name}
              <span className="ml-1.5 opacity-60">({cat.products.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Sections */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        {PRODUCT_CATEGORIES.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="mb-16 scroll-mt-36"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-light text-dark italic tracking-tight mb-2">
                {category.name}
              </h2>
              <p className="text-dark/50 text-sm">{category.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-light-bg border-t border-light-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 text-center">
          <h3 className="text-xl md:text-2xl font-light text-dark italic mb-3">
            Need Help Choosing?
          </h3>
          <p className="text-dark/50 text-sm mb-6 max-w-lg mx-auto">
            Our experts can help you find the perfect Yale product for your home. Get in touch on WhatsApp for instant assistance.
          </p>
          <a
            href="https://wa.me/919176186062?text=Hi%2C%20I%20need%20help%20choosing%20a%20Yale%20product.%20Can%20you%20assist%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium px-8 py-3 rounded-full transition-colors duration-200"
          >
            <FaWhatsapp className="w-5 h-5" />
            Chat with Us
          </a>
        </div>
      </div>
    </div>
  );
}
