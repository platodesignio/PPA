import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const LAST_UPDATED = "2026-06-23";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-3">Legal</p>
        <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-300">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-xs text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">1. Who We Are</h2>
          <p>
            Proper Paper Audit ("PPA", "we", "us") is a conceptual audit engine for research papers and manuscripts.
            It is operated as part of the Plato Design audit philosophy tool family.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">2. What We Process</h2>
          <p className="mb-3">When you use Proper Paper Audit, the following data is processed:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span className="text-gray-200 shrink-0">—</span><span><strong className="text-gray-700">Paper text and metadata</strong> you submit (title, abstract, main text, uploaded files). This is sent to OpenAI's API to generate the audit report. It is not stored on our servers.</span></li>
            <li className="flex gap-3"><span className="text-gray-200 shrink-0">—</span><span><strong className="text-gray-700">Audit results</strong> are stored in your browser's localStorage only. We do not retain them.</span></li>
            <li className="flex gap-3"><span className="text-gray-200 shrink-0">—</span><span><strong className="text-gray-700">No personal data</strong> (name, email, institution) is collected or required to use the audit.</span></li>
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">3. Third-Party Services</h2>
          <p className="mb-3">We use the following third-party services:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span className="text-gray-200 shrink-0">—</span><span><strong className="text-gray-700">OpenAI API</strong> — paper text is sent to OpenAI for audit generation. OpenAI's data usage policies apply. See <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">openai.com/policies/privacy-policy</a>.</span></li>
            <li className="flex gap-3"><span className="text-gray-200 shrink-0">—</span><span><strong className="text-gray-700">Vercel</strong> — infrastructure and hosting. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">vercel.com/legal/privacy-policy</a>.</span></li>
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">4. Confidential Research</h2>
          <p>
            Do not submit unpublished research text that you consider sensitive or confidential
            unless you have reviewed OpenAI's data retention policies and are satisfied with them.
            Proper Paper Audit sends submitted text to OpenAI's API for processing.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">5. Cookies and Tracking</h2>
          <p>
            We do not use tracking cookies or advertising trackers. Audit results are stored in
            browser localStorage only, which you can clear at any time through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">6. Children</h2>
          <p>
            This service is intended for researchers and adult users. We do not knowingly collect
            information from users under 13 years of age.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">7. Changes</h2>
          <p>
            We may update this policy. Changes will be reflected in the "Last updated" date above.
            Continued use of the service after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">8. Contact</h2>
          <p>
            Questions about this privacy policy should be directed to the Plato Design team
            via the contact information on the FEDS Studio site.
          </p>
        </section>

      </div>
    </div>
  );
}
