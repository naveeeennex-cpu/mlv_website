import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Products', href: '#products' },
  { label: 'Book', href: '#booking' },
  { label: 'Contact', href: '#contact' },
];

const INSTAGRAM_URL = 'https://www.instagram.com/mlv_smartlockexperts?igsh=MXNtMGllcGQyNjI0Yg==';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 lg:h-20">
        <a href="#home" className="text-xl lg:text-2xl font-bold tracking-tight">
          <span className="text-dark">MLV</span>
          <span className="text-dark/60"> Enterprises</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dark/60 hover:text-dark transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark/60 hover:text-dark transition-colors duration-200"
            aria-label="Instagram"
          >
            <FaInstagram size={18} />
          </a>
          <a
            href="#booking"
            className="text-sm font-medium px-5 py-2 rounded-full border border-dark text-dark hover:bg-dark hover:text-white transition-all duration-200"
          >
            Contact Us
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-dark transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-light-border"
        >
          <div className="px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg text-dark/80 hover:text-dark transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-dark/80 hover:text-dark transition-colors py-2"
            >
              <FaInstagram size={20} />
              <span>Instagram</span>
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
