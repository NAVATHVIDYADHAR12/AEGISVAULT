import './globals.css';

export const metadata = {
  title: {
    default: 'Aegis Vault — Verify. Collaborate. Prove.',
    template: '%s — Aegis Vault',
  },
  description: 'A centralized secret vault for teams that need provable control over credentials, access, and change.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
