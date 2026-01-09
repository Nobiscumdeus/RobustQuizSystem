import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Users, Shield, Monitor, FileText, Globe, Book, Lock } from 'lucide-react';
import Footer from '@shared/Footer';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'react-router-dom';

const AcceptableUsePolicy = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <Shield className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Acceptable Use Policy
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Guidelines for responsible use of Chasfat Academy
          </p>
        </div>

        <div className={`rounded-2xl shadow-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Introduction */}
          <section className="mb-10">
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Book className="inline w-6 h-6 mr-3 text-blue-500" />
                Purpose & Scope
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                This Acceptable Use Policy (&apos;AUP&apos;) outlines the standards for acceptable use of the 
                Chasfat Academy platform. All users, including students, instructors, administrators, 
                and institutional partners, must comply with this policy. Violations may result in 
                account suspension, termination, or legal action.
              </p>
            </div>
          </section>

          {/* Allowed Activities */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <CheckCircle className="w-6 h-6 text-green-500" />
              Allowed Activities
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                  <Users className="w-5 h-5" />
                  For Students
                </h3>
                <ul className={`space-y-2 ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                    Taking assigned exams and assessments
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                    Accessing course materials and resources
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                    Communicating with instructors for academic purposes
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                    Reviewing personal academic progress
                  </li>
                </ul>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  <Monitor className="w-5 h-5" />
                  For Instructors
                </h3>
                <ul className={`space-y-2 ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Creating and administering educational content
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Assessing student performance and providing feedback
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Managing course materials and resources
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                    Generating academic reports and analytics
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <XCircle className="w-6 h-6 text-red-500" />
              Prohibited Activities
            </h2>
            
            <div className="space-y-6">
              {/* Security Violations */}
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-red-300' : 'text-red-900'}`}>
                  <Lock className="w-5 h-5" />
                  Security Violations
                </h3>
                <ul className={`space-y-3 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Attempting to breach, test, or circumvent security measures
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Unauthorized access to accounts, systems, or data
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Introducing viruses, malware, or harmful code
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Conducting denial-of-service attacks
                  </li>
                </ul>
              </div>

              {/* Academic Integrity Violations */}
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-red-300' : 'text-red-900'}`}>
                  <FileText className="w-5 h-5" />
                  Academic Integrity Violations
                </h3>
                <ul className={`space-y-3 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Cheating, plagiarism, or academic dishonesty
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Impersonating other users during assessments
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Unauthorized collaboration on individual assessments
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Using unauthorized materials or resources during exams
                  </li>
                </ul>
              </div>

              {/* Content & Communication Violations */}
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-red-300' : 'text-red-900'}`}>
                  <Globe className="w-5 h-5" />
                  Content & Communication Violations
                </h3>
                <ul className={`space-y-3 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Harassment, bullying, or discriminatory behavior
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Sharing inappropriate, offensive, or illegal content
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Spamming or excessive messaging
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    Copyright infringement or unauthorized distribution
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* System Usage Guidelines */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              System Usage Guidelines
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Resource Usage</h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Avoid excessive system resource consumption</li>
                  <li>• No automated scraping or data collection</li>
                  <li>• Respect API rate limits and quotas</li>
                  <li>• Report performance issues instead of exploiting them</li>
                </ul>
              </div>
              
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Account Management</h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Maintain account security and confidentiality</li>
                  <li>• No account sharing or transfer</li>
                  <li>• Use real, verifiable information</li>
                  <li>• Report lost or compromised credentials immediately</li>
                </ul>
              </div>
              
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Compliance</h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Adhere to institutional policies</li>
                  <li>• Comply with applicable laws and regulations</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Follow platform-specific guidelines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monitoring & Enforcement */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Monitor className="inline w-6 h-6 mr-3 text-orange-500" />
              Monitoring & Enforcement
            </h2>
            
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Our Monitoring Practices
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} mr-4`}>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Proactive Monitoring</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      We continuously monitor platform usage to detect violations and ensure security.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`p-2 rounded ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} mr-4`}>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Incident Response</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      We investigate all reported violations and take appropriate action.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`p-2 rounded ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} mr-4`}>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Transparency</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      We maintain audit logs and provide information to authorized institutional representatives.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <p className={`${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  <strong>Note:</strong> All platform activity is logged for security, compliance, and academic integrity purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Consequences of Violation */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Consequences of Violation
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Violation Type</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Offense</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Repeat Offense</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Severe Violation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Minor AUP Violation</td>
                    <td className={`p-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Warning & Education</td>
                    <td className={`p-4 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Temporary Suspension (7 days)</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Account Review</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Academic Dishonesty</td>
                    <td className={`p-4 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Assessment Invalidated</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Course Suspension</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Permanent Ban</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Security Violation</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Immediate Suspension</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Permanent Ban</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Legal Action</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Content Violation</td>
                    <td className={`p-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Content Removal</td>
                    <td className={`p-4 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Account Restriction</td>
                    <td className={`p-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Account Termination</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Reporting Violations */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Reporting Violations
            </h2>
            
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To report violations of this Acceptable Use Policy:
              </p>
              
              <div className="space-y-4">
                <div>
                  <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>For Students:</strong>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Report to your instructor or institutional administrator first.
                  </p>
                </div>
                
                <div>
                  <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Email Reporting:</strong>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Send detailed reports to: <span className="text-blue-500">aup@chasfatacademy.com</span>
                  </p>
                </div>
                
                <div>
                  <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Required Information:</strong>
                  <ul className={`mt-2 space-y-1 ml-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Specific violation observed</li>
                    <li>• Date and time of incident</li>
                    <li>• Screenshots or evidence (if applicable)</li>
                    <li>• Your contact information</li>
                  </ul>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Confidentiality:</strong> We treat all reports confidentially and investigate 
                  them promptly. Retaliation against reporters is strictly prohibited.
                </p>
              </div>
            </div>
          </section>

          {/* Contact & Updates */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Policy Updates & Contact
            </h3>
            <div className="space-y-3">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                This Acceptable Use Policy may be updated periodically. Users will be notified of 
                significant changes through platform notifications or email.
              </p>
              
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <strong>Questions?</strong> Contact: <span className="text-blue-500">legal@chasfatacademy.com</span>
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <Link 
                  to="/terms-of-service"
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'} transition-colors`}
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy-policy"
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors`}
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/cookie-policy"
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition-colors`}
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AcceptableUsePolicy;