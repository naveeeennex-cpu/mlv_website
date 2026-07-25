import emailjs from '@emailjs/browser';

const SERVICE_ID = 'SERVICE_ID';
const TEMPLATE_ID = 'TEMPLATE_ID';
const PUBLIC_KEY = 'PUBLIC_KEY';

export async function sendBookingEmail(formData) {
  const templateParams = {
    from_name: formData.name,
    phone: formData.phone,
    location: formData.location,
    service_type: formData.serviceType,
    preferred_date: formData.date,
    message: formData.message,
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
