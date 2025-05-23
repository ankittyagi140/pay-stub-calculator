import Image from 'next/image';
import Link from 'next/link';

export default function AuthorProfile() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-indigo-50 shadow-lg">
                <Image
                  src="/author-profile.jpg"
                  alt="Ankit Tyagi - Full Stack Developer"
                  fill
                  className="object-cover"
                  priority
                />
              </div> */}
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Ankit Tyagi</h2>
                  <p className="text-lg text-indigo-600 font-medium mt-1">
                    Full Stack Developer & Financial Technology Expert
                  </p>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Passionate about creating intuitive financial tools that make complex calculations simple. 
                  Specializing in full-stack development with a focus on React, Node.js, and modern web technologies.
                </p>
                
                <div className="flex gap-4 justify-center md:justify-start">
                  <Link 
                    href="https://github.com/ankittyagi140" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </Link>
                  
                  <Link 
                    href="https://www.linkedin.com/in/atyagi-js" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Project</h3>
                  <p className="text-gray-600">
                    This Pay Stub Calculator was created to simplify payroll calculations and help users understand their earnings breakdown. 
                    It features real-time calculations, multiple export formats, and an intuitive interface.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get in Touch</h3>
                  <p className="text-gray-600">
                    Have suggestions or found a bug? Feel free to reach out on LinkedIn or create an issue on GitHub. 
                    I'm always looking to improve and enhance the calculator's functionality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 