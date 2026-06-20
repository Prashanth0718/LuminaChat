import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all fields correctly', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
      return
    }

    setLoading(true)

    try {
      const res = await API.post('/login', form)

      console.log('LOGIN RESPONSE:', res.data)

      if (!res.data.success) {
        toast.error(res.data.message || 'Login failed', {
          icon: <AlertCircle className="w-5 h-5 text-error-500" />,
        })
        return
      }

      localStorage.setItem('token', res.data.token)

      toast.success('Welcome back to LuminaChat!', {
        duration: 3000,
        icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      })

      navigate('/home')

    } catch (err) {
      console.error('Login error:', err)

      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.message ||
                          'Login failed. Please check your credentials.'

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
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary-300/20 to-secondary-300/20 rounded-full blur-2xl"
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
            className="absolute w-2 h-2 bg-secondary-400 rounded-full"
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
            Welcome Back
          </h1>
          <p className="text-surface-600 text-base">
            Sign in to continue to LuminaChat
          </p>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 relative overflow-hidden"
        >
          {/* Card Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group"
              >
                Forgot password?
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
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
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
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

          {/* Sign Up Link */}
          <motion.p variants={itemVariants} className="text-center text-surface-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group"
            >
              Create one
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.p>
        </motion.div>

        {/* Terms & Privacy */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-surface-400 mt-6 px-4"
        >
          By signing in, you agree to our{' '}
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

export default Login
