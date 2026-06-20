import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Image,
  Paperclip,
  Mic,
  Square,
  X,
  Smile,
  Reply,
  FileText,
  Loader2,
} from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import toast from 'react-hot-toast'
import API from '../services/api'

function MessageInput({
  message,
  setMessage,
  sendMessage,
  typingUser,
  socketRef,
  conversationId,
  user,
  selectedImage,
  setSelectedImage,
  replyMessage,
  setReplyMessage,
  darkMode,
  loadMessages
}) {
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => chunks.push(e.data)

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        try {
          setUploading(true)
          const formData = new FormData()
          formData.append('file', blob, 'voice.webm')

          const upload = await API.post('/upload-audio', formData)

          await API.post('/message', {
            conversation_id: conversationId,
            sender_email: user.email,
            audio_url: upload.data.audio_url
          })

          toast.success('Voice message sent', { icon: '🎤' })
          await loadMessages(conversationId)
          setUploading(false)
        } catch (err) {
          console.error(err)
          toast.error('Failed to send voice message')
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      toast.success('Recording started', { icon: '🔴', duration: 1500 })
    } catch (err) {
      console.error(err)
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    setRecording(false)
  }

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const upload = await API.post('/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      await API.post('/message', {
        conversation_id: conversationId,
        sender_email: user.email,
        file_url: upload.data.file_url,
        file_name: upload.data.file_name
      })

      toast.success('File sent', { icon: '📎' })
      await loadMessages(conversationId)
      setUploading(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to send file')
    }
  }

  // Image Upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  // Handle submit
  const handleSubmit = (e) => {
    e?.preventDefault()
    if (message.trim() || selectedImage) {
      sendMessage()
    }
  }

  const handleSendImage = async () => {
    if (!selectedImage) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedImage)

      const upload = await API.post('/upload-chat-image', formData)

      await API.post('/message', {
        conversation_id: conversationId,
        sender_email: user.email,
        image_url: upload.data.image_url
      })

      toast.success('Image sent', { icon: '🖼️' })
      setSelectedImage(null)
      await loadMessages(conversationId)
      setUploading(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to send image')
    }
  }

  // Typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value)
    if (!conversationId) return;
    socketRef.current?.send(
      JSON.stringify({
        type: 'typing',
        sender: user.email,
        sender_name: user.username || user.full_name || user.email,
        conversation_id: conversationId
      })
    )
  }

  return (
    <div className={`
      border-t
      ${darkMode
        ? 'bg-surface-900 border-surface-700'
        : 'bg-white border-surface-200'
      }
    `}>
      {/* Reply Preview */}
      <AnimatePresence>
        {replyMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4"
          >
            <div className={`
              flex items-center justify-between gap-3 p-3 rounded-t-xl
              ${darkMode
                ? 'bg-primary-900/50 border border-primary-700 border-b-0'
                : 'bg-primary-50 border border-primary-200 border-b-0'
              }
            `}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`
                  p-2 rounded-lg
                  ${darkMode ? 'bg-primary-800' : 'bg-primary-100'}
                `}>
                  <Reply className={`w-4 h-4 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                    Replying to
                  </p>
                  <p className={`text-sm truncate ${darkMode ? 'text-surface-300' : 'text-surface-700'}`}>
                    {replyMessage.message}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setReplyMessage(null)}
                className={`
                  p-2 rounded-lg flex-shrink-0
                  ${darkMode
                    ? 'bg-primary-800 hover:bg-primary-700 text-primary-400'
                    : 'bg-primary-100 hover:bg-primary-200 text-primary-600'
                  }
                `}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`px-4 py-2 flex items-center gap-2 ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}
          >
            <div className="flex gap-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 bg-primary-500 rounded-full"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-primary-500 rounded-full"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-primary-500 rounded-full"
              />
            </div>
            <span className="text-xs italic">{typingUser} is typing...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3"
          >
            <div className={`
              relative inline-flex p-2 rounded-xl
              ${darkMode ? 'bg-surface-800 border border-surface-700' : 'bg-surface-50 border border-surface-200'}
            `}>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="w-28 h-28 object-cover rounded-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 p-1.5 bg-error-500 text-white rounded-full shadow-lg"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendImage}
                disabled={uploading}
                className="absolute bottom-4 right-4 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium shadow-lg flex items-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2"
          >
            <div className={`
              rounded-2xl overflow-hidden shadow-xl
              ${darkMode ? 'bg-surface-800' : 'bg-white border border-surface-200'}
            `}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage(prev => prev + emojiData.emoji)
                  setShowEmojiPicker(false)
                }}
                theme={darkMode ? 'dark' : 'light'}
                width="100%"
                height={300}
                searchDisabled
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3"
          >
            <div className={`
              flex items-center gap-3 p-4 rounded-xl
              ${darkMode ? 'bg-error-900/30 border border-error-700' : 'bg-error-50 border border-error-200'}
            `}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-4 h-4 bg-error-500 rounded-full"
              />
              <div className="flex-1">
                <div className="flex gap-1 items-center h-6">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, Math.random() * 24 + 8, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1 bg-error-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
              <span className={`text-sm ${darkMode ? 'text-error-400' : 'text-error-600'}`}>
                Recording...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="p-4">
        <form
          onSubmit={handleSubmit}
          className={`
            flex items-end gap-2 p-2 rounded-2xl
            ${darkMode
              ? 'bg-surface-800 border border-surface-700'
              : 'bg-surface-50 border border-surface-200'
            }
          `}
        >
          {/* Hidden Inputs */}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Buttons - Left */}
          <div className="flex items-center gap-1">
            {/* Emoji */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`
                p-2.5 rounded-xl transition-colors
                ${showEmojiPicker
                  ? 'bg-primary-500 text-white'
                  : darkMode
                    ? 'hover:bg-surface-700 text-surface-400'
                    : 'hover:bg-surface-200 text-surface-500'
                }
              `}
            >
              <Smile className="w-5 h-5" />
            </motion.button>

            {/* Image */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => imageInputRef.current?.click()}
              className={`
                p-2.5 rounded-xl transition-colors
                ${darkMode
                  ? 'hover:bg-surface-700 text-surface-400'
                  : 'hover:bg-surface-200 text-surface-500'
                }
              `}
            >
              <Image className="w-5 h-5" />
            </motion.button>

            {/* File */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className={`
                p-2.5 rounded-xl transition-colors
                ${uploading
                  ? 'opacity-50 cursor-wait'
                  : darkMode
                    ? 'hover:bg-surface-700 text-surface-400'
                    : 'hover:bg-surface-200 text-surface-500'
                }
              `}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5 rotate-45" />
              )}
            </motion.button>

            {/* Voice */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={recording ? stopRecording : startRecording}
              className={`
                p-2.5 rounded-xl transition-colors
                ${recording
                  ? 'bg-error-500 text-white'
                  : darkMode
                    ? 'hover:bg-surface-700 text-surface-400'
                    : 'hover:bg-surface-200 text-surface-500'
                }
              `}
            >
              {recording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="Type a message..."
              disabled={uploading}
              className={`
                w-full px-4 py-2.5 rounded-xl outline-none text-sm
                ${darkMode
                  ? 'bg-surface-700 text-white placeholder-surface-500'
                  : 'bg-white text-surface-900 placeholder-surface-400 border border-surface-200'
                }
                focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                disabled:opacity-50
              `}
            />
          </div>

          {/* Send Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={uploading || (!message.trim() && !selectedImage)}
            className={`
              p-3 rounded-xl transition-all
              ${message.trim() || selectedImage
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg'
                : darkMode
                  ? 'bg-surface-700 text-surface-500'
                  : 'bg-surface-200 text-surface-400'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>

        {/* Hint */}
        <p className={`text-center text-xs mt-2 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}>
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default MessageInput
