import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreVertical,
  Reply,
  Forward,
  Copy,
  Trash2,
  Pin,
  PinOff,
  Edit3,
  Heart,
  ThumbsUp,
  Smile,
  Check,
  CheckCheck,
  X,
  Download,
  FileText,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function MessageList({
  messages,
  user,
  selectedUser,
  searchText,
  messagesEndRef,
  loadMessages,
  conversationId,
  replyMessage,
  setReplyMessage,
  darkMode,
  forwardMessage,
  setForwardMessage,
  setShowForwardModal,
}) {
  const [previewImage, setPreviewImage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)
  const [playingAudio, setPlayingAudio] = useState(null)

  // Close menu on outside click
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])

  // Audio playback
  useEffect(() => {
    return () => setPlayingAudio(null)
  }, [])

  const deleteMessage = async (messageId) => {
    try {
      await API.put(`/message/delete/${messageId}`)
      toast.success('Message deleted', { icon: '🗑️' })
      await loadMessages(conversationId)
      setOpenMenuId(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete message')
    }
  }

  const saveEdit = async (messageId) => {
    if (!editedText.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    try {
      await API.put(`/message/edit/${messageId}`, { message: editedText })
      toast.success('Message edited', { icon: '✏️' })
      setEditingId(null)
      setEditedText('')
      setOpenMenuId(null)
      await loadMessages(conversationId)
    } catch (err) {
      console.error(err)
      toast.error('Failed to edit message')
    }
  }

  const reactToMessage = async (messageId, emoji) => {
    try {
      await API.put(`/message/react/${messageId}`, {
        emoji,
        user: user.email
      })
      setOpenMenuId(null)
      await loadMessages(conversationId)
    } catch (err) {
      console.error(err)
    }
  }

  const copyMessage = async (text) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard', { icon: '📋' })
    setTimeout(() => setCopied(false), 2000)
    setOpenMenuId(null)
  }

  const togglePin = async (msg) => {
    try {
      await API.put(
        msg.pinned ? `/message/unpin/${msg.id}` : `/message/pin/${msg.id}`
      )
      toast.success(msg.pinned ? 'Message unpinned' : 'Message pinned', { icon: '📌' })
      await loadMessages(conversationId)
      setOpenMenuId(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update pin')
    }
  }

  const pinnedMessage = messages.find((m) => m.pinned)

  const filteredMessages = messages.filter((msg) =>
    msg.message?.toLowerCase().includes(searchText?.toLowerCase() || '')
  )

  const emojiReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉']

  // Message time format
  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  const pinnedVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  }

  return (
    <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-surface-900' : 'bg-surface-50'}`}>
      {/* Pinned Message */}
      <AnimatePresence>
        {pinnedMessage && (
          <motion.div
            variants={pinnedVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="sticky top-0 z-20 mb-4"
          >
            <div className={`
              flex items-center justify-between gap-3 p-3 rounded-xl
              ${darkMode
                ? 'bg-accent-900/50 border border-accent-700'
                : 'bg-gradient-to-r from-accent-100 to-accent-50 border border-accent-200'
              }
            `}>
              <div className="flex items-center gap-2 min-w-0">
                <Pin className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-accent-400' : 'text-accent-600'}`} />
                <span className={`truncate text-sm ${darkMode ? 'text-accent-300' : 'text-accent-800'}`}>
                  {pinnedMessage.message}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  await API.put(`/message/unpin/${pinnedMessage.id}`)
                  await loadMessages(conversationId)
                }}
                className={`flex-shrink-0 p-1 rounded-lg ${darkMode ? 'hover:bg-accent-800 text-accent-400' : 'hover:bg-accent-200 text-accent-600'}`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredMessages.map((msg) => {
            const isOwn = msg.sender_email === user.email
            const showMenu = openMenuId === msg.id && !msg.deleted

            return (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`group relative max-w-[85%] sm:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {/* Avatar for group chats */}
                  {!isOwn && selectedUser?.is_group && (
                    <div className="flex items-end gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {msg.sender_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-0.5">
                        {msg.sender_name}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`
                    relative px-4 py-2.5 rounded-2xl shadow-sm
                    ${isOwn
                      ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-md'
                      : darkMode
                        ? 'bg-surface-800 text-white rounded-bl-md'
                        : 'bg-white text-surface-900 rounded-bl-md border border-surface-200'
                    }
                  `}>
                    {/* Menu Button */}
                    {!msg.deleted && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === msg.id ? null : msg.id)
                        }}
                        className={`
                          absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                          p-1.5 rounded-lg
                          ${isOwn
                            ? 'hover:bg-white/20 text-white/80 hover:text-white'
                            : darkMode
                              ? 'hover:bg-surface-700 text-surface-400 hover:text-white'
                              : 'hover:bg-surface-100 text-surface-400 hover:text-surface-600'
                          }
                        `}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    )}

                    {/* Context Menu */}
                    <AnimatePresence>
                      {showMenu && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className={`
                            absolute top-8 ${isOwn ? 'right-0' : 'left-0'}
                            z-50 min-w-[180px] py-2 rounded-xl shadow-xl border overflow-hidden
                            ${darkMode
                              ? 'bg-surface-800 border-surface-700 text-surface-100'
                              : 'bg-white border-surface-200 text-surface-900'
                            }
                          `}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Reply */}
                          <button
                            onClick={() => {
                              setReplyMessage(msg)
                              setOpenMenuId(null)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${darkMode ? 'hover:bg-surface-700' : 'hover:bg-surface-50'}`}
                          >
                            <Reply className="w-4 h-4" />
                            <span>Reply</span>
                          </button>

                          {/* Forward */}
                          <button
                            onClick={() => {
                              setForwardMessage(msg)
                              setShowForwardModal(true)
                              setOpenMenuId(null)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${darkMode ? 'hover:bg-surface-700' : 'hover:bg-surface-50'}`}
                          >
                            <Forward className="w-4 h-4" />
                            <span>Forward</span>
                          </button>

                          {/* Pin/Unpin */}
                          <button
                            onClick={() => togglePin(msg)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${darkMode ? 'hover:bg-surface-700' : 'hover:bg-surface-50'}`}
                          >
                            {msg.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                            <span>{msg.pinned ? 'Unpin' : 'Pin'}</span>
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => copyMessage(msg.message)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${darkMode ? 'hover:bg-surface-700' : 'hover:bg-surface-50'}`}
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </button>

                          {/* Reactions */}
                          <div className={`px-4 py-2.5 border-t ${darkMode ? 'border-surface-700' : 'border-surface-100'}`}>
                            <p className={`text-xs mb-2 ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>React</p>
                            <div className="flex gap-2">
                              {emojiReactions.map((emoji) => (
                                <motion.button
                                  key={emoji}
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => reactToMessage(msg.id, emoji)}
                                  className="text-lg hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg p-1"
                                >
                                  {emoji}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Edit (own messages only) */}
                          {isOwn && (
                            <button
                              onClick={() => {
                                setEditingId(msg.id)
                                setEditedText(msg.message)
                                setOpenMenuId(null)
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm border-t ${darkMode ? 'border-surface-700 hover:bg-surface-700' : 'border-surface-100 hover:bg-surface-50'}`}
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Delete (own messages only) */}
                          {isOwn && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 border-t border-error-100 dark:border-error-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Image */}
                    {!msg.deleted && msg.image_url && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-2"
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL}${msg.image_url}`}
                          alt="Shared image"
                          className="rounded-xl max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setPreviewImage(`${import.meta.env.VITE_API_URL}${msg.image_url}`)}
                        />
                      </motion.div>
                    )}

                    {/* File */}
                    {!msg.deleted && msg.file_url && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}${msg.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`
                          flex items-center gap-3 p-3 rounded-xl mb-2
                          ${isOwn
                            ? 'bg-white/10 hover:bg-white/15'
                            : darkMode
                              ? 'bg-surface-700 hover:bg-surface-600'
                              : 'bg-surface-50 hover:bg-surface-100 border border-surface-200'
                          }
                          transition-colors group
                        `}
                      >
                        <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-primary-100'}`}>
                          <FileText className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-primary-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{msg.file_name}</p>
                          <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-surface-400'}`}>Click to download</p>
                        </div>
                        <Download className={`w-4 h-4 ${isOwn ? 'text-white/70' : 'text-surface-400'}`} />
                      </a>
                    )}

                    {/* Audio */}
                    {!msg.deleted && msg.audio_url && (
                      <div className="mb-2">
                        <audio
                          controls
                          className="w-full max-w-48 h-10"
                          onPlay={() => setPlayingAudio(msg.id)}
                          onPause={() => setPlayingAudio(null)}
                        >
                          <source
                            src={`${import.meta.env.VITE_API_URL}${msg.audio_url}`}
                            type="audio/webm"
                          />
                        </audio>
                      </div>
                    )}

                    {/* Message Text */}
                    {editingId === msg.id ? (
                      <div className="flex gap-2 items-center mt-1">
                        <input
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(msg.id)
                            if (e.key === 'Escape') {
                              setEditingId(null)
                              setEditedText('')
                            }
                          }}
                          className={`
                            flex-1 px-3 py-2 rounded-lg border
                            ${isOwn
                              ? 'bg-white/20 border-white/30 text-white placeholder-white/50'
                              : darkMode
                                ? 'bg-surface-700 border-surface-600 text-white'
                                : 'bg-surface-50 border-surface-200 text-surface-900'
                            }
                            focus:outline-none focus:ring-2 focus:ring-primary-500
                          `}
                          autoFocus
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => saveEdit(msg.id)}
                          className="p-2 bg-success-500 text-white rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingId(null)
                            setEditedText('')
                          }}
                          className={`p-2 rounded-lg ${isOwn ? 'bg-white/20 text-white' : 'bg-surface-200 text-surface-600'}`}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : (
                      msg.message && (
                        <div>
                          {/* Reply Quote */}
                          {msg.reply_to && (
                            <div className={`
                              mb-2 px-3 py-2 rounded-lg border-l-4 text-xs
                              ${isOwn
                                ? 'bg-white/10 border-white/40'
                                : darkMode
                                  ? 'bg-surface-700/50 border-primary-400'
                                  : 'bg-surface-100 border-primary-400'
                              }
                            `}>
                              <div className={`font-semibold ${isOwn ? 'text-white/80' : 'text-primary-600'}`}>
                                <Reply className="w-3 h-3 inline mr-1" />
                                Reply
                              </div>
                              <div className={`truncate ${isOwn ? 'text-white/70' : 'text-surface-600'}`}>
                                {msg.reply_to}
                              </div>
                            </div>
                          )}

                          {/* Forwarded indicator */}
                          {msg.forwarded && (
                            <div className={`text-xs italic mb-1 flex items-center gap-1 ${isOwn ? 'text-white/70' : 'text-surface-400'}`}>
                              <Forward className="w-3 h-3" />
                              Forwarded
                            </div>
                          )}

                          {/* Message text */}
                          <p className={`break-words ${msg.deleted ? 'italic text-surface-400' : ''}`}>
                            {msg.message}
                            {msg.edited && (
                              <span className="text-xs ml-2 italic opacity-60">(edited)</span>
                            )}
                          </p>
                        </div>
                      )
                    )}

                    {/* Reactions */}
                    {!msg.deleted && msg.reactions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.reactions.map((reaction, index) => (
                          <motion.span
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`
                              px-2 py-1 rounded-full text-sm
                              ${isOwn
                                ? 'bg-white/20'
                                : darkMode
                                  ? 'bg-surface-700'
                                  : 'bg-surface-100 border border-surface-200'
                              }
                            `}
                          >
                            {reaction.emoji}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {/* Time & Status */}
                    <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isOwn ? 'text-white/70' : darkMode ? 'text-surface-400' : 'text-surface-400'}`}>
                      <span className="text-xs">{formatTime(msg.created_at)}</span>
                      {isOwn && (
                        <div className="flex items-center">
                          {msg.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" />}
                          {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-primary-300" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <motion.a
              href={previewImage}
              download
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-900 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-success-400" />
            <span>Copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageList
