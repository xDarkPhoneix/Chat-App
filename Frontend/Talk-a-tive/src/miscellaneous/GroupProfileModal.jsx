import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiEye, FiX } from 'react-icons/fi';

function GroupProfileModal({ user, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
       {children ? (
        <span onClick={() => setIsOpen(true)} className="cursor-pointer block">{children}</span>
      ) : (
        <button 
          className="p-2 hover:bg-dark-700 rounded-full text-gray-300 hover:text-white transition-colors border border-white/5 flex flex-col items-center justify-center w-full" 
          onClick={() => setIsOpen(true)}
        >
          <FiEye size={20} />
        </button>
      )}
      
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
            
            <div className="flex flex-col items-center justify-center py-6">
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
                {user?.name}
              </h2>
              
              <img 
                className="w-36 h-36 rounded-full object-cover border-4 border-dark-900 shadow-xl mb-8"
                src={user?.pic || "https://ui-avatars.com/api/?name=User&background=252525&color=fff"}
                alt={user?.name} 
              />
              
              <p className="text-xl md:text-2xl text-gray-300 font-medium">
                Email: {user?.email}
              </p>
            </div>
            
            <div className="flex justify-end mt-2 pt-4 border-t border-white/5">
              <button 
                className="bg-dark-700/80 hover:bg-dark-600 px-5 py-2.5 rounded-xl text-white font-semibold transition-colors border border-white/10 shadow-sm" 
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      </>
    )
}

export default GroupProfileModal;