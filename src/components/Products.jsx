import { motion } from 'framer-motion';

const SHOWCASE_PRODUCTS = [
  {
    name: 'Smart Doorbell',
    highlight: 'MLV',
    description:
      'Advanced smart doorbell with camera and sensors for the security and comfort of your home. Real-time notifications and two-way audio.',
    image: 'https://gw-assets.assaabloy.com/is/image/assaabloy/yale-byyou-pro-champagne-gold-1:1x1?fmt=webp-alpha&wid=752&hei=752',
    dark: true,
  },
  {
    name: 'Remote',
    highlight: 'MLV',
    description:
      'Control your locks from anywhere with our smart remote system. Compatible with all MLV smart lock models for seamless integration.',
    image: 'https://dmnwhfs1e7dfi.cloudfront.net/media/assets/images/lock-essential-black/esential-black-5.webp',
    dark: false,
  },
  {
    name: 'Sync LED',
    highlight: 'MLV',
    description:
      'Smart LED indicator system that syncs with your lock status. Visual confirmation of lock state with ambient lighting integration.',
    image: 'https://dmnwhfs1e7dfi.cloudfront.net/media/assets/images/lock-essential-black/esential-black-3.webp',
    dark: true,
  },
];

const GRID_PRODUCTS = [
  {
    title: 'Premium Fingerprint Lock',
    description:
      'Advanced biometric access with up to 100 fingerprint storage for ultimate security.',
    image: 'https://dmnwhfs1e7dfi.cloudfront.net/media/assets/images/lock-essential-black/esential-black-5.webp',
  },
  {
    title: 'WiFi Connected Lock',
    description:
      'Control your door from anywhere via smartphone app with real-time activity logs.',
    image: 'https://gw-assets.assaabloy.com/is/image/assaabloy/yale-byyou-pro-champagne-gold-1:1x1?fmt=webp-alpha&wid=752&hei=752',
  },
];

export default function Products() {
  return (
    <section id="products">
      {SHOWCASE_PRODUCTS.map((product, i) => (
        <ProductRow key={product.name} product={product} index={i} />
      ))}

      <div className="bg-light-bg py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {GRID_PRODUCTS.map((product, i) => (
              <ProductGridCard key={product.title} product={product} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductRow({ product, index }) {
  const isReversed = index % 2 !== 0;

  return (
    <div className={product.dark ? 'bg-dark' : 'bg-white'}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 items-center min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className={`flex items-center justify-center p-4 md:p-6 min-h-[350px] lg:min-h-[500px] overflow-hidden ${
              isReversed ? 'lg:order-2' : 'lg:order-1'
            } ${product.dark ? 'bg-dark-card' : 'bg-light-bg'}`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-w-xl lg:max-w-2xl h-auto max-h-[450px] object-contain"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`px-8 md:px-12 lg:px-16 py-16 lg:py-20 ${
              isReversed ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <h3
              className={`text-2xl md:text-3xl font-bold mb-4 ${
                product.dark ? 'text-white' : 'text-dark'
              }`}
            >
              <span className={product.dark ? 'text-white/50' : 'text-dark/40'}>
                {product.highlight}
              </span>{' '}
              <span className="italic font-light">{product.name}</span>
            </h3>
            <p
              className={`text-sm leading-relaxed mb-8 max-w-md ${
                product.dark ? 'text-white/60' : 'text-light-muted'
              }`}
            >
              {product.description}
            </p>
            <a
              href="#booking"
              className={`inline-block text-sm font-medium px-7 py-3 rounded-full border transition-all duration-200 ${
                product.dark
                  ? 'border-white/30 text-white hover:bg-white hover:text-dark'
                  : 'border-dark/30 text-dark hover:bg-dark hover:text-white'
              }`}
            >
              Book Now
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProductGridCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative rounded-2xl overflow-hidden aspect-[3/2] cursor-pointer"
    >
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h4 className="text-lg md:text-xl font-semibold text-white mb-2">
          {product.title}
        </h4>
        <p className="text-white/70 text-sm mb-4 max-w-sm">{product.description}</p>
        <a
          href="#booking"
          className="inline-block text-sm font-medium px-6 py-2.5 rounded-full bg-white text-dark hover:bg-white/90 transition-all duration-200"
        >
          Buy Now
        </a>
      </div>
    </motion.div>
  );
}
