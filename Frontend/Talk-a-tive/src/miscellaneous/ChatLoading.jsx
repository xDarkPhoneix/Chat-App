import React from 'react';

function ChatLoading() {
    return (
      <div className="flex flex-col space-y-3 w-full p-2">
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
        <div className="h-11 bg-dark-700/50 backdrop-blur-sm rounded-xl animate-pulse w-full"></div>
      </div>
    )
}

export default ChatLoading;