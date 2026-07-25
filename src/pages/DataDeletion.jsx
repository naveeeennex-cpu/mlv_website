import LegalLayout, {
  LegalSection,
  LegalSubSection,
  BulletList,
  InfoBox,
} from '../components/LegalLayout';
import { FiMail, FiMessageSquare, FiCheckCircle, FiClock } from 'react-icons/fi';

const STEPS = [
  {
    icon: FiMail,
    step: 'Step 1',
    title: 'Send a Deletion Request',
    desc: 'Email sales@mlventerprises.in with the subject line "Data Deletion Request – [Your Name]". Include your full name, registered phone number, and email address for verification.',
  },
  {
    icon: FiMessageSquare,
    step: 'Step 2',
    title: 'Identity Verification',
    desc: 'We will verify your identity to ensure we process the correct account. You may be asked to confirm additional details. This step protects you from unauthorised deletion requests.',
  },
  {
    icon: FiClock,
    step: 'Step 3',
    title: 'Processing Period',
    desc: 'Once verified, we will initiate the deletion process. Your data will be permanently deleted within 30 days. You will receive email updates at each stage of the process.',
  },
  {
    icon: FiCheckCircle,
    step: 'Step 4',
    title: 'Deletion Confirmation',
    desc: 'Upon completion, you will receive a written confirmation that your personal data has been deleted from our primary systems and instructed for removal from backup systems within 90 days.',
  },
];

export default function DataDeletion() {
  return (
    <LegalLayout
      title="Data Deletion Instructions"
      subtitle="This page explains how you can request the deletion of your personal data that MLV Enterprises has collected through our website, services, WhatsApp integrations, and connected applications."
      lastUpdated="May 7, 2026"
    >
      <InfoBox>
        <strong>For Meta / Facebook App Users:</strong> If you connected to our services via a Meta app, Facebook Login, or WhatsApp, you can request deletion of all data collected through that connection by following the steps on this page. We are required by Meta's Platform Policy to provide and honour these deletion requests.
      </InfoBox>

      {/* Visual Steps */}
      <div className="grid sm:grid-cols-2 gap-4 mt-2">
        {STEPS.map(({ icon: Icon, step, title, desc }) => (
          <div
            key={step}
            className="border border-light-border rounded-xl p-5 space-y-3 hover:border-gold/40 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dark flex items-center justify-center shrink-0">
                <Icon size={16} className="text-gold" />
              </div>
              <div>
                <p className="text-xs text-light-muted">{step}</p>
                <p className="text-sm font-semibold text-dark">{title}</p>
              </div>
            </div>
            <p className="text-xs text-light-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <LegalSection title="1. Purpose of This Page">
        <p>
          In compliance with Meta's Platform Policy, the Digital Personal Data Protection Act, 2023 (India), and principles consistent with the General Data Protection Regulation (GDPR), MLV Enterprises provides clear, accessible instructions for users to request the deletion of their personal data.
        </p>
        <p className="mt-3">
          This page applies to all data collected through:
        </p>
        <BulletList items={[
          'Our website at www.mlventerprises.in',
          'WhatsApp Business API-powered bots and communication tools operated by us',
          'Any application or service connected to a Meta/Facebook product',
          'Our CRM, analytics, and third-party integrations',
          'Email communications, contact forms, and support interactions',
        ]} />
      </LegalSection>

      <LegalSection title="2. What Data We Hold About You">
        <p>Depending on how you have interacted with our services, we may hold the following categories of data:</p>
        <LegalSubSection title="Personal Identification Data">
          <BulletList items={[
            'Name, email address, phone number (including WhatsApp number/WAID)',
            'Business name and contact designation',
            'IP address and device identifiers',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="Communication and Interaction Data">
          <BulletList items={[
            'WhatsApp message history from bot conversations',
            'Email exchanges and support ticket content',
            'Form submissions on our website',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="Service and Transaction Data">
          <BulletList items={[
            'Service orders, invoices, and payment records',
            'Project-specific data and deliverables you have shared',
            'Account credentials and login activity logs',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="Technical Data">
          <BulletList items={[
            'Browser cookies and session data',
            'Website analytics and usage logs',
            'API access logs and integration records',
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="3. How to Submit a Deletion Request">
        <LegalSubSection title="Option A – Email Request (Primary Method)">
          <p>Send an email to:</p>
          <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-2 space-y-2 text-sm">
            <p><span className="font-semibold text-dark">To:</span> <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a></p>
            <p><span className="font-semibold text-dark">Subject:</span> Data Deletion Request – [Your Full Name]</p>
            <p className="font-semibold text-dark">Email Body must include:</p>
            <BulletList items={[
              'Your full name',
              'Registered email address or WhatsApp phone number',
              'Type of data you wish to have deleted (all data, or specific categories)',
              'Any service or project reference number (if applicable)',
              'Whether this is a partial deletion request or a full account deletion',
            ]} />
          </div>
        </LegalSubSection>
        <LegalSubSection title="Option B – WhatsApp Request">
          <p>Send a WhatsApp message to <a href="https://wa.me/919087918939" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">+91 90879 18939</a> with the message: <span className="font-medium text-dark">"I request deletion of my personal data."</span> Our team will guide you through the verification process.</p>
        </LegalSubSection>
        <LegalSubSection title="Option C – Written Request">
          <p>Send a written request to our registered address:</p>
          <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-2 text-sm text-dark space-y-0.5">
            <p className="font-medium">Data Privacy Team – MLV Enterprises</p>
            <p>200ft Road, near KFC, Thillai Nagar, Mahavir Nagar,</p>
            <p>Kolathur, Chennai, Tamil Nadu – 600099</p>
          </div>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="4. Verification Process">
        <p>
          To protect against unauthorised deletion requests, we verify the identity of every requester before processing. Verification may include:
        </p>
        <BulletList items={[
          'Confirming the email address or phone number on record',
          'A one-time verification code sent to your registered contact method',
          'For business accounts: confirmation from the authorised account administrator',
        ]} />
        <p className="mt-3">
          We will acknowledge your request within <strong className="text-dark">72 hours</strong> of receipt. If additional information is required for verification, we will contact you within this window.
        </p>
      </LegalSection>

      <LegalSection title="5. Processing Timelines">
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-light-bg">
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Stage</th>
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Timeframe</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Acknowledgement of request', 'Within 72 hours'],
                ['Identity verification', 'Within 5 business days'],
                ['Deletion from primary systems', 'Within 30 days of verified request'],
                ['Deletion from backup systems', 'Within 90 days of primary deletion'],
                ['Written confirmation sent to you', 'Upon completion of primary deletion'],
              ].map(([stage, time]) => (
                <tr key={stage} className="even:bg-light-bg/50">
                  <td className="px-4 py-3 border border-light-border text-dark">{stage}</td>
                  <td className="px-4 py-3 border border-light-border font-medium text-dark">{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="6. Scope of Deletion">
        <p>
          Upon a successful full deletion request, we will permanently erase or anonymise:
        </p>
        <BulletList items={[
          'Your personal profile and contact details from our systems',
          'WhatsApp conversation logs associated with your number',
          'Website analytics tied to your identifiable session data',
          'Marketing preferences and communication history',
          'Any account credentials and login records',
        ]} />
        <p className="mt-3">
          Data will be removed from all active databases. Encrypted backup copies will be purged within 90 days as part of scheduled backup rotation cycles.
        </p>
      </LegalSection>

      <LegalSection title="7. Exceptions – Data We May Retain">
        <p>
          Certain categories of data may be retained even after a deletion request, where we are required or permitted by law to do so:
        </p>
        <BulletList items={[
          'Financial records and invoices required under the Income Tax Act, 1961 and GST regulations (typically 7 years)',
          'Data required for the resolution of pending disputes, legal claims, or regulatory investigations',
          'Aggregated, anonymised data that cannot identify you as an individual',
          'Legally mandated audit trails and compliance logs',
        ]} />
        <p className="mt-3">
          Where we retain data under an exception, we will inform you of the specific legal basis and estimated retention period in our deletion confirmation email.
        </p>
      </LegalSection>

      <LegalSection title="8. Deletion of Data from Meta-Connected Services">
        <p>
          If your data was collected through a Meta product (such as Facebook Login or WhatsApp), please note:
        </p>
        <BulletList items={[
          'We will delete our copy of the data upon your verified request.',
          'To request deletion of data held directly by Meta, you must use Meta\'s own data deletion tools via your Facebook/Instagram account settings.',
          'Meta\'s Privacy Policy governs data stored on Meta\'s infrastructure.',
          'Our deletion of data from our systems does not automatically delete data held by Meta.',
        ]} />
        <p className="mt-3">
          For Meta data deletion: visit <a href="https://www.facebook.com/help/contact/540977946302970" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">Facebook's Data Deletion Instructions</a>.
        </p>
      </LegalSection>

      <LegalSection title="9. Post-Deletion">
        <p>
          Once your data is deleted:
        </p>
        <BulletList items={[
          'You will no longer be able to access any account or service tied to that data',
          'Active service contracts may be terminated as a result of the deletion',
          'You will receive a final confirmation email once primary deletion is complete',
          'If you wish to re-engage our services in the future, you will be treated as a new user',
        ]} />
      </LegalSection>

      <LegalSection title="10. Contact for Data Deletion">
        <p>For any questions about the deletion process, please contact us:</p>
        <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-3 space-y-1 text-sm text-dark">
          <p className="font-medium">Data Privacy Team – MLV Enterprises</p>
          <p>Email: <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a></p>
          <p>WhatsApp: <a href="https://wa.me/919087918939" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">+91 90879 18939</a></p>
          <p>Address: 200ft Road, near KFC, Thillai Nagar, Mahavir Nagar, Kolathur, Chennai, Tamil Nadu – 600099</p>
          <p className="text-light-muted text-xs pt-1">Business hours: Mon–Sat, 9:00 AM – 6:00 PM IST</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
