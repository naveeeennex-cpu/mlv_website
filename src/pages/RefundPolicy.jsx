import LegalLayout, {
  LegalSection,
  LegalSubSection,
  BulletList,
  InfoBox,
} from '../components/LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund Policy"
      subtitle="This Refund Policy outlines the terms under which MLV Enterprises processes refunds for our software development, AI automation, WhatsApp bot solutions, and digital services."
      lastUpdated="May 7, 2026"
    >
      <InfoBox>
        All refund requests are evaluated on a case-by-case basis. To initiate a refund, contact us at <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a> within the applicable window specified below. We are committed to fair and transparent resolution of all refund requests.
      </InfoBox>

      <LegalSection title="1. Overview">
        <p>
          MLV Enterprises provides technology services including AI automation, custom software development, WhatsApp bot solutions, and digital consulting. Due to the nature of professional services and digital deliverables, our refund eligibility criteria differ from those applicable to physical product retailers.
        </p>
        <p className="mt-3">
          We are committed to client satisfaction. Before pursuing a formal refund, we strongly encourage clients to first raise a support request or service complaint, giving us the opportunity to resolve the issue directly. Most concerns can be addressed without the need for a refund.
        </p>
      </LegalSection>

      <LegalSection title="2. Service Categories and Refund Eligibility">
        <LegalSubSection title="2.1 Custom Software Development and AI Automation Projects">
          <p>For bespoke development projects (fixed-price or milestone-based):</p>
          <BulletList items={[
            'Advance/retainer payments are refundable only if work has not yet commenced (within 48 hours of payment).',
            'Milestone payments are non-refundable once a milestone has been delivered and accepted by the client.',
            'If a milestone is not delivered within the agreed timeline due to our fault, the client is entitled to a full refund of that milestone amount.',
            'Partial refunds may be issued for partially completed milestones, calculated proportionally based on work completed at the time of cancellation.',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.2 WhatsApp Bot Solutions">
          <p>For WhatsApp bot development and integration services:</p>
          <BulletList items={[
            'Setup and integration fees are non-refundable once the bot has been deployed to a WhatsApp Business number.',
            'If the bot fails to function as per the agreed specifications due to our error, we will first provide corrective development at no additional charge.',
            'If we are unable to resolve a critical functional defect within 14 business days of it being reported, a full refund of the affected milestone may be issued.',
            'Monthly maintenance or hosting fees are billed in advance and are non-refundable for the current billing period.',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.3 Monthly Subscription and Retainer Services">
          <p>For ongoing retainer arrangements, monthly support plans, or subscription-based automation services:</p>
          <BulletList items={[
            'Cancellations made before the 5th of the current billing month will be processed without charge for the upcoming month.',
            'Cancellations after the 5th are effective from the following billing cycle; no refund is issued for the current month.',
            'If we fail to deliver the agreed service level for an entire billing period, a pro-rated refund will be considered upon written request.',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.4 Digital Consulting and Strategy Services">
          <p>For one-time consulting sessions, strategy documents, or advisory services:</p>
          <BulletList items={[
            'Cancellations made more than 24 hours before a scheduled session are eligible for a full refund or rescheduling.',
            'Cancellations within 24 hours of the session are eligible for a 50% refund or credit toward a future session.',
            'Delivered strategy documents, reports, or written deliverables are non-refundable once sent.',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="2.5 Website and Landing Page Development">
          <p>For website design and development projects:</p>
          <BulletList items={[
            'Initial design deposits are refundable only within 48 hours of payment if no design work has been initiated.',
            'Once wireframes or initial designs are presented, the deposit becomes non-refundable.',
            'Remaining balances are due upon project completion and are non-refundable after sign-off.',
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="3. Non-Refundable Items">
        <p>The following are non-refundable under any circumstances:</p>
        <BulletList items={[
          'Government-mandated taxes, including GST collected and remitted to the relevant authority',
          'Third-party licence fees, API subscription costs, or cloud infrastructure charges already paid on your behalf',
          'Domain registration, SSL certificates, and hosting fees once provisioned',
          'WhatsApp Business API meta-costs incurred through Meta\'s platform (conversation fees, WABA registration costs)',
          'Services fully delivered and formally accepted in writing by the client',
          'Emergency or expedited service surcharges',
          'Training sessions and workshops once conducted',
        ]} />
      </LegalSection>

      <LegalSection title="4. How to Request a Refund">
        <p>To initiate a refund request, follow these steps:</p>
        <div className="space-y-4 mt-3">
          {[
            {
              num: '01',
              title: 'Submit a Written Request',
              body: 'Send an email to sales@mlventerprises.in with the subject "Refund Request – [Invoice/Project Reference]". Include your name, business name, the service in question, reason for the refund, and relevant invoice number.',
            },
            {
              num: '02',
              title: 'Acknowledgement',
              body: 'We will acknowledge your request within 2 business days and assign it a support reference number for tracking.',
            },
            {
              num: '03',
              title: 'Review and Assessment',
              body: 'Our team will review the request against the deliverables, timelines, and the terms of your service agreement. We may request additional information or documentation.',
            },
            {
              num: '04',
              title: 'Resolution',
              body: 'We will communicate our decision within 7–14 business days. If approved, the refund will be processed to the original payment method.',
            },
          ].map(({ num, title, body }) => (
            <div key={num} className="flex gap-4 p-4 border border-light-border rounded-xl">
              <div className="text-2xl font-bold text-gold shrink-0 w-8">{num}</div>
              <div>
                <p className="text-sm font-semibold text-dark mb-1">{title}</p>
                <p className="text-xs text-light-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="5. Refund Processing Time">
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-light-bg">
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Payment Method</th>
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Processing Time</th>
                <th className="text-left px-4 py-3 border border-light-border font-semibold text-dark">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['UPI (GPay, PhonePe, Paytm)', '2–5 business days', 'Direct reversal to source account'],
                ['NEFT / IMPS Bank Transfer', '3–7 business days', 'Reversal to originating bank account'],
                ['Razorpay / Payment Gateway', '5–10 business days', 'Subject to gateway processing cycles'],
                ['Credit / Debit Card', '7–14 business days', 'Depends on issuing bank policy'],
                ['International Wire Transfer', '10–21 business days', 'Applicable forex charges may apply'],
              ].map(([method, time, note]) => (
                <tr key={method} className="even:bg-light-bg/50">
                  <td className="px-4 py-3 border border-light-border text-dark font-medium">{method}</td>
                  <td className="px-4 py-3 border border-light-border">{time}</td>
                  <td className="px-4 py-3 border border-light-border text-light-muted">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-light-muted">
          Refunds are always processed to the original payment method and account. We do not issue refunds to a different account or via a different payment method than that used for the original transaction.
        </p>
      </LegalSection>

      <LegalSection title="6. Partial Refunds">
        <p>
          In cases where a project is partially completed or where only certain deliverables are disputed, we may issue a partial refund calculated as follows:
        </p>
        <BulletList items={[
          'Based on the percentage of work completed versus total project scope at the time of cancellation',
          'Less any direct third-party costs already incurred (API licences, cloud setup, etc.)',
          'Subject to a mutual written agreement on the completed and incomplete portions of work',
        ]} />
        <p className="mt-3">
          Partial refunds are at the Company's discretion and will be documented via a credit note or revised invoice.
        </p>
      </LegalSection>

      <LegalSection title="7. Cancellation Policy">
        <LegalSubSection title="7.1 Cancellation by Client">
          <p>
            You may cancel a project or service by providing written notice. The following cancellation fees apply to fixed-scope projects unless otherwise specified in your agreement:
          </p>
          <BulletList items={[
            'Cancelled before work commencement: No fee; full advance refunded (minus bank charges)',
            'Cancelled after 25% completion: 25% of project fee retained',
            'Cancelled after 50% completion: 50% of project fee retained',
            'Cancelled after 75% completion: 75% of project fee retained; no refund',
            'Cancelled after delivery: No refund applicable',
          ]} />
        </LegalSubSection>
        <LegalSubSection title="7.2 Cancellation by Us">
          <p>
            In the rare event that we need to cancel a project (due to unforeseen circumstances or inability to deliver), we will:
          </p>
          <BulletList items={[
            'Provide a minimum of 7 days\' written notice',
            'Refund all payments for undelivered work in full',
            'Provide all completed work product to you at no additional cost',
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="8. Disputes and Escalation">
        <p>
          If you are not satisfied with our refund decision, you may escalate the matter by:
        </p>
        <BulletList items={[
          'Sending a formal written complaint to sales@mlventerprises.in, addressed to the Business Head',
          'Requesting mediation through the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019 (for eligible B2C transactions)',
          'Initiating arbitration as described in our Terms & Conditions',
        ]} />
        <p className="mt-3">
          We are committed to resolving all disputes fairly and in a timely manner.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>
          We reserve the right to update this Refund Policy at any time. Any changes will be posted on this page with a revised "Last Updated" date. For ongoing service contracts, the policy in effect at the time of contract execution governs refund eligibility for that engagement, unless both parties agree in writing to apply the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact for Refund Queries">
        <p>For refund-related queries or to submit a request:</p>
        <div className="bg-light-bg border border-light-border rounded-lg px-5 py-4 mt-3 space-y-1 text-sm text-dark">
          <p className="font-medium">MLV Enterprises – Finance & Billing</p>
          <p>Email: <a href="mailto:sales@mlventerprises.in" className="text-gold hover:underline">sales@mlventerprises.in</a></p>
          <p>Phone: <a href="tel:+919087918939" className="text-gold hover:underline">+91 90879 18939</a></p>
          <p>Address: 200ft Road, near KFC, Thillai Nagar, Mahavir Nagar, Kolathur, Chennai, Tamil Nadu – 600099</p>
          <p className="text-light-muted text-xs pt-1">Response time: Within 2 business days (Mon–Sat, 9:00 AM – 6:00 PM IST)</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
