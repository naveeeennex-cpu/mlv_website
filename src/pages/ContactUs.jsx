import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WHATSAPP_URL = 'https://wa.me/919087918939?text=Hi%20MLV%20Enterprises%2C%20I%20have%20a%20query.';
const INSTAGRAM_URL = 'https://www.instagram.com/mlv_smartlockexperts?igsh=MXNtMGllcGQyNjI0Yg==';

const CONTACT_INFO = [
  {
    icon: FiMapPin,
    label: 'Office Address',
    value: '200ft Road, near KFC, Thillai Nagar, Mahavir Nagar, Kolathur, Chennai, Tamil Nadu – 600099',
  },
  {
    icon: FiPhone,
    label: 'Phone / WhatsApp',
    value: '+91 90879 18939',
    href: 'tel:+919087918939',
  },
  {
    icon: FiMail,
    label: 'Email',
    value: 'sales@mlventerprises.in',
    href: 'mailto:sales@mlventerprises.in',
  },
  {
    icon: FiClock,
    label: 'Business Hours',
    value: 'Monday – Saturday: 9:00 AM – 6:00 PM IST',
  },
];

const SERVICES = [
  'AI Automation Solutions',
  'WhatsApp Bot Development',
  'Custom Software Development',
  'Website Development',
  'Business Process Automation',
  'Digital Consulting',
  'CRM & Integration',
  'Other',
];

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    // Simulate form submission — wire to EmailJS or backend as needed
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', phone: '', service: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-dark pt-24 pb-14 lg:pt-32 lg:pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <nav className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <Link to="/" className="hover:text-white/70 transition-colors duration-200">Home</Link>
            <FiChevronRight size={12} />
            <span className="text-white/60">Contact Us</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-white/50 text-sm lg:text-base leading-relaxed max-w-xl">
            Have a project in mind, a question about our services, or need a quote? Fill out the form or reach us directly — we typically respond within one business day.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

          {/* Contact Info — left */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-dark tracking-tight mb-6">Contact Information</h2>
              <ul className="space-y-5">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-dark flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={15} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-light-muted mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium text-dark hover:text-gold transition-colors duration-200">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-dark leading-relaxed">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-dark mb-3 tracking-wide">Follow Us</h3>
              <div className="flex gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark text-white text-xs font-medium hover:bg-dark/80 transition-all duration-200"
                >
                  <FaWhatsapp size={14} />
                  WhatsApp
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-light-border text-dark text-xs font-medium hover:border-dark transition-all duration-200"
                >
                  <FaInstagram size={14} />
                  Instagram
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div className="border-t border-light-border pt-6">
              <h3 className="text-sm font-semibold text-dark mb-3 tracking-wide">Quick Legal Links</h3>
              <ul className="space-y-2">
                {[
                  { label: 'Privacy Policy', to: '/privacy-policy' },
                  { label: 'Terms & Conditions', to: '/terms-conditions' },
                  { label: 'Refund Policy', to: '/refund-policy' },
                  { label: 'Data Deletion Request', to: '/data-deletion' },
                ].map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-1.5 text-sm text-light-muted hover:text-dark transition-colors duration-200"
                    >
                      <FiChevronRight size={12} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Form — right */}
          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4 border border-light-border rounded-2xl"
              >
                <div className="w-14 h-14 rounded-full bg-dark flex items-center justify-center">
                  <FiSend size={22} className="text-gold" />
                </div>
                <h3 className="text-xl font-semibold text-dark">Message Received!</h3>
                <p className="text-light-muted text-sm max-w-xs leading-relaxed">
                  Thank you for reaching out. Our team will review your message and respond within one business day.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm font-medium px-6 py-2.5 rounded-full border border-dark text-dark hover:bg-dark hover:text-white transition-all duration-200"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-semibold text-dark tracking-tight mb-6">Send Us a Message</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark" htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Naveen Kumar"
                      required
                      className="w-full px-4 py-3 text-sm border border-light-border rounded-xl bg-white text-dark placeholder-light-muted focus:border-dark transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark" htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      required
                      className="w-full px-4 py-3 text-sm border border-light-border rounded-xl bg-white text-dark placeholder-light-muted focus:border-dark transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark" htmlFor="phone">
                      Phone / WhatsApp
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 text-sm border border-light-border rounded-xl bg-white text-dark placeholder-light-muted focus:border-dark transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark" htmlFor="service">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border border-light-border rounded-xl bg-white text-dark focus:border-dark transition-colors duration-200"
                    >
                      <option value="">Select a service...</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-dark" htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder="Describe your project, requirements, or questions in detail..."
                    className="w-full px-4 py-3 text-sm border border-light-border rounded-xl bg-white text-dark placeholder-light-muted focus:border-dark transition-colors duration-200 resize-none"
                  />
                </div>

                <p className="text-xs text-light-muted leading-relaxed">
                  By submitting this form, you agree to our{' '}
                  <Link to="/privacy-policy" className="text-dark hover:text-gold underline transition-colors duration-200">
                    Privacy Policy
                  </Link>
                  . We will never share your contact details with third parties without consent.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-dark text-white text-sm font-medium hover:bg-dark/80 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-light-border bg-light-bg">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-light-muted text-xs">
            © {new Date().getFullYear()} MLV Enterprises. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-light-muted">
            <Link to="/privacy-policy" className="hover:text-dark transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-dark transition-colors duration-200">Terms</Link>
            <Link to="/refund-policy" className="hover:text-dark transition-colors duration-200">Refunds</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
