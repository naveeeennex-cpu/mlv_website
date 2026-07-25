import LegalLayout, {
  LegalSection,
  LegalSubSection,
  BulletList,
  InfoBox,
} from '../components/LegalLayout';

export default function TermsConditions() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Please read these Terms & Conditions carefully before using our website or engaging our services. These terms constitute a legally binding agreement between you and MLV Enterprises."
      lastUpdated="May 7, 2026"
    >
      <InfoBox>
        By accessing our website at <strong>www.mlventerprises.in</strong>, placing a service order, or using any of our products or solutions, you confirm that you have read, understood, and agreed to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please discontinue use immediately.
      </InfoBox>

      <LegalSection title="1. Definitions">
        <p>In these Terms & Conditions, the following definitions apply:</p>
        <BulletList items={[
          '"Company," "we," "us," or "our" refers to MLV Enterprises, a business entity registered in Tamil Nadu, India.',
          '"Client," "you," or "your" refers to any individual, sole proprietor, partnership, company, or other entity that engages our services or uses our website.',
          '"Services" means all AI automation solutions, WhatsApp bot development, custom software, digital services, and business automation solutions provided by us.',
          '"Platform" means our website at www.mlventerprises.in and any associated web applications, dashboards, or APIs.',
          '"Agreement" means the service agreement, proposal, or purchase order executed between you and the Company, read together with these Terms.',
          '"Content" means all text, code, software, graphics, data, and other materials created or delivered under any Agreement.',
        ]} />
      </LegalSection>

      <LegalSection title="2. Description of Services">
        <p>MLV Enterprises offers the following categories of services:</p>
        <LegalSubSection title="2.1 AI Automation Solutions">
          <p>Design and deployment of artificial intelligence workflows to automate repetitive business processes, including document processing, lead qualification, and customer interaction automation.</p>
        </LegalSubSection>
        <LegalSubSection title="2.2 WhatsApp Bot Solutions">
          <p>Development and integration of WhatsApp Business API-powered chatbots, including conversational flows, campaign broadcasting, CRM integration, and intelligent message routing. All WhatsApp-related services are subject to Meta's WhatsApp Business Policy and Acceptable Use Policy.</p>
        </LegalSubSection>
        <LegalSubSection title="2.3 Custom Software Development">
          <p>Bespoke application development including web applications, mobile applications, REST APIs, SaaS platforms, and database systems tailored to client specifications.</p>
        </LegalSubSection>
        <LegalSubSection title="2.4 Digital Services">
          <p>Digital marketing support, website development, SEO integrations, CRM setup, and online business tools implementation.</p>
        </LegalSubSection>
        <LegalSubSection title="2.5 Business Automation Consulting">
          <p>Strategic consulting on process automation, technology stack selection, API integrations, and operational efficiency improvement.</p>
        </LegalSubSection>
        <p className="mt-3">
          Service scope, timelines, deliverables, and pricing are defined in individual project proposals or service agreements executed separately. These Terms govern all such engagements unless otherwise expressly stated in writing.
        </p>
      </LegalSection>

      <LegalSection title="3. User Eligibility">
        <BulletList items={[
          'You must be at least 18 years of age to enter into a service agreement with us.',
          'If engaging on behalf of a business entity, you represent that you have the legal authority to bind that entity.',
          'Our services are intended for legitimate business use only. Personal use of enterprise-grade automation tools may be subject to additional terms.',
          'We reserve the right to refuse service to any individual or entity at our discretion, without being required to disclose our reason.',
        ]} />
      </LegalSection>

      <LegalSection title="4. Account Registration and Security">
        <p>
          Certain services require you to register an account or access a client dashboard. By registering, you agree to:
        </p>
        <BulletList items={[
          'Provide accurate, current, and complete information during registration',
          'Maintain the security of your login credentials and not share them with any third party',
          'Notify us immediately at sales@mlventerprises.in if you suspect unauthorised access to your account',
          'Accept responsibility for all activities that occur under your account credentials',
        ]} />
        <p className="mt-3">
          We are not liable for any loss or damage arising from your failure to comply with these security obligations. We reserve the right to terminate accounts that display suspicious activity or breach these Terms.
        </p>
      </LegalSection>

      <LegalSection title="5. Intellectual Property">
        <LegalSubSection title="5.1 Our IP">
          <p>
            All proprietary software, frameworks, templates, methodologies, documentation, and tools developed by MLV Enterprises prior to or independent of any client engagement remain the exclusive intellectual property of the Company. Nothing in any service agreement transfers ownership of our underlying IP to you.
          </p>
        </LegalSubSection>
        <LegalSubSection title="5.2 Work Product">
          <p>
            Custom deliverables developed specifically for a client under a signed service agreement will be assigned to the client upon receipt of full payment, unless otherwise stipulated in the agreement. The Company retains the right to use anonymised, non-identifiable aspects of work for portfolio, case studies, and capability demonstrations unless the client requests confidentiality in writing.
          </p>
        </LegalSubSection>
        <LegalSubSection title="5.3 Your Content">
          <p>
            You retain ownership of all data, content, logos, and materials you provide to us. By providing such materials, you grant us a limited, non-exclusive licence to use them solely for the purpose of delivering the agreed services.
          </p>
        </LegalSubSection>
        <LegalSubSection title="5.4 Third-Party Licences">
          <p>
            Where our deliverables incorporate open-source libraries or third-party components, such components remain governed by their respective licences (e.g., MIT, Apache 2.0). We will disclose relevant third-party components upon request.
          </p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="6. User Responsibilities">
        <p>As a client or user of our services, you agree to:</p>
        <BulletList items={[
          'Provide timely, accurate, and complete requirements, content, and feedback necessary for project delivery',
          'Ensure that any data or content you provide does not infringe third-party intellectual property rights',
          'Maintain all necessary licences, consents, and regulatory approvals required to use our deliverables within your business context',
          'Use our WhatsApp bot solutions and automation tools strictly in compliance with Meta\'s Acceptable Use Policy and applicable Indian law',
          'Not exceed any API usage limits or rate limits stipulated in your service agreement',
          'Inform us promptly of any changes in business requirements that may affect ongoing service delivery',
        ]} />
      </LegalSection>

      <LegalSection title="7. Prohibited Uses">
        <p>You must not use our services or platform for any of the following:</p>
        <BulletList items={[
          'Sending spam, unsolicited bulk messages, or phishing communications via WhatsApp or any other channel',
          'Distributing malware, viruses, ransomware, or any other malicious code',
          'Violating any applicable local, national, or international law or regulation',
          'Engaging in fraudulent, deceptive, or misleading business practices',
          'Collecting or harvesting personal data without lawful consent in violation of data protection laws',
          'Using our AI or automation tools to generate or disseminate misinformation, hate speech, or discriminatory content',
          'Circumventing or attempting to breach the security or authentication systems of our platform or any third-party systems',
          'Reverse engineering, decompiling, or disassembling any proprietary software or algorithms we provide',
          'Reselling, sublicensing, or white-labelling our services without our prior written consent',
          'Impersonating MLV Enterprises, our employees, or any other person or entity',
        ]} />
        <p className="mt-3">
          We reserve the right to immediately suspend or terminate your access and report to law enforcement if we detect prohibited usage.
        </p>
      </LegalSection>

      <LegalSection title="8. Payment Terms">
        <LegalSubSection title="8.1 Fees and Invoicing">
          <p>Service fees are agreed upon in writing in individual proposals or contracts. All amounts are in Indian Rupees (INR) unless otherwise specified. Invoices are issued as per the milestone or payment schedule outlined in the agreement.</p>
        </LegalSubSection>
        <LegalSubSection title="8.2 Payment Due Dates">
          <p>Invoices are due within 7 days of issuance unless a different period is specified in the agreement. Late payments may attract a monthly interest charge of 1.5% or the maximum rate permitted by law, whichever is lower.</p>
        </LegalSubSection>
        <LegalSubSection title="8.3 Taxes">
          <p>All fees are exclusive of Goods and Services Tax (GST) and any other applicable taxes. GST will be charged at the prevailing rate and shown separately on invoices. You are responsible for any withholding taxes or duties applicable under your jurisdiction.</p>
        </LegalSubSection>
        <LegalSubSection title="8.4 Non-Payment">
          <p>In the event of non-payment, we reserve the right to suspend service delivery, withhold deliverables, and pursue legal recovery of outstanding dues including reasonable legal fees and collection costs.</p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="9. Service Delivery and Timelines">
        <BulletList items={[
          'Project timelines are estimates based on the information available at the time of proposal and are subject to change if requirements evolve or client approvals are delayed.',
          'We will communicate any material delays in writing and work collaboratively to reschedule milestones.',
          'Delays caused by the client\'s failure to provide required materials, approvals, or access will not constitute a breach by us.',
          'We reserve the right to engage qualified sub-contractors to assist with delivery, while retaining overall accountability for quality.',
        ]} />
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable Indian law:
        </p>
        <BulletList items={[
          'Our total aggregate liability to you for any claim arising out of or in connection with any service agreement shall not exceed the total fees paid by you for the specific service giving rise to the claim in the three (3) months preceding the event.',
          'We shall not be liable for any indirect, incidental, consequential, special, or exemplary damages, including but not limited to loss of profits, loss of data, loss of goodwill, or business interruption.',
          'We are not liable for failures or delays caused by circumstances beyond our reasonable control, including force majeure events, internet outages, third-party API failures, or regulatory changes.',
          'We do not warrant that our services will be uninterrupted, error-free, or free from security vulnerabilities, though we undertake reasonable efforts to maintain service quality.',
        ]} />
      </LegalSection>

      <LegalSection title="11. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless MLV Enterprises, its directors, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
        </p>
        <BulletList items={[
          'Your violation of these Terms & Conditions or any applicable law',
          'Your use of our services in a manner not authorised under these Terms',
          'Any content or data you provide that infringes third-party rights',
          'Disputes between you and your end-users arising from your use of our deliverables',
        ]} />
      </LegalSection>

      <LegalSection title="12. Account Suspension and Termination">
        <LegalSubSection title="12.1 By Us">
          <p>We may suspend or terminate your access to our services immediately and without prior notice if:</p>
          <BulletList items={[
            'You breach any material provision of these Terms',
            'You engage in prohibited use as described in Section 7',
            'Payment obligations remain unfulfilled beyond the grace period',
            'We receive a valid legal or regulatory direction to do so',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="12.2 By You">
          <p>You may terminate a service engagement by providing written notice as specified in your service agreement. Termination fees may apply for early exit from fixed-term contracts.</p>
        </LegalSubSection>
        <LegalSubSection title="12.3 Effect of Termination">
          <p>Upon termination, we will cease active work, provide a final invoice for completed deliverables, and return or delete your data in accordance with our Privacy Policy. Provisions relating to IP, liability, indemnification, and dispute resolution survive termination.</p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="13. Confidentiality">
        <p>
          Both parties agree to maintain strict confidentiality of any non-public information, trade secrets, or business data exchanged during the engagement. This obligation survives termination for a period of three (3) years. Neither party shall disclose the other's Confidential Information to any third party without prior written consent, except as required by law or in the performance of agreed services.
        </p>
      </LegalSection>

      <LegalSection title="14. Dispute Resolution">
        <LegalSubSection title="14.1 Informal Resolution">
          <p>In the event of any dispute, both parties agree to first attempt resolution through good-faith negotiation within 30 days of the dispute being raised in writing.</p>
        </LegalSubSection>
        <LegalSubSection title="14.2 Arbitration">
          <p>If informal resolution fails, disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996 (India). The arbitration shall be conducted in Chennai, Tamil Nadu, in the English language, by a sole arbitrator mutually agreed upon by both parties.</p>
        </LegalSubSection>
        <LegalSubSection title="14.3 Courts">
          <p>Notwithstanding the above, either party may seek urgent injunctive or equitable relief from the courts having jurisdiction in Chennai, Tamil Nadu, India.</p>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="15. Governing Law">
        <p>
          These Terms & Conditions are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, the Contract Act, 1872, and the Digital Personal Data Protection Act, 2023. The courts of Chennai, Tamil Nadu shall have exclusive jurisdiction over any disputes not resolved through arbitration.
        </p>
      </LegalSection>

      <LegalSection title="16. Severability and Waiver">
        <p>
          If any provision of these Terms is found to be unenforceable or invalid, that provision will be modified to the minimum extent necessary to make it enforceable, while the remaining provisions continue in full force. Our failure to enforce any right or provision does not constitute a waiver of that right.
        </p>
      </LegalSection>

      <LegalSection title="17. Modifications to These Terms">
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be communicated via email to registered clients and/or via a notice on our website at least 14 days before the changes take effect. Continued use of our services after the effective date constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="18. Contact Us">
        <p>For questions about these Terms & Conditions, please contact:</p>
        <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-3 space-y-1 text-sm text-dark">
          <p className="font-medium">MLV Enterprises – Legal Queries</p>
          <p>Email: <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a></p>
          <p>Phone: <a href="tel:+919087918939" className="text-gold hover:underline">+91 90879 18939</a></p>
          <p>Address: 200ft Road, near KFC, Thillai Nagar, Mahavir Nagar, Kolathur, Chennai, Tamil Nadu – 600099</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
