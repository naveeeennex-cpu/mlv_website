import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const WHATSAPP_URL =
  'https://wa.me/919176186062?text=I%20want%20to%20book%20a%20smart%20lock';
const INSTAGRAM_URL = 'https://www.instagram.com/mlv_smartlockexperts?igsh=MXNtMGllcGQyNjI0Yg==';

const QUICK_LINKS = [
  { label: 'About Us', href: '#home' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Contact Us', href: '#contact' },
  { label: 'FAQ', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Disclaimer', href: '#' },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-dark">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              MLV Enterprises
            </h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              MLV Enterprises is a smart lock company based in Chennai. We focus on
              developing and installing innovative smart lock products for homes
              and commercial spaces across India.
            </p>
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
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
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
                <span className="text-white/40 text-sm">+91 91761 86062</span>
              </li>
              <li className="flex items-start gap-3">
                <FiMail size={14} className="text-white/40 mt-0.5 shrink-0" />
                <span className="text-white/40 text-sm">sales@mlventerprises.com</span>
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
          <p className="text-white/30 text-xs">
            Smart Lock Installation &amp; Security Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
