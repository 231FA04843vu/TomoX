import React from "react";

function Privacy() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <p className="legal-eyebrow">TomoX Legal</p>
        <h1>Privacy Policy</h1>
        <p className="legal-subtitle">
          This Privacy Policy explains how TomoX collects, uses, and protects
          your personal information when you use our services.
        </p>
        <p className="legal-updated">Last updated: February 17, 2026</p>
      </header>

      <section className="legal-section">
        <h2>1. Information We Collect</h2>
        <ul>
          <li>Account details such as name, phone number, and email address.</li>
          <li>Delivery information like addresses and location data.</li>
          <li>Order history, cart contents, and preferences.</li>
          <li>Device data, IP address, and usage analytics.</li>
          <li>Support interactions and feedback.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To process orders, payments, and deliveries.</li>
          <li>To personalize recommendations and search results.</li>
          <li>To improve service reliability and user experience.</li>
          <li>To communicate order updates, promotions, or policy changes.</li>
          <li>To prevent fraud and enforce platform policies.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Sharing of Information</h2>
        <p>
          We may share information with vendors, delivery partners, and service
          providers strictly to fulfill orders and maintain the platform. We do
          not sell personal data.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. Location Data</h2>
        <p>
          If you enable location access, we use it to show nearby restaurants,
          estimate delivery times, and enhance service accuracy. You can disable
          location access in your device settings.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Cookies and Tracking</h2>
        <p>
          TomoX uses cookies and similar technologies to keep you signed in,
          remember preferences, and measure performance. You can control cookie
          settings through your browser.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Data Retention</h2>
        <p>
          We retain personal information only for as long as needed to provide
          services, meet legal requirements, resolve disputes, and enforce our
          agreements.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Security</h2>
        <p>
          We implement security safeguards to protect your data. However, no
          system can be guaranteed to be completely secure.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Your Choices and Rights</h2>
        <ul>
          <li>Update or correct your account information at any time.</li>
          <li>Request account deletion, subject to legal obligations.</li>
          <li>Opt out of marketing communications.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>9. Children's Privacy</h2>
        <p>
          TomoX is not intended for children under 18. We do not knowingly
          collect data from minors.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. International Transfers</h2>
        <p>
          If you access TomoX from outside our primary operating region, your
          data may be transferred and processed in other countries.
        </p>
      </section>

      <section className="legal-section">
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Continued use of the
          platform means you accept the revised policy.
        </p>
      </section>

      <section className="legal-section">
        <h2>12. Contact Us</h2>
        <p>
          For privacy questions, contact us through the Help section in the
          app.
        </p>
      </section>
    </div>
  );
}

export default Privacy;
