import { useEffect } from 'react';
import { Scale, Shield, AlertTriangle, Book, User, FileText, Lock, GraduationCap, Globe, Mail } from 'lucide-react';

import Footer from '@shared/Footer';
import { useTheme } from '@hooks/useTheme';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
            <Scale className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Terms of Service
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            By using Chasfat Academy, you agree to these terms. Please read them carefully.
          </p>
        </div>

        <div className={`rounded-2xl shadow-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Table of Contents */}
          <div className={`mb-10 p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="inline w-5 h-5 mr-2" />
              Table of Contents
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                '1. Acceptance of Terms',
                '2. Account Registration',
                '3. User Responsibilities',
                '4. Academic Integrity',
                '5. Content Usage Rights',
                '6. Prohibited Activities',
                '7. Payment & Refunds',
                '8. Privacy & Data Security',
                '9. Intellectual Property',
                '10. Termination',
                '11. Disclaimer of Warranties',
                '12. Limitation of Liability',
                '13. Governing Law',
                '14. Changes to Terms',
                '15. Contact Information'
              ].map((item, index) => (
                <a 
                  key={index}
                  href={`#section-${index + 1}`}
                  className={`text-sm p-2 rounded hover:${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* 1. Acceptance of Terms */}
          <section id="section-1" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Book className="w-6 h-6 text-blue-500" />
              1. Acceptance of Terms
            </h2>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                By accessing or using the Chasfat Academy platform (&apos;the Platform&apos;), you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service (&apos;Terms&apos;). If you are using the Platform on 
                behalf of an educational institution, organization, or company, you represent that you have the authority 
                to bind that entity to these Terms.
              </p>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <AlertTriangle className="inline w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2" />
                <strong className={darkMode ? 'text-yellow-400' : 'text-yellow-800'}>
                  Important:
                </strong>
                <span className={`ml-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  If you do not agree to these Terms, you must immediately cease using the Platform.
                </span>
              </div>
            </div>
          </section>

          {/* 2. Account Registration */}
          <section id="section-2" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <User className="w-6 h-6 text-green-500" />
              2. Account Registration
            </h2>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>2.1 Eligibility</h3>
              <p>
                To use the Platform, you must:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  Be at least 13 years of age (or the age of digital consent in your jurisdiction)
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  Be enrolled in or employed by an educational institution that has subscribed to our services
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  Have the legal capacity to enter into binding agreements
                </li>
              </ul>

              <h3 className={`text-lg font-semibold mt-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>2.2 Account Security</h3>
              <p>
                You are responsible for:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <Lock className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  Maintaining the confidentiality of your login credentials
                </li>
                <li className="flex items-start">
                  <Lock className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  All activities that occur under your account
                </li>
                <li className="flex items-start">
                  <Lock className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  Immediately notifying us of any unauthorized access or security breach
                </li>
              </ul>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                <AlertTriangle className="inline w-5 h-5 text-red-600 dark:text-red-500 mr-2" />
                <strong className={darkMode ? 'text-red-400' : 'text-red-800'}>
                  Prohibited:
                </strong>
                <span className={`ml-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  Sharing accounts, using false information, or creating accounts for others.
                </span>
              </div>
            </div>
          </section>

          {/* 3. User Responsibilities */}
          <section id="section-3" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-6 h-6 text-orange-500" />
              3. User Responsibilities
            </h2>
            <div className={`space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>3.1 Student Responsibilities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Complete assessments independently and honestly
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Respect examination deadlines and time limits
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Maintain academic integrity in all activities
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Report technical issues promptly
                  </li>
                </ul>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>3.2 Instructor Responsibilities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    Create accurate and appropriate educational content
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    Provide timely feedback and assessment
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    Maintain student privacy and confidentiality
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                    Adhere to institutional academic policies
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Academic Integrity */}
          <section id="section-4" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <GraduationCap className="w-6 h-6 text-indigo-500" />
              4. Academic Integrity
            </h2>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                Chasfat Academy maintains a zero-tolerance policy for academic dishonesty. The following are strictly prohibited:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Cheating</h4>
                  <ul className={`space-y-1 text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    <li>• Using unauthorized materials</li>
                    <li>• Copying others&apos; work</li>
                    <li>• Unauthorized collaboration</li>
                  </ul>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Plagiarism</h4>
                  <ul className={`space-y-1 text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    <li>• Submitting others&apos; work as your own</li>
                    <li>• Improper citation</li>
                    <li>• Self-plagiarism</li>
                  </ul>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Consequences of Violations</h4>
                <ul className={`space-y-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                  <li>• Immediate account suspension or termination</li>
                  <li>• Notification to your educational institution</li>
                  <li>• Invalidated examination results</li>
                  <li>• Permanent ban from the platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Prohibited Activities */}
          <section id="section-6" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <AlertTriangle className="w-6 h-6 text-red-500" />
              6. Prohibited Activities
            </h2>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>You agree not to:</p>
              
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                  <strong className={darkMode ? 'text-red-400' : 'text-red-600'}>Security Violations:</strong>
                  <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Attempt to breach security, disrupt services, or interfere with other users
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                  <strong className={darkMode ? 'text-red-400' : 'text-red-600'}>Unauthorized Access:</strong>
                  <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Access accounts, data, or systems without authorization
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                  <strong className={darkMode ? 'text-red-400' : 'text-red-600'}>Illegal Content:</strong>
                  <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload or distribute malicious software, illegal, or harmful content
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                  <strong className={darkMode ? 'text-red-400' : 'text-red-600'}>Commercial Use:</strong>
                  <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Use the Platform for commercial purposes without written consent
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Privacy & Data Security */}
          <section id="section-8" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Lock className="w-6 h-6 text-blue-500" />
              8. Privacy & Data Security
            </h2>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                Your privacy is important to us. Our data practices are governed by our 
                <Link to="/privacy-policy" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1">
                  Privacy Policy
                </Link>, which is incorporated into these Terms.
              </p>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Data Protection Commitments</h3>
                <ul className={`space-y-2 ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  <li>• We implement industry-standard security measures</li>
                  <li>• We comply with applicable data protection laws (GDPR, COPPA, FERPA)</li>
                  <li>• We do not sell your personal data to third parties</li>
                  <li>• We retain data only as necessary for educational purposes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 13. Governing Law */}
          <section id="section-13" className="mb-10 scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Globe className="w-6 h-6 text-green-500" />
              13. Governing Law
            </h2>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                [Your Country/State], without regard to its conflict of law provisions.
              </p>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dispute Resolution</h3>
                <p className="mb-2">
                  Any disputes arising from these Terms shall be resolved through:
                </p>
                <ol className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>
                    Informal negotiation between parties (30-day period)
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>
                    Mediation with a neutral third party
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>
                    Binding arbitration in [Your City], [Your Country]
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 15. Contact Information */}
          <section id="section-15" className="scroll-mt-20">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Mail className="w-6 h-6 text-purple-500" />
              15. Contact Information
            </h2>
            
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                For questions about these Terms, please contact:
              </p>
              
              <div className="space-y-3">
                <div>
                  <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Legal Department:</strong>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>legal@chasfatacademy.com</p>
                </div>
                
                <div>
                  <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>General Inquiries:</strong>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>support@chasfatacademy.com</p>
                </div>
                
                <div>
                  <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Mailing Address:</strong>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Chasfat Academy<br />
                    [Your Street Address]<br />
                    [Your City, State, ZIP Code]<br />
                    [Your Country]
                  </p>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Response Time:</strong> We aim to respond to all legal inquiries within 7-10 business days.
                </p>
              </div>
            </div>
          </section>

          {/* Agreement Section */}
          <div className={`mt-12 p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Acknowledgement
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              By using Chasfat Academy, you acknowledge that:
            </p>
            <ul className={`space-y-3 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                You have read and understood these Terms of Service
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                You agree to be bound by these Terms
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                You are at least 13 years old (or age of digital consent in your jurisdiction)
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                You have the authority to enter into this agreement
              </li>
            </ul>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>Note:</strong> These Terms constitute the entire agreement between you and Chasfat Academy 
                regarding your use of the Platform and supersede all prior agreements and understandings.
              </p>
            </div>
          </div>

          {/* Related Documents */}
          <div className="mt-8">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Related Documents
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/privacy-policy"
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors`}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/cookie-policy"
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'} transition-colors`}
              >
                Cookie Policy
              </Link>
              <Link 
                to="/acceptable-use"
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition-colors`}
              >
                Acceptable Use Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;