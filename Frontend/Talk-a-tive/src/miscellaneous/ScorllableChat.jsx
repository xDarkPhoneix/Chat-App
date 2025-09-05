import { Avatar, Stack, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/Chatlogic';
import { ChatState } from '../Contexts/ChatContext';
import ScrollableFeed from 'react-scrollable-feed';


function  ScorllableChat ({messages}) {
    const { user } = ChatState();
    return (
      <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user.data.loggedInUser._id) ||
              isLastMessage(messages, i, user.data.loggedInUser._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user.data.loggedInUser._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i,user.data.loggedInUser._id),
                marginTop: isSameUser(messages, m, i, user.data.loggedInUser._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      
     


      </ScrollableFeed>
    )
}

export default ScorllableChat;