import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChatState } from '../Contexts/ChatContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import UserListItem from './UserListItems';
import UserBadgeItem from './UserBadgeItem';

function GroupChatModal({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const { user, chats, setChats, END_POINT } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
          setSearchResult([]);
          return;
        }

        try {
          setLoading(true);
          const config = { headers: { Authorization: `Bearer ${user.data.user}` } };
          const { data } = await axios.get(`${END_POINT}/users/getallUser?search=${query}`, config, { withCredentials: true });
          setLoading(false);
          setSearchResult(data);
        } 
        catch (error) {
          toast.error("Failed to Load the Search Results");
          setLoading(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length === 0) {
            toast.error("Please fill all the fields and add users");
            return;
        }

        try {
            const config = {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.data.user}` },
            };

            const { data } = await axios.post(`${END_POINT}/chats/createGroupChat`, {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            }, config)
            
            setChats([data.data, ...chats]);
            setIsOpen(false);
            setGroupChatName("");
            setSelectedUsers([]);
            setSearchResult([]);
            setSearch("");
            toast.success("New Group Chat Created!");
        } catch (error) {
            toast.error("Failed to Create the Chat!");
        }
    };
    
    const handleGroup = (userToAdd) => {
        if (selectedUsers.some(u => u._id === userToAdd._id)) {
            toast.error("User already added");
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (deluser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== deluser._id));
    };
    
    return (
        <>
        <span onClick={() => setIsOpen(true)} className="cursor-pointer block">{children}</span>

        {isOpen && createPortal(
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
               
               <div className="relative glass-panel bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in z-[110] flex flex-col">
                 <button 
                   onClick={() => setIsOpen(false)} 
                   className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700 transition-colors"
                 >
                    <FiX size={24} />
                 </button>
                 
                 <h2 className="text-2xl font-bold font-sans text-center mb-6 text-white pt-2">
                   Create Group Chat
                 </h2>
                 
                 <div className="flex flex-col space-y-4">
                   <input
                     placeholder="Chat Name"
                     value={groupChatName}
                     onChange={(e) => setGroupChatName(e.target.value)}
                     className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                   />
                   
                   <input
                     placeholder="Add Users eg: John, Piyush, Jane"
                     value={search}
                     onChange={(e) => handleSearch(e.target.value)}
                     className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                   />
                   
                   <div className="flex flex-wrap w-full">
                     {selectedUsers.map((u) => (
                       <UserBadgeItem
                         key={u._id}
                         user={u}
                         handleFunction={() => handleDelete(u)}
                       />
                     ))}
                   </div>
                   
                   <div className="flex flex-col w-full max-h-40 overflow-y-auto custom-scrollbar">
                       {loading ? (
                         <div className="p-4 text-center text-primary-500 text-sm font-medium animate-pulse">Loading...</div>
                       ) : (
                         searchResult?.slice(0, 4).map((userResult) => (
                           <UserListItem
                             key={userResult._id}
                             user={userResult}
                             handleFunction={() => handleGroup(userResult)}
                           />
                         ))
                       )}
                   </div>
                 </div>
                 
                 <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                   <button 
                     className="bg-primary-600 hover:bg-primary-500 px-5 py-2.5 rounded-xl text-white font-semibold transition-colors shadow-lg shadow-primary-500/20" 
                     onClick={handleSubmit}
                   >
                     Create Chat
                   </button>
                 </div>
               </div>
             </div>,
             document.body
        )}
      </>
    )
}

export default GroupChatModal;