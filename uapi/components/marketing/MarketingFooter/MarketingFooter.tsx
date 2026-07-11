'use client';

import React from 'react';
import Link from 'next/link';

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full py-12 bg-gray-950 border-t border-gray-800">
      <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 tablet:px-6">
        <div className="grid grid-cols-1 laptop:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="col-span-1 laptop:col-span-1">
            <div className="flex items-center mb-4">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" stroke="#67FEB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20Z" stroke="#67FEB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 8.5L13 13" stroke="#67FEB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 19L23.5 23.5" stroke="#67FEB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white font-bold text-xl">bitcode</span>
            </div>
            <p className="text-gray-400 text-sm">
              Bitcode intelligence for modern development teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-gray-400 hover:text-emerald-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-emerald-400 transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="text-gray-400 hover:text-emerald-400 transition-colors">Integrations</Link></li>
              <li><Link href="/changelog" className="text-gray-400 hover:text-emerald-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors">Documentation</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">Blog</Link></li>
              <li><Link href="/community" className="text-gray-400 hover:text-emerald-400 transition-colors">Community</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-emerald-400 transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-emerald-400 transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</Link></li>
              <li><Link href="/legal" className="text-gray-400 hover:text-emerald-400 transition-colors">Legal</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col laptop:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 laptop:mb-0">
            &copy; {currentYear} Bitcode, Inc. All rights reserved.
            {process.env.NEXT_PUBLIC_APP_VERSION && (
              <span className="ml-2 text-[10px] text-gray-400/70 select-none">
                v{process.env.NEXT_PUBLIC_APP_VERSION}
                {process.env.NEXT_PUBLIC_APP_VERSION_DATE && (
                  <>
                    {" "}
                    ({new Date(process.env.NEXT_PUBLIC_APP_VERSION_DATE).toLocaleDateString(undefined, {
                      year: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })})
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
