/** Small destination marks for the share sheet (simplified, not official logos). */

export const SaveIcon = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <rect width="40" height="40" rx="12" fill="var(--mint)" />
    <path d="M20 10v14M14 18.5l6 6 6-6M12 28h16" fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WhatsAppIcon = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <rect width="40" height="40" rx="12" fill="#25D366" />
    <path d="M20 9.5a10.5 10.5 0 0 0-9.1 15.8L9.5 30.5l5.3-1.4A10.5 10.5 0 1 0 20 9.5z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
    <path
      d="M16.4 15.2c.3-.7 1-.8 1.4-.2l.8 1.3c.2.4.1.8-.2 1.1l-.5.5c.6 1.3 1.6 2.3 2.9 2.9l.5-.5c.3-.3.7-.4 1.1-.2l1.3.8c.6.4.5 1.1-.2 1.4-2.7 1.2-8.3-4.4-7.1-7.1z"
      fill="#fff"
    />
  </svg>
);

export const InstagramIcon = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <defs>
      <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#FEDA75" />
        <stop offset=".35" stopColor="#FA7E1E" />
        <stop offset=".6" stopColor="#D62976" />
        <stop offset="1" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill="url(#ig-grad)" />
    <rect x="10" y="10" width="20" height="20" rx="6" fill="none" stroke="#fff" strokeWidth="2.4" />
    <circle cx="20" cy="20" r="4.8" fill="none" stroke="#fff" strokeWidth="2.4" />
    <circle cx="26" cy="14" r="1.5" fill="#fff" />
  </svg>
);

export const TikTokIcon = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <rect width="40" height="40" rx="12" fill="#111" />
    <path d="M22.5 10v13.5a4.5 4.5 0 1 1-4.5-4.5" fill="none" stroke="#25F4EE" strokeWidth="2.8" strokeLinecap="round" transform="translate(-1 -1)" />
    <path d="M22.5 10c.6 2.8 2.6 4.8 5.5 5.1" fill="none" stroke="#25F4EE" strokeWidth="2.8" strokeLinecap="round" transform="translate(-1 -1)" />
    <path d="M22.5 10v13.5a4.5 4.5 0 1 1-4.5-4.5" fill="none" stroke="#FE2C55" strokeWidth="2.8" strokeLinecap="round" transform="translate(1 1)" />
    <path d="M22.5 10c.6 2.8 2.6 4.8 5.5 5.1" fill="none" stroke="#FE2C55" strokeWidth="2.8" strokeLinecap="round" transform="translate(1 1)" />
    <path d="M22.5 10v13.5a4.5 4.5 0 1 1-4.5-4.5" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M22.5 10c.6 2.8 2.6 4.8 5.5 5.1" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

export const ShareGlyph = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path d="M10 2.5v10M6.5 6 10 2.5 13.5 6M5 9H3.8v8.2h12.4V9H15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
