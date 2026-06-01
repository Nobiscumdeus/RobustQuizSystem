import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import ScrollDownIcon from "../utility/ScrollDownIcon";


const Contact = () => {


  return (
    <AnimatePresence>
      {/* Use gradient background from theme */}
      <div className="min-h-screen bg-gradient-background">
        {/* Contact Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="px-4 py-20 bg-surface/30"
        >
          <div className="container mx-auto max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold text-center mb-8 text-text-primary"
            >
              Get in Touch
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg text-center mb-12 text-text-secondary"
            >
              Have questions or feedback? We&apos;d love to hear from you! Fill out the form below and we&apos;ll get back to you shortly.
            </motion.p>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { 
                  icon: "📧", 
                  title: "Email", 
                  info: "support@quizmaster.com",
                  desc: "For general inquiries"
                },
                { 
                  icon: "📞", 
                  title: "Phone", 
                  info: "+1 (234) 567-8900",
                  desc: "Mon-Fri, 9AM-6PM EST"
                },
                { 
                  icon: "📍", 
                  title: "Location", 
                  info: "123 Education St, City",
                  desc: "Visit our office"
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-surface border border-border rounded-xl p-6 text-center shadow-sm"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-text-secondary font-medium mb-1">{item.info}</p>
                  <p className="text-text-tertiary text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.form 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-surface border border-border rounded-2xl shadow-lg p-8 max-w-2xl mx-auto"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileFocus={{ scale: 1.02 }}
                className="mb-6"
              >
                <label className="block text-sm font-bold mb-2 text-text-primary" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full py-3 px-4 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileFocus={{ scale: 1.02 }}
                className="mb-6"
              >
                <label className="block text-sm font-bold mb-2 text-text-primary" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full py-3 px-4 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your email address"
                  required
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileFocus={{ scale: 1.02 }}
                className="mb-6"
              >
                <label className="block text-sm font-bold mb-2 text-text-primary" htmlFor="subject">
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full py-3 px-4 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a topic</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="billing">Billing & Payment</option>
                  <option value="other">Other</option>
                </select>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileFocus={{ scale: 1.02 }}
                className="mb-8"
              >
                <label className="block text-sm font-bold mb-2 text-text-primary" htmlFor="message">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  className="w-full py-3 px-4 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </motion.div>

              <div className="flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(var(--color-primary-hover))" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg"
                >
                  Send Message
                </motion.button>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center mt-6 text-text-tertiary text-sm"
              >
                We typically respond within 24 hours during business days.
              </motion.p>
            </motion.form>

            {/* FAQ Section */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-20 max-w-3xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-center mb-8 text-text-primary">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {[
                  { q: "How quickly will I receive a response?", a: "We aim to respond to all inquiries within 24 hours on business days." },
                  { q: "Is there a fee for using QuizMaster?", a: "QuizMaster offers both free and premium plans. Check our pricing page for details." },
                  { q: "Can I schedule a demo?", a: "Yes! Contact us to schedule a personalized demo of our platform." },
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-surface border border-border rounded-lg p-6"
                  >
                    <h4 className="font-bold text-text-primary mb-2">{faq.q}</h4>
                    <p className="text-text-secondary">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
        
        <ScrollDownIcon />
        <Footer />
      </div>
    </AnimatePresence>
  );
};

export default Contact;


