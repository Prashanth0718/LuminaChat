import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  Check,
  Search,
  UserPlus,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function GroupModal({
  users,
  user,
  showGroupModal,
  setShowGroupModal,
  loadConversations,
  darkMode
}) {
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const availableUsers = useMemo(() => {
    return users?.filter(u =>
      u.email !== user?.email &&
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  }, [users, user, searchQuery])

  const toggleUser = (email) => {
    setSelectedUsers(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one member')
      return
    }

    try {
      setCreating(true)

      await API.post('/group', {
        name: groupName.trim(),
        created_by: user.email,
        participants: [user.email, ...selectedUsers]
      })

      await loadConversations()
      toast.success('Group created successfully!', { icon: '👥' })

      setGroupName('')
      setSelectedUsers([])
      setSearchQuery('')
      setShowGroupModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  const closeModal = () => {
    setGroupName('')
    setSelectedUsers([])
    setSearchQuery('')
    setShowGroupModal(false)
  }

  return (
    <AnimatePresence>
      {showGroupModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              w-full max-w-md max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col
              ${darkMode
                ? 'bg-surface-800 border border-surface-700'
                : 'bg-white border border-surface-200'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`
              flex items-center justify-between p-5 border-b
              ${darkMode ? 'border-surface-700' : 'border-surface-200'}
            `}>
              <div className="flex items-center gap-3">
                <div className={`
                  p-2.5 rounded-xl
                  ${darkMode ? 'bg-primary-900/50' : 'bg-primary-100'}
                `}>
                  <Users className={`w-5 h-5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                    Create Group
                  </h2>
                  <p className={`text-xs ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                    {selectedUsers.length + 1} member{selectedUsers.length !== 0 ? 's' : ''}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className={`
                  p-2 rounded-xl
                  ${darkMode ? 'hover:bg-surface-700 text-surface-400' : 'hover:bg-surface-100 text-surface-500'}
                `}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Group Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-surface-300' : 'text-surface-700'}`}>
                  Group Name
                </label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className={`
                    w-full px-4 py-3 rounded-xl border outline-none transition-all
                    ${darkMode
                      ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                      : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                    }
                  `}
                />
              </div>

              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-surface-300' : 'text-surface-700'}`}>
                    Selected Members
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {selectedUsers.map(email => {
                        const u = users.find(user => user.email === email)
                        if (!u) return null
                        return (
                          <motion.button
                            key={email}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleUser(email)}
                            className={`
                              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                              ${darkMode
                                ? 'bg-primary-900/50 border border-primary-700 text-primary-300'
                                : 'bg-primary-50 border border-primary-200 text-primary-700'
                              }
                            `}
                          >
                            <span>{u.username}</span>
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Search Users */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-surface-300' : 'text-surface-700'}`}>
                  Add Members
                </label>
                <div className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border mb-3
                  ${darkMode
                    ? 'bg-surface-700 border-surface-600'
                    : 'bg-surface-50 border-surface-200'
                  }
                `}>
                  <Search className={`w-4 h-4 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className={`
                      bg-transparent outline-none text-sm flex-1
                      ${darkMode ? 'text-white placeholder-surface-500' : 'text-surface-900 placeholder-surface-400'}
                    `}
                  />
                </div>

                {/* Users List */}
                <div className={`
                  max-h-60 overflow-y-auto rounded-xl border
                  ${darkMode ? 'border-surface-700' : 'border-surface-200'}
                `}>
                  {availableUsers.length === 0 ? (
                    <div className={`
                      flex items-center justify-center gap-2 py-8 text-sm
                      ${darkMode ? 'text-surface-500' : 'text-surface-400'}
                    `}>
                      <AlertCircle className="w-4 h-4" />
                      <span>No users found</span>
                    </div>
                  ) : (
                    availableUsers.map(u => {
                      const isSelected = selectedUsers.includes(u.email)
                      return (
                        <motion.button
                          key={u.email}
                          whileHover={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                          onClick={() => toggleUser(u.email)}
                          className={`
                            flex items-center justify-between w-full px-4 py-3 transition-colors
                            ${darkMode ? 'border-surface-700' : 'border-surface-100'}
                            border-b last:border-b-0
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {u.profile_picture ? (
                              <img
                                src={`http://127.0.0.1:8000${u.profile_picture}`}
                                alt={u.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold text-sm">
                                {u.username?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div className="text-left">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                                {u.full_name || u.username}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                                {u.email}
                              </p>
                            </div>
                          </div>

                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center transition-all
                            ${isSelected
                              ? 'bg-primary-500 text-white'
                              : darkMode
                                ? 'bg-surface-700 border border-surface-600'
                                : 'bg-surface-100 border border-surface-300'
                            }
                          `}>
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                        </motion.button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`
              flex items-center gap-3 p-5 border-t
              ${darkMode ? 'border-surface-700' : 'border-surface-200'}
            `}>
              <button
                onClick={closeModal}
                className={`
                  flex-1 px-5 py-3 rounded-xl font-medium transition-colors
                  ${darkMode
                    ? 'bg-surface-700 hover:bg-surface-600 text-white'
                    : 'bg-surface-100 hover:bg-surface-200 text-surface-700'
                  }
                `}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createGroup}
                disabled={creating || !groupName.trim()}
                className={`
                  flex-1 px-5 py-3 rounded-xl font-medium transition-all
                  flex items-center justify-center gap-2
                  ${!groupName.trim() || creating
                    ? darkMode
                      ? 'bg-surface-700 text-surface-500 cursor-not-allowed'
                      : 'bg-surface-200 text-surface-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg'
                  }
                `}
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create Group</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GroupModal
