import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MessageCircle,
  Users,
  Plus,
  Sun,
  Moon,
  Settings,
  ChevronRight,
  Sparkles,
  LogOut,
  Bell,
} from 'lucide-react'

function Sidebar({
  users,
  user,
  onlineUsers,
  openConversation,
  unreadCounts,
  setShowGroupModal,
  conversations,
  openGroup,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  sidebarSearch,
  setSidebarSearch,
}) {
  const navigate = useNavigate()
  const [hoveredUser, setHoveredUser] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  //console.log('Sidebar Conversations:', conversations)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email !== user?.email &&
      (u.username?.toLowerCase().includes(sidebarSearch?.toLowerCase() || '') ||
        u.email?.toLowerCase().includes(sidebarSearch?.toLowerCase() || ''))
  )

  const filteredGroups = conversations.filter(
    (c) =>
      c.is_group &&
      c.name?.toLowerCase().includes(sidebarSearch?.toLowerCase() || '')
  )

  const totalUnread = Object.values(unreadCounts || {}).reduce((sum, count) => sum + count, 0)

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        w-80 h-screen flex flex-col
        ${darkMode
          ? 'bg-surface-900 border-r border-surface-700'
          : 'bg-white/80 backdrop-blur-xl border-r border-surface-200'
        }
      `}
    >
      {/* Header - User Profile Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`p-4 ${darkMode ? 'border-b border-surface-700' : 'border-b border-surface-200'}`}
      >
        <div
          onClick={() => navigate('/profile')}
          className={`
            flex items-center gap-3 p-3 rounded-2xl cursor-pointer
            group transition-all duration-300
            ${darkMode
              ? 'hover:bg-surface-800'
              : 'hover:bg-primary-50 border border-transparent hover:border-primary-200 hover:shadow-md'
            }
          `}
        >
          {/* Avatar */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white
                ${darkMode
                  ? 'bg-gradient-to-br from-primary-600 to-secondary-500'
                  : 'bg-gradient-to-br from-primary-500 to-secondary-400 shadow-md'
                }
              `}
            >
              {user?.profile_picture ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${user.profile_picture}`}
                  alt={user?.username || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (user?.username || user?.email)?.charAt(0)?.toUpperCase()
              )}
            </motion.div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-surface-900'}`}>
              {user?.full_name || user?.username || 'User'}
            </h3>
            <p className={`text-xs truncate ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
              {user?.email}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {totalUnread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-error-500 rounded-full flex items-center justify-center"
              >
                <span className="text-xs text-white font-bold">{totalUnread > 9 ? '9+' : totalUnread}</span>
              </motion.div>
            )}
            <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="p-4"
      >
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`} />
          <input
            type="text"
            placeholder="Search chats..."
            value={sidebarSearch || ''}
            onChange={(e) => setSidebarSearch(e.target.value)}
            className={`
              w-full pl-12 pr-4 py-3 rounded-xl
              ${darkMode 
                ? 'bg-surface-800 text-white placeholder-surface-500 focus:bg-surface-700' 
                : 'bg-surface-100 text-surface-900 placeholder-surface-400 focus:bg-white'
              }
              border-2 border-transparent
              focus:outline-none focus:border-primary-400
              transition-all duration-200
            `}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 pb-3"
      >
        <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-surface-800' : 'bg-surface-100'}`}>
          <button
            onClick={() => setActiveTab('chats')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
              ${activeTab === 'chats'
                ? darkMode
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-primary-600 shadow-sm'
                : darkMode
                  ? 'text-surface-400 hover:text-white'
                  : 'text-surface-500 hover:text-surface-700'
              }
            `}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chats</span>
            {totalUnread > 0 && activeTab !== 'chats' && (
              <span className="w-5 h-5 bg-error-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
              ${activeTab === 'groups'
                ? darkMode
                  ? 'bg-secondary-600 text-white shadow-md'
                  : 'bg-white text-secondary-600 shadow-sm'
                : darkMode
                  ? 'text-surface-400 hover:text-white'
                  : 'text-surface-500 hover:text-surface-700'
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span>Groups</span>
          </button>
        </div>
      </motion.div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <AnimatePresence mode="wait">
          {activeTab === 'chats' && (
            <motion.div
              key="chats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="space-y-1"
            >
              {filteredUsers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-12 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}
                >
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </motion.div>
              ) : (
                filteredUsers.map((u) => {
                  const isOnline = onlineUsers?.includes(u.email)
                  const unread = unreadCounts?.[u.email] || 0

                  return (
                    <motion.div
                      key={u.id}
                      variants={itemVariants}
                      onMouseEnter={() => setHoveredUser(u.id)}
                      onMouseLeave={() => setHoveredUser(null)}
                      onClick={() => openConversation(u)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl cursor-pointer
                        group transition-all duration-200
                        ${darkMode
                          ? 'hover:bg-surface-800'
                          : 'hover:bg-surface-50 border border-transparent hover:border-surface-200'
                        }
                        ${hoveredUser === u.id ? (darkMode ? 'bg-surface-800' : 'bg-surface-50') : ''}
                      `}
                    >
                      {/* User Avatar */}
                      <div className="relative">
                        {u.profile_picture ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${u.profile_picture}`}
                            alt={u.username}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-surface-800 shadow-sm"
                          />
                        ) : (
                          <div className={`
                            w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white shadow-sm
                            ${isOnline
                              ? 'bg-gradient-to-br from-success-500 to-success-400'
                              : 'bg-gradient-to-br from-primary-500 to-secondary-400'
                            }
                          `}>
                            {u.username?.charAt(0)?.toUpperCase()}
                          </div>
                        )}

                        {/* Online Indicator */}
                        <div className={`
                          absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-surface-900
                          ${isOnline ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-600'}
                        `} />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                            {u.username}
                          </h4>
                          {unread > 0 && (
                            <span className="min-w-[22px] h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                          {isOnline ? (
                            <span className="text-success-500 font-medium">Online</span>
                          ) : (
                            u.email
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              className="space-y-1"
            >
              {/* Create Group Button */}
              <motion.button
                variants={itemVariants}
                onClick={() => setShowGroupModal(true)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl
                  ${darkMode
                    ? 'bg-surface-800 hover:bg-surface-700'
                    : 'bg-gradient-to-r from-secondary-50 to-primary-50 border border-secondary-200 hover:border-secondary-300 hover:shadow-md'
                  }
                  transition-all duration-200 group
                `}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-400 flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                    Create New Group
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-surface-400' : 'text-secondary-600'}`}>
                    Start a group conversation
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${darkMode ? 'text-surface-500' : 'text-secondary-500'}`} />
              </motion.button>

              {/* Groups List */}
              {filteredGroups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 ${darkMode ? 'text-surface-500' : 'text-surface-400'}`}
                >
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No groups yet</p>
                  <p className="text-xs mt-1">Create one to start chatting</p>
                </motion.div>
              ) : (
                filteredGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    variants={itemVariants}
                    onClick={() => openGroup(group)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl cursor-pointer
                      group transition-all duration-200
                      ${darkMode
                        ? 'hover:bg-surface-800'
                        : 'hover:bg-surface-50 border border-transparent hover:border-surface-200'
                      }
                    `}
                  >
                    {/* Group Avatar */}
                    {group.group_image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${group.group_image}`}
                        alt={group.name}
                        className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-surface-800"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-surface-900'}`}>
                        {group.name}
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-surface-400' : 'text-surface-500'}`}>
                        {group.participants?.length || 0} members
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${darkMode ? 'text-surface-600' : 'text-surface-300'}`} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`p-4 border-t ${darkMode ? 'border-surface-700 bg-surface-800/50' : 'border-surface-200 bg-surface-50/50'}`}
      >
        <div className="flex gap-2">
          {/* Theme Toggle */}
          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
              transition-all duration-200
              ${darkMode
                ? 'bg-primary-600/20 text-primary-400 hover:bg-primary-600/30'
                : 'bg-surface-200 text-surface-600 hover:bg-surface-300'
              }
            `}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </>
            )}
          </motion.button>

          {/* Create Group */}
          <motion.button
            onClick={() => setShowGroupModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-secondary-500 to-secondary-400 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Group</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Sidebar
