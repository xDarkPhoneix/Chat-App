import React from 'react';

function UserListItem({ user, handleFunction }) {
    return (
      <div
        onClick={handleFunction}
        className="flex items-center cursor-pointer bg-dark-800/80 hover:bg-primary-600 w-full text-gray-200 hover:text-white px-3 py-2 mb-2 rounded-xl border border-white/5 hover:border-primary-500 transition-all duration-200 shadow-sm"
      >
        <img
          src={user.pic || "https://ui-avatars.com/api/?name=User&background=252525&color=fff"}
          alt={user.name}
          className="w-10 h-10 rounded-full mr-3 object-cover border border-white/10"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-gray-400 group-hover:text-gray-200">
            <span className="font-medium mr-1">Email :</span>
            {user.email}
          </p>
        </div>
      </div>
    )
}

export default UserListItem;