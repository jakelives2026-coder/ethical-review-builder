export default function TermsPage() {
  const lastUpdated = "March 13, 2026";
  const contactEmail = "legal@ethicalreviewbuilder.com";
  const appName = "Ethical Review Builder";
  const companyName = "Ethical Review Builder";
  const appUrl = "https://ethicalreviewbuilder.com";

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <p className="text-muted-foreground">
            Please read these Terms of Service ("Terms") carefully before using{" "}
            <span className="font-medium">{appUrl}</span> (the "Service") operated by{" "}
            {companyName} ("we", "us", or "our"). By creating an account or using the Service
            you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        {/* 1 — Acceptance */}
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using {appName} you confirm that you are at least 16 years old,
            have the legal capacity to enter into a binding agreement, and accept these Terms
            in full. If you are using the Service on behalf of a business or organisation, you
            represent that you have authority to bind that entity to these Terms.
          </p>
        </section>

        {/* 2 — Description of Service */}
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="text-muted-foreground mb-3">
            {appName} is an AI-powered review generation platform. It guides users through a
            structured questionnaire about their experience with a business and uses OpenAI's
            large language models to synthesise a draft review based on their answers.
          </p>
          <p className="text-muted-foreground">
            The Service is intended to help real customers articulate genuine experiences more
            effectively — not to fabricate reviews. Users are solely responsible for ensuring
            that any review they post is truthful and complies with the review platform's own
            terms (e.g. Google's review policies).
          </p>
        </section>

        {/* 3 — Accounts */}
        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts and Responsibilities</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>You must create an account to access most features of the Service. You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Keep your password secure and not share it with third parties.</li>
              <li>Notify us immediately at{" "}
                <a href={`mailto:${contactEmail}`}
                   className="underline underline-offset-2 hover:text-foreground">
                  {contactEmail}
                </a>{" "}if you suspect unauthorised access to your account.</li>
              <li>Take responsibility for all activity that occurs under your account.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that provide false
              information or violate these Terms.
            </p>
          </div>
        </section>

        {/* 4 — Acceptable Use */}
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
          <p className="text-muted-foreground mb-3">You agree not to use the Service to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
            <li>Generate reviews for experiences you did not personally have.</li>
            <li>Post AI-generated reviews on platforms that prohibit them.</li>
            <li>Create fake, misleading, or defamatory content about any person or business.</li>
            <li>Attempt to reverse-engineer, scrape, or automate access to the Service beyond
                normal use.</li>
            <li>Upload malicious code, conduct security attacks, or disrupt the Service.</li>
            <li>Violate any applicable law or regulation, including consumer protection,
                advertising, and competition laws.</li>
            <li>Resell or sublicense access to the Service without our written permission.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Violation of this section may result in immediate account termination and, where
            appropriate, referral to law enforcement.
          </p>
        </section>

        {/* 5 — AI-Generated Content */}
        <section>
          <h2 className="text-xl font-semibold mb-3">5. AI-Generated Content Disclaimer</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              The review drafts produced by the Service are generated by an AI model (OpenAI
              GPT-4o) based solely on the information you provide. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>AI-generated text may contain errors, inaccuracies, or stylistic artefacts.</li>
              <li>You are responsible for reviewing and editing any draft before posting it.</li>
              <li>You are solely responsible for the accuracy and truthfulness of the final
                  review you choose to publish.</li>
              <li>We do not guarantee that generated content will comply with the policies of
                  any third-party review platform (Google, Yelp, TripAdvisor, etc.).</li>
            </ul>
            <p>
              We expressly disclaim liability for any consequences arising from the posting of
              AI-generated reviews on third-party platforms.
            </p>
          </div>
        </section>

        {/* 6 — Payments */}
        <section>
          <h2 className="text-xl font-semibold mb-3">6. Payment and Refund Terms</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-1">Plans and billing</h3>
              <p>Paid subscriptions are billed in advance on a monthly or annual basis.
              All payments are processed securely by Stripe. By subscribing you authorise us
              to charge your payment method on a recurring basis until you cancel.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Price changes</h3>
              <p>We may change subscription prices with 30 days' notice. Continued use after
              the effective date constitutes acceptance of the new price.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Cancellation</h3>
              <p>You may cancel your subscription at any time from your account settings.
              Cancellation takes effect at the end of the current billing period; you retain
              access to paid features until then.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Refunds</h3>
              <p>We offer a 7-day money-back guarantee on your first month of a paid plan. After
              that, subscription fees are non-refundable except where required by applicable
              law. To request a refund within the guarantee period, contact{" "}
              <a href={`mailto:${contactEmail}`}
                 className="underline underline-offset-2 hover:text-foreground">
                {contactEmail}
              </a>.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Free tier</h3>
              <p>The free tier is provided as-is with no guarantee of continued availability.
              We reserve the right to modify free tier limits at any time.</p>
            </div>
          </div>
        </section>

        {/* 7 — Intellectual Property */}
        <section>
          <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-1">Our property</h3>
              <p>The Service, including its software, design, trademarks, and content (excluding
              user-submitted content), is owned by {companyName} and protected by intellectual
              property laws. You may not copy, modify, or distribute any part of the Service
              without our prior written consent.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Your content</h3>
              <p>You retain ownership of the questionnaire answers and business information you
              submit. By using the Service you grant us a limited, non-exclusive licence to
              process that information for the sole purpose of providing the Service to you.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Generated reviews</h3>
              <p>The AI-generated review draft produced from your inputs is yours to use. We
              claim no ownership over review text generated on your behalf.</p>
            </div>
          </div>
        </section>

        {/* 8 — Limitation of Liability */}
        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              To the maximum extent permitted by law, {companyName} and its affiliates,
              officers, and employees shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of the Service, including
              but not limited to: loss of profits, loss of data, reputational harm, or platform
              penalties resulting from posted reviews.
            </p>
            <p>
              Our total aggregate liability for any claim arising from these Terms or your use
              of the Service shall not exceed the greater of (a) the amount you paid us in the
              12 months preceding the claim or (b) USD $100.
            </p>
            <p>
              The Service is provided "as is" without warranties of any kind, express or
              implied, including warranties of merchantability, fitness for a particular
              purpose, or non-infringement. We do not warrant that the Service will be
              uninterrupted, error-free, or that AI-generated content will meet your
              expectations.
            </p>
          </div>
        </section>

        {/* 9 — Termination */}
        <section>
          <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              You may delete your account at any time. We may suspend or terminate your access
              immediately, without notice, if you breach these Terms or if we are required to
              do so by law.
            </p>
            <p>
              On termination, your right to use the Service ceases immediately. Sections 5, 7,
              8, 10, and 11 of these Terms survive termination.
            </p>
          </div>
        </section>

        {/* 10 — Governing Law */}
        <section>
          <h2 className="text-xl font-semibold mb-3">10. Governing Law and Disputes</h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws of the State of Utah, United States, without
            regard to conflict-of-law principles. Any dispute arising under these Terms shall
            first be subject to good-faith negotiation. If unresolved, disputes shall be
            submitted to binding arbitration in Salt Lake City, Utah, under the rules of the
            American Arbitration Association, except that either party may seek injunctive
            relief in a court of competent jurisdiction.
          </p>
        </section>

        {/* 11 — Changes */}
        <section>
          <h2 className="text-xl font-semibold mb-3">11. Changes to These Terms</h2>
          <p className="text-muted-foreground">
            We may update these Terms from time to time. We will notify registered users by
            email at least 14 days before material changes take effect. Continued use of the
            Service after the effective date constitutes acceptance of the revised Terms. The
            current version is always available at{" "}
            <span className="font-medium">{appUrl}/terms</span>.
          </p>
        </section>

        {/* 12 — Contact */}
        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p className="text-muted-foreground">
            Questions about these Terms? Contact us:
          </p>
          <div className="mt-3 p-4 bg-muted/40 rounded-md text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{companyName}</p>
            <p>
              Email:{" "}
              <a href={`mailto:${contactEmail}`}
                 className="underline underline-offset-2 hover:text-foreground">
                {contactEmail}
              </a>
            </p>
            <p>Website: <span className="font-medium">{appUrl}</span></p>
          </div>
        </section>

      </div>
    </div>
  );
}
