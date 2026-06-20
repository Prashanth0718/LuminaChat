import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Forward,
  Search,
  User,
  Users,
  Image as ImageIcon,
  FileText,
  Mic,
  MessageSquare,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function ForwardModal({
  showForwardModal,
  setShowForwardModal,
  forwardMessage,
  users,
  conversations,
  user,
  darkMode,
}) {
  const [search, setSearch] = useState('')
  const [forwarding, setForwarding] = useState(false)
  const [forwardedTo, setForwardedTo] = useState(null)

  const handleClose = () => {
    setSearch('')
    setForwarding(false)
    setForwardedTo(null)
    setShowForwardModal(false)
  }

  const forwardToUser = async (u) => {
    const convo = conversations.find(
      (c) =>
        !c.is_group &&
        c.participants?.includes(u.email) &&
        c.participants?.includes(user.email)
    )

    if (!convo) {
      toast.error('No conversation found with this user')
      return
    }

    await doForward(convo.id, u.username)
  }

  const forwardToGroup = async (group) => {
    await doForward(group.id, group.name)
  }

  const doForward = async (conversationId, destinationName) => {
    setForwarding(true)
    try {
      await API.post('/message', {
        conversation_id: conversationId,
        sender_email: user.email,
        message: forwardMessage?.message || '',
        image_url: forwardMessage?.image_url || null,
        file_url: forwardMessage?.file_url || null,
        file_name: forwardMessage?.file_name || null,
        audio_url: forwardMessage?.audio_url || null,
        forwarded: true,
      })

      toast.success(`Forwarded to ${destinationName}`, { icon: '↗️' })
      setForwardedTo(destinationName)
      setTimeout(() => handleClose(), 800)
    } catch (err) {
      console.error(err)
      toast.error('Failed to forward message')
    } finally {
      setForwarding(false)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!users || !user) return []
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.email !== user.email &&
        (u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q))
    )
  }, [users, user, search])

  const filteredGroups = useMemo(() => {
    if (!conversations) return []
    const q = search.toLowerCase()
    return conversations.filter(
      (c) => c.is_group && c.name?.toLowerCase().includes(q)
    )
  }, [conversations, search])

  const messagePreview = () => {
    if (!forwardMessage) return null
    return (
      <div
        className={`
          p-4 rounded-xl border mb-4
          ${
            darkMode
              ? 'bg-surface-700/70 border-surface-700'
              : 'bg-surface-50 border-surface-200'
          }
        `}
      >
        <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
          Forwarding
        </p>
        <div className="flex items-start gap-2">
          <Forward className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
          <div className="min-w-0">
            {forwardMessage.message && (
              <p className={`text-sm line-clamp-3 ${darkMode ? 'text-surface-200' : 'text-surface-700'}`}>
                {forwardMessage.message}
              </p>
            )}
            {forwardMessage.image_url && (
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </div>
            )}
            {forwardMessage.file_url && (
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                <FileText className="w-4 h-4" />
                <span className="truncate">{forwardMessage.file_name || 'File'}</span>
              </div>
            )}
            {forwardMessage.audio_url && (
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                <Mic className="w-4 h-4" />
                <span>Voice Message</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {showForwardModal && forwardMessage && (
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
              ${
                darkMode
                  ? 'bg-surface-800 border border-surface-700'
                  : 'bg-white border border-surface-200'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`
                flex items-center justify-between p-5 border-b
                ${darkMode ? 'border-surface-700' : 'border-surface-200'}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    p-2.5 rounded-xl
                    ${darkMode ? 'bg-primary-900/50' : 'bg-primary-100'}
                  `}
                >
                  <Forward
                    className={`w-5 h-5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}
                  />
                </div>
                <div>
                  <h2
                    className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-surface-900'}`}
                  >
                    Forward Message
                  </h2>
                  <p className={`text-xs ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                    Share with contacts
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
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Message Preview */}
              {messagePreview()}

              {/* Search */}
              <div
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border
                  ${
                    darkMode
                      ? 'bg-surface-700 border-surface-600'
                      : 'bg-surface-50 border-surface-200'
                  }
                `}
              >
                <Search
                  className={`w-4 h-4 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users or groups..."
                  className={`
                    bg-transparent outline-none text-sm flex-1
                    ${
                      darkMode
                        ? 'text-white placeholder-surface-500'
                        : 'text-surface-900 placeholder-surface-400'
                    }
                  `}
                />
                {search && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearch('')}
                    className={`
                      p-1 rounded-full
                      ${darkMode ? 'hover:bg-surface-600 text-surface-400' : 'hover:bg-surface-200 text-surface-400'}
                    `}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>

              {/* Users Section */}
              <div>
                <h3
                  className={`text-sm font-semibold mb-2 ${darkMode ? 'text-surface-300' : 'text-surface-600'}`}
                >
                  Users
                </h3>
                {filteredUsers.length === 0 ? (
                  <div
                    className={`
                      flex items-center justify-center gap-2 py-6 text-sm rounded-xl
                      ${darkMode ? 'text-surface-500 bg-surface-700/30' : 'text-surface-400 bg-surface-50'}
                    `}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>No users found</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredUsers.map((u) => (
                      <motion.button
                        key={u.email}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => forwardToUser(u)}
                        disabled={forwarding}
                        className={`
                          flex items-center justify-between w-full p-3 rounded-xl transition-colors
                          ${
                            darkMode
                              ? 'hover:bg-surface-700/50 text-surface-300'
                              : 'hover:bg-surface-100 text-surface-700'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {u.profile_picture ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${u.profile_picture}`}
                              alt={u.username}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary-500/20">
                              {u.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="text-left min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                darkMode ? 'text-white' : 'text-surface-900'
                              }`}
                            >
                              {u.full_name || u.username}
                            </p>
                            <p
                              className={`text-xs truncate ${
                                darkMode ? 'text-surface-500' : 'text-surface-400'
                              }`}
                            >
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`
                            p-2 rounded-lg flex-shrink-0
                            ${
                              darkMode
                                ? 'bg-primary-900/50 text-primary-400'
                                : 'bg-primary-100 text-primary-600'
                            }
                          `}
                        >
                          <Send className="w-4 h-4" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Groups Section */}
              {filteredGroups.length > 0 && (
                <div>
                  <h3
                    className={`text-sm font-semibold mb-2 ${darkMode ? 'text-surface-300' : 'text-surface-600'}`}
                  >
                    Groups
                  </h3>
                  <div className="space-y-1">
                    {filteredGroups.map((group) => (
                      <motion.button
                        key={group.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => forwardToGroup(group)}
                        disabled={forwarding}
                        className={`
                          flex items-center justify-between w-full p-3 rounded-xl transition-colors
                          ${
                            darkMode
                              ? 'hover:bg-surface-700/50 text-surface-300'
                              : 'hover:bg-surface-100 text-surface-700'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-primary-500/20
                              ${
                                darkMode
                                  ? 'bg-surface-700 text-surface-400'
                                  : 'bg-surface-100 text-surface-500'
                              }
                            `}
                          >
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="text-left min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                darkMode ? 'text-white' : 'text-surface-900'
                              }`}
                            >
                              {group.name}
                            </p>
                            <p
                              className={`text-xs truncate ${
                                darkMode ? 'text-surface-500' : 'text-surface-400'
                              }`}
                            >
                              {group.participants?.length || 0} members
                            </p>
                          </div>
                        </div>
                        <div
                          className={`
                            p-2 rounded-lg flex-shrink-0
                            ${
                              darkMode
                                ? 'bg-primary-900/50 text-primary-400'
                                : 'bg-primary-100 text-primary-600'
                            }
                          `}
                        >
                          <Send className="w-4 h-4" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {filteredUsers.length === 0 && filteredGroups.length === 0 && (
                <div
                  className={`
                    flex flex-col items-center gap-2 py-8 text-sm
                    ${darkMode ? 'text-surface-500' : 'text-surface-400'}
                  `}
                >
                  <Search className="w-8 h-8 opacity-50" />
                  <p>No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ForwardModal
