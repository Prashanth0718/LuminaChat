import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

function Terms() {
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
      title: "1. Acceptance of Terms",
      content: "By accessing and using LuminaChat, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "2. User Accounts",
      content: "To use certain features of the service, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
    },
    {
      title: "3. Acceptable Use",
      content: "You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Harassment, hate speech, and spam are strictly prohibited."
    },
    {
      title: "4. Content Ownership",
      content: "You retain all rights to the content you post on LuminaChat. However, by posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content."
    },
    {
      title: "5. Termination",
      content: "We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      title: "6. Changes to Terms",
      content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes."
    },
    {
      title: "7. Contact Information",
      content: "If you have any questions about these Terms, please contact us at support@luminachat.com."
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Terms of Service
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
              By continuing to use LuminaChat, you acknowledge that you have read and understood these terms.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Terms