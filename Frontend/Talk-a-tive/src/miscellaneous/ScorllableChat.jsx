import React from 'react';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/Chatlogic';
import { ChatState } from '../Contexts/ChatContext';
import ScrollableFeed from 'react-scrollable-feed';

function ScorllableChat({ messages }) {
    const { user } = ChatState();
    return (
      <ScrollableFeed className="pr-2">
      {messages &&
        messages.map((m, i) => {
          const isSender = m.sender._id === user?.data?.loggedInUser?._id;
          return (
          <div className="flex w-full group relative" key={m._id} style={{
              justifyContent: isSender ? 'flex-end' : 'flex-start',
              marginTop: isSameUser(messages, m, i, user?.data?.loggedInUser?._id) ? 3 : 15
          }}>
            {(!isSender && (isSameSender(messages, m, i, user?.data?.loggedInUser?._id) ||
              isLastMessage(messages, i, user?.data?.loggedInUser?._id))) ? (
              <div className="relative group mr-2">
                <img
                  className="w-8 h-8 rounded-full mt-2 object-cover border border-white/10"
                  src={m.sender.pic || "https://ui-avatars.com/api/?name=User&background=252525&color=fff"}
                  alt={m.sender.name}
                />
                <span className="absolute bottom-10 left-0 bg-dark-900 border border-white/20 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-lg">
                  {m.sender.name}
                </span>
              </div>
            ) : null}
            
            <span
              className={`px-4 py-2 rounded-2xl max-w-[75%] break-words shadow-md text-[15px] ${
                  isSender 
                  ? "bg-primary-600 text-white rounded-tr-sm" 
                  : "bg-dark-700/80 text-gray-100 rounded-tl-sm border border-white/5"
              }`}
              style={{
                marginLeft: !isSender ? isSameSenderMargin(messages, m, i, user?.data?.loggedInUser?._id) : 0,
              }}
            >
              {m.content}
            </span>
          </div>
        )})}
      </ScrollableFeed>
    )
}

export default ScorllableChat;