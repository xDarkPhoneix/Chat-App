import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiEye, FiX } from 'react-icons/fi';
import { ChatState } from '../Contexts/ChatContext';
import UserBadgeItem from './UserBadgeItem';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserListItem from './UserListItems';

function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
    const [isOpen, setIsOpen] = useState(false);
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    
    const { user, selectedChat, setSelectedChat, END_POINT } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResult([]);
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.data.user}` } };
            const { data } = await axios.get(`${END_POINT}/users/getallUser?search=${query}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast.error("Failed to Load the Search Results");
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.data.user}` } };
            const { data } = await axios.put(`${END_POINT}/chats/renamegroup`, {
                chatId: selectedChat._id,
                chatName: groupChatName,
            }, config);
            
            setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
            setGroupChatName("");
            toast.success("Group name updated");
        } catch (error) {
            toast.error("Error updating group name");
            setRenameLoading(false);
        }
    };

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast.error("User Already in group");
            return;
        }

        if (selectedChat.groupAdmin._id !== user.data.loggedInUser._id) {
            toast.error("Only admins can add someone!");
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.data.user}` } };
            const { data } = await axios.put(`${END_POINT}/chats/addToGroup`, {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);

            setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
            toast.success("User added successfully");
        } catch (error) {
            toast.error("Error occurred!");
            setLoading(false);
        }
    };

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user.data.loggedInUser._id && user1._id !== user.data.loggedInUser._id) {
            toast.error("Only admins can remove someone!");
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.data.user}` } };
            const { data } = await axios.put(`${END_POINT}/chats/removeFromGroup`, {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);
            
            user1._id === user.data.loggedInUser._id ? setSelectedChat() : setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
            toast.success("User removed successfully");
        } catch (error) {
            toast.error("Error occurred!");
            setLoading(false);
        }
    };

    return (
      <>
        <button 
           className="p-2 hover:bg-dark-700/80 rounded-full text-gray-300 hover:text-white transition-colors border border-white/5" 
           onClick={() => setIsOpen(true)}
         >
           <FiEye size={20} />
         </button>
  
        {isOpen && createPortal(
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
               
               <div className="relative glass-panel bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in z-[110] flex flex-col">
                 <button 
                   onClick={() => setIsOpen(false)} 
                   className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700 transition-colors"
                 >
                    <FiX size={24} />
                 </button>
                 
                 <h2 className="text-2xl font-bold font-sans text-center mb-6 text-white pt-2">
                   {selectedChat.chatName}
                 </h2>
                 
                 <div className="flex flex-col space-y-4">
                     <div className="flex flex-wrap w-full">
                       {selectedChat.users.map((u) => (
                         <UserBadgeItem
                           key={u._id}
                           user={u}
                           admin={selectedChat.groupAdmin}
                           handleFunction={() => handleRemove(u)}
                         />
                       ))}
                     </div>
                     
                     <div className="flex gap-2 w-full">
                       <input
                         placeholder="Chat Name"
                         value={groupChatName}
                         onChange={(e) => setGroupChatName(e.target.value)}
                         className="flex-1 bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                       />
                       <button
                         onClick={handleRename}
                         disabled={renameloading}
                         className={`bg-primary-600 hover:bg-primary-500 px-4 py-2.5 rounded-xl text-white font-medium transition-colors border border-white/5 whitespace-nowrap text-sm shadow-md shadow-primary-500/20 ${renameloading ? "opacity-70 cursor-not-allowed" : ""}`}
                       >
                         {renameloading ? "Updating..." : "Update"}
                       </button>
                     </div>
                     
                     <input
                       placeholder="Add Users to Group"
                       onChange={(e) => handleSearch(e.target.value)}
                       className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm mt-2"
                     />
                     
                     <div className="flex flex-col w-full max-h-40 overflow-y-auto custom-scrollbar">
                         {loading ? (
                           <div className="p-4 text-center text-primary-500 text-sm font-medium flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 mr-2 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                           </div>
                         ) : (
                           searchResult?.map((userResult) => (
                             <UserListItem
                               key={userResult._id}
                               user={userResult}
                               handleFunction={() => handleAddUser(userResult)}
                             />
                           ))
                         )}
                     </div>
                 </div>
                 
                 <div className="flex justify-end mt-4 pt-4 border-t border-white/5 break-words">
                   <button 
                     onClick={() => handleRemove(user.data.loggedInUser)} 
                     className="bg-red-500/90 hover:bg-red-500 px-5 py-2.5 rounded-xl text-white font-semibold transition-colors shadow-md shadow-red-500/20"
                     >
                     Leave Group
                   </button>
                 </div>
               </div>
             </div>,
             document.body
        )}
      </>
    )
}

export default UpdateGroupChatModal;