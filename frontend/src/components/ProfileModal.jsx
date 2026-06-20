import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  Shield,
} from 'lucide-react'

function ProfileModal({ showProfile, setShowProfile, profileData, onlineUsers }) {
  if (!showProfile || !profileData) {
    return null
  }

  const isOnline = onlineUsers?.includes(profileData.email)

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return null
    let formattedLastSeen = lastSeen;
    if (typeof lastSeen === 'string' && !lastSeen.includes('T')) {
       formattedLastSeen = lastSeen.replace(' ', 'T') + 'Z';
    }
    const date = new Date(formattedLastSeen)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  // Info Item Component
  const InfoItem = ({ icon: Icon, label, value, iconColor = 'text-primary-500' }) => (
    <motion.div
      variants={itemVariants}
      className="flex items-start gap-3"
    >
      <div className={`p-2 rounded-lg bg-surface-50 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-500 font-medium">{label}</p>
        <p className="text-surface-800 truncate">{value || <span className="text-surface-400 italic">Not added</span>}</p>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {showProfile && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowProfile(false)}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {/* Modal Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
              {/* Gradient Header */}
              <div className="relative h-32 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Close Button */}
                <motion.button
                  onClick={() => setShowProfile(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Profile Picture */}
              <div className="relative -mt-16 flex justify-center z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  {profileData.profile_picture ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${profileData.profile_picture}`}
                      alt={profileData.username}
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center text-4xl font-bold ring-4 ring-white shadow-xl">
                      {profileData.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  {/* Online/Offline Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`
                      absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white
                      ${isOnline
                        ? 'bg-success-500'
                        : 'bg-surface-400'
                      }
                    `}
                  >
                    {isOnline ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Clock className="w-5 h-5 text-white" />
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Name & Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center mt-4 px-6"
              >
                <h2 className="text-2xl font-bold text-surface-900">
                  {profileData.full_name || profileData.username}
                </h2>
                <p className="text-surface-500 mt-1">@{profileData.username}</p>

                {/* Status Badge */}
                <div className="mt-3 flex justify-center">
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-100 text-success-700 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  ) : profileData.last_seen ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-600 rounded-full text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      Last seen {formatLastSeen(profileData.last_seen)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-500 rounded-full text-sm">
                      Offline
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Bio */}
              {profileData.bio && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 px-6"
                >
                  <div className="p-4 bg-surface-50 rounded-2xl">
                    <p className="text-surface-700 text-sm leading-relaxed text-center">
                      "{profileData.bio}"
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Info Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.25 }}
                className="p-6 space-y-4"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-surface-200 to-transparent" />

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={profileData.email}
                    iconColor="text-primary-500"
                  />
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={profileData.phone}
                    iconColor="text-secondary-500"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Gender"
                    value={profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : null}
                    iconColor="text-accent-500"
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date of Birth"
                    value={profileData.dob}
                    iconColor="text-success-500"
                  />
                </motion.div>

                {/* Account Info */}
                <motion.div
                  variants={itemVariants}
                  className="mt-4 pt-4 border-t border-surface-100"
                >
                  <div className="flex items-center justify-center gap-6 text-xs text-surface-400">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Verified Account</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom Decorative Glow */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-t from-primary-500/20 to-transparent rounded-full blur-3xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Container variants for stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

export default ProfileModal
