import { useEffect } from "react";
import puppetImage from "../assets/puppet.jpg";
import walletImage from "../assets/walletImage.jpeg";
import formImage from "../assets/form.jpeg";
import solanaLogo from "../assets/solana_logo.jpeg";
import twitterConfig1 from "../assets/twitterConfig1.jpg";
import twitterConfig2 from "../assets/twitterConfig2.jpg";
import twitterConfig3 from "../assets/twitterConfig3.jpg";
import twitterConfig4 from "../assets/twitterConfig4.jpg";
import telegramConfig from "../assets/telegramConfig.jpg";
import telegramConfigSettingsPlatform from "../assets/telegramConfigSettingsPlatform.jpg";
import manageAgents from "../assets/manageAgents.jpg";
import testAgentResponse from "../assets/TestAgentResponse.jpg";
import agentProfile from "../assets/AgentProfile.jpg";
import easyToUpdateKnowledge from "../assets/EasyToUpdateKnowledge.jpg";
import twitterDeveloperCreds from "../assets/twitterDeveloperCreds.jpg";
import twitterDeveloperAuthSettings from "../assets/twitterDeveloperAuthSettings.jpg";
import openAiApiPermission from "../assets/open-ai-api-permission.jpg";

export default function AgentCreationGuide() {
  useEffect(() => {
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
            This guide walks you through creating your own AI agent using the Valet platform. We now use Valet Tokens to create agents and SOL to buy credits (though please don’t buy credits for now—that’s a future feature). We do not refund agent creation tokens or SOL that you use to buy credits, so make sure to think carefully before proceeding!
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
              <strong>Valet Tokens & SOL Balance</strong>: You’ll need 1000 Valet Tokens to create an agent and a small amount of SOL for transaction fees. Buying credits uses SOL, but please don’t buy credits yet—it’s a future feature. Ensure you have enough SOL in your wallet on Solana Mainnet.
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
                Click "Create (Pay 1000 Valet Tokens)" to submit. Your wallet will prompt you to approve the transaction using 1000 Valet Tokens (plus a small SOL fee). Once confirmed, you’ll see an "Agent Created" notification with your agent’s ID. <strong>Warning:</strong> We do not refund agent creation tokens, so please ensure you are not creating agents randomly or impulsively triggering the 'Create Agent' option! Additionally, if your agent isn’t working because you didn’t configure it correctly or lacked the proper credentials, we still do not offer refunds.
              </p>
            </div>

            {/* Step 5 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 5: Manage Your Agent</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                After creation, you’ll be redirected to manage your agent. You can edit its details, view its profile, or integrate it into your workflows.
              </p>
              <img
                src={manageAgents}
                alt="Manage Agents Page"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>
          </div>
        </section>

        {/* Twitter Config Setup */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Twitter Config Setup</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            To enable your agent to post on Twitter, follow these steps to configure the Twitter integration after creating your agent.
          </p>
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            <strong>Important Warning:</strong> You need to make sure you set up the agent correctly and use a correct and valid API Key from OpenAI and credentials from Twitter. Also, free Twitter Developer accounts only offer posting capabilities—not tweet mentions or replies. If you need tweet mention or reply features for your agent, you must have a paid Twitter Developer account.
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

            {/* Twitter Credentials Source */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Twitter Credentials Source</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Twitter credentials can be generated in this Twitter Developer page.
              </p>
              <img
                src={twitterDeveloperCreds}
                alt="Twitter Developer Portal Credentials Page"
                className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
              />
            </div>

            {/* Twitter Authentication Settings */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Twitter Authentication Settings</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Make sure to check the auth settings to choose read and write and direct message if you got a paid developer Twitter account.
              </p>
              <img
                src={twitterDeveloperAuthSettings}
                alt="Twitter Developer Portal Authentication Settings"
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
              {/* Note on OpenAI API Key Permissions */}
              <div className="mt-4">
                <h4 className="text-md sm:text-lg font-medium mb-2">Note on OpenAI API Key Permissions</h4>
                <p className="text-gray-300 text-sm sm:text-base">
                  To ensure your agent can generate tweets using the OpenAI API, the API key must have the correct permissions. In the OpenAI dashboard, navigate to the "API Keys" section, edit your key, and select the <strong>Restricted</strong> tab. Under "Model capabilities," set the permission to <strong>Write</strong>. This permission allows the key to generate responses using models like <code>gpt-3.5-turbo</code> via the <code>/v1/chat/completions</code> endpoint, as well as access other capabilities in this group. The image below shows an example of the permissions setup—ensure "Model capabilities" is set to <strong>Write</strong>.
                </p>
                <img
                  src={openAiApiPermission}
                  alt="OpenAI API Key Permissions Setup"
                  className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
                />
              </div>
            </div>

            {/* Showcase Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Showcase: Your Agent in Action</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Once configured, your agent is ready to perform tasks. Here’s how it looks in action:
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-gray-300 text-sm sm:text-base italic">
                    Test your agent’s response using the web app tool to ensure it’s working as expected.
                  </p>
                  <img
                    src={testAgentResponse}
                    alt="Test Agent Response in Web App"
                    className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
                  />
                </div>
                <div>
                  <p className="text-gray-300 text-sm sm:text-base italic">
                    View your agent’s profile to verify the setup and details.
                  </p>
                  <img
                    src={agentProfile}
                    alt="Agent Profile View"
                    className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
                  />
                </div>
                <div>
                  <p className="text-gray-300 text-sm sm:text-base italic">
                    Easily add or update knowledge for your agent to enhance its capabilities.
                  </p>
                  <img
                    src={easyToUpdateKnowledge}
                    alt="Easy to Update Knowledge"
                    className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Telegram Integration */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Telegram Integration</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            To enable your agent to interact with Telegram (e.g., respond to mentions or group messages), follow these steps to set up a Telegram bot and integrate it with your Valet agent.
          </p>
          <div className="space-y-6 sm:space-y-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 1: Create a Bot Using BotFather</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Open Telegram and search for <strong>@BotFather</strong>, the official bot for creating Telegram bots. Follow these steps:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li>Send <code>/start</code> to begin.</li>
                  <li>Send <code>/newbot</code> to create a new bot.</li>
                  <li>Follow the prompts: Choose a name (e.g., "ValetTestBot") and a username ending in "Bot" (e.g., "@ValetTestBot").</li>
                </ul>
                BotFather will confirm the bot’s creation and provide a <strong>Bot Token</strong>.
              </p>
              <p className="text-gray-400 text-sm italic mt-3">[Image: Screenshot of BotFather conversation showing /newbot and token response]</p>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 2: Get the Agent Handle and Bot Token</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                After creating the bot:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li><strong>Agent Handle</strong>: This is the bot’s username (e.g., <code>@ValetTestBot</code>). It’s how users mention your bot in Telegram.</li>
                  <li><strong>Bot Token</strong>: This is a long string provided by BotFather (e.g., <code>7736744451:AAEaizfEyDGyVNkMvq5XDFzyICtouYto5hs</code>). Copy it carefully—it’s your bot’s unique authentication key.</li>
                </ul>
                Save both the handle and token, as you’ll need them for configuration.
              </p>
              <p className="text-gray-400 text-sm italic mt-3">[Image: Screenshot highlighting the bot username and token from BotFather]</p>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 3: Add the Bot to a Telegram Group</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                To allow your bot to interact in a group:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li>Open Telegram and create a new group or use an existing one.</li>
                  <li>Add the bot by searching for its username (e.g., <code>@ValetTestBot</code>) and selecting it from the member list.</li>
                  <li>Grant the bot permissions if prompted (e.g., to send messages). By default, bots can send messages, but group admins can adjust settings.</li>
                </ul>
              </p>
              <p className="text-gray-400 text-sm italic mt-3">[Image: Screenshot of adding a bot to a Telegram group]</p>
            </div>

            {/* Step 4 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 4: Get the Group Chat ID</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                To configure your agent to listen to a specific group, you need its Chat ID:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li>Add another bot, <strong>@GetIDsBot</strong>, to your group (search for it and invite it).</li>
                  <li>Send any message in the group, and <code>@GetIDsBot</code> will reply with the group’s Chat ID (e.g., <code>-1007436987917</code>). Note the negative number—it indicates a group.</li>
                  <li>Alternatively, use your bot to retrieve it: Send a message in the group, then use a tool like <code>https://api.telegram.org/bot&lt;YourBotToken&gt;/getUpdates</code> in a browser and look for <code>{`"chat":{"id":-1007436987917}`}</code> in the JSON response.</li>
                </ul>
              </p>
              <p className="text-gray-400 text-sm italic mt-3">[Image: Screenshot of @GetIDsBot replying with a group Chat ID]</p>
            </div>

            {/* Step 5 */}
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Step 5: Configure Telegram in Valet</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                In your agent’s management page, configure Telegram by completing these two parts:
              </p>
              <div className="mt-4 space-y-6 sm:space-y-8">
                {/* Part 1: Add Telegram to Platforms */}
                <div>
                  <h4 className="text-md sm:text-lg font-medium mb-2">Part 1: Add Telegram to Platforms</h4>
                  <p className="text-gray-300 text-sm sm:text-base">
                    Go to the "Settings" tab and add <code>telegram</code> (lowercase) to the "Platforms" field. This tells the Valet app that your agent will interact with Telegram. Save the settings to proceed.
                  </p>
                  <img
                    src={telegramConfigSettingsPlatform}
                    alt="Adding Telegram Platform in Settings"
                    className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
                  />
                </div>

                {/* Part 2: Configure Telegram Credentials */}
                <div>
                  <h4 className="text-md sm:text-lg font-medium mb-2">Part 2: Configure Telegram Credentials</h4>
                  <p className="text-gray-300 text-sm sm:text-base">
                    In the "Telegram Config" section, fill in the following:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                      <li>Paste your <strong>Bot Token</strong> (e.g., <code>7736744451:AAEaizfEyDGyVNkMvq5XDFzyICtouYto5hs</code>) into the "Telegram Bot Token" field.</li>
                      <li>Enter the <strong>Group Chat ID</strong> (e.g., <code>-1007436987917</code>) into the "Telegram Group ID" field to specify where the bot listens.</li>
                      <li>Toggle "Enable Telegram Replies" to "On" if you want the bot to respond to messages.</li>
                    </ul>
                    Then, in the "API Keys" tab, ensure your OpenAI API key is added (same as Twitter setup) for generating responses. Save your changes, and your agent will start listening to the group!
                  </p>
                  <img
                    src={telegramConfig}
                    alt="Adding Telegram Credentials in Telegram Tab"
                    className="mt-3 sm:mt-4 rounded-lg shadow-md w-full sm:w-full md:w-full lg:w-3/4 h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-10 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Troubleshooting</h3>
          <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-2 sm:space-y-3">
            <li>
              <strong>Wallet Not Connecting</strong>: Ensure your wallet extension is installed and unlocked. Refresh the page and try again.
            </li>
            <li>
              <strong>Insufficient Tokens or SOL</strong>: Ensure you have 1000 Valet Tokens and enough SOL for fees in your wallet on Solana Mainnet. Buying credits uses SOL, but that’s not available yet—don’t buy credits now.
            </li>
            <li>
              <strong>Form Errors</strong>: Fill all required fields (*). Check character limits in the form.
            </li>
            <li>
              <strong>Telegram Bot Not Responding</strong>: Verify the Bot Token is correct, the bot is added to the group, and the Group Chat ID matches. Ensure "telegram" is in Platforms and the agent is active.
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