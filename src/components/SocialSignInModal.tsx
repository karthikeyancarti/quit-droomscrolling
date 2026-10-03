import React, { useState } from 'react';
import { X } from 'lucide-react';

const providers = [
  {
    name: 'Google',
    color: 'text-[#DB4437]',
    path: 'M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z'
  },
  {
    name: 'X',
    color: 'text-[#14171a]',
    path: 'M17.6874 3.0625 12.6907 8.77425 8.37045 3.0625H2.11328l7.47633 9.7762-7.08583 8.0988h3.03417l5.46885-6.2488 4.7795 6.2488h6.1022l-7.7935-10.3022 6.6248-7.5721h-3.0324Zm-1.0642 16.06L5.65436 4.78217h1.80309L18.3034 19.1225h-1.6802Z'
  },
  {
    name: 'Facebook',
    color: 'text-[#1877f2]',
    path: 'M14 13.5h2.5l1-4H14v-2c0-1.02938 0-2 2-2h1.5V2.1401C17.1743 2.09685 15.943 2 14.6429 2 11.9284 2 10 3.65686 10 6.69971V9.5H7v4h3V22h4v-8.5Z'
  },
  {
    name: 'GitHub',
    color: 'text-[#333333]',
    path: 'M12.001 2C6.47598 2 2.00098 6.475 2.00098 12c0 4.425 2.8625 8.1625 6.8375 9.4875.5.0875.6875-.2125.6875-.475 0-.2375-.0125-1.025-.0125-1.8625-2.5125.4625-3.1625-.6125-3.3625-1.175-.1125-.2875-.6-1.175-1.025-1.4125-.35-.1875-.85-.65-.0125-.6625.7875-.0125 1.35.725 1.5375 1.025.9 1.5125 2.3375 1.0875 2.9125.825.0875-.65.35-1.0875.6375-1.3375-2.225-.25-4.55-1.1125-4.55-4.9375 0-1.0875.3875-1.9875 1.025-2.6875-.1-.25-.45-1.275.1-2.65 0 0 .8375-.2625 2.75 1.025.8-.225 1.65-.3375 2.5-.3375s1.7.1125 2.5.3375c1.9125-1.3 2.75-1.025 2.75-1.025.55 1.375.2 2.4.1 2.65.6375.7 1.025 1.5875 1.025 2.6875 0 3.8375-2.3375 4.6875-4.5625 4.9375.3625.3125.675.9125.675 1.85 0 1.3375-.0125 2.4125-.0125 2.75 0 .2625.1875.575.6875.475C19.259 20.1133 22 16.2963 22.001 12c0-5.525-4.475-10-10-10Z'
  }
];

interface SocialSignInModalProps {
  onClose: () => void;
}

export const SocialSignInModal: React.FC<SocialSignInModalProps> = ({ onClose }) => {
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/60 p-4 backdrop-blur-xs"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-sign-in-title"
        className="w-full max-w-sm overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 id="social-sign-in-title" className="font-serif text-lg font-bold text-stone-900">
              Sign in to your account
            </h2>
            <p className="mt-1 text-xs text-stone-500">Choose a provider to preview the sign-in options.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign-in preview"
            className="rounded-md p-1 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 p-5">
          <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Preview only. Provider authentication is not configured.
          </p>
          {providers.map((provider) => (
            <button
              key={provider.name}
              type="button"
              onClick={() => setStatusMessage(`${provider.name} sign-in is not configured in this demo.`)}
              className="flex w-full items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <svg className={`mr-3 h-4 w-4 ${provider.color}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={provider.path} />
              </svg>
              Login with {provider.name}
            </button>
          ))}
          <p role="status" aria-live="polite" className="min-h-5 pt-1 text-center text-xs text-stone-500">
            {statusMessage}
          </p>
        </div>
      </section>
    </div>
  );
};