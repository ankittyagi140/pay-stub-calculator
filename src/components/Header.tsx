'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  // Navigation items with icons
  const navItems = [
    { 
      href: '/', 
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    { 
      href: '/about', 
      label: 'About',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      href: '/privacy', 
      label: 'Privacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 0 1 2.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0 1 10 1.944ZM11 14a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0v2Zm0-7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      href: '/terms', 
      label: 'Terms',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v10A2.5 2.5 0 0 0 4.5 17h10a2.5 2.5 0 0 0 2.5-2.5v-10A2.5 2.5 0 0 0 14.5 2h-10ZM5 6a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H6Zm0 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H6Z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect' : 'bg-white/95'
    }`}>
      <div className="container-wide px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="font-display text-xl font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
          >
            <Image 
              src="/logo.svg" 
              alt="PayStub Calculator Logo" 
              width={28} 
              height={28}
              className="text-primary"
            />
            <span className="hidden sm:inline font-display">PayStub Calculator</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 text-m font-large rounded-md transition-all flex items-center gap-2 ${
                  isActive(href) 
                    ? 'text-primary bg-primary/5 font-semibold' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="text-inherit">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/5 focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            <svg 
              className="h-6 w-6 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'none' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-64 opacity-100 py-2 border-t border-gray-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="flex flex-col space-y-1 pb-2">
            {navItems.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                  isActive(href)
                    ? 'text-primary bg-primary/5 font-semibold'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="text-inherit">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
} 