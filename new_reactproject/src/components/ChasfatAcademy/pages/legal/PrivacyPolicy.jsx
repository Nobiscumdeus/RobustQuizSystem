import { useEffect } from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';
import Footer from '@shared/Footer';
import { useTheme } from '@hooks/useTheme';

const PrivacyPolicy = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Privacy Policy
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className={`rounded-2xl shadow-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Introduction */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Lock className="w-6 h-6 text-blue-500" />
              1. Introduction
            </h2>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Welcome to <strong>Chasfat Academy</strong> (&apos;we,&apos; &apos;our,&apos; or &apos;us&apos;). We are committed to protecting 
              your personal information and your right to privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our educational platform.
            </p>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              By accessing or using Chasfat Academy, you agree to the terms of this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Database className="w-6 h-6 text-green-500" />
              2. Information We Collect
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Personal Information
                </h3>
                <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>• Full name and contact information</li>
                  <li>• Email address and phone number</li>
                  <li>• Matriculation/Student ID number</li>
                  <li>• Academic institution details</li>
                  <li>• Profile pictures (optional)</li>
                </ul>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Academic Information
                </h3>
                <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>• Course enrollment data</li>
                  <li>• Exam results and performance</li>
                  <li>• Assessment responses</li>
                  <li>• Attendance records</li>
                  <li>• Progress tracking data</li>
                </ul>
              </div>
            </div>

            <div className={`mt-6 p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Technical Information
              </h3>
              <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• IP address and device information</li>
                <li>• Browser type and version</li>
                <li>• Usage patterns and session data</li>
                <li>• Cookies and similar technologies</li>
                <li>• Security and authentication logs</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <UserCheck className="w-6 h-6 text-purple-500" />
              3. How We Use Your Information
            </h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-blue-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>Academic Purposes</h4>
                <p className={darkMode ? 'text-gray-300' : 'text-blue-800'}>
                  To deliver educational content, administer exams, track progress, and provide academic feedback.
                </p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-green-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-green-900'}`}>Platform Operation</h4>
                <p className={darkMode ? 'text-gray-300' : 'text-green-800'}>
                  To maintain and improve our services, ensure security, and provide technical support.
                </p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-purple-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-purple-900'}`}>Communication</h4>
                <p className={darkMode ? 'text-gray-300' : 'text-purple-800'}>
                  To send important updates, exam notifications, and academic announcements.
                </p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-orange-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-orange-900'}`}>Research & Development</h4>
                <p className={darkMode ? 'text-gray-300' : 'text-orange-800'}>
                  To analyze platform usage and improve educational outcomes (anonymized data only).
                </p>
              </div>
            </div>
          </section>

          {/* Data Protection & Security */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-6 h-6 text-red-500" />
              4. Data Protection & Security
            </h2>
            
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Our Security Measures
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Technical Security</h4>
                  <ul className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• End-to-end encryption for sensitive data</li>
                    <li>• Secure HTTPS connections</li>
                    <li>• Regular security audits</li>
                    <li>• Firewall and intrusion detection</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Access Controls</h4>
                  <ul className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Role-based access permissions</li>
                    <li>• Two-factor authentication</li>
                    <li>• Session timeout protection</li>
                    <li>• Audit logging of all access</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300">
                  <strong>Important:</strong> While we implement robust security measures, no system is 100% secure. 
                  We encourage users to maintain strong passwords and report any suspicious activity immediately.
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Data Retention Periods
            </h2>
            
            <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl`}>
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data Type</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Retention Period</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Academic Records</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>7 years</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Transcripts and certification</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Exam Session Data</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>3 years</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Academic integrity and appeals</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>User Accounts</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Until deletion request</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service provision</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Log Files</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>1 year</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Security monitoring</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Eye className="w-6 h-6 text-indigo-500" />
              6. Your Rights & Choices
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Access & Control</h3>
                <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Right to access your personal data</li>
                  <li>✓ Right to correct inaccurate data</li>
                  <li>✓ Right to delete your data</li>
                  <li>✓ Right to data portability</li>
                  <li>✓ Right to restrict processing</li>
                </ul>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Preferences</h3>
                <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Manage communication preferences</li>
                  <li>✓ Control cookie settings</li>
                  <li>✓ Update privacy settings</li>
                  <li>✓ Export your academic data</li>
                  <li>✓ Request data deletion</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className={`p-6 rounded-xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
              <Mail className="w-6 h-6" />
              7. Contact Us
            </h2>
            
            <div className="space-y-3">
              <p className={darkMode ? 'text-blue-300' : 'text-blue-800'}>
                For privacy-related inquiries or to exercise your rights:
              </p>
              
              <div className="space-y-2">
                <p className={darkMode ? 'text-blue-300' : 'text-blue-800'}>
                  <strong>Data Protection Officer:</strong> privacy@chasfatacademy.com
                </p>
                <p className={darkMode ? 'text-blue-300' : 'text-blue-800'}>
                  <strong>Support:</strong> support@chasfatacademy.com
                </p>
                <p className={darkMode ? 'text-blue-300' : 'text-blue-800'}>
                  <strong>Address:</strong> [Your Institution Address]
                </p>
              </div>
              
              <p className={`mt-4 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                We respond to all legitimate requests within 30 days.
              </p>
            </div>
          </section>

          {/* Policy Updates */}
          <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Note:</strong> We may update this Privacy Policy periodically. We will notify you of any 
              material changes by posting the new Privacy Policy on this page and updating the &apos;Last Updated&apos; date.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;