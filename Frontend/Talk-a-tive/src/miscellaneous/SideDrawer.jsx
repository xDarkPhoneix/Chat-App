import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiBell, FiChevronDown, FiX } from "react-icons/fi";
import { ChatState } from '../Contexts/ChatContext';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItems';
import { getsender } from '../config/Chatlogic';

function SideDrawer() {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [bellMenuOpen, setBellMenuOpen] = useState(false);
    const { user, selectedChat, setSelectedChat, chats, setChats, notifications, setNotifications, END_POINT } = ChatState();
    
    // Add refs for click outside handling
    const menuRef = useRef(null);
    const bellRef = useRef(null);

    const navigate = useNavigate();

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setBellMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlesearch = async () => {
        if (!search) {
            toast.error("Please enter something in search");
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.data.user}` } };
            const { data } = await axios.get(`${END_POINT}/users/getallUser?search=${search}`, config, { withCredentials: true });
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast.error("Failed to Load the Search Results");
            setLoading(false);
        }
    }
    
    const acsessChat = async (lol) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.data.user}` }
            };
            const { data } = await axios.post(`${END_POINT}/chats/acessChat`, { userId: lol }, config);
            
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
             
            setSelectedChat(data);
            setLoadingChat(false);
            setIsOpen(false); // Close drawer
        } catch (error) {
            toast.error("Error Occurred While fetching chat!");
            setLoadingChat(false);
        }
    }

    const logouthanler = async () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    }

    return (
      <>
      {/* Top Navbar Area */}
      <div className='flex justify-between items-center w-full px-5 py-3 glass z-20 sticky top-0 rounded-b-xl border-t-0'>
          
        <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 group hover:bg-dark-700/50 px-3 py-2 rounded-xl transition-all"
        >
            <FiSearch className="text-gray-300 group-hover:text-primary-400 transition-colors" />
            <span className='hidden md:flex text-gray-300 font-medium group-hover:text-primary-400'>
                Search User
            </span>
        </button>

        <h1 className='text-xl md:text-2xl font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500'>
          Talk-A-Tive
        </h1>

        <div className="flex items-center gap-4">
            
            {/* Notifications Menu */}
            <div className="relative" ref={bellRef}>
                <button 
                    onClick={() => setBellMenuOpen(!bellMenuOpen)}
                    className="relative p-2 text-gray-300 hover:text-white hover:bg-dark-700/50 rounded-full transition-all"
                >
                    <FiBell size={22} />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-dark-900">
                            {notifications.length}
                        </span>
                    )}
                </button>
                
                {bellMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="py-2">
                            {!notifications.length && (
                                <p className="px-4 py-3 text-gray-400 text-sm text-center">No New Messages</p>
                            )}
                            {notifications.map((notif) => (
                                <div key={notif._id}
                                    className="px-4 py-3 hover:bg-dark-700 cursor-pointer text-sm text-gray-200 border-b border-white/5 last:border-0 transition-colors"
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotifications(notifications.filter((n) => n !== notif));
                                        setBellMenuOpen(false);
                                    }}
                                >
                                    {notif.chat.isGroupchat ? `New Message In ${notif.chat.ChatName}` : `New Message from ${getsender(user.data.loggedInUser, notif.chat.users)}`}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-white/10 px-3 py-1.5 rounded-full transition-all"
                >
                    <img 
                        src={user?.data?.loggedInUser?.pic || "https://ui-avatars.com/api/?name=User&background=252525&color=fff"} 
                        alt="avatar" 
                        className="w-7 h-7 rounded-full object-cover" 
                    />
                    <FiChevronDown className="text-gray-400" />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="py-1">
                            <ProfileModal user={user}>
                                <div className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-dark-700 hover:text-white cursor-pointer transition-colors">
                                    My Profile
                                </div>
                            </ProfileModal>
                            <div className="border-t border-white/10 my-1"></div>
                            <button 
                                onClick={logouthanler}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
      </div>
  
      {/* Search Drawer Overlay */}
      {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Search Drawer Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full md:w-80 glass-panel border-l-0 border-y-0 border-r border-white/10 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <h2 className="text-lg font-semibold text-white">Search Users</h2>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700/50 transition-colors">
                      <FiX size={20} />
                  </button>
              </div>

              <div className="flex gap-2 mb-4">
                  <input
                      type="text"
                      placeholder="Search by name or email"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-dark-900/60 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                  <button onClick={handlesearch} className="bg-primary-600 hover:bg-primary-500 text-white px-4 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20">
                      Go
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {loading ? (
                      <div className="flex justify-center p-4">
                          <ChatLoading />
                      </div>
                  ) : (
                      searchResult?.map((u) => (
                          <UserListItem
                              key={u._id}
                              user={u}
                              handleFunction={() => acsessChat(u._id)}
                          />
                      ))
                  )}
                  {loadingChat && (
                      <div className="flex justify-center p-4">
                          <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      </div>
                  )}
              </div>
          </div>
      </div>
      </>
    )
}

export default SideDrawer;