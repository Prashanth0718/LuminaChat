import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  UserMinus,
  UserPlus,
  Search,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Mail,
  MessageCircle,
  Loader2,
  Edit2,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function GroupInfoModal({
  showGroupInfo,
  setShowGroupInfo,
  setSelectedGroup,
  selectedGroup,
  users,
  loadConversations,
  darkMode,
  user,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [processing, setProcessing] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const groupMembers = useMemo(() => {
    if (!selectedGroup?.participants) return []
    return selectedGroup.participants.map(email => {
      const found = users?.find(u => u.email === email)
      return found || { email, username: email.split('@')[0] }
    })
  }, [selectedGroup, users])

  const availableUsers = useMemo(() => {
    if (!users || !selectedGroup) return []
    return users.filter(u =>
      !selectedGroup.participants?.includes(u.email) &&
      u.email !== user?.email &&
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, selectedGroup, user, searchQuery])

  const isAdmin = selectedGroup?.created_by === user?.email

  const removeMember = async (email) => {
    if (!selectedGroup?.id) return
    setProcessing(true)
    try {
      await API.put(`/group/remove-member/${selectedGroup.id}`, { email })
      const updated = await loadConversations()
      const latestGroup = updated.find((g) => g.id === selectedGroup.id)
      setSelectedGroup(latestGroup)
      toast.success('Member removed', { icon: '👋' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove member')
    } finally {
      setProcessing(false)
      setConfirmRemove(null)
    }
  }

  const addMember = async (email) => {
    if (!selectedGroup?.id || !email) return
    setProcessing(true)
    try {
      await API.put(`/group/add-member/${selectedGroup.id}`, { email })
      const updated = await loadConversations()
      const latestGroup = updated.find((g) => g.id === selectedGroup.id)
      setSelectedGroup(latestGroup)
      setSearchQuery('')
      toast.success('Member added', { icon: '👋' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to add member')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setConfirmRemove(null)
    setIsEditingName(false)
    setShowGroupInfo(false)
  }

  const updateGroupName = async () => {
    if (!newGroupName.trim() || newGroupName.trim() === selectedGroup.name) {
      setIsEditingName(false)
      return
    }
    
    setProcessing(true)
    try {
      await API.put(`/group/${selectedGroup.id}/name`, { name: newGroupName.trim() })
      const updated = await loadConversations()
      const latestGroup = updated.find((g) => g.id === selectedGroup.id)
      setSelectedGroup(latestGroup)
      toast.success('Group name updated', { icon: '✏️' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to update group name')
    } finally {
      setProcessing(false)
      setIsEditingName(false)
    }
  }

  return (
    <AnimatePresence>
      {showGroupInfo && selectedGroup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
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
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateGroupName()}
                        className={`
                          text-lg font-bold bg-transparent border-b-2 outline-none
                          ${darkMode ? 'text-white border-primary-500' : 'text-surface-900 border-primary-500'}
                        `}
                        disabled={processing}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={updateGroupName}
                        disabled={processing}
                        className="p-1 rounded-lg text-primary-500 hover:bg-primary-50"
                      >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsEditingName(false)}
                        disabled={processing}
                        className="p-1 rounded-lg text-error-500 hover:bg-error-50"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                        {selectedGroup.name}
                      </h2>
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setNewGroupName(selectedGroup.name);
                            setIsEditingName(true);
                          }}
                          className={`
                            p-1.5 rounded-lg transition-colors
                            ${darkMode ? 'hover:bg-surface-700 text-surface-400' : 'hover:bg-surface-100 text-surface-500'}
                          `}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  )}
                  <p className={`text-xs ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                    {groupMembers.length} members
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className={`
                  p-2 rounded-xl
                  ${darkMode ? 'hover:bg-surface-700 text-surface-400' : 'hover:bg-surface-100 text-surface-500'}
                `}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Group Creator */}
              <div className={`
                flex items-center gap-3 p-4 rounded-xl
                ${darkMode
                  ? 'bg-surface-700/50 border border-surface-700'
                  : 'bg-surface-50 border border-surface-200'
                }
              `}>
                <div className={`
                  p-2 rounded-xl
                  ${darkMode ? 'bg-primary-900/50' : 'bg-primary-100'}
                `}>
                  <Crown className={`w-4 h-4 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-surface-300' : 'text-surface-600'}`}>
                    Group Admin
                  </p>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                    {selectedGroup.created_by}
                  </p>
                </div>
                {isAdmin && (
                  <span className={`
                    text-xs font-semibold px-2 py-1 rounded-full
                    ${darkMode ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-100 text-primary-700'}
                  `}>
                    You
                  </span>
                )}
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                    Members
                  </h3>
                  <span className={`text-xs ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
                    {groupMembers.length} total
                  </span>
                </div>

                <div className="space-y-2">
                  {groupMembers.map((member) => {
                    const isCreator = member.email === selectedGroup.created_by
                    const isCurrentUser = member.email === user?.email
                    const isRemoving = confirmRemove === member.email

                    return (
                      <motion.div
                        key={member.email}
                        layout
                        className={`
                          flex items-center justify-between p-3 rounded-xl
                          ${darkMode ? 'bg-surface-700/50' : 'bg-surface-50'}
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {member.profile_picture ? (
                            <img
                              src={`http://127.0.0.1:8000${member.profile_picture}`}
                              alt={member.username}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary-500/20">
                              {member.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                              {member.full_name || member.username}
                              {isCurrentUser && (
                                <span className={`ml-2 text-xs font-normal ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className={`text-xs truncate ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isCreator && (
                            <span className={`
                              text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1
                              ${darkMode ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-100 text-primary-700'}
                            `}>
                              <Crown className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                          {isAdmin && !isCreator && !isCurrentUser && (
                            <AnimatePresence mode="wait">
                              {isRemoving ? (
                                <motion.div
                                  key="confirm"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="flex items-center gap-2"
                                >
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeMember(member.email)}
                                    disabled={processing}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-error-500 text-white hover:bg-error-600"
                                  >
                                    {processing ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      'Remove'
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setConfirmRemove(null)}
                                    className={`
                                      px-3 py-1.5 rounded-lg text-xs font-semibold
                                      ${darkMode ? 'bg-surface-700 text-surface-300 hover:bg-surface-600' : 'bg-surface-200 text-surface-600 hover:bg-surface-300'}
                                    `}
                                  >
                                    Cancel
                                  </motion.button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="remove"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setConfirmRemove(member.email)}
                                  className={`
                                    p-2 rounded-lg transition-colors
                                    ${darkMode
                                      ? 'hover:bg-error-900/50 text-error-400'
                                      : 'hover:bg-error-50 text-error-500'
                                    }
                                  `}
                                  title="Remove member"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Add Members Section */}
              {isAdmin && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                    Add Members
                  </h3>

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
                      placeholder="Search users to add..."
                      className={`
                        bg-transparent outline-none text-sm flex-1
                        ${darkMode ? 'text-white placeholder-surface-500' : 'text-surface-900 placeholder-surface-400'}
                      `}
                    />
                    {searchQuery && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')}
                        className={`
                          p-1 rounded-full
                          ${darkMode ? 'hover:bg-surface-600 text-surface-400' : 'hover:bg-surface-200 text-surface-400'}
                        `}
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {availableUsers.length === 0 ? (
                      <div className={`
                        flex items-center justify-center gap-2 py-6 text-sm
                        ${darkMode ? 'text-surface-500' : 'text-surface-400'}
                      `}>
                        <Shield className="w-4 h-4" />
                        <span>No more users to add</span>
                      </div>
                    ) : (
                      availableUsers.map((u) => (
                        <motion.div
                          key={u.email}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`
                            flex items-center justify-between p-3 rounded-xl
                            ${darkMode ? 'bg-surface-700/50' : 'bg-surface-50'}
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {u.profile_picture ? (
                              <img
                                src={`http://127.0.0.1:8000${u.profile_picture}`}
                                alt={u.username}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary-500/20">
                                {u.username?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                                {u.full_name || u.username}
                              </p>
                              <p className={`text-xs truncate ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
                                {u.email}
                              </p>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addMember(u.email)}
                            disabled={processing}
                            className={`
                              p-2 rounded-lg transition-colors
                              ${darkMode
                                ? 'bg-primary-900/50 text-primary-400 hover:bg-primary-900/70'
                                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            title="Add member"
                          >
                            {processing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GroupInfoModal
