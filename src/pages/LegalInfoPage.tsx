import { useEffect } from "react";
import privacyImage from "../assets/privacy.jpg"; // Placeholder for Privacy Policy
import termsImage from "../assets/terms.jpg";   // Placeholder for Terms of Service
import dataImage from "../assets/data.jpg";     // Placeholder for Data Usage

export default function LegalInfoPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 sm:p-6 bg-black/80 backdrop-blur-md border-b border-[#494848] z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Legal Information</h1>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-10 px-4 sm:px-6 md:px-8 lg:px-12 max-w-5xl mx-auto">
        {/* Introduction */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Welcome to Valet App Legal Info</h2>
          <p className="text-gray-300 text-sm sm:text-base">
            This page provides our Privacy Policy, Terms of Service, and Data Usage information. We’re committed to protecting your data and ensuring transparency in how we operate. Please read these sections carefully to understand your rights and our responsibilities.
          </p>
        </section>

        {/* Privacy Policy */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Privacy Policy</h2>
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Our Commitment to Your Privacy</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                At Valet App, we prioritize the security and confidentiality of your personal information. We collect only the data necessary to provide our services, such as your wallet address, email (if provided), and agent configurations. All data is stored securely using industry-standard encryption, and we do not share your information with third parties without your explicit consent, except as required by law.
              </p>
              <img
                src={privacyImage}
                alt="Privacy Policy Illustration"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Data Deletion Request</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Your data is yours. If you wish to delete your information from our systems, you may request this at any time by emailing us at{" "}
                <a href="mailto:valwea329@gmail.com" className="text-[#6894f3] hover:underline">valwea329@gmail.com</a>.
                To process your request, we require a signed document confirming your intent to delete your data. Please include your wallet address in the email, sign the document (digitally or physically), and attach it as proof. Once verified, we will remove your data within 30 days and notify you upon completion.
              </p>
            </div>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Terms of Service</h2>
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Acceptance of Terms</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                By using Valet App, you agree to these Terms of Service. We provide a platform for creating and managing AI agents using Valet Tokens and SOL. You are responsible for maintaining the security of your wallet and any credentials (e.g., API keys) you provide. We reserve the right to update these terms at any time, with changes posted on this page.
              </p>
              <img
                src={termsImage}
                alt="Terms of Service Illustration"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">No Refunds</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                All transactions, including the use of 1000 Valet Tokens to create an agent or SOL for credits (when available), are final. We do not offer refunds for tokens or SOL spent, even if your agent fails to function due to misconfiguration or invalid credentials. Please ensure all details are correct before proceeding with transactions.
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Account Termination</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                You may terminate your account by requesting data deletion (see Privacy Policy). We may terminate or suspend your access if you violate these terms, such as engaging in fraudulent activity or abusing the platform. Upon termination, your agents will be deactivated, and data will be handled per your deletion request.
              </p>
            </div>
          </div>
        </section>

        {/* Data Usage */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Data Usage</h2>
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">How We Use Your Data</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                We use your data solely to operate the Valet App platform, including:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li><strong>Wallet Address</strong>: To authenticate and process transactions.</li>
                  <li><strong>Agent Details</strong>: To configure and run your AI agents.</li>
                  <li><strong>API Keys</strong>: To enable integrations (e.g., Twitter, OpenAI) as specified by you.</li>
                </ul>
                Your data is never sold, rented, or used for advertising purposes. It’s stored securely and only accessed by our system to fulfill your requests.
              </p>
              <img
                src={dataImage}
                alt="Data Usage Illustration"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Data Safety</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                We employ robust security measures, including encryption and access controls, to protect your data from unauthorized access, loss, or breaches. In the unlikely event of a data breach, we will notify affected users within 72 hours and take immediate steps to mitigate harm.
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Your Control Over Data</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                You have full control over your data. You can update your agent details at any time via the platform. To delete all your data, email us at{" "}
                <a href="mailto:valwea329@gmail.com" className="text-[#6894f3] hover:underline">valwea329@gmail.com</a>{" "}
                with a signed document (digital or physical signature) stating your intent and including your wallet address. We’ll process the request within 30 days and confirm deletion.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Questions?</h3>
          <p className="text-gray-300 text-sm sm:text-base">
            If you have any questions about our Privacy Policy, Terms of Service, or Data Usage, feel free to reach out to us on{" "}
            <a href="https://x.com/ValetAgents" target="_blank" rel="noopener noreferrer" className="text-[#6894f3] hover:underline">
              X @ValetAgents
            </a>{" "}
            or email us at{" "}
            <a href="mailto:valwea329@gmail.com" className="text-[#6894f3] hover:underline">valwea329@gmail.com</a>.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm sm:text-base">
          <p>
            Last Updated: March 25, 2025
          </p>
        </footer>
      </main>
    </div>
  );
}