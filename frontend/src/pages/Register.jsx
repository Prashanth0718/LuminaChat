import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    gender: '',
    dob: ''
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      // Only allow numbers and basic phone characters
      const sanitizedValue = value.replace(/[^0-9+\-\s()]/g, '')
      setForm(prev => ({ ...prev, [name]: sanitizedValue }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (form.phone && !/^[\d+\-\s()]{7,15}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    setLoading(true)

    try {
      const res = await API.post('/register', form)

      toast.success(res.data.message || 'Account created successfully! Welcome to LuminaChat.', {
        duration: 5000,
        icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      })

      // Navigate to login on success
      navigate('/')

    } catch (err) {
      console.error('Registration error:', err)

      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.message ||
                          'Registration failed. Please try again.'

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

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-primary-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
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
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-primary-300/20 to-secondary-300/20 rounded-full blur-2xl"
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
            className="absolute w-2 h-2 bg-primary-400 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '-10px'
            }}
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
            Join LuminaChat
          </h1>
          <p className="text-surface-600 text-base">
            Create your account and start connecting
          </p>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 relative overflow-hidden"
        >
          {/* Card Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Username
                <span className="text-error-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                ${focusedField === 'username' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className={`input-premium pl-12 ${errors.username ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                />
                <AnimatePresence>
                  {errors.username && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.username}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Full Name */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Full Name
                <span className="text-error-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                ${focusedField === 'full_name' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  name="full_name"
                  type="text"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('full_name')}
                  onBlur={() => setFocusedField(null)}
                  className={`input-premium pl-12 ${errors.full_name ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                />
                <AnimatePresence>
                  {errors.full_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.full_name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="relative">
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
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`input-premium pl-12 ${errors.email ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Password
                <span className="text-error-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                ${focusedField === 'password' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
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
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Phone Number */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                ${focusedField === 'phone' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  className={`input-premium pl-12 ${errors.phone ? 'border-error-400 focus:border-error-500 focus:ring-error-500/10' : ''}`}
                />
                <AnimatePresence>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error-500 text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phone}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Date of Birth */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                ${focusedField === 'dob' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('dob')}
                  onBlur={() => setFocusedField(null)}
                  className="input-premium pl-12 text-surface-600"
                />
              </div>
            </motion.div>

            {/* Gender */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
                                ${focusedField === 'gender' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <User className="w-5 h-5" />
                </div>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('gender')}
                  onBlur={() => setFocusedField(null)}
                  className="input-premium pl-12 appearance-none cursor-pointer"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Bio
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-4 transition-colors duration-300
                                ${focusedField === 'bio' ? 'text-primary-500' : 'text-surface-400'}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('bio')}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  className="input-premium pl-12 resize-none"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-premium w-full group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-surface-400">or</span>
            </div>
          </motion.div>

          {/* Sign In Link */}
          <motion.p variants={itemVariants} className="text-center text-surface-600">
            Already have an account?{' '}
            <Link
              to="/"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group"
            >
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.p>
        </motion.div>

        {/* Terms & Privacy */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-surface-400 mt-6 px-4"
        >
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Register
