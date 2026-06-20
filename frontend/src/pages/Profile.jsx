import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Camera,
  Edit3,
  Save,
  X,
  LogOut,
  Trash2,
  Upload,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

import { memo } from 'react'

const ProfileField = memo(({ icon: Icon, label, name, value, editable = true, type = 'text', rows, onChange, editing, itemVariants }) => (
  <motion.div variants={itemVariants} className="group">
    <label className="flex items-center gap-2 text-sm font-medium text-surface-600 mb-2">
      <Icon className="w-4 h-4 text-primary-500" />
      {label}
    </label>
    {editing && editable ? (
      type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={rows || 4}
          className="input-premium resize-none"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value || ''}
          onChange={onChange}
          className="input-premium"
          placeholder={type === 'date' ? '' : `Enter your ${label.toLowerCase()}`}
        />
      )
    ) : (
      <div className="px-4 py-3 bg-surface-50/50 rounded-xl border border-surface-100 min-h-[48px] flex items-center">
        <p className="text-surface-800">
          {value || <span className="text-surface-400 italic">Not added</span>}
        </p>
      </div>
    )}
  </motion.div>
))

function Profile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await API.get('/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      toast.error('Failed to load profile', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      await API.put('/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Profile updated successfully!', {
        icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      })

      setEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
      toast.error('Failed to save profile', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await API.post('/upload-profile-picture', formData)

      const token = localStorage.getItem('token')
      await API.put('/profile-picture', {
        image_url: uploadRes.data.image_url
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Profile picture updated!', {
        icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      })

      fetchProfile()
    } catch (err) {
      console.error('Error uploading image:', err)
      toast.error('Failed to upload image', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteProfilePicture = async () => {
    setDeleting(true)

    try {
      const token = localStorage.getItem('token')
      await API.delete('/profile-picture', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setProfile(prev => ({ ...prev, profile_picture: '' }))

      toast.success('Profile picture removed', {
        icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
      })
    } catch (err) {
      console.error('Error deleting picture:', err)
      toast.error('Failed to delete picture', {
        icon: <AlertCircle className="w-5 h-5 text-error-500" />,
      })
    } finally {
      setDeleting(false)
    }
  }

  const logout = async () => {
    try {
      if (user?.email) {
        await API.post('/logout', { email: user.email });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.clear()
    toast.success('Logged out successfully', {
      icon: <LogOut className="w-5 h-5 text-primary-600" />,
    })
    setTimeout(() => navigate('/'), 500)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    }
  }

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-28 h-28 rounded-full skeleton" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 skeleton rounded" />
                <div className="h-5 w-32 skeleton rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-12 w-full skeleton rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <AlertCircle className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-700 mb-2">Profile Not Found</h2>
          <p className="text-surface-500 mb-6">Unable to load your profile data.</p>
          <button onClick={() => navigate('/')} className="btn-premium">
            Go to Login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary-400/30 to-primary-400/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto relative"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center shadow-premium">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">My Profile</h1>
              <p className="text-surface-500 text-sm">Manage your account settings</p>
            </div>
          </div>

          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-error-50 text-error-600 rounded-xl border border-error-200 hover:bg-error-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Logout</span>
          </motion.button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 sm:p-8 mb-6"
        >
          {/* Profile Picture & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-surface-200">
            {/* Profile Picture */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                {profile.profile_picture ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${profile.profile_picture}`}
                    alt="Profile"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-primary-100 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold shadow-premium">
                    {profile.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Overlay on hover */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </motion.div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={uploadImage}
                className="hidden"
              />

              {/* Active indicator */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success-500 rounded-full flex items-center justify-center ring-4 ring-white">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Name & Username */}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-b-2 border-primary-400 focus:outline-none w-full sm:w-auto px-2 py-1 mb-2"
                  placeholder="Your Name"
                />
              ) : (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-surface-900 mb-1"
                >
                  {profile.full_name || 'No Name'}
                </motion.h2>
              )}
              <p className="text-surface-500 text-lg">@{profile.username}</p>

              {/* Picture Actions */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </motion.button>

                {profile.profile_picture && (
                  <motion.button
                    onClick={deleteProfilePicture}
                    disabled={deleting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-error-50 text-error-600 rounded-lg text-sm font-medium hover:bg-error-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Removing...' : 'Remove'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <motion.div variants={itemVariants} className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['overview', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                <ProfileField
                  icon={Mail}
                  label="Email"
                  name="email"
                  value={profile.email}
                  editable={false}
                  editing={editing}
                  itemVariants={itemVariants}
                />
                <ProfileField
                  icon={Phone}
                  label="Phone"
                  name="phone"
                  value={profile.phone}
                  editing={editing}
                  itemVariants={itemVariants}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                    setProfile(prev => ({ ...prev, phone: sanitizedValue }));
                  }}
                />
                <ProfileField
                  icon={User}
                  label="Gender"
                  name="gender"
                  value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''}
                  editing={editing}
                  itemVariants={itemVariants}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                />
                <ProfileField
                  icon={Calendar}
                  label="Date of Birth"
                  name="dob"
                  value={profile.dob}
                  type="date"
                  editing={editing}
                  itemVariants={itemVariants}
                  onChange={(e) => setProfile(prev => ({ ...prev, dob: e.target.value }))}
                />
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
                }}
                className="space-y-5"
              >
                <ProfileField
                  icon={MessageSquare}
                  label="Bio"
                  name="bio"
                  value={profile.bio}
                  type="textarea"
                  rows={5}
                  editing={editing}
                  itemVariants={itemVariants}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 w-full sm:w-auto"
              >
                <motion.button
                  onClick={saveProfile}
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  className="btn-premium flex-1 sm:flex-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setEditing(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary"
                >
                  <span className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="edit"
                onClick={() => setEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-premium"
              >
                <span className="flex items-center justify-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Account Info Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-surface-800">Account Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between items-center py-2 px-3 bg-surface-50 rounded-lg">
              <span className="text-surface-500">Account Status</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-surface-50 rounded-lg">
              <span className="text-surface-500">Member Since</span>
              <span className="font-medium text-surface-700">Today</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Profile
