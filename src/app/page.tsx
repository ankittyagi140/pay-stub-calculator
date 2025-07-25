'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareIcons from '@/components/ShareIcons';
import type { WorkSheet, WorkBook } from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import Modal from '@/components/Modal';

type PayType = 'hourly' | 'salary';

interface FormData {
  // Employee Information
  fullName: string;
  jobTitle: string;
  employeeId: string;
  employeeAddress: string;
  
  // Employer Information
  companyName: string;
  companyAddress: string;
  employerId: string;
  
  // Pay Period Information
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  
  // Earnings Information
  payType: PayType;
  hourlyRate: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimeRate: number;
  salaryAmount: number;
  bonusesCommission: number;
  
  // Deductions
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirement: number;
  otherDeductions: number;
  otherDeductionsLabel: string;
  
  // Stub Customization
  currency: string;
  notes: string;
}

// Add step interface
interface Step {
  title: string;
  fields: string[];
}

const formSteps: Step[] = [
  {
    title: "Employee Information",
    fields: ["fullName", "jobTitle", "employeeId", "employeeAddress"]
  },
  {
    title: "Employer Information",
    fields: ["companyName", "employerId", "companyAddress"]
  },
  {
    title: "Pay Period",
    fields: ["payPeriodStart", "payPeriodEnd", "payDate"]
  },
  {
    title: "Earnings",
    fields: ["payType", "hourlyRate", "hoursWorked", "overtimeHours", "overtimeRate", "salaryAmount", "bonusesCommission"]
  },
  {
    title: "Deductions",
    fields: ["federalTax", "stateTax", "socialSecurity", "medicare", "healthInsurance", "retirement", "otherDeductionsLabel", "otherDeductions"]
  },
  {
    title: "Additional Information",
    fields: ["notes"]
  }
];

// Add icon mapping for steps
const STEP_ICONS = [
  (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ), // Employee
  (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
  ), // Employer
  (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ), // Pay Period
  (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7a2 2 0 012-2h12a2 2 0 012 2v7c0 2.21-3.582 4-8 4z" /></svg>
  ), // Earnings
  (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7a2 2 0 012-2h12a2 2 0 012 2v7c0 2.21-3.582 4-8 4z" /></svg>
  ), // Deductions
  (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
  ), // Additional
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  const { register, handleSubmit, watch, trigger, formState: { errors, isValid }, reset } = useForm<FormData>({
    defaultValues: {
      socialSecurity: 6.2,
      medicare: 1.45,
      overtimeRate: 1.5,
      currency: 'USD',
      federalTax: 10,
      stateTax: 5
    },
    mode: 'onChange'
  });
  
  const [netPay, setNetPay] = useState<number | null>(null);
  const [grossPay, setGrossPay] = useState<number | null>(null);
  const [deductions, setDeductions] = useState<{
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    healthInsurance: number;
    retirement: number;
    otherDeductions: number;
  }>({
    federalTax: 0,
    stateTax: 0,
    socialSecurity: 0,
    medicare: 0,
    healthInsurance: 0,
    retirement: 0,
    otherDeductions: 0,
  });

  const payType = watch('payType');

  const validateStep = async (stepIndex: number) => {
    const fields = formSteps[stepIndex].fields;
    const result = await trigger(fields as any);
    return result;
  };

  const nextStep = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid && currentStep < formSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      toast.promise(
        new Promise((resolve) => {
          calculatePay(data);
          setIsCalculated(true);
          resolve(true);
        }),
        {
          loading: 'Calculating pay stub...',
          success: 'Pay stub calculated successfully!',
          error: 'Failed to calculate pay stub',
        }
      );
    }
  };

  // Calculation function
  const calculatePay = (data: FormData) => {
    let gross = 0;
    
    if (data.payType === 'hourly') {
      const hourlyRate = Number(data.hourlyRate) || 0;
      const hoursWorked = Number(data.hoursWorked) || 0;
      const overtimeHours = Number(data.overtimeHours) || 0;
      const overtimeRate = Number(data.overtimeRate) || 1.5;
      
      const regularPay = hourlyRate * hoursWorked;
      const overtimePay = overtimeHours * (hourlyRate * overtimeRate);
      gross = regularPay + overtimePay;
    } else {
      gross = Number(data.salaryAmount) || 0;
    }
    
    // Add bonuses/commission
    gross += Number(data.bonusesCommission) || 0;
    setGrossPay(gross);

    const fedTax = gross * (Number(data.federalTax) / 100) || 0;
    const stateTaxAmount = gross * (Number(data.stateTax) / 100) || 0;
    const socialSecurityAmount = gross * (Number(data.socialSecurity) / 100) || 0;
    const medicareAmount = gross * (Number(data.medicare) / 100) || 0;
    const healthInsuranceAmount = Number(data.healthInsurance) || 0;
    const retirementAmount = Number(data.retirement) || 0;
    const otherDeductionAmount = Number(data.otherDeductions) || 0;

    setDeductions({
      federalTax: fedTax,
      stateTax: stateTaxAmount,
      socialSecurity: socialSecurityAmount,
      medicare: medicareAmount,
      healthInsurance: healthInsuranceAmount,
      retirement: retirementAmount,
      otherDeductions: otherDeductionAmount,
    });

    const totalDeductions =
      fedTax +
      stateTaxAmount +
      socialSecurityAmount +
      medicareAmount +
      healthInsuranceAmount +
      retirementAmount +
      otherDeductionAmount;

    const net = gross - totalDeductions;
    setNetPay(net);
  };

  // Handle PDF Download
  const downloadPayStub = async () => {
    const element = document.getElementById('paystub');
    if (!element || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.75,
        filename: `pay_stub_${watch('fullName').replace(/\s+/g, '_')}_${watch('payPeriodStart')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true, logging: false, dpi: 300, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compress: true, precision: 16 },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await toast.promise(
        html2pdf().set(opt).from(element).save(),
        {
          loading: 'Generating PDF...',
          success: 'PDF downloaded successfully!',
          error: 'Failed to generate PDF',
        }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Excel Download
  const downloadExcel = async () => {
    if (isGeneratingExcel || !grossPay || !netPay) return;
    try {
      setIsGeneratingExcel(true);
      
      await toast.promise(
        (async () => {
          const XLSX = await import('xlsx');
          
          // Create a simple array of arrays for the data
          const data = [
            ['Pay Stub Details'],
            [],
            ['Company Information'],
            ['Company Name:', watch('companyName')],
            ['Company Address:', watch('companyAddress')],
            ['Employer ID:', watch('employerId')],
            [],
            ['Employee Information'],
            ['Employee Name:', watch('fullName')],
            ['Job Title:', watch('jobTitle')],
            ['Employee ID:', watch('employeeId')],
            ['Employee Address:', watch('employeeAddress')],
            [],
            ['Pay Period Information'],
            ['Pay Period:', `${watch('payPeriodStart')} to ${watch('payPeriodEnd')}`],
            ['Pay Date:', watch('payDate')],
            [],
            ['Earnings'],
            ['Gross Pay:', `${getCurrencySymbol(watch('currency'))}${grossPay.toFixed(2)}`],
            [],
            ['Deductions'],
            ['Federal Tax:', `${getCurrencySymbol(watch('currency'))}${deductions.federalTax.toFixed(2)}`],
            ['State Tax:', `${getCurrencySymbol(watch('currency'))}${deductions.stateTax.toFixed(2)}`],
            ['Social Security:', `${getCurrencySymbol(watch('currency'))}${deductions.socialSecurity.toFixed(2)}`],
            ['Medicare:', `${getCurrencySymbol(watch('currency'))}${deductions.medicare.toFixed(2)}`],
            ['Health Insurance:', `${getCurrencySymbol(watch('currency'))}${deductions.healthInsurance.toFixed(2)}`],
            ['401(k):', `${getCurrencySymbol(watch('currency'))}${deductions.retirement.toFixed(2)}`]
          ];

          // Add other deductions if they exist
          if (watch('otherDeductionsLabel')) {
            data.push([
              `${watch('otherDeductionsLabel')}:`,
              `${getCurrencySymbol(watch('currency'))}${deductions.otherDeductions.toFixed(2)}`
            ]);
          }

          // Add net pay
          data.push(
            [],
            ['Net Pay:', `${getCurrencySymbol(watch('currency'))}${netPay.toFixed(2)}`]
          );

          // Add notes if they exist
          if (watch('notes')) {
            data.push(
              [],
              ['Notes:', watch('notes')]
            );
          }

          // Create a new workbook
          const wb = XLSX.utils.book_new();
          
          // Convert the data to a worksheet
          const ws = XLSX.utils.aoa_to_sheet(data);

          // Set column widths
          ws['!cols'] = [{ wch: 25 }, { wch: 35 }];

          // Add some styling
          ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]; // Merge first row
          
          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, 'Pay Stub');

          // Generate the Excel file
          const fileName = `pay_stub_${watch('fullName').replace(/\s+/g, '_')}_${watch('payPeriodStart')}.xlsx`;
          
          // Write the file using FileSaver
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })(),
        {
          loading: 'Generating Excel file...',
          success: 'Excel file downloaded successfully!',
          error: 'Failed to generate Excel file',
        }
      );
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error(`Failed to generate Excel. ${(error as Error).message}`);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Handle Word Download
  const downloadWord = async () => {
    if (isGeneratingWord || !grossPay || !netPay) return;
    try {
      setIsGeneratingWord(true);
      const { Document, Paragraph, HeadingLevel, Packer } = await import('docx');
      
      const paragraphs = [
        new Paragraph({
          text: `Pay Stub - ${watch('fullName')}`,
          heading: HeadingLevel.HEADING_1
        }),
        new Paragraph({
          text: `Pay Period: ${watch('payPeriodStart')} to ${watch('payPeriodEnd')}`
        }),
        new Paragraph({
          text: `Gross Pay: ${getCurrencySymbol(watch('currency'))}${grossPay.toFixed(2)}`
        }),
        new Paragraph({
          text: `Federal Tax: ${getCurrencySymbol(watch('currency'))}${deductions.federalTax.toFixed(2)}`
        }),
        new Paragraph({
          text: `State Tax: ${getCurrencySymbol(watch('currency'))}${deductions.stateTax.toFixed(2)}`
        }),
        new Paragraph({
          text: `Social Security: ${getCurrencySymbol(watch('currency'))}${deductions.socialSecurity.toFixed(2)}`
        }),
        new Paragraph({
          text: `Medicare: ${getCurrencySymbol(watch('currency'))}${deductions.medicare.toFixed(2)}`
        }),
        new Paragraph({
          text: `Health Insurance: ${getCurrencySymbol(watch('currency'))}${deductions.healthInsurance.toFixed(2)}`
        }),
        new Paragraph({
          text: `401(k): ${getCurrencySymbol(watch('currency'))}${deductions.retirement.toFixed(2)}`
        }),
        new Paragraph({
          text: `Net Pay: ${getCurrencySymbol(watch('currency'))}${netPay.toFixed(2)}`,
          heading: HeadingLevel.HEADING_2
        })
      ];

      // Add other deductions if label exists
      if (watch('otherDeductionsLabel')) {
        paragraphs.splice(-1, 0, new Paragraph({
          text: `${watch('otherDeductionsLabel')}: ${getCurrencySymbol(watch('currency'))}${deductions.otherDeductions.toFixed(2)}`
        }));
      }
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pay_stub_${watch('fullName').replace(/\s+/g, '_')}_${watch('payPeriodStart')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
        return '₹';
      case 'CAD':
        return 'C$';
      case 'AUD':
        return 'A$';
      case 'JPY':
        return '¥';
      default:
        return '$';
    }
  };

  // Enhanced ProgressIndicator with icons and progress bar
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="relative w-full max-w-2xl mx-auto mb-4">
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 rounded-full -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-2 bg-blue-500 rounded-full z-10 transition-all duration-300"
          style={{
            width: `${((currentStep) / (formSteps.length - 1)) * 100}%`,
            minWidth: '2rem',
          }}
        />
        <div className="flex justify-between relative z-20">
          {formSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center w-1/6">
              <button
                type="button"
                onClick={() => index < currentStep && setCurrentStep(index)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200
                  ${index === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg'
                    : index < currentStep
                    ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 cursor-pointer'
                    : 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'}
                `}
                aria-label={`Step ${index + 1}: ${step.title}`}
              >
                {STEP_ICONS[index]}
              </button>
              <span className={`mt-2 text-xs text-center font-medium ${index === currentStep ? 'text-blue-700' : 'text-gray-500'}`}>{step.title.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Step {currentStep + 1} of {formSteps.length}:</span>
          <span className="ml-2">{formSteps[currentStep].title}</span>
        </div>
      </div>
    </div>
  );

  // Add color constants for the pie chart
  const COLORS = {
    netPay: '#10b981',  // Emerald green for net pay
    federalTax: '#f59e0b',  // Amber for federal tax
    stateTax: '#fbbf24',  // Light amber for state tax
    socialSecurity: '#fcd34d',  // Gold for social security
    medicare: '#fef3c7',  // Pale gold for medicare
    healthInsurance: '#a78bfa',  // Purple for health insurance
    retirement: '#c4b5fd',  // Light purple for retirement
    otherDeductions: '#d8b4fe'  // Lavender for other deductions
  };

  // Add function to prepare pie chart data
  const getPieChartData = () => {
    if (!grossPay || !netPay) return [];

    const data = [
      { name: 'Take Home Salary', value: netPay, color: COLORS.netPay },
      { name: 'Federal Tax', value: deductions.federalTax, color: COLORS.federalTax },
      { name: 'State Tax', value: deductions.stateTax, color: COLORS.stateTax },
      { name: 'Social Security', value: deductions.socialSecurity, color: COLORS.socialSecurity },
      { name: 'Medicare', value: deductions.medicare, color: COLORS.medicare }
    ];

    // Add optional deductions if they exist
    if (deductions.healthInsurance > 0) {
      data.push({ name: 'Health Insurance', value: deductions.healthInsurance, color: COLORS.healthInsurance });
    }
    if (deductions.retirement > 0) {
      data.push({ name: '401(k)', value: deductions.retirement, color: COLORS.retirement });
    }
    if (deductions.otherDeductions > 0 && watch('otherDeductionsLabel')) {
      data.push({ 
        name: watch('otherDeductionsLabel'), 
        value: deductions.otherDeductions, 
        color: COLORS.otherDeductions 
      });
    }

    return data;
  };

  // Add custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
  return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-gray-600">
            {getCurrencySymbol(watch('currency'))}{data.value.toFixed(2)}
            <span className="ml-2 text-gray-500">
              ({((data.value / grossPay!) * 100).toFixed(2)}%)
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleResetConfirm = () => {
    reset({
      socialSecurity: 6.2,
      medicare: 1.45,
      overtimeRate: 1.5,
      currency: 'USD',
      federalTax: 10,
      stateTax: 5
    });
    setCurrentStep(0);
    setIsCalculated(false);
    setNetPay(null);
    setGrossPay(null);
    setDeductions({
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      healthInsurance: 0,
      retirement: 0,
      otherDeductions: 0,
    });
    toast.success('Form has been reset successfully');
    setIsResetModalOpen(false);
  };

  const handleDownloadConfirm = () => {
    downloadPayStub();
    setIsDownloadModalOpen(false);
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const handleDownloadClick = () => {
    if (!isCalculated) {
      setIsDownloadModalOpen(true);
      return;
    }
    downloadPayStub();
  };

  // Add isStepValid function here
  const isStepValid = async (stepIndex: number) => {
    const fields = formSteps[stepIndex].fields;
    const result = await trigger(fields as any);
    return result;
  };

  return (
    <>
      <Header />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '0.5rem',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset all form fields? This action cannot be undone."
        confirmText="Reset"
        type="warning"
      />
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onConfirm={handleDownloadConfirm}
        title="Calculate First"
        message="Please calculate the pay stub before downloading. Would you like to calculate now?"
        confirmText="Calculate"
        type="info"
      />
      
      <main className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="container-wide px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 font-display">
              Free <span className="text-primary">Pay Stub</span> Calculator
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-gray-700">
              Calculate Your Paycheck After Taxes & Generate Professional Pay Stubs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Account for federal, state, and local taxes, plus common deductions like FICA, Medicare, health insurance, and retirement contributions. Create accurate pay stubs instantly.
            </p>
            <div className="flex justify-center mt-6 mb-2">
              <div className="inline-block">
                <ShareIcons 
                  title="Free Pay Stub Calculator - Generate Professional Pay Stubs"
                  description="Calculate your take-home pay accounting for taxes and deductions. Generate professional pay stubs with our free calculator."
                  hashtags={["paystub", "calculator", "paycheck", "salary"]}
                />
        </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side - Form */}
            <div className="lg:w-[45%]">
              {/* Currency Selection */}
              <div className="mb-8 flex justify-end">
                <div className="w-48">
                  <label className="form-label mb-1">Select Currency</label>
                  <select
                    {...register('currency')}
                    className="form-select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-card shadow-card">
                <ProgressIndicator />

                {/* Step Content */}
                <div className="transition-all duration-300 ease-in-out">
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">Employee Information</h2>
                      
                      {/* Tips card */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-700 mb-1">Tips for Employee Information</h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                          <li>Enter your legal name as it appears on official documents</li>
                          <li>Include your complete address with zip/postal code</li>
                          <li>If you have an employee ID number, it can usually be found on your company ID card</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input
                            {...register('fullName', { required: true })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Full Name"
                          />
                          {errors.fullName && <p className="text-red-500 text-sm mt-1">Full name is required</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            {...register('jobTitle')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Job Title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                          <input
                            {...register('employeeId')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee ID"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <textarea
                            {...register('employeeAddress', { required: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee Address"
                            rows={3}
                          />
                          {errors.employeeAddress && <p className="text-red-500 text-sm mt-1">Address is required</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">Employer Information</h2>
                      
                      {/* Tips card */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-700 mb-1">Tips for Employer Information</h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                          <li>Your company's EIN (Employer Identification Number) is a 9-digit number</li>
                          <li>This information can typically be found on previous pay stubs</li>
                          <li>Include the complete company address for accurate documentation</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                          <input
                            {...register('companyName', { required: true })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Company Name"
                          />
                          {errors.companyName && <p className="text-red-500 text-sm mt-1">Company name is required</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employer ID (EIN)</label>
                          <input
                            {...register('employerId')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Employer ID"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Address *</label>
                          <textarea
                            {...register('companyAddress', { required: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Company Address"
                            rows={3}
                          />
                          {errors.companyAddress && <p className="text-red-500 text-sm mt-1">Company address is required</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">Pay Period Information</h2>
                      
                      {/* Tips card */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-700 mb-1">Tips for Pay Period</h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                          <li>Pay period dates should match your company's official pay schedule</li>
                          <li>Typically, the pay date is a few days after the pay period ends</li>
                          <li>Common pay periods include weekly, bi-weekly, semi-monthly, and monthly</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period Start *</label>
                          <input
                            {...register('payPeriodStart', { required: true })}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.payPeriodStart && <p className="text-red-500 text-sm mt-1">Start date is required</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period End *</label>
                          <input
                            {...register('payPeriodEnd', { required: true })}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.payPeriodEnd && <p className="text-red-500 text-sm mt-1">End date is required</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date *</label>
                          <input
                            {...register('payDate', { required: true })}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.payDate && <p className="text-red-500 text-sm mt-1">Pay date is required</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">Earnings Information</h2>
                      
                      {/* Tips card */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-700 mb-1">Tips for Earnings</h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                          <li>For hourly employees: standard overtime rate is typically 1.5x regular pay</li>
                          <li>Include all bonuses and commissions earned during this pay period</li>
                          <li>For salary employees: enter your gross salary for this pay period</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type *</label>
                          <select
                            {...register('payType', { required: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="salary">Salary</option>
                          </select>
                          {errors.payType && <p className="text-red-500 text-sm mt-1">Pay type is required</p>}
                        </div>

                        {payType === 'hourly' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate *</label>
                              <input
                                {...register('hourlyRate', { 
                                  required: payType === 'hourly',
                                  min: { value: 0, message: 'Hourly rate must be positive' },
                                  valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Hourly Rate"
                              />
                              {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate.message || 'Hourly rate is required'}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked *</label>
                              <input
                                {...register('hoursWorked', { 
                                  required: payType === 'hourly',
                                  min: { value: 0, message: 'Hours worked must be positive' },
                                  valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Hours Worked"
                              />
                              {errors.hoursWorked && <p className="text-red-500 text-sm mt-1">{errors.hoursWorked.message || 'Hours worked is required'}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                              <input
                                {...register('overtimeHours')}
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Overtime Hours"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate</label>
                              <input
                                {...register('overtimeRate')}
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Overtime Rate"
                                defaultValue={1.5}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Amount *</label>
                            <input
                              {...register('salaryAmount', { 
                                required: payType === 'salary',
                                min: { value: 0, message: 'Salary amount must be positive' },
                                valueAsNumber: true
                              })}
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Salary Amount"
                            />
                            {errors.salaryAmount && <p className="text-red-500 text-sm mt-1">{errors.salaryAmount.message || 'Salary amount is required'}</p>}
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bonuses/Commission</label>
                          <input
                            {...register('bonusesCommission')}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Bonuses/Commission"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">Deductions</h2>
                      
                      {/* Tips card */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-700 mb-1">Tips for Deductions</h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                          <li>Federal tax rates typically range from 10% to 37% based on income level</li>
                          <li>FICA deductions include 6.2% for Social Security and 1.45% for Medicare</li>
                          <li>Common other deductions include union dues, garnishments, or charitable contributions</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax % *</label>
                          <input
                            {...register('federalTax', { required: true, valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Federal Tax %"
                            defaultValue={10}
                          />
                          {errors.federalTax && <p className="text-red-500 text-sm mt-1">Federal tax is required</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State Tax %</label>
                          <input
                            {...register('stateTax', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="State Tax %"
                            defaultValue={5}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Social Security % (FICA)</label>
                          <input
                            {...register('socialSecurity', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Social Security %"
                            defaultValue={6.2}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicare % (FICA)</label>
                          <input
                            {...register('medicare', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Medicare %"
                            defaultValue={1.45}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Health Insurance Deduction</label>
                          <input
                            {...register('healthInsurance', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Health Insurance Deduction"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">401(k) Deduction</label>
                          <input
                            {...register('retirement', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="401(k) Deduction"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions Label</label>
                          <input
                            {...register('otherDeductionsLabel')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Other Deductions Label"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions Amount</label>
                          <input
                            {...register('otherDeductions', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Other Deductions Amount"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800">Additional Information</h2>
                      
                      {/* Tips card */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-700 mb-1">Tips for Additional Information</h3>
                        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                          <li>Include any relevant notes about special circumstances for this pay period</li>
                          <li>Note explanations for unusual pay rates, bonuses, or adjustments</li>
                          <li>This information will appear on your generated pay stub</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes or Memo</label>
                          <textarea
                            {...register('notes')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notes or Memo"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-button
                    bg-gray-100 text-gray-700 hover:bg-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    transition-all duration-200 ease-in-out
                    transform hover:scale-105 active:scale-95
                    shadow-sm hover:shadow
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Form
                  </button>
                  
                  <div className="flex items-center gap-3 ml-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-button
                      bg-white text-gray-700 border border-gray-300
                      hover:bg-gray-50 hover:text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                      transition-all duration-200 ease-in-out
                      transform hover:scale-105 active:scale-95
                      shadow-sm hover:shadow
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      disabled:hover:bg-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const isValid = await isStepValid(currentStep);
                        if (isValid) {
                          if (currentStep < formSteps.length - 1) {
                            setCurrentStep(currentStep + 1);
                          } else {
                            handleSubmit(onSubmit)();
                          }
                        } else {
                          toast.error('Please fill in all required fields for this step');
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-button
                      bg-primary text-white
                      hover:bg-primary-dark 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                      transition-all duration-200 ease-in-out
                      transform hover:scale-105 active:scale-95
                      shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      disabled:hover:bg-primary"
                    >
                      {currentStep < formSteps.length - 1 ? (
                        <>
                          Next
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Calculate
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right side - Results */}
            <div className="lg:w-[55%]">
              {isCalculated && grossPay !== null && netPay !== null ? (
                <div className="space-y-8">
                  {/* Download Buttons - Moved to top */}
                  <div className="flex flex-wrap justify-end gap-4">
                    <button
                      onClick={handleDownloadClick}
                      disabled={isGeneratingPdf}
                      className="inline-flex items-center px-4 py-2 bg-danger text-white font-medium rounded-button hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          Download PDF
                        </>
                      )}
                    </button>

                    <button
                      onClick={downloadExcel}
                      disabled={isGeneratingExcel}
                      className="inline-flex items-center px-4 py-2 bg-success text-white font-medium rounded-button hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingExcel ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                          </svg>
                          Download Excel
                        </>
                      )}
                    </button>
                  </div>

                  <div id="paystub" className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{watch('companyName')}</h2>
                        <p className="text-gray-600 whitespace-pre-line">{watch('companyAddress')}</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-800">{watch('fullName')}</h2>
                        <p className="text-gray-600">{watch('employeeAddress')}</p>
                        {watch('jobTitle') && <p className="text-gray-600">{watch('jobTitle')}</p>}
                        {watch('employeeId') && <p className="text-gray-600">ID: {watch('employeeId')}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-gray-600">Pay Period:</p>
                        <p className="font-medium">{watch('payPeriodStart')} to {watch('payPeriodEnd')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pay Date:</p>
                        <p className="font-medium">{watch('payDate')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Currency:</p>
                        <p className="font-medium">{watch('currency')}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Gross Pay:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{grossPay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Federal Tax:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{deductions.federalTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">State Tax:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{deductions.stateTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Social Security:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{deductions.socialSecurity.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Medicare:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{deductions.medicare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Health Insurance:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{deductions.healthInsurance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">401(k):</span>
                        <span>{getCurrencySymbol(watch('currency'))}{deductions.retirement.toFixed(2)}</span>
                      </div>
                      {watch('otherDeductionsLabel') && (
                        <div className="flex justify-between">
                          <span className="font-medium">{watch('otherDeductionsLabel')}:</span>
                          <span>{getCurrencySymbol(watch('currency'))}{deductions.otherDeductions.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 my-2"></div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Net Pay:</span>
                        <span>{getCurrencySymbol(watch('currency'))}{netPay.toFixed(2)}</span>
                      </div>
                    </div>

                    {watch('notes') && (
                      <div className="mt-6 pt-4 border-t border-gray-300">
                        <p className="text-gray-600">{watch('notes')}</p>
                      </div>
                    )}
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Where is your money going?</h2>
                    <div className="flex flex-col items-center justify-between">
                      <div className="w-full">
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getPieChartData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {getPieChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                formatter={(value, entry: any) => (
                                  <span className="text-gray-700">
                                    {value} ({((entry.payload.value / grossPay!) * 100).toFixed(1)}%)
                                  </span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
    </div>
                      </div>
                      <div className="w-full mt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
                            <p className="text-gray-600">Gross Pay: {getCurrencySymbol(watch('currency'))}{grossPay.toFixed(2)}</p>
                            <p className="text-gray-600">
                              Total Deductions: {getCurrencySymbol(watch('currency'))}
                              {(grossPay - netPay).toFixed(2)} ({((grossPay - netPay) / grossPay * 100).toFixed(1)}%)
                            </p>
                            <p className="text-gray-600 font-medium">Net Pay: {getCurrencySymbol(watch('currency'))}{netPay.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white p-8 rounded-card shadow-card">
                  <div className="text-center max-w-lg">
                    <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Your Pay Stub Preview</h3>
                    <p className="text-gray-500 mb-4">Fill out the form to generate your personalized pay stub. Follow the steps to provide all necessary information.</p>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-left">
                      <h4 className="font-medium text-yellow-700 mb-2">Did you know?</h4>
                      <ul className="text-sm text-yellow-800 space-y-2 ml-4 list-disc">
                        <li>The average American worker will receive over 1,000 pay stubs in their lifetime</li>
                        <li>In most states, employers are legally required to provide pay stubs</li>
                        <li>Digital pay stubs reduce paper waste and are easier to store</li>
                        <li>Keeping your pay stubs is important for tax purposes and loan applications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Comprehensive Information Section */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">Understanding Your Federal Paycheck</h2>
            
            <div className="space-y-12">
              {/* Quick Facts Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Quick Facts</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Federal income tax rates range from 10% up to 37%</li>
                  <li>The U.S. median household income in 2023 was $77,719 (adjusted for inflation)</li>
                  <li>9 U.S. states don't impose their own income tax for tax years 2024 and 2025</li>
                </ul>
              </section>

              {/* How Your Paycheck Works Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">How Your Paycheck Works</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    When you start a new job or get a raise, you'll agree to either an hourly wage or an annual salary. But calculating your weekly take-home pay isn't a simple matter of multiplying your hourly wage by the number of hours you'll work each week, or dividing your annual salary by 52. That's because your employer withholds taxes from each paycheck, lowering your overall pay.
                  </p>
                  <p className="text-gray-700">
                    Tax withholding is the money that comes out of your paycheck in order to pay taxes, with the biggest one being income taxes. The federal government collects your income tax payments gradually throughout the year by taking directly from each of your paychecks. It's your employer's responsibility to withhold this money based on the information you provide in your Form W-4.
                  </p>
                </div>
              </section>

              {/* Tax Brackets Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Federal Tax Brackets</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">2024 Tax Year (due April 2025)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Taxable Income</th>
                            <th className="border border-gray-300 p-2">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-gray-300 p-2">$0 - $11,600</td><td className="border border-gray-300 p-2">10%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$11,600 - $47,150</td><td className="border border-gray-300 p-2">12%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$47,150 - $100,525</td><td className="border border-gray-300 p-2">22%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$100,525 - $191,950</td><td className="border border-gray-300 p-2">24%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$191,950 - $243,725</td><td className="border border-gray-300 p-2">32%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$243,725 - $609,350</td><td className="border border-gray-300 p-2">35%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$609,350+</td><td className="border border-gray-300 p-2">37%</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-medium mb-3">2025 Tax Year (due April 2026)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Taxable Income</th>
                            <th className="border border-gray-300 p-2">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-gray-300 p-2">$0 - $11,925</td><td className="border border-gray-300 p-2">10%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$11,925 - $48,475</td><td className="border border-gray-300 p-2">12%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$48,475 - $103,350</td><td className="border border-gray-300 p-2">22%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$103,350 - $197,300</td><td className="border border-gray-300 p-2">24%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$197,300 - $250,525</td><td className="border border-gray-300 p-2">32%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$250,525 - $626,350</td><td className="border border-gray-300 p-2">35%</td></tr>
                          <tr><td className="border border-gray-300 p-2">$626,350+</td><td className="border border-gray-300 p-2">37%</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* FICA Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">FICA Withholding</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    FICA (Federal Insurance Contributions Act) taxes are your contribution to Social Security and Medicare programs. These contributions are shared between employees and employers:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Social Security tax: 6.2% (income up to $168,600 for 2024, $176,100 for 2025)</li>
                    <li>Medicare tax: 1.45% (no income limit)</li>
                    <li>Additional Medicare tax: 0.9% for high earners</li>
                  </ul>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Additional Medicare Tax Thresholds:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>$200,000 for single filers, heads of household and qualifying widow(er)s</li>
                      <li>$250,000 for married taxpayers filing jointly</li>
                      <li>$125,000 for married taxpayers filing separately</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Deductions Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Common Paycheck Deductions</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Beyond mandatory federal tax and FICA withholdings, several other deductions may affect your take-home pay:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Pre-tax Deductions</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Health insurance premiums</li>
                        <li>HSA/FSA contributions</li>
                        <li>Traditional 401(k) or 403(b) contributions</li>
                        <li>State and local taxes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Post-tax Deductions</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Roth 401(k) contributions</li>
                        <li>Disability insurance</li>
                        <li>Life insurance</li>
                        <li>Union dues</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pay Frequency Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Pay Frequency</h3>
                <p className="text-gray-700">
                  Your pay frequency affects the size of each paycheck. Common pay schedules include:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
                  <li>Monthly (12 paychecks per year)</li>
                  <li>Semi-monthly (24 paychecks per year, on set dates)</li>
                  <li>Bi-weekly (26 paychecks per year)</li>
                  <li>Weekly (52 paychecks per year)</li>
                </ul>
              </section>

              {/* FAQ Section */}
              <section className="my-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Frequently Asked Questions</h3>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <h4 className="text-lg font-medium text-gray-800">How accurate is this pay stub calculator?</h4>
                        <span className="text-primary group-open:rotate-180 transition-transform duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200">
                        <p className="text-gray-700">
                          This calculator provides a close estimate of your take-home pay based on common tax rates and deductions. For the most accurate calculations, we recommend adjusting the tax percentages to match your specific tax brackets and consulting with a tax professional for personalized advice. The calculator uses standard FICA rates (6.2% for Social Security and 1.45% for Medicare) but does not account for state-specific rules or special circumstances.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <h4 className="text-lg font-medium text-gray-800">Are the generated pay stubs legally valid?</h4>
                        <span className="text-primary group-open:rotate-180 transition-transform duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200">
                        <p className="text-gray-700">
                          The pay stubs generated by this calculator are for informational purposes only and are not official payroll documents. While they can be useful for personal record-keeping, budgeting, and estimating taxes, they should not be used as official documentation for loan applications, housing verification, or legal purposes. Official pay stubs must be issued by an employer or authorized payroll provider following applicable regulations.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <h4 className="text-lg font-medium text-gray-800">How do I calculate overtime pay correctly?</h4>
                        <span className="text-primary group-open:rotate-180 transition-transform duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200">
                        <p className="text-gray-700">
                          Standard overtime is typically calculated at 1.5 times (time and a half) your regular hourly rate for hours worked beyond 40 hours per week. In the calculator, enter your regular hourly rate, standard hours worked (up to 40), and then any overtime hours separately. The calculator will automatically apply the overtime multiplier (default 1.5x) to calculate your overtime pay. Some jobs or locations may have different overtime rules, so you can adjust the overtime rate multiplier as needed.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <h4 className="text-lg font-medium text-gray-800">What's the difference between gross pay and net pay?</h4>
                        <span className="text-primary group-open:rotate-180 transition-transform duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200">
                        <p className="text-gray-700">
                          Gross pay is your total earnings before any taxes or deductions are taken out. It includes your base pay (hourly wages or salary), overtime pay, bonuses, commissions, and other forms of compensation. Net pay, also called take-home pay, is what you actually receive after all deductions have been subtracted from your gross pay. Deductions typically include federal and state income taxes, Social Security and Medicare taxes (FICA), health insurance premiums, retirement contributions, and other withholdings. The pay stub calculator shows both values so you can understand the complete breakdown of your earnings.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              </section>

              {/* Local Factors Section */}
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Local Tax Factors</h3>
                <p className="text-gray-700">
                  State and local taxes can significantly impact your take-home pay. Like federal taxes, these are typically withheld from each paycheck based on your location and local tax rates. Consider consulting a tax professional to understand your specific local tax obligations.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 

