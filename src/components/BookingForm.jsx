import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendBookingEmail } from '../utils/email';

const SERVICE_TYPES = [
  'New Installation',
  'Lock Replacement',
  'Repair & Service',
  'Consultation',
];

const INITIAL_FORM = {
  name: '',
  phone: '',
  location: '',
  serviceType: '',
  message: '',
};

export default function BookingForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.name.trim()) return 'Please enter your name';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim()))
      return 'Please enter a valid 10-digit phone number';
    if (!form.location.trim()) return 'Please enter your location';
    if (!form.serviceType) return 'Please select a service type';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSending(true);
    try {
      await sendBookingEmail(form);
      toast.success('Booking request sent! We will contact you shortly.');
      setForm(INITIAL_FORM);
    } catch {
      toast.error('Something went wrong. Please try again or contact us on WhatsApp.');
    } finally {
      setSending(false);
    }
  }

  const inputClasses =
    'w-full bg-white border border-light-border rounded-lg px-4 py-3 text-dark placeholder:text-dark-muted/50 focus:border-dark/40 focus:ring-1 focus:ring-dark/10 transition-all duration-200 text-sm';

  return (
    <section id="booking" className="bg-dark py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-white/40 text-xs tracking-widest uppercase">
            Get Started
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mt-3 tracking-tight">
            Book an Installation
          </h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto text-sm">
            Fill out the form below and our team will reach out within 24 hours
            to confirm your appointment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 md:p-10 space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-xs text-dark/60 mb-2 font-medium uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs text-dark/60 mb-2 font-medium uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="location" className="block text-xs text-dark/60 mb-2 font-medium uppercase tracking-wider">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City or area"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="serviceType" className="block text-xs text-dark/60 mb-2 font-medium uppercase tracking-wider">
                  Service Type
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs text-dark/60 mb-2 font-medium uppercase tracking-wider">
                Message <span className="text-dark-muted/50 normal-case">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Any specific requirements or questions..."
                className={`${inputClasses} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-dark hover:bg-dark/90 text-white font-medium py-3.5 rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {sending ? 'Sending...' : 'Submit Booking Request'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
