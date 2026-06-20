import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

function Privacy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  const sections = [
    {
      title: "1. Privacy & Data Collection",
      content: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, profile picture, and messages."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect about you to provide, maintain, and improve our services, such as to facilitate communications, provide customer support, and develop new features."
    },
    {
      title: "3. Information Sharing",
      content: "We do not share your personal information with third parties except as described in this privacy policy, such as with your consent, to comply with laws, or to protect our rights."
    },
    {
      title: "4. Cookies",
      content: "We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our service. This helps us provide you with a good experience and allows us to improve our service."
    },
    {
      title: "5. Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction."
    },
    {
      title: "6. Data Retention",
      content: "We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it, or for other legitimate business purposes, including to meet our legal, regulatory, or other compliance obligations."
    },
    {
      title: "7. Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at privacy@luminachat.com."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 via-secondary-400/30 to-accent-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary-400/30 via-primary-400/30 to-accent-400/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-premium mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Privacy Policy
          </h1>
          <p className="text-surface-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card p-8 sm:p-12"
        >
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={index}
                variants={itemVariants}
                className="group"
              >
                <h2 className="text-xl font-semibold text-surface-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {section.title}
                </h2>
                <p className="text-surface-600 leading-relaxed">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-surface-200 text-center"
          >
            <p className="text-surface-500 text-sm">
              Your privacy is critically important to us.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Privacy