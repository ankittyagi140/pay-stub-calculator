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
  keywords: [
    'pay stub calculator',
    'paycheck calculator',
    'paycheck tax calculator',
    'free paycheck calculator',
    'calculate my paycheck',
    'paycheck estimator',
    'payroll check calculator',
    'hourly paycheck calculator',
    'paystub generator with calculator',
    'salary paycheck calculator',
    'federal tax calculator paycheck',
    'take home paycheck calculator',
    'how to calculate taxes on paycheck'
  ],
  authors: [{ name: 'PayStub Calculator' }],
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/logo.svg', type: 'image/svg+xml' }
    ]
  },
  openGraph: {
    title: 'Pay Stub Calculator | Pay Check Calculator | Hours Calculator Paycheck',
    description: 'Calculate your take-home pay with our free pay check and pay stub calculator',
    url: 'https://paystubcalculator.org',
    siteName: 'PayStub Calculator',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Pay Stub Calculator - Calculate your take-home pay'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pay Stub Calculator | Pay Check Calculator | Hours Calculator Paycheck',
    description: 'Calculate your take-home pay with our free pay check and pay stub calculator',
    images: [{
      url: '/og-image.jpg',
      alt: 'PayStub Calculator Preview'
    }],
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
    <html lang="en-US">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://paystubcalculator.org" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="google-site-verification" content="TwGBC-YGauR8kmpE9OFznfWfx5XgGnP8ZmeQKXB_9Ig" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Pay Stub Calculator",
              "url": "https://paystubcalculator.org",
              "description": "Calculate your take-home pay with our free pay check and pay stub calculator",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "publisher": {
                "@type": "Organization",
                "name": "PayStub Calculator",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://paystubcalculator.org/logo.svg",
                },
              },
              "image": "https://paystubcalculator.org/og-image.jpg",
              "keywords": [
                "pay stub calculator",
                "online pay stub calculator",
                "paycheck stub calculator",
                "paycheck tax calculator",
                "free paycheck calculator",
                "net paycheck calculator",
                "calculate my paycheck",
                "paycheck estimator",
                "payroll check calculator",
                "hourly paycheck calculator",
                "hourly pay stub calculator",
                "salary paycheck calculator",
                "salary pay stub calculator",
                "federal tax calculator paycheck",
                "take home paycheck calculator",
                "how to calculate taxes on paycheck",
                "adp pay stub calculator",
                "free online pay stub calculator",
                "free pay check calculator",
              ],
              "inLanguage": "en-US",
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} ${sourceSans.variable} font-sans pt-16`}>
        {children}
      </body>
    </html>
  );
}