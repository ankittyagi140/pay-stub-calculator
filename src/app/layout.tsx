import './globals.css';
import type { Metadata } from 'next';
import { Inter, Montserrat, Source_Sans_3 } from 'next/font/google';

// Define fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap'
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://paystubcalculator.org'),
  title: 'Pay Stub Calculator | Pay Check Calculator | Hours Calculator Paycheck',
  description: 'Calculate your take-home pay with our free paycheck calculator. Account for federal & state taxes, deductions like FICA, Medicare, health insurance, and 401(k) contributions.',
  keywords: 'pay stub calculator, paycheck calculator, paycheck tax calculator, free paycheck calculator, calculate my paycheck, paycheck estimator, payroll check calculator, hourly paycheck calculator, paystub generator with calculator, salary paycheck calculator, federal tax calculator paycheck, take home paycheck calculator, how to calculate taxes on paycheck',
  authors: [{ name: 'PayStub Calculator' }],
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo.svg', type: 'image/svg+xml' }]
  },
  openGraph: {
    title: 'Free Pay Stub Calculator with Tax Deductions | PayStub Calculator',
    description: 'Calculate your paycheck after taxes including federal, state, FICA, Medicare, and other deductions. Generate professional pay stubs instantly.',
    url: 'https://paystubcalculator.org',
    siteName: 'PayStub Calculator',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.jpg' }], // ✅ Better preview than logo.svg
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Paycheck Calculator | Calculate Taxes & Generate Pay Stubs',
    description: 'Calculate your take-home pay with accurate tax deductions. Create professional pay stubs with our free calculator.',
    images: ['/og-image.jpg'], // ✅ Use a proper preview banner
  },
  verification: {
    google: 'TwGBC-YGauR8kmpE9OFznfWfx5XgGnP8ZmeQKXB_9Ig',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <meta name="google-site-verification" content="TwGBC-YGauR8kmpE9OFznfWfx5XgGnP8ZmeQKXB_9Ig" />
        <script type="application/ld+json">
          {`
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pay Stub Calculator",
  "url": "https://paystubcalculator.org",
  "description": "Calculate your take-home pay with our free paycheck calculator. Account for federal & state taxes, deductions like FICA, Medicare, health insurance, and 401(k) contributions.",
  "publisher": {
    "@type": "Organization",
    "name": "PayStub Calculator",
    "logo": {
      "@type": "ImageObject",
      "url": "https://paystubcalculator.org/logo.svg"
    }
  },
  "image": "https://paystubcalculator.org/og-image.jpg",
  "keywords": [
    "pay stub calculator",
    "pay check calculator",
    "paycheck tax calculator",
    "free paycheck calculator",
    "calculate my paycheck",
    "paycheck estimator",
    "payroll check calculator",
    "hourly paycheck calculator",
    "paystub generator with calculator",
    "salary paycheck calculator",
    "federal tax calculator paycheck",
    "take home paycheck calculator",
    "how to calculate taxes on paycheck"
  ],
  "inLanguage": "en"
}
`}
        </script>
      </head>
      <body className={`${inter.variable} ${montserrat.variable} ${sourceSans.variable} font-sans pt-16`}>
        {children}
      </body>
    </html>
  );
}
