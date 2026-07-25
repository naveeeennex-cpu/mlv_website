import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiCalendar } from 'react-icons/fi';

export default function LegalLayout({ title, subtitle, lastUpdated, children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-dark pt-24 pb-14 lg:pt-32 lg:pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <nav className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <Link to="/" className="hover:text-white/70 transition-colors duration-200">
              Home
            </Link>
            <FiChevronRight size={12} />
            <span className="text-white/60">{title}</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/50 text-sm lg:text-base leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 mt-5 text-white/30 text-xs">
            <FiCalendar size={12} />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-10">
        {children}
      </div>

      {/* Footer note */}
      <div className="border-t border-light-border bg-light-bg">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-light-muted text-xs text-center sm:text-left">
            © {new Date().getFullYear()} MLV Enterprises. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-light-muted">
            <Link to="/privacy-policy" className="hover:text-dark transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-dark transition-colors duration-200">Terms</Link>
            <Link to="/refund-policy" className="hover:text-dark transition-colors duration-200">Refunds</Link>
            <Link to="/contact" className="hover:text-dark transition-colors duration-200">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-light-border">
        {title}
      </h2>
      <div className="space-y-3 text-light-muted text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function LegalSubSection({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-dark mb-2">{title}</h3>
      <div className="space-y-2 text-light-muted text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function BulletList({ items }) {
  return (
    <ul className="list-disc list-outside pl-5 space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function InfoBox({ children }) {
  return (
    <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 text-sm text-light-muted leading-relaxed">
      {children}
    </div>
  );
}
