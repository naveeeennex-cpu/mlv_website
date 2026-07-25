import { motion } from 'framer-motion';
import { FiTruck } from 'react-icons/fi';

const STATS = [
  {
    value: '50000+',
    label:
      'Installations completed across Chennai and other major cities since 2010.',
  },
  {
    icon: <FiTruck size={28} className="text-dark" />,
    label:
      ' Available for delivery and installation throughout Tamil Nadu with installation completion within 48 hours.',
  },
  {
    value: '15+',
    label:
      'Years of experience in providing smart lock solutions and security systems for homes and commercial projects.',
  },
];

export default function Stats() {
  return (
    <section className="bg-white pt-40 pb-20 lg:pt-48 lg:pb-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {stat.value ? (
                <p className="text-3xl md:text-4xl font-bold text-dark mb-3">
                  {stat.value}
                </p>
              ) : (
                <div className="mb-3">{stat.icon}</div>
              )}
              <p className="text-light-muted text-sm leading-relaxed">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
