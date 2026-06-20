import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  KeyRound,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [errors, setErrors] = useState({})

  // OTP input refs for auto-focus
  const otpRefs = []

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i]
    }

    setOtp(newOtp)
  }

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email' })
      return false
    }
    setErrors({})
    return true
  }

  const validateOtp = () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' })
      return false
    }
    setErrors({})
    return true
  }

  const validatePassword = () => {
    const newErrors = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sendOtp = async () => {
    if (!validateEmail()) {
      toast.error('Please enter a valid email address', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
      return
    }

    setLoading(true)

    try {
      await API.post('/forgot-password', { email })

      toast.success('OTP sent to your email!', {
        duration: 5000,
        icon: <Mail className="w-5 h-5 text-success-500" />,
      })

      setStep(2)

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to send OTP. Please try again.'
      toast.error(errorMessage, {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!validateOtp()) {
      toast.error('Please enter the complete OTP', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
      return
    }

    setLoading(true)

    try {
      await API.post('/verify-otp', { email, otp: otp.join('') })

      toast.success('OTP verified successfully!', {
        icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      })

      setStep(3)

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid OTP. Please try again.'
      toast.error(errorMessage, {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!validatePassword()) {
      toast.error('Please fix the errors above', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
      return
    }

    setLoading(true)

    try {
      await API.put('/reset-password', { email, password })

      toast.success('Password updated successfully!', {
        duration: 5000,
        icon: <ShieldCheck className="w-5 h-5 text-success-500" />,
      })

      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to reset password. Please try again.'
      toast.error(errorMessage, {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
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

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  }

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -10],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  }

  const steps = [
    { number: 1, title: 'Email', icon: Mail },
    { number: 2, title: 'Verify', icon: KeyRound },
    { number: 3, title: 'Reset', icon: Lock }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-primary-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/40 via-secondary-400/40 to-accent-400/40 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary-400/40 via-primary-400/40 to-accent-400/40 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-primary-300/20 to-secondary-300/20 rounded-full blur-2xl"
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: -100,
              x: Math.random() * 100 - 50
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute w-2 h-2 bg-accent-400 rounded-full"
            style={{ left: `${15 + i * 15}%`, bottom: '-10px' }}
          />
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative"
      >
        {/* Logo & Branding */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 rounded-3xl shadow-premium mb-4 group-hover:shadow-glow transition-shadow duration-300"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Reset Password
          </h1>
          <p className="text-surface-600 text-base">
            Recover access to your account
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: step === s.number ? 1 : 0.9,
                  }}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    step >= s.number
                      ? 'bg-gradient-to-br from-primary-600 to-secondary-500 shadow-glow'
                      : 'bg-surface-200'
                  }`}
                >
                  <s.icon className={`w-5 h-5 ${step >= s.number ? 'text-white' : 'text-surface-400'}`} />

                  {step > s.number && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Step Title - Hidden on mobile */}
                <div className="hidden sm:block ml-3">
                  <p className={`text-sm font-medium ${step >= s.number ? 'text-surface-900' : 'text-surface-400'}`}>
                    {s.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block w-8 lg:w-16 mx-2">
                    <div className="h-0.5 bg-surface-200 relative overflow-hidden rounded-full">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: step > s.number ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-secondary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 relative overflow-hidden"
        >
          {/* Card Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                    <Mail className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-surface-900 mb-2">
                    Enter your email
                  </h2>
                  <p className="text-surface-500 text-sm">
                    We'll send you a 6-digit verification code
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Email Address
                    <span className="text-error-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                    ${focusedField === 'email' ? 'text-primary-500' : 'text-surface-400'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors({})
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-premium pl-12 ${errors.email ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  onClick={sendOtp}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="btn-premium w-full group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-2xl mb-4">
                    <KeyRound className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-surface-900 mb-2">
                    Enter verification code
                  </h2>
                  <p className="text-surface-500 text-sm">
                    We sent a 6-digit code to <span className="text-primary-600 font-medium">{email}</span>
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-surface-700 mb-3 text-center">
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => otpRefs[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-semibold
                                   bg-white/60 backdrop-blur-sm border-2 border-surface-200 rounded-xl
                                   focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10
                                   transition-all duration-200"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error-500 text-xs mt-3 text-center flex items-center justify-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.otp}
                    </motion.p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary flex-1 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back</span>
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={verifyOtp}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="btn-premium flex-1 group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Code</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>

                <p className="text-center text-surface-500 text-sm">
                  Didn't receive the code?{' '}
                  <button
                    onClick={sendOtp}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Resend
                  </button>
                </p>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-2xl mb-4">
                    <Lock className="w-8 h-8 text-accent-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-surface-900 mb-2">
                    Create new password
                  </h2>
                  <p className="text-surface-500 text-sm">
                    Your identity has been verified
                  </p>
                </div>

                {/* New Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    New Password
                    <span className="text-error-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                    ${focusedField === 'password' ? 'text-primary-500' : 'text-surface-400'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-premium pl-12 pr-12 ${errors.password ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Confirm Password
                    <span className="text-error-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                    ${focusedField === 'confirmPassword' ? 'text-primary-500' : 'text-surface-400'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-premium pl-12 pr-12 ${errors.confirmPassword ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button
                    onClick={() => setStep(2)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary flex-1 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back</span>
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={resetPassword}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="btn-premium flex-1 group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <ShieldCheck className="w-5 h-5" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Login Link */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-surface-200"
          >
            <p className="text-center text-surface-600">
              Remember your password?{' '}
              <Link
                to="/"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
