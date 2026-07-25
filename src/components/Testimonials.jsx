import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const TESTIMONIALS = [
  {
    name: 'Arun Mehta',
    location: 'Kolathur, Chennai',
    text: 'Got a fingerprint lock installed for my apartment. The team was punctual, professional, and explained everything clearly. Works flawlessly even after 6 months.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    location: 'Anna Nagar, Chennai',
    text: 'We upgraded all our office doors with smart locks from MLV. The access management and activity logs have made security so much easier to handle.',
    rating: 5,
  },
  {
    name: 'Vikram Kumar',
    location: 'Velachery, Chennai',
    text: 'I was skeptical about smart locks at first, but the quality and after-sales support won me over. No more worrying about lost keys.',
    rating: 5,
  },
  {
    name: 'Deepa Krishnan',
    location: 'T. Nagar, Chennai',
    text: 'The installation was quick and clean — no damage to the door frame. The WiFi lock lets me check if the door is locked from my phone. Very convenient.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-dark-muted text-xs tracking-widest uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-dark mt-3 tracking-tight">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-light-bg rounded-2xl p-8 space-y-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: item.rating }).map((_, idx) => (
                  <FiStar
                    key={idx}
                    size={14}
                    className="fill-dark text-dark"
                  />
                ))}
              </div>
              <p className="text-dark/80 text-sm leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="pt-1">
                <p className="text-dark font-medium text-sm">{item.name}</p>
                <p className="text-light-muted text-xs">{item.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
