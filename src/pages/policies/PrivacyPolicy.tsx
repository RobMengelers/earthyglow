import { PolicyLayout } from '../../components/layout/PolicyLayout'

export function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" updated="21 September 2026">
      <p>
        This policy explains how EarthyGlow handles personal data when you use
        this website, contact us, or place an order. EarthyGlow is operated by
        Naomi. Our Chamber of Commerce number is 42049155 and our VAT number is
        NL005456394B38.
      </p>

      <h2>What we collect</h2>
      <p>Depending on how you use the site, we may receive:</p>
      <ul>
        <li>your name, email address, phone number and delivery address when you check out;</li>
        <li>your order, payment method, delivery and return details;</li>
        <li>your name, email address and message when you contact us;</li>
        <li>technical information needed to keep the site secure and working; and</li>
        <li>the items in your cart, stored locally in your browser so the cart works between pages.</li>
      </ul>
      <p>We do not ask you to create an account and do not collect card details ourselves. Payments are handled by our payment provider.</p>

      <h2>Why we use your data</h2>
      <ul>
        <li>To take and fulfil your order, arrange delivery, process refunds and send order updates (contract).</li>
        <li>To keep accounting and tax records and meet other legal duties (legal obligation).</li>
        <li>To answer messages, prevent misuse and secure the website (legitimate interests).</li>
      </ul>
      <p>We do not currently send newsletters, run behavioural advertising or use analytics or advertising cookies. We will ask for consent before introducing optional marketing that needs it.</p>

      <h2>Who receives your data</h2>
      <p>We share only what is needed with service providers that help us run the shop: Mollie for payments, Resend for transactional and contact emails, our hosting and database providers (including Netlify and Railway), and delivery partners when needed to deliver an order. We may disclose data to authorities where the law requires it. These providers process data under their own terms and, where relevant, data-processing agreements.</p>

      <h2>Emails and contact forms</h2>
      <p>We use your email address to send receipts, fulfilment updates and other messages directly related to your order. A message sent through the contact form is forwarded to us so we can reply; it is not added to a marketing list.</p>

      <h2>Cookies and local storage</h2>
      <p>The shop uses necessary browser storage for your cart. The app does not currently set analytics or advertising cookies. Links to social media open the third-party site rather than embedding a social widget here. Hosting or payment providers may use their own technical cookies when you visit their services; their privacy policies apply there.</p>

      <h2>How long we keep data</h2>
      <p>We keep order and payment records for as long as needed to fulfil the order, handle returns or disputes, and meet accounting and tax duties. Contact messages are kept for as long as needed to respond and manage the relationship. We then delete or anonymise data when there is no longer a lawful reason to keep it. We do not promise a fixed period where legal obligations require a different one.</p>

      <h2>Your rights</h2>
      <p>Under the GDPR, you can ask for access to, correction or deletion of your personal data, restriction of processing, or object to processing based on legitimate interests. Where applicable, you can also request data portability or withdraw consent. Email your request to <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. We may need to verify your identity, and some records must be retained to meet legal obligations.</p>

      <h2>International transfers</h2>
      <p>Some providers may process data outside the European Economic Area. We use the safeguards required by applicable data-protection law, such as an adequacy decision or standard contractual clauses where needed. See the relevant provider&apos;s privacy information for its current locations and safeguards.</p>

      <h2>Security and children</h2>
      <p>We use reasonable technical and organisational measures to protect your data, but no online transmission or storage can be guaranteed to be completely secure. The shop is not directed at children and we do not knowingly collect children&apos;s personal data.</p>

      <h2>Questions and complaints</h2>
      <p>For privacy questions or requests, contact <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. You can also complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) or the supervisory authority where you live or work.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy when the website, our providers or the law changes. The date at the top shows when it was last updated.</p>
    </PolicyLayout>
  )
}
