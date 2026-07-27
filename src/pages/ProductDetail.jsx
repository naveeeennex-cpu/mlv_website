import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaWhatsapp,
  FaShieldAlt,
  FaFingerprint,
  FaKey,
  FaWifi,
  FaBolt,
  FaArrowLeft,
  FaPalette,
  FaBox,
  FaChevronRight,
  FaDoorOpen,
} from 'react-icons/fa';
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
  'Vibration Alert': FaBolt,
};

function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-light-border last:border-0">
      <span className="text-dark/40 text-xs w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-dark text-sm font-medium">{value}</span>
    </div>
  );
}

function RecommendedCard({ product }) {
  const pricing = getPricing(product);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl border border-light-border overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square bg-light-bg overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaShieldAlt className="w-10 h-10 text-dark/15" />
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h4 className="font-medium text-dark text-sm leading-tight mb-1 line-clamp-2 hover:underline">
            {product.name}
          </h4>
        </Link>
        {product.code && product.code !== product.name && (
          <p className="text-dark/40 text-xs mb-1">{product.code}</p>
        )}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-dark font-semibold text-sm">{pricing.priceLabel}</span>
          {pricing.hasDiscount && (
            <span className="text-dark/40 text-xs line-through">{pricing.strikeLabel}</span>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={getWhatsAppLink(product.name, pricing.priceLabel)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 bg-[#25D366] hover:bg-[#1fb855] text-white text-xs font-medium py-2 rounded-xl transition-colors duration-200"
          >
            <FaWhatsapp className="w-3.5 h-3.5" />
            Order
          </a>
          <Link
            to={`/products/${product.id}`}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-light-border text-dark/60 hover:text-dark hover:border-dark/30 text-xs transition-colors duration-200"
          >
            Details <FaChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);

    fetch(`/api/products?id=${productId}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setProduct(data);
        // Load sibling products (same sub-category) for recommendations
        return fetch('/api/products')
          .then(r => r.json())
          .then(groups => {
            const subs = (Array.isArray(groups) ? groups : []).flatMap(g => g.subcategories || []);
            const sub = subs.find(s => s.id === data.category_id);
            if (sub) setRecommendations(sub.products.filter(p => p.id !== data.id).slice(0, 3));
          });
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark/20 border-t-dark rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark/40 text-lg mb-4">Product not found</p>
          <Link to="/products" className="text-dark underline text-sm">Back to catalog</Link>
        </div>
      </div>
    );
  }

  const specs = product.specs || {};
  const pricing = getPricing(product);
  const inStock = product.inStock !== false;

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex items-center gap-2 text-xs text-white/50">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <Link
            to={`/products#${product.category_id}`}
            onClick={(e) => { e.preventDefault(); navigate('/products', { state: { scrollTo: product.category_id } }); }}
            className="hover:text-white transition-colors"
          >
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="text-white/80 truncate max-w-[180px]">{product.name}</span>
        </div>
      </div>

      {/* Main Detail */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-dark/40 hover:text-dark text-sm mb-8 transition-colors"
        >
          <FaArrowLeft className="w-3 h-3" />
          Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {!inStock && (
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            )}
            <div className="aspect-square bg-light-bg rounded-3xl overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-contain p-10 ${inStock ? '' : 'opacity-50 grayscale'}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <FaShieldAlt className="w-16 h-16 text-dark/15" />
                  <p className="text-dark/30 text-xs">Image coming soon</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <p className="text-dark/40 text-xs font-medium uppercase tracking-widest mb-2">
              {product.category_name}
            </p>
            <h1 className="text-3xl md:text-4xl font-light italic text-dark tracking-tight mb-1">
              {product.name}
            </h1>
            {product.code && product.code !== product.name && (
              <p className="text-dark/40 text-sm mb-4 font-mono">{product.code}</p>
            )}

            <div className="mb-6">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-semibold text-dark">{pricing.priceLabel}</span>
                {pricing.hasDiscount && (
                  <>
                    <span className="text-dark/40 text-lg line-through">{pricing.strikeLabel}</span>
                    <span className="text-[#1a7a32] bg-[#e7f6ec] text-xs font-semibold px-2 py-1 rounded-full">
                      {pricing.off}% OFF
                    </span>
                  </>
                )}
              </div>
              <span className="text-dark/30 text-xs">
                Incl. taxes{pricing.hasDiscount ? ` · You save ${pricing.saveLabel}` : ''}
              </span>
            </div>

            <p className="text-dark/60 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mb-6">
                <p className="text-dark/40 text-xs uppercase tracking-widest mb-3">Access Methods</p>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature) => {
                    const Icon = FEATURE_ICONS[feature] || FaShieldAlt;
                    return (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1.5 text-xs bg-dark text-white px-3 py-1.5 rounded-full"
                      >
                        <Icon className="w-3 h-3 opacity-70" />
                        {feature}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finishes */}
            {product.finishes?.length > 0 && (
              <div className="mb-6">
                <p className="text-dark/40 text-xs uppercase tracking-widest mb-3">
                  <FaPalette className="inline w-3 h-3 mr-1" />
                  Available Finishes
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.finishes.map((finish) => (
                    <span
                      key={finish}
                      className="text-xs border border-light-border text-dark/70 px-3 py-1.5 rounded-full"
                    >
                      {finish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suitable For — door compatibility */}
            {((product.doorMaterial?.length > 0) || (product.doorConfiguration?.length > 0)) && (
              <div className="mb-6">
                <p className="text-dark/40 text-xs uppercase tracking-widest mb-3">
                  <FaDoorOpen className="inline w-3 h-3 mr-1" />
                  Suitable For
                </p>
                <div className="flex flex-wrap gap-2">
                  {(product.doorMaterial || []).map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1.5 text-xs bg-dark/[0.06] text-dark px-3 py-1.5 rounded-full border border-light-border"
                    >
                      {m}
                    </span>
                  ))}
                  {(product.doorConfiguration || []).map((cfg) => (
                    <span
                      key={cfg}
                      className="inline-flex items-center gap-1.5 text-xs bg-dark/[0.06] text-dark px-3 py-1.5 rounded-full border border-light-border"
                    >
                      {cfg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle */}
            {product.bundleIncludes && (
              <div className="bg-light-bg rounded-xl p-4 mb-6 flex items-start gap-3">
                <FaBox className="w-4 h-4 text-dark/40 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-dark/40 text-xs uppercase tracking-widest mb-0.5">Bundle Includes</p>
                  <p className="text-dark text-sm">{product.bundleIncludes}</p>
                </div>
              </div>
            )}

            {inStock ? (
              <a
                href={getWhatsAppLink(product.name, pricing.priceLabel)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium py-4 rounded-2xl transition-colors duration-200 text-base mt-auto"
              >
                <FaWhatsapp className="w-5 h-5" />
                Order on WhatsApp
              </a>
            ) : (
              <div className="mt-auto">
                <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-medium py-4 rounded-2xl text-base cursor-not-allowed">
                  Out of Stock
                </div>
                <p className="text-center text-dark/40 text-xs mt-2">Currently unavailable — contact us on WhatsApp to be notified.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Specs Table */}
        {Object.keys(specs).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-light italic text-dark tracking-tight mb-6">Specifications</h2>
            <div className="bg-light-bg rounded-2xl p-6 max-w-xl">
              <SpecRow label="Model Code" value={product.code !== product.name ? product.code : undefined} />
              <SpecRow label="Door Thickness" value={specs.doorThickness} />
              <SpecRow label="Door Width" value={specs.doorWidth} />
              <SpecRow label="Door Weight" value={specs.doorWeight} />
              <SpecRow label="Dimensions" value={specs.dimensions} />
              <SpecRow label="Weight" value={specs.weight} />
              <SpecRow label="Volume" value={specs.volume} />
              <SpecRow label="Battery" value={specs.battery} />
              <SpecRow label="Warranty" value={specs.warranty} />
            </div>
          </motion.div>
        )}

        {/* Applications & Advantages */}
        {(product.applications || product.advantages) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl"
          >
            {product.applications && (
              <div className="bg-light-bg rounded-2xl p-6">
                <h3 className="text-lg font-light italic text-dark tracking-tight mb-3">Applications</h3>
                <p className="text-dark/60 text-sm leading-relaxed whitespace-pre-line">{product.applications}</p>
              </div>
            )}
            {product.advantages && (
              <div className="bg-light-bg rounded-2xl p-6">
                <h3 className="text-lg font-light italic text-dark tracking-tight mb-3">Advantages</h3>
                <p className="text-dark/60 text-sm leading-relaxed whitespace-pre-line">{product.advantages}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light italic text-dark tracking-tight">
                You Might Also Like
              </h2>
              <Link
                to="/products"
                className="text-dark/40 hover:text-dark text-sm transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.map((rec) => (
                <RecommendedCard key={rec.id} product={rec} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-dark text-white mt-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 text-center">
          <h3 className="text-xl md:text-2xl font-light italic mb-3">Need Help Choosing?</h3>
          <p className="text-white/50 text-sm mb-6 max-w-lg mx-auto">
            Our experts can guide you to the perfect Yale product. Contact us on WhatsApp for instant help.
          </p>
          <a
            href="https://wa.me/919087918939?text=Hi%2C%20I%20need%20help%20choosing%20a%20Yale%20product.%20Can%20you%20assist%3F"
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
