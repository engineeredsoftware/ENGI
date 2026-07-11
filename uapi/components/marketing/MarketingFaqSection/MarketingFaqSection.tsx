"use client";

import React from 'react';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { Disclosure, Transition } from '@headlessui/react';

const faqs = [
  {
    question: "Is my code and usage data secure with Bitcode?",
    answer:
      "Absolutely. Bitcode is built on a security-first, zero-trust architecture designed to meet the most stringent enterprise requirements. All code and usage data are encrypted in transit with TLS 1.3+ and at rest with AES-256 (with optional customer-managed keys). Each session runs in a fully isolated, ephemeral container that is destroyed immediately after processing - nothing you submit is stored permanently unless you explicitly opt in. We enforce multi-factor authentication, granular role-based access controls, and integrate with your identity provider (SAML, OIDC, SCIM) for seamless SSO and enterprise-grade access governance. Comprehensive audit trails, continuous vulnerability scanning, and regular third-party penetration tests keep us ahead of emerging threats. Bitcode maintains SOC 2 Type II, ISO 27001, and FedRAMP readiness, and fully complies with GDPR, CCPA, HIPAA, and other major data protection regulations. When performing inference, Bitcode only integrates with third-party LLM services (e.g., Anthropic, OpenAI, and others) that adhere to our same encryption, isolation, and data protection requirements - none of your data is used to train their models without explicit, per-use opt-in. In short, your intellectual property remains entirely yours - Bitcode simply orchestrates secure, compliant LLM inference without retaining or training on your data (unless you explicitly opt in).",
  },

  {
    question: 'Everyone\'s building "amazing AI tools". These are...?',
    answer:
      "Source-to-shares inference systems. Simple shepherding, proactive preparation, reactive calibration, deep iteration scoping, source-attributed research evidence, progress logging, measured-knowledge procurement, diverse command interfaces, 3rd-party integrations, and much more make Bitcode a technical collaborator for measuring Reads, finding fits, and delivering AssetPacks. Everyone from non-technical solopreneurs to large industrial engineering teams use Bitcode to make software development operations lean, mean, and green.",
  },
  {
    question: "So... is this a crypto scam?",
    answer:
      "No. BTC is the fee asset, and $BTD is not a checkout spend unit or fungible currency token. $BTD records non-fungible AssetPack share/read-right holdings and the measured Bitcode amount in accepted content. Terminal minting and Exchange purchase flows mature after V26, with wallet-readable balances keeping the distinction explicit.",
  },
  {
    question: "Is this powerful tool easy to use?",
    answer:
      "Easy to learn, hard to master. Within minutes, you'll have your tools connected and be chatting your way through your first real-world Reads into AssetPacks and Shippables. Quickly, Read measurement, fit review, and AssetPack guidance become second nature. Advanced users utilize triggered coordinated-learning sequencing, deeper workstation compute capabilities, internal MCPs, knowledge-gap arbitrage, and more to expand technical value creation across their organizations.",
  },
  {
    question: "Does Bitcode work with private repositories and APIs?",
    answer:
      "Yes. Through the GitHub App, Bitcode can access both public and private repositories. You retain full control over installation scopes and permissions. MCP API credentials are securely stored, monitored when used, and can be deleted anytime.",
  },
  {
    question: "AI codes slop! Now I'm supposed to code less... how does this really work?",
    answer:
      "Off-the-shelf AIs generally over-fit to their wide programming example training data. Enterprise misalignment is demonstrated through disrespected coding principles, underused abstractions, over-confident incomplete solutions, intrusive regressions, and worse. Bitcode orchestration targets systemic improvements and full-context comprehension that compound to raise code quality on your specific IP. By pairing proactive preparation with reactive calibration, investing time with Bitcode is well worth it.",
  },
  {
    question: "So, Bitcode supports my stack and can do what I read it to do?",
    answer:
      "Probably. Bitcode supports almost all programming languages, popular libraries, and full-stack frameworks and researches the web or procures data for what it doesn't. Languages include Python, JavaScript/TypeScript, Java, Go, Ruby, PHP, C/C++, Rust, Solidity, C#, CSS/HTML, Objective-C, Swift, Kotlin, Scala, Dart, Haskell, Elixir, COBOL, and more. Frameworks include React, React Native, NextJS, Tailwind, Angular, Vue, Svelte, Django, Rails, Flask, Spring, Node/Express, ASP.NET, Laravel, Symfony, Flutter, Xamarin, TensorFlow, PyTorch, Kubernetes, Docker, Unity, Unreal Engine, and more. Between version control (GitHub, GitLab) complete read/write and MCPs, general software engineering is Bitcode's specialty.",
  },
  {
    question: "We don't use cloud tools. Is self-hosting supported?",
    answer:
      "Yes. Some internet-native tools will be unavailable including one that will require replacement implementation: the LLM API. Contact sales to benefit from enterprise self-hosting to bring your own keys, fully own security, and build on Bitcode's protocol foundations.",
  },
  {
    question: "Can it be cheaper?",
    answer:
      "Currently, S-tier reasoning models average ~$20/million tokens. Completing realistic engineering tasks typically requires millions of tokens to consistently produce complete, correct, and high-quality AssetPacks and Shippables. Bitcode accounts for Read measurement, fit search, AssetPack synthesis, and connected-interface delivery precisely per run.",
  },
  {
    question: "What are 'coins', 'tokens', and '$BTD'?",
    answer:
      "Bitcoin is the fee currency, text tokens are model accounting units, and $BTD is the non-fungible share/read-right tied to AssetPacks and measured Bitcode content amount.",
  },
  {
    question: "Who is Advanced Engineered Software, Inc.?",
    answer:
      "Advanced Engineered Software, Inc. (USA C-Corp) builds provable technical-knowledge exchange systems that accelerate reliable software delivery. Enterprises across the world deliver better software to their customers for lower costs by using our tools. Bitcode and $BTD are the first generally available commercial product pair.",
  },
];

const MarketingFaqSection: React.FC = () => {
  /* Contact form has been moved to the dedicated CTA+Contact section */

  // File-local class constants (SRP/DRY; no visual changes)
  const faqItemClass = 'pt-4 border-l-2 border-emerald-500/20 pl-4';
  const faqButtonClass = 'flex w-full items-center space-x-3 py-2 pr-4 rounded-md hover:bg-emerald-500/10 transition-all duration-200';
  const arrowIconClass = 'select-none text-gray-300 transition-transform duration-300 text-lg ml-2';
  const faqPanelClass = 'pl-8 pr-4 pt-2 pb-3 text-gray-300';

  return (
    <MarketingSectionWrapper id="faq" className="bg-transparent">
      <div className="text-center mb-12">
        <h2 className="text-2xl laptop:text-3xl font-bold mb-4 block super-shiny-text">
          Bitcode Protocol FAQs
        </h2>
        <p className="text-base laptop:text-lg text-gray-300 max-w-3xl mx-auto">
          Everything you read to know about Read measurement, AssetPacks, $BTD, BTC fees, and connected-interface delivery.
        </p>
      </div>

      <dl className="mx-auto">
        {faqs.map((faq, index) => (
          <Disclosure
            key={index}
            as="div"
            className={faqItemClass}
          >
            {({ open }) => (
              <>
                <dt>
                  <Disclosure.Button
                    className={faqButtonClass}
                  >
                    <span
                      className={`${arrowIconClass} ${open ? 'transform rotate-90' : ''}`}
                    >
                      ›
                    </span>
                    <span className="text-base laptop:text-lg font-semibold text-white flex-1 text-left">
                      {faq.question}
                    </span>
                  </Disclosure.Button>
                </dt>
                <Transition
                  show={open}
                  enter="transition duration-300 ease-out"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition duration-200 ease-in"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-1"
                >
                  <Disclosure.Panel
                    as="dd"
                    className={faqPanelClass}
                  >
                    {faq.answer}
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        ))}
      </dl>

      {/* Contact form moved to CTAContactSection */}
    </MarketingSectionWrapper>
  );
};

export default MarketingFaqSection;
