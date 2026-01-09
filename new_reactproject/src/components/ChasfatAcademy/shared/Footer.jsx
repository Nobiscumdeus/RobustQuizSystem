import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-surface text-text border-t border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-text-primary font-medium">
              © {new Date().getFullYear()} QuizMaster. All rights reserved.
            </p>
            <p className="text-text-tertiary text-sm mt-1">
              Empowering education through technology
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
            <div className="flex space-x-6">

              <Link
                to="/privacy-policy" 
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                Privacy Policy
              </Link>


              <Link
                to="/terms" 
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                Terms of Service
              </Link>
              <Link 
                to="/contact" 
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Social Links (Optional) */}
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a 
                href="#" 
                className="text-text-tertiary hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-text-tertiary hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4"></div>

        {/* Bottom info */}
        <div className="text-center">
          <p className="text-text-tertiary text-sm">
            Made with ❤️ for educators and learners worldwide
          </p>
          <p className="text-text-tertiary text-xs mt-1">
            Version 2.0.0 • Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

