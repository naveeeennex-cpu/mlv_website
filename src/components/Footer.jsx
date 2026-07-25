import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const WHATSAPP_URL =
  'https://wa.me/919087918939?text=Hi%20MLV%20Enterprises%2C%20I%20have%20a%20query.';
const INSTAGRAM_URL = 'https://www.instagram.com/mlv_smartlockexperts?igsh=MXNtMGllcGQyNjI0Yg==';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-conditions' },
  { label: 'Data Deletion', to: '/data-deletion' },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-dark">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MLV Enterprises" className="h-12 w-auto" />
              <h3 className="text-2xl font-bold text-white tracking-tight">
                MLV Enterprises
              </h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              MLV Enterprises provides smart lock and automated 
              security solutions for homes and 
              commercial projects across Tamil Nadu.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-gold text-xs">★</span>
              <span className="text-white/60 text-xs font-medium">Yale Authorised Dealer</span>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all duration-200"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-sm font-semibold text-white tracking-wider">
              Quick Menu
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-sm font-semibold text-white tracking-wider">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiPhone size={14} className="text-white/40 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+919345344052" className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200">+91 9345344052</a>
                  <a href="tel:+919159844052" className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200">+91 9159844052</a>
                  <a href="tel:+917094976337" className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200">+91 7094976337</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FiMail size={14} className="text-white/40 mt-0.5 shrink-0" />
                <a href="mailto:sales@mlventerprises.in" className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200">sales@mlventerprises.in</a>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin size={14} className="text-white/40 mt-0.5 shrink-0" />
                <span className="text-white/40 text-sm">
                  200ft Road, near KFC, Thillai Nagar, Mahavir Nagar, Kolathur, Chennai, Tamil Nadu 600099
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} MLV Enterprises. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-white/30 text-xs">
              Smart Lock Installation &amp; Security Solutions
            </p>
            <span className="text-white/10 text-xs hidden md:block">|</span>
            <p className="text-white/30 text-xs">
              Website by{' '}
              <a
                href="https://lazyrabbit.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors duration-200"
              >
                Lazyrabbit.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
