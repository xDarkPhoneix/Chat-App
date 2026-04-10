import React from 'react';
import { FiX } from 'react-icons/fi';

function UserBadgeItem({ user, handleFunction, admin }) {
    return (
        <span
          onClick={handleFunction}
          className="inline-flex items-center px-2 py-1 rounded-lg m-1 mb-2 text-xs font-semibold bg-accent-500/20 text-accent-400 border border-accent-500/30 cursor-pointer hover:bg-accent-500 hover:text-white transition-colors"
        >
          {user.name}
          {admin?._id === user._id && <span className="ml-1 opacity-75">(Admin)</span>}
          <FiX className="ml-1 opacity-75" />
        </span>
    );
}

export default UserBadgeItem;