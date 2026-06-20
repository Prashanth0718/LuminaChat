import { motion } from 'framer-motion'
import {
  Search,
  X,
  Users,
  Info,
  ChevronLeft,
  Phone,
  Video,
  CheckCircle2,
  Clock,
  Circle,
} from 'lucide-react'

function ChatHeader({
  selectedUser,
  onlineUsers,
  setShowProfile,
  setShowGroupInfo,
  searchText,
  setSearchText,
  darkMode,
  onBack
}) {
  const isOnline = onlineUsers?.includes(selectedUser?.email)
  const isGroup = selectedUser?.is_group

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
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 border-b
      ${darkMode
        ? 'bg-surface-900 border-surface-700'
        : 'bg-white border-surface-200'
      }
    `}>
      {/* Back Button (Mobile) */}
      {onBack && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className={`
            p-2 rounded-xl lg:hidden
            ${darkMode ? 'hover:bg-surface-700 text-surface-400' : 'hover:bg-surface-100 text-surface-500'}
          `}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}

      {/* Avatar + Info */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => isGroup ? setShowGroupInfo(true) : setShowProfile(true)}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {(isGroup ? selectedUser?.group_image : selectedUser?.profile_picture) ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${isGroup ? selectedUser.group_image : selectedUser.profile_picture}`}
              alt={selectedUser.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold text-lg ring-2 ring-primary-500/20">
              {selectedUser?.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}

          {/* Online Status Dot */}
          {isOnline && !isGroup && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success-500 rounded-full ring-2 ring-white dark:ring-surface-900"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-success-500 rounded-full"
              />
            </motion.span>
          )}
        </div>

        {/* Name & Status */}
        <div className="min-w-0 text-left">
          <h2 className={`font-bold text-base truncate ${darkMode ? 'text-white' : 'text-surface-900'}`}>
            {isGroup ? (selectedUser?.name || selectedUser?.username) : (selectedUser?.full_name || selectedUser?.username)}
          </h2>

          <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
            {isGroup ? (
              <>
                <Users className="w-3.5 h-3.5" />
                <span>Group</span>
              </>
            ) : isOnline ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                <span className="text-success-500 font-medium">Online</span>
              </>
            ) : selectedUser?.last_seen ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Last seen {formatLastSeen(selectedUser.last_seen)}</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </motion.button>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className={`
          relative flex items-center
          ${searchText ? 'w-48 sm:w-64' : 'w-10 sm:w-48 sm:focus-within:w-64'}
          transition-all duration-300
        `}>
          <div className={`
            flex items-center gap-2 w-full
            ${darkMode ? 'bg-surface-800' : 'bg-surface-100'}
            rounded-xl px-3 py-2
          `}>
            <Search className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`
                bg-transparent outline-none text-sm w-full
                ${darkMode ? 'text-white placeholder-surface-500' : 'text-surface-900 placeholder-surface-400'}
                ${!searchText ? 'hidden sm:block' : ''}
              `}
            />
            {searchText && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchText('')}
                className={`
                  p-1 rounded-full flex-shrink-0
                  ${darkMode ? 'hover:bg-surface-700 text-surface-400' : 'hover:bg-surface-200 text-surface-400'}
                `}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Call Buttons */}
        <div className="hidden md:flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              p-2.5 rounded-xl
              ${darkMode
                ? 'hover:bg-surface-700 text-surface-400'
                : 'hover:bg-surface-100 text-surface-500'
              }
            `}
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              p-2.5 rounded-xl
              ${darkMode
                ? 'hover:bg-surface-700 text-surface-400'
                : 'hover:bg-surface-100 text-surface-500'
              }
            `}
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Group Info */}
        {isGroup && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowGroupInfo(true)}
            className={`
              p-2.5 rounded-xl
              ${darkMode
                ? 'hover:bg-surface-700 text-surface-400'
                : 'hover:bg-surface-100 text-surface-500'
              }
            `}
            title="Group info"
          >
            <Info className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default ChatHeader
