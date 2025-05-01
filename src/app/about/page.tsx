'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareIcons from '@/components/ShareIcons';
import AuthorProfile from '@/components/AuthorProfile';

export default function About() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16 pt-24">
        <div className="container-wide px-4">
          <div className="bg-white p-8 rounded-lg shadow-md prose prose-indigo max-w-none">
            <h1>About Our Pay Stub Calculator</h1>
            
            <h2>Our Mission</h2>
            <p>
              We created this pay stub calculator to help employees and employers better understand their paychecks. Our goal is to provide a simple, accurate, and comprehensive tool that makes it easy to calculate take-home pay while accounting for various deductions and taxes.
            </p>

            <h2>Features</h2>
            <ul>
              <li>Calculate both hourly and salary-based pay</li>
              <li>Account for federal and state taxes</li>
              <li>Include FICA (Social Security and Medicare) deductions</li>
              <li>Add health insurance and retirement contributions</li>
              <li>Support for multiple currencies</li>
              <li>Generate downloadable PDF, Excel, and Word documents</li>
              <li>Visual breakdown of earnings and deductions with interactive charts</li>
              <li>Multi-step form for easier data entry</li>
            </ul>

            <h2>How It Works</h2>
            <p>
              Our calculator uses up-to-date tax information and standard payroll formulas to provide accurate estimates of take-home pay. Users simply input their earnings, deductions, and tax information, and our tool does the rest, generating a professional pay stub that can be downloaded in multiple formats.
            </p>
            <p>
              The multi-step form guides you through the process, ensuring you don't miss any important information and making the experience more user-friendly.
            </p>

            <h2>Accuracy</h2>
            <p>
              While we strive to provide accurate calculations, please note that this calculator is for informational purposes only. Actual pay stubs may vary based on specific tax laws, local regulations, and employer policies. We recommend consulting with a tax professional for precise calculations.
            </p>

            <h2>Privacy</h2>
            <p>
              Your privacy is important to us. All calculations are performed locally in your browser, and we do not store any of your personal or financial information. For more details, please see our <a href="/privacy">Privacy Policy</a>.
            </p>

            <h2>Contact Us</h2>
            <p>
              Have questions or suggestions? We'd love to hear from you. Please reach out to us at <a href="mailto:paystubcalculator@gmail.com">paystubcalculator@gmail.com</a>.
            </p>
            
            <div className="mt-8 border-t pt-6">
              <ShareIcons 
                title="About PayStub Calculator - Free Online Pay Stub Generator" 
                description="Learn about our simple, accurate, and comprehensive tool that makes it easy to calculate take-home pay and generate professional pay stubs."
              />
            </div>
          </div>
        </div>
      </main>
      <AuthorProfile />
      <Footer />
    </>
  );
} 