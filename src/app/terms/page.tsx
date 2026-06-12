import Footer from "../../components/footer";

export const metadata = {
  title: "Privacy Policy — Nexun",
  description: "How Nexun collects, uses, shares, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="legal-page">
        <div className="legal-container">
          <p className="legal-updated">Last updated: June 12, 2026</p>
          <h1 className="legal-title">Privacy Policy</h1>

          <p className="legal-intro">
            Nexun (&quot;Nexun&quot;, &quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) provides an AI-powered resume analysis
            platform (the &quot;Service&quot;). This Privacy Policy
            describes how we collect, use, disclose, and safeguard
            information when you visit our website, create an account,
            or use the Service. By using Nexun, you agree to the
            collection and use of information in accordance with this
            policy.
          </p>

          <section className="legal-section">
            <h2>1. Information We Collect</h2>

            <h3>1.1 Account Information</h3>
            <p>
              We use Supabase Authentication to manage user accounts. If
              you create an account, we (through Supabase) collect and
              store information such as your email address, a securely
              hashed password (or authentication tokens if you sign in
              via a third-party provider), and account metadata such as
              account creation date and last login time.
            </p>

            <h3>1.2 Resume Files and Content</h3>
            <p>
              When you upload a resume (PDF, DOC, or DOCX), we process
              the file to extract its text content. This may include
              personal information you have included in your resume,
              such as your name, contact details, employment history,
              education, certifications, skills, and any other
              information you choose to include.
            </p>

            <h3>1.3 Analysis Data</h3>
            <p>
              When you submit a resume, our Service generates an
              analysis, including ATS compatibility scores, keyword
              coverage, section-by-section feedback, readability
              metrics, and improvement recommendations (&quot;Analysis
              Data&quot;). Resume text and Analysis Data may be
              associated with your account and stored in our database.
            </p>

            <h3>1.4 Contact Form Submissions</h3>
            <p>
              If you contact us through the form available in our
              footer, we collect the name, email address, and message
              content you submit. These submissions are processed
              through a third-party form service (Web3Forms) and
              delivered to our inbox.
            </p>

            <h3>1.5 Local Device Storage</h3>
            <p>
              Your most recent Analysis Data may be temporarily cached in
              your browser&apos;s local storage so that results can be
              displayed on the analysis page. This data remains on your
              device and is overwritten each time a new analysis is run.
            </p>

            <h3>1.6 Log and Technical Data</h3>
            <p>
              Our hosting, infrastructure, authentication, and database
              providers (including Supabase) may automatically collect
              standard technical information, such as IP address,
              browser type and version, device information, operating
              system, date and time stamps, and similar diagnostic data,
              for security, session management, and abuse-prevention
              purposes.
            </p>

            <h3>1.7 Cookies and Similar Technologies</h3>
            <p>
              We use cookies or similar technologies that are strictly
              necessary for authentication and core functionality — for
              example, to keep you signed in via Supabase Auth and to
              maintain basic security. We do not currently use cookies
              for advertising, analytics, or cross-site tracking.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information described above for the following purposes:</p>
            <ul className="legal-list">
              <li>To create and manage your account, and to authenticate you when you sign in;</li>
              <li>To provide, operate, and maintain the Service, including processing uploaded resumes and generating Analysis Data;</li>
              <li>To store a record of resumes processed and the corresponding Analysis Data, associated with your account, so you can access your history and so we can improve the Service;</li>
              <li>To respond to inquiries, support requests, and other communications submitted through our contact form;</li>
              <li>To monitor, maintain, and improve the security, performance, and reliability of our infrastructure;</li>
              <li>To detect, prevent, and address technical issues, fraud, unauthorized access, or misuse of the Service;</li>
              <li>To comply with applicable legal obligations, resolve disputes, and enforce our agreements.</li>
            </ul>
            <p>
              We do not sell personal information, and we do not use the
              content of your resume or account information for targeted
              advertising. We do not currently use any analytics or
              tracking tools.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. How We Share Your Information</h2>
            <p>
              We do not sell or rent your personal information to third
              parties. We may share information in the following limited
              circumstances:
            </p>
            <ul className="legal-list">
              <li><strong>Service Providers.</strong> We rely on trusted third-party vendors that perform services on our behalf, including Supabase (authentication and database), Web3Forms (contact form processing), and our hosting provider (see Section 5). These providers are permitted to access information only as needed to perform their functions and are not authorized to use it for their own marketing purposes.</li>
              <li><strong>Legal Compliance.</strong> We may disclose information if required to do so by law, regulation, legal process, or a request from a competent governmental or judicial authority, or where we believe disclosure is necessary to protect the rights, property, or safety of Nexun, our users, or others.</li>
              <li><strong>Business Transfers.</strong> If Nexun is involved in a merger, acquisition, financing, restructuring, or sale of assets, information may be transferred as part of that transaction, subject to standard confidentiality protections.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Retention</h2>
            <p>
              We retain your account information for as long as your
              account remains active. Resume text and Analysis Data are
              retained for as long as necessary to provide the Service,
              maintain your account history, and improve the accuracy of
              our analysis algorithms, unless a longer or shorter
              retention period is required or permitted by applicable
              law.
            </p>
            <p>
              Contact form submissions are retained for as long as
              necessary to address your inquiry and for our internal
              record-keeping.
            </p>
            <p>
              You may request deletion of your account, resume data, and
              Analysis Data at any time by contacting us as described in
              Section 11. We will process such requests within a
              reasonable timeframe, except where retention is required
              for legal, security, or legitimate business purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Third-Party Service Providers</h2>
            <p>
              We use the following categories of third-party providers to
              operate the Service. These providers process data under
              their own privacy policies and security practices:
            </p>
            <ul className="legal-list">
              <li><strong>Supabase.</strong> Provides authentication (account sign-up/login) and database infrastructure used to store account information, resume text, and Analysis Data.</li>
              <li><strong>Web3Forms.</strong> Processes and delivers contact form submissions to our team.</li>
              <li><strong>Hosting and Content Delivery Providers.</strong> Host, serve, and deliver our website and application.</li>
              <li><strong>Google Fonts.</strong> Loads typography assets used throughout the Service.</li>
            </ul>
            <p>
              We select providers that maintain appropriate security and
              confidentiality standards, but we encourage you to review
              their respective privacy policies for further information.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. International Data Transfers</h2>
            <p>
              Nexun is based in India, and your information may be stored
              and processed in India or in other countries where our
              service providers (such as Supabase and our hosting
              provider) operate infrastructure. Where your information is
              transferred outside your country of residence, we take
              steps intended to ensure it continues to be protected in
              accordance with this Privacy Policy and applicable law.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Data Security</h2>
            <p>
              We implement reasonable security practices and procedures,
              as contemplated under applicable Indian law, including the
              Information Technology Act, 2000 and rules made thereunder,
              to protect your information from unauthorized access, use,
              alteration, or disclosure. These measures include HTTPS
              encryption, security-related HTTP headers, authentication
              via Supabase, restricted database access, and access
              controls. However, no method of electronic transmission or
              storage is 100% secure, and we cannot guarantee absolute
              security of your information.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Your Privacy Rights and Choices</h2>
            <p>
              You may have certain rights regarding your personal
              information, which may include the right to:
            </p>
            <ul className="legal-list">
              <li>Access and review the personal information associated with your account;</li>
              <li>Correct or update inaccurate or incomplete information, including through your account settings;</li>
              <li>Request deletion of your account and associated personal information, subject to certain exceptions;</li>
              <li>Withdraw consent to certain processing, where processing is based on consent;</li>
              <li>Request information about how your personal data is processed.</li>
            </ul>
            <p>
              If you are located in India, these rights are provided in
              line with applicable Indian data protection law, including
              the Digital Personal Data Protection Act, 2023, once it
              comes into effect. If you are located outside India and
              your jurisdiction provides additional statutory rights (for
              example, under the GDPR or similar frameworks), we will
              honor such rights to the extent required by applicable law.
            </p>
            <p>
              To exercise any of these rights, please contact us as
              described in Section 11. We may need to verify your
              identity before fulfilling certain requests.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to, and is not intended for use
              by, individuals under the age of 18, or under the age of
              majority in their jurisdiction. We do not knowingly collect
              personal information from children. If we become aware that
              we have inadvertently collected personal information from a
              child without appropriate consent, we will take steps to
              delete that information.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to
              reflect changes in our practices, technologies, legal
              requirements, or for other operational reasons. The
              &quot;Last updated&quot; date at the top of this page
              indicates when this policy was last revised. We encourage
              you to review this page periodically. Continued use of the
              Service after changes become effective constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this
              Privacy Policy, your account, or our data practices, please
              contact us using the <strong>Contact</strong> form available
              in the footer of our website. We aim to respond to all
              legitimate requests within a reasonable timeframe.
            </p>
          </section>

          <p className="legal-disclaimer">
            This Privacy Policy is provided for general informational
            purposes and is intended to reflect our current data
            practices and our base of operations in India. It does not
            constitute legal advice. Depending on your user base and the
            jurisdictions from which users access the Service, additional
            disclosures, consent mechanisms (such as a cookie consent
            banner), or compliance steps may be required under applicable
            law, including the Digital Personal Data Protection Act, 2023.
            We recommend having this policy reviewed by qualified legal
            counsel.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}