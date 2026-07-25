import LegalLayout, {
  LegalSection,
  LegalSubSection,
  BulletList,
  InfoBox,
} from '../components/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="This Privacy Policy explains how MLV Enterprises collects, uses, discloses, and safeguards your information when you use our website, services, APIs, and WhatsApp-based communication tools."
      lastUpdated="May 7, 2026"
    >
      <InfoBox>
        Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by this policy. If you do not agree with any part of this policy, please discontinue use of our services immediately.
      </InfoBox>

      <LegalSection title="1. About MLV Enterprises">
        <p>
          MLV Enterprises ("we," "our," or "us") is a technology company registered in India, providing AI automation solutions, WhatsApp bot development, custom software development, digital services, and business automation solutions. Our registered office is located at:
        </p>
        <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-3 space-y-1 text-sm text-dark">
          <p className="font-medium">MLV Enterprises</p>
          <p>200ft Road, near KFC, Thillai Nagar, Mahavir Nagar,</p>
          <p>Kolathur, Chennai, Tamil Nadu – 600099</p>
          <p>Email: <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a></p>
          <p>Phone: <a href="tel:+919087918939" className="text-gold hover:underline">+91 90879 18939</a></p>
          <p>Website: <a href="https://www.mlventerprises.in" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">www.mlventerprises.in</a></p>
        </div>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>
          We collect information you voluntarily provide and information that is automatically generated when you interact with our services. The categories of data we collect include:
        </p>
        <LegalSubSection title="2.1 Personal Identification Information">
          <BulletList items={[
            'Full name, email address, and phone number submitted via contact forms or service registrations',
            'Business name and designation when engaging with our B2B services',
            'Billing address and GST/PAN details for invoice generation (when applicable)',
            'Government-issued identification, only when required for regulatory compliance',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.2 Communication Data">
          <BulletList items={[
            'Messages, queries, and attachments you send via WhatsApp, email, or our website contact forms',
            'Chat transcripts generated through our WhatsApp bot integrations',
            'Feedback, reviews, and survey responses provided by you',
            'Support tickets and helpdesk communications',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.3 Technical and Usage Data">
          <BulletList items={[
            'IP address, browser type and version, operating system, and device identifiers',
            'Pages visited, time spent on pages, links clicked, and referral URLs',
            'API request logs, endpoint usage patterns, and integration activity',
            'Error reports, crash logs, and performance diagnostics',
            'Cookies, session tokens, and similar tracking technologies (see Section 6)',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.4 WhatsApp and Messaging Platform Data">
          <p>
            When you interact with our WhatsApp Business API-powered bots or automation workflows, we may collect:
          </p>
          <BulletList items={[
            'Your WhatsApp phone number (WAID) and display name as provided by WhatsApp',
            'Message content exchanged within the bot conversation flow',
            'Timestamps of message delivery and read receipts',
            'User inputs and form responses submitted through interactive WhatsApp messages',
            'Opt-in and opt-out preferences for messaging campaigns',
          ]} />
          <p className="mt-3 text-xs text-light-muted italic">
            Note: We operate as a WhatsApp Business Solution Provider (BSP) partner and comply with Meta's Messaging Policy and Commercial Policy. All WhatsApp data handling is governed by Meta's terms in addition to this Privacy Policy.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <p>We process your personal data for the following legitimate purposes:</p>
        <LegalSubSection title="3.1 Service Delivery">
          <BulletList items={[
            'Developing, deploying, and maintaining custom software, bots, and automation workflows on your behalf',
            'Sending transactional WhatsApp messages such as order confirmations, appointment reminders, and service updates',
            'Providing customer support and resolving technical issues',
            'Managing user accounts and authenticating access to client dashboards',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="3.2 Business Operations">
          <BulletList items={[
            'Processing payments, generating invoices, and maintaining financial records as required by Indian law',
            'Communicating service updates, project milestones, and important notices',
            'Conducting internal analytics to improve our products and services',
            'Detecting, preventing, and investigating fraudulent or unauthorised activities',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="3.3 Marketing Communications">
          <BulletList items={[
            'Sending promotional messages, newsletters, and product announcements via email or WhatsApp, only with your explicit consent',
            'Retargeting campaigns based on browsing behaviour (you may opt out at any time)',
            'Personalising content and offers based on your service history',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="3.4 Legal and Compliance">
          <BulletList items={[
            'Complying with applicable laws including the Information Technology Act, 2000, IT (Amendment) Act, 2008, and the Digital Personal Data Protection Act, 2023 (DPDPA)',
            'Responding to legal requests, court orders, or government inquiries',
            'Enforcing our Terms & Conditions and protecting our legal rights',
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="4. WhatsApp Business Communication">
        <p>
          We use the WhatsApp Business API, provided by Meta Platforms, Inc., to communicate with customers and deliver automated messaging services. By opting in to our WhatsApp communications, you expressly consent to:
        </p>
        <BulletList items={[
          'Receiving transactional and service-related messages through WhatsApp',
          'Engaging with AI-powered chatbots that may collect inputs to fulfil your requests',
          'Having your conversation data processed by Meta\'s infrastructure in accordance with Meta\'s Privacy Policy',
          'Receiving template messages approved under WhatsApp Business API guidelines',
        ]} />
        <p className="mt-3">
          <strong className="text-dark">Opt-Out:</strong> You may opt out of WhatsApp communications at any time by replying "STOP" to any message, or by contacting us at <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a>. Opting out will stop marketing messages but may not affect critical transactional notifications required to fulfil active service agreements.
        </p>
        <p className="mt-3">
          Our use of the WhatsApp Business API is governed by Meta's Acceptable Use Policy and Commercial Terms. We do not use WhatsApp to send unsolicited bulk messages, spam, or content that violates Meta's policies.
        </p>
      </LegalSection>

      <LegalSection title="5. API Integrations and Third-Party Services">
        <p>
          Our services integrate with various third-party platforms and APIs to deliver functionality. Each third party has its own privacy practices that govern data processed through their platforms:
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-light-bg">
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Third-Party Service</th>
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Purpose</th>
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Data Shared</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Meta (WhatsApp Business API)', 'WhatsApp messaging delivery', 'Phone number, message content'],
                ['Google Cloud / Firebase', 'Infrastructure, database, and analytics', 'Usage logs, app data'],
                ['Razorpay / Stripe', 'Payment processing', 'Billing details (not stored by us)'],
                ['EmailJS / SMTP provider', 'Transactional emails', 'Name, email address'],
                ['OpenAI / Google Gemini', 'AI automation and chatbot intelligence', 'Conversation inputs (anonymised where possible)'],
                ['Vercel / AWS', 'Website and API hosting', 'Server logs, IP address'],
              ].map(([service, purpose, data]) => (
                <tr key={service} className="even:bg-light-bg/50">
                  <td className="px-4 py-3 border border-light-border text-dark font-medium">{service}</td>
                  <td className="px-4 py-3 border border-light-border">{purpose}</td>
                  <td className="px-4 py-3 border border-light-border">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          We take reasonable steps to ensure all third-party integrations comply with applicable data protection standards. We do not sell your personal data to any third party for monetary consideration.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and Tracking Technologies">
        <p>
          Our website uses cookies and similar technologies to enhance your browsing experience. We use the following categories of cookies:
        </p>
        <LegalSubSection title="Strictly Necessary Cookies">
          <p>Required for the website to function. These cannot be disabled. Examples include session cookies and CSRF protection tokens.</p>
        </LegalSubSection>
        <LegalSubSection title="Performance & Analytics Cookies">
          <p>Help us understand how visitors interact with the site (e.g., Google Analytics). Data collected is aggregated and anonymised.</p>
        </LegalSubSection>
        <LegalSubSection title="Functional Cookies">
          <p>Remember your preferences such as language, region, or previously filled form data to improve your experience.</p>
        </LegalSubSection>
        <LegalSubSection title="Marketing Cookies">
          <p>Used for retargeting and personalised advertising. These are only set with your prior consent via our cookie consent banner.</p>
        </LegalSubSection>
        <p className="mt-3">
          You may withdraw cookie consent at any time by adjusting your browser settings or clearing stored cookies. Note that disabling cookies may affect the functionality of certain features on our website.
        </p>
      </LegalSection>

      <LegalSection title="7. Data Sharing and Disclosure">
        <p>We do not sell, trade, or rent your personal information. We may disclose data in the following limited circumstances:</p>
        <BulletList items={[
          'To service providers and sub-processors who assist in delivering our services, under strict data processing agreements',
          'To Meta Platforms, Inc. as required to operate WhatsApp Business API communications',
          'To law enforcement or government bodies when required by applicable law, court order, or legal process',
          'To our professional advisors (legal counsel, accountants) under obligations of confidentiality',
          'To a successor entity in the event of a merger, acquisition, or business transfer, with prior notice to you',
          'With your explicit consent for any other disclosure not covered above',
        ]} />
      </LegalSection>

      <LegalSection title="8. Data Retention">
        <p>
          We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law:
        </p>
        <BulletList items={[
          'Account and contact data: Retained for the duration of the business relationship, plus 3 years thereafter',
          'Financial records and invoices: 7 years, as required under Indian accounting and tax laws',
          'WhatsApp message logs: 90 days from date of conversation, unless required for active dispute resolution',
          'Technical logs and analytics: Rolling 12-month window',
          'Marketing consent records: Until withdrawn, plus 2 years for audit purposes',
        ]} />
        <p className="mt-3">
          Upon expiry of the applicable retention period, or upon a verified deletion request, data is securely erased or anonymised in accordance with our data destruction procedures.
        </p>
      </LegalSection>

      <LegalSection title="9. Your Rights Under Indian and Global Data Protection Laws">
        <p>
          In accordance with the Digital Personal Data Protection Act, 2023 (India) and principles consistent with the GDPR (EU), you have the following rights regarding your personal data:
        </p>
        <BulletList items={[
          'Right to Access: Request a copy of the personal data we hold about you',
          'Right to Correction: Request correction of inaccurate or incomplete personal data',
          'Right to Erasure: Request deletion of your personal data (subject to legal obligations)',
          'Right to Data Portability: Request your data in a structured, machine-readable format',
          'Right to Withdraw Consent: Withdraw consent for marketing or non-essential processing at any time',
          'Right to Grievance Redressal: Lodge a complaint with us or with a competent authority',
          'Right to Nominate: Nominate another individual to exercise your rights on your behalf in the event of incapacity',
        ]} />
        <p className="mt-3">
          To exercise any of these rights, contact our Data Grievance Officer at: <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a>. We will acknowledge your request within 72 hours and resolve it within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="10. Data Deletion">
        <p>
          You may request the deletion of your personal data at any time. Please visit our{' '}
          <a href="/data-deletion" className="text-gold hover:underline">Data Deletion Instructions</a> page for a detailed step-by-step process. In summary:
        </p>
        <BulletList items={[
          'Send a deletion request email to sales@mlventerprises.in with the subject line "Data Deletion Request"',
          'Include your registered name, phone number, and/or email address for verification',
          'We will confirm receipt within 72 hours and complete the deletion within 30 days',
          'You will receive a written confirmation once your data has been deleted',
        ]} />
      </LegalSection>

      <LegalSection title="11. Data Security">
        <p>
          We implement industry-standard technical and organisational security measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include:
        </p>
        <BulletList items={[
          'TLS/SSL encryption for all data transmitted between your browser and our servers',
          'AES-256 encryption for sensitive data at rest',
          'Role-based access controls (RBAC) limiting data access to authorised personnel only',
          'Regular security audits, vulnerability assessments, and penetration testing',
          'Multi-factor authentication for all internal administrative systems',
          'Secure backup and disaster recovery protocols',
        ]} />
        <p className="mt-3">
          Despite these measures, no method of data transmission over the internet is 100% secure. In the event of a data breach that poses a risk to your rights, we will notify you and the relevant authorities within the timeframes required by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="12. Children's Privacy">
        <p>
          Our services are not directed at children under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately at <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a> and we will delete such data promptly.
        </p>
      </LegalSection>

      <LegalSection title="13. Cross-Border Data Transfers">
        <p>
          Our servers and third-party providers may be located in countries outside India, including the United States and the European Union. By using our services, you consent to the transfer of your data to these jurisdictions. We ensure such transfers are subject to adequate protection mechanisms, including contractual obligations equivalent to those required under Indian law.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to This Privacy Policy">
        <p>
          We reserve the right to update this Privacy Policy at any time to reflect changes in our practices, legal obligations, or service offerings. When we make material changes, we will:
        </p>
        <BulletList items={[
          'Update the "Last Updated" date at the top of this page',
          'Send a notification to your registered email address (where applicable)',
          'Display a prominent notice on our website for a minimum of 14 days',
        ]} />
        <p className="mt-3">
          Continued use of our services after the effective date of any revised policy constitutes your acceptance of the changes.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact and Grievance Redressal">
        <p>
          For any questions, concerns, or requests relating to this Privacy Policy, please reach out to our designated Data Grievance Officer:
        </p>
        <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-3 space-y-1 text-sm text-dark">
          <p className="font-medium">Data Grievance Officer – MLV Enterprises</p>
          <p>Email: <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a></p>
          <p>Phone: <a href="tel:+919087918939" className="text-gold hover:underline">+91 90879 18939</a></p>
          <p>Address: 200ft Road, near KFC, Thillai Nagar, Mahavir Nagar, Kolathur, Chennai, Tamil Nadu – 600099</p>
          <p className="text-light-muted text-xs pt-1">Response time: Within 72 hours on business days (Mon–Sat, 9:00 AM – 6:00 PM IST)</p>
        </div>
        <p className="mt-3 text-xs text-light-muted">
          If you are not satisfied with our response, you may file a complaint with the Data Protection Board of India once constituted under the Digital Personal Data Protection Act, 2023, or with any other competent authority having jurisdiction.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
