import { useEffect } from "react";
import puppetImage from "../assets/puppet.jpg";
import walletImage from "../assets/walletImage.jpeg";
import formImage from "../assets/form.jpeg";
import solanaLogo from "../assets/solana_logo.jpeg";
import twitterConfig1 from "../assets/twitterConfig1.jpg"; // Step 1 image
import twitterConfig2 from "../assets/twitterConfig2.jpg"; // Step 2 image
import twitterConfig3 from "../assets/twitterConfig3.jpg"; // Step 3 image
import twitterConfig4 from "../assets/twitterConfig4.jpg"; // Step 4 image

export default function AgentCreationGuide() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 sm:p-6 bg-black/80 backdrop-blur-md border-b border-[#494848] z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Agent Creation Guide</h1>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-10 px-4 sm:px-6 md:px-8 lg:px-12 max-w-5xl mx-auto">
        {/* Introduction */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Welcome to Valet App Agent Creation</h2>
          <p className="text-gray-300 text-sm sm:text-base">
            This guide walks you through creating your own AI agent using the Valet platform. Whether you’re building a basic agent or exploring future frameworks like PuppetOS, you’ll learn how to get started with just 0.01 SOL.
          </p>
        </section>

        {/* Prerequisites */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Prerequisites</h2>
          <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-2 sm:space-y-3">
            <li>
              <strong>Solana Wallet</strong>: Install a wallet like Phantom or Solflare in your browser.
              <img
                src={walletImage}
                alt="Wallet Connection Example"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto"
              />
            </li>
            <li>
              <strong>SOL Balance</strong>: Right now, we’re in testing, so Devnet is fine—ensure you have at least 0.01 SOL (plus a small fee) using a faucet like{" "}
              <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="text-[#6894f3] hover:underline">
                Solana Faucet
              </a>{" "}
              to get test SOL. Once we publish, you’ll need real SOL on a live wallet (Mainnet).
              <img
                src={solanaLogo}
                alt="Solana Logo"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-20 sm:w-24 h-auto"
              />
            </li>
            <li>
              <strong>Valet Account</strong>: Connect your wallet on the homepage to log in or create an account.
            </li>
          </ul>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">How to Create an Agent</h2>
          <div className="space-y-6 sm:space-y-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 1: Connect Your Wallet</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                On the homepage, click "Connect Wallet" to link your Solana wallet (e.g., Phantom). You’ll see a prompt to select your wallet, followed by a "Wallet Connected" notification. The app will then redirect you to the agent creation page.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 2: Choose Agent Framework</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Select the framework for your agent. Currently, only "Basic Agent" is available (PuppetOS is coming soon). Click the "Basic Agent" option to proceed.
              </p>
              <img
                src={puppetImage}
                alt="PuppetOS Preview (Coming Soon)"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-3/4 sm:w-1/2 md:w-1/2 lg:w-1/3 h-auto"
              />
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 3: Fill Out Agent Details</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Complete the form with your agent’s details:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li><strong>Name</strong>: Unique name for your agent (1-50 characters).</li>
                  <li><strong>Tone</strong>: Voice style (e.g., Friendly, Professional, 1-20 characters).</li>
                  <li><strong>Formality</strong>: Level of formality (e.g., Casual, Formal, 1-20 characters).</li>
                  <li><strong>Catchphrase</strong>: A signature phrase (1-50 characters).</li>
                  <li><strong>Bio</strong>: Background story (10-500 characters).</li>
                </ul>
              </p>
              <img
                src={formImage}
                alt="Agent Creation Form Example"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>

            {/* Step 4 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 4: Submit and Pay</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Click "Create (Pay 0.01 SOL)" to submit. Your wallet will prompt you to approve a 0.01 SOL payment to the Valet receiver address. Once confirmed, you’ll see a "Agent Created" notification with your agent’s ID.
              </p>
            </div>

            {/* Step 5 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 5: Manage Your Agent</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                After creation, you’ll be redirected to manage your agent. You can edit its details, view its profile, or integrate it into your workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Twitter Config Setup */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Twitter Config Setup</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            To enable your agent to post on Twitter, follow these steps to configure the Twitter integration after creating your agent.
          </p>
          <div className="space-y-6 sm:space-y-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 1: Activate Your Agent</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Navigate to your agent’s management page. Under the "Basic Info" section, ensure your agent is active by ticking the checkbox labeled "Active." This enables the agent to perform actions like posting to Twitter.
              </p>
              <img
                src={twitterConfig1}
                alt="Activating Agent in Basic Info"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 2: Add Twitter to Platforms</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Go to the "Settings" tab. In the "Platforms" field, type "twitter" (lowercase) to indicate that your agent will interact with Twitter. Save the settings to proceed.
              </p>
              <img
                src={twitterConfig2}
                alt="Adding Twitter to Platforms in Settings"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 3: Configure Twitter Credentials</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                In the "Twitter Config" section, fill in all required fields with your Twitter credentials (e.g., API Key, API Secret, Access Token, Access Token Secret). To get these, visit the{" "}
                <a
                  href="https://developer.x.com/en/portal/projects-and-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6894f3] hover:underline"
                >
                  Twitter Developer Portal
                </a>
                , create an app, and generate your credentials. Then:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li><strong>Post Interval</strong>: Set the posting frequency in seconds (e.g., 3600 for hourly posts).</li>
                  <li><strong>Enable Tweet Posting</strong>: Toggle this option to "On" to allow your agent to post tweets.</li>
                  <li><strong>Twitter Developer Account</strong>: Check this box if you’re subscribed to the Twitter Developer API.</li>
                </ul>
              </p>
              <img
                src={twitterConfig3}
                alt="Configuring Twitter Credentials"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>

            {/* Step 4 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 4: Add OpenAI API Key</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                For your agent to generate tweets, it needs an OpenAI API key. Go to the "API Keys" tab, paste your OpenAI API key into the designated field, and save it. You can get this key from the OpenAI dashboard.
              </p>
              <img
                src={twitterConfig4}
                alt="Adding OpenAI API Key in API Keys Tab"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Troubleshooting</h2>
          <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-2 sm:space-y-3">
            <li>
              <strong>Wallet Not Connecting</strong>: Ensure your wallet extension is installed and unlocked. Refresh the page and try again.
            </li>
            <li>
              <strong>Insufficient SOL</strong>: During testing, ensure you have enough SOL on Devnet using a faucet. After launch, verify your live wallet balance on Mainnet.
            </li>
            <li>
              <strong>Form Errors</strong>: Fill all required fields (*). Check character limits in the form.
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm sm:text-base">
          <p>
            Need help? Contact us on{" "}
            <a href="https://x.com/ValetAgents" target="_blank" rel="noopener noreferrer" className="text-[#6894f3] hover:underline">
              X @ValetAgents
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}