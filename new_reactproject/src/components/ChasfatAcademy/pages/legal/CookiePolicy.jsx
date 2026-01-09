import { useEffect, useState } from 'react';
import { Cookie, Settings, Shield, AlertCircle, CheckCircle, XCircle, Info, Eye, EyeOff } from 'lucide-react';
import Footer from '@shared/Footer';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  const { darkMode } = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load saved preferences
    const saved = localStorage.getItem('cookiePreferences');
    if (saved) {
      setCookiePreferences(JSON.parse(saved));
    }
  }, []);

  const handlePreferenceChange = (type) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => {
      const updated = { ...prev, [type]: !prev[type] };
      localStorage.setItem('cookiePreferences', JSON.stringify(updated));
      return updated;
    });
  };

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Cookie preferences saved!');
  };

  const resetPreferences = () => {
    const defaultPrefs = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setCookiePreferences(defaultPrefs);
    localStorage.setItem('cookiePreferences', JSON.stringify(defaultPrefs));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
            <Cookie className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Cookie Policy
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Learn how we use cookies and manage your preferences
          </p>
        </div>

        <div className={`rounded-2xl shadow-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Quick Summary */}
          <section className="mb-10">
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'} border ${darkMode ? 'border-amber-800' : 'border-amber-200'}`}>
              <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Info className="w-6 h-6 text-amber-500" />
                Quick Summary
              </h2>
              <p className={`${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                Chasfat Academy uses cookies to provide essential functionality, improve user experience, 
                and analyze platform usage. You can control non-essential cookies through the preferences below.
              </p>
            </div>
          </section>

          {/* What Are Cookies */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              What Are Cookies?
            </h2>
            <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cookies are small text files that are placed on your device when you visit our platform. 
                They help us recognize your device, remember your preferences, and provide a better user experience.
              </p>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center gap-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
              </button>
              
              {showDetails && (
                <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>How Cookies Work:</h4>
                  <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Stored in your browser&apos;s cookie storage</li>
                    <li>• Sent back to our servers with each request</li>
                    <li>• Can be session-based (deleted when browser closes) or persistent</li>
                    <li>• First-party (our domain) vs third-party (external services)</li>
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Cookie Types */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Types of Cookies We Use
            </h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                      Essential Cookies
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-200 text-green-800'}`}>
                    Required
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className={darkMode ? 'text-green-400' : 'text-green-800'}>
                    These cookies are necessary for the platform to function properly. They cannot be disabled.
                  </p>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-green-300' : 'text-green-900'}`}>Purposes:</h4>
                    <ul className={`space-y-1 text-sm ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                      <li>• User authentication and session management</li>
                      <li>• Security and fraud prevention</li>
                      <li>• Load balancing and performance</li>
                      <li>• Remembering privacy settings</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Always enabled - Required for platform operation
                    </span>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-blue-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                      Functional Cookies
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-200 text-blue-800'}`}>
                    Optional
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className={darkMode ? 'text-blue-400' : 'text-blue-800'}>
                    These cookies enhance your experience by remembering preferences and settings.
                  </p>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Purposes:</h4>
                    <ul className={`space-y-1 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                      <li>• Remembering language preferences</li>
                      <li>• Saving UI theme settings (dark/light mode)</li>
                      <li>• Remembering recently viewed content</li>
                      <li>• Maintaining form data across sessions</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cookiePreferences.functional ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {cookiePreferences.functional ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('functional')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        cookiePreferences.functional
                          ? darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          : darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {cookiePreferences.functional ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'} border ${darkMode ? 'border-purple-800' : 'border-purple-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-purple-500" />
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                      Analytics Cookies
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-200 text-purple-800'}`}>
                    Optional
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className={darkMode ? 'text-purple-400' : 'text-purple-800'}>
                    These cookies help us understand how users interact with our platform.
                  </p>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>Purposes:</h4>
                    <ul className={`space-y-1 text-sm ${darkMode ? 'text-purple-400' : 'text-purple-800'}`}>
                      <li>• Analyzing platform usage patterns</li>
                      <li>• Measuring feature adoption</li>
                      <li>• Identifying technical issues</li>
                      <li>• Improving user experience</li>
                    </ul>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Data Collection:</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      We collect anonymized data only. No personal information is included in analytics.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cookiePreferences.analytics ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {cookiePreferences.analytics ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('analytics')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        cookiePreferences.analytics
                          ? darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          : darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {cookiePreferences.analytics ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie Management */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Manage Your Cookie Preferences
            </h2>
            
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Browser Settings
                  </h3>
                  <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    You can control cookies through your browser settings:
                  </p>
                  <ul className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Delete existing cookies</li>
                    <li>• Block all cookies (may break functionality)</li>
                    <li>• Set preferences for specific sites</li>
                    <li>• Enable private browsing mode</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Do Not Track
                  </h3>
                  <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Some browsers offer a &apos;Do Not Track&apos; feature. When enabled:
                  </p>
                  <ul className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• We respect this setting for analytics cookies</li>
                    <li>• Essential cookies still required for functionality</li>
                    <li>• Functional cookies may be limited</li>
                  </ul>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Note:</strong> Blocking all cookies may prevent the platform from functioning properly.
                  Essential cookies are required for authentication and security.
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Duration */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Cookie Duration
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cookie Type</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration</th>
                    <th className={`p-4 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Session Cookies</td>
                    <td className={`p-4 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Browser Session</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Deleted when browser closes</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Persistent Cookies</td>
                    <td className={`p-4 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Up to 365 days</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remain until expiration or deletion</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Authentication Cookies</td>
                    <td className={`p-4 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>Up to 30 days</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>For &apos;remember me&apos; functionality</td>
                  </tr>
                  <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preference Cookies</td>
                    <td className={`p-4 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>Up to 90 days</td>
                    <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Theme, language, and UI settings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Save Preferences */}
          <section className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Save Your Preferences
            </h2>
            
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Current Preferences
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(cookiePreferences).map(([key, value]) => (
                      <div 
                        key={key}
                        className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <span className="capitalize mr-2">{key}:</span>
                        {value ? (
                          <span className="text-green-600 dark:text-green-400">✓ Enabled</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">✗ Disabled</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={savePreferences}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={resetPreferences}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                  <strong>Note:</strong> Your preferences are saved in your browser&apos;s local storage. 
                  Clearing browser data will reset these preferences.
                </p>
              </div>
            </div>
          </section>

          {/* Contact & Related */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Questions & Related Documents
            </h3>
            
            <div className="space-y-4">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                For questions about our Cookie Policy, contact: <span className="text-blue-500">privacy@chasfatacademy.com</span>
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/privacy-policy"
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} transition-colors`}
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms-of-service"
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'} transition-colors`}
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/acceptable-use"
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition-colors`}
                >
                  Acceptable Use Policy
                </Link>
              </div>
              
              <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  This policy is reviewed annually and updated as needed. Last review: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;