import { roboto } from "@/app/fonts";
import Avatar from "../avatar/avatar";
import Message from "../messages/message";
import Image from "next/image";
import { PresenceIcon } from "@/app/types";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef } from "react";
import { User, Message as pnMessage, Membership } from "@pubnub/chat";
import classNames from "classnames";

export default function MessageList({
  activeChannel,
  currentUser,
  groupUsers,
  groupMembership,
  messageActionHandler = (action, vars) => {},
  usersHaveChanged,
  updateUnreadMessagesCounts,
  setChatSettingsScreenVisible,
  quotedMessage,
  quotedMessageSender,
  activeChannelPinnedMessage,
  setActiveChannelPinnedMessage,
  setShowThread,
  showUserMessage,
}) {
  const MAX_AVATARS_SHOWN = 9;
  const [messages, setMessages] = useState<pnMessage[]>([]);
  const [currentMembership, setCurrentMembership] = useState<Membership>();
  const [readReceipts, setReadReceipts] = useState();
  const messageListRef = useRef<HTMLDivElement>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  function uniqueById(items) {
    const set = new Set();
    return items.filter((item) => {
      const isDuplicate = set.has(item.timetoken);
      set.add(item.timetoken);
      return !isDuplicate;
    });
  }

  useEffect(() => {
    //  UseEffect to handle initial configuration of the Message List including reading the historical messages
    setLoadingMessage("Fetching History from Server...");
    if (!activeChannel) return;
    async function initMessageList() {
      setMessages([]);
      if (groupMembership == null) {
        console.log("Error: groupMembership should not be null");
      }
      var localCurrentMembership = groupMembership;
      setCurrentMembership(groupMembership);
      activeChannel
        .getHistory({ count: 20 })
        .then(async (historicalMessagesObj) => {
          //  Run through the historical messages and set the most recently received one (that we were not the sender of) as read
          if (historicalMessagesObj.messages) {
            if (historicalMessagesObj.messages.length == 0) {
              setLoadingMessage("No messages in this chat yet");
            } else {
              setMessages((messages) => {
                return uniqueById([...historicalMessagesObj.messages]); //  Avoid race condition where message was being added twice
              });
              for (
                var i = historicalMessagesObj.messages.length - 1;
                i >= 0;
                i--
              ) {
                await localCurrentMembership?.setLastReadMessageTimetoken(
                  historicalMessagesObj.messages[i].timetoken
                );
                updateUnreadMessagesCounts();
                break;
              }
            }
          }
        });
    }
    initMessageList();
  }, [activeChannel]);

  useEffect(() => {
    //  UseEffect to stream Read Receipts
    if (!activeChannel) return;
    if (activeChannel.type == "public") return; //  Read receipts are not supported on public channels

    activeChannel.streamReadReceipts((receipts) => {
      setReadReceipts(receipts);
    });
  }, [activeChannel]);

  useEffect(() => {
    activeChannel?.streamUpdates(async (channelUpdate) => {
      if (channelUpdate.custom) {
        const pinnedMessageTimetoken =
          channelUpdate.custom.pinnedMessageTimetoken;
        if (!pinnedMessageTimetoken) {
          //  Message was unpinned
          setActiveChannelPinnedMessage(null);
        } else {
          channelUpdate.getMessage(pinnedMessageTimetoken).then((message) => {
            setActiveChannelPinnedMessage(message);
          });
        }
      } else {
        setActiveChannelPinnedMessage(null);
      }
    });
  }, [activeChannel]);

  useEffect(() => {
    //  UseEffect to receive new messages sent on the channel
    if (!activeChannel) return;

    return activeChannel.connect((message) => {
      currentMembership?.setLastReadMessageTimetoken(message.timetoken);
      setMessages((messages) => {
        return uniqueById([...messages, message]); //  Avoid race condition where message was being added twice when the channel was launched with historical messages
      });
    });
  }, [activeChannel, currentMembership]);

  useEffect(() => {
    //  UseEffect to receive updates to messages such as reactions.  This does NOT include new messages being received on the channel (which is handled by the connect elsewhere)
    if (!messages || messages.length == 0) return;
    return pnMessage.streamUpdatesOn(messages, setMessages);
  }, [messages]);

  useEffect(() => {
    if (groupUsers && groupUsers.length > 0) {
      return User.streamUpdatesOn(groupUsers, (updatedUsers) => {
        usersHaveChanged();
      });
    }
  }, [groupUsers]);

  useEffect(() => {
    if (!messageListRef.current) return;
    if (
      messageListRef.current.scrollTop != 0 &&
      messageListRef.current.scrollHeight - messageListRef.current.scrollTop >
        1115
    ) {
      return; //  We aren't scrolled to the bottom
    }
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current?.scrollHeight;
      }
    }, 10); //  Some weird timing issue
  }, [messages]);

  if (!activeChannel)
    return (
      <div className={styles.not_active_channel}>
        <div className={styles.logo}>
          <Image
            src="/chat-logo.svg"
            alt="Chat Icon"
            className=""
            width={200}
            height={200}
            priority
          />
        </div>
        <div className={styles.loading}>
          <Image
            src="/icons/loading.png"
            alt="Chat Icon"
            className=""
            width={50}
            height={50}
            priority
          />
        </div>
        <div>Loading...</div>
      </div>
    );

  return (
    <div className={styles.wrapper}>
      <div id="chats-header" className={styles.chat_header}>
        <div className={styles.header_content}>
          {activeChannel.type == "direct" && (
            <div className={styles.direct}>
              <div className={styles.direct_content}>
                {groupUsers?.map((member, index) => (
                  <Avatar
                    key={index}
                    avatarUrl={member.profileUrl}
                    present={
                      member.active ? PresenceIcon.ONLINE : PresenceIcon.OFFLINE
                    }
                  />
                ))}
              </div>
              {groupUsers?.map(
                (member, index) =>
                  `${member.name}${
                    groupUsers.length - 1 != index ? " and " : ""
                  }`
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex" }}>
          {/* Icons on the top right of a chat screen */}
          <div style={{ display: "flex" }}>
            {/* Pin with number of pinned messages */}
            <div className={styles.active_channel_pinned_msg}>
              {activeChannelPinnedMessage ? "1" : "0"}
            </div>
            <div
              className={classNames(
                styles.pinned,
                activeChannelPinnedMessage && styles.active
              )}
              onClick={() => {
                if (!activeChannelPinnedMessage) return;
                if (messageListRef && messageListRef.current) {
                  messageListRef.current.scrollTop = 0;
                }
              }}
            >
              <Image
                src="/icons/pin.svg"
                alt="Pin"
                className=""
                width={24}
                height={24}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* This section hard-codes the bottom of the message list to accommodate the height of the message input Div, whose height will vary depending on whether there is a quoted message displayed or not */}
      <div
        id="chats-bubbles"
        className={classNames(
          styles.chats_bubbles,
          quotedMessage && styles.quoted
        )}
        ref={messageListRef}
      >
        {messages && messages.length == 0 && (
          <div className={styles.chat_logo}>
            <Image
              src="/chat-logo.svg"
              alt="Chat Icon"
              className=""
              width={100}
              height={100}
              priority
            />
            {loadingMessage}
          </div>
        )}
        {/* Show the pinned message first if there is one */}
        {activeChannelPinnedMessage && !activeChannelPinnedMessage.deleted && (
          <Message
            key={activeChannelPinnedMessage.timetoken}
            received={currentUser.id !== activeChannelPinnedMessage.userId}
            avatarUrl={
              activeChannelPinnedMessage.userId === currentUser.id
                ? currentUser.profileUrl
                : groupUsers?.find(
                    (user) => user.id === activeChannelPinnedMessage.userId
                  )?.profileUrl
            }
            isOnline={
              activeChannelPinnedMessage.userId === currentUser.id
                ? currentUser.active
                : groupUsers?.find(
                    (user) => user.id === activeChannelPinnedMessage.userId
                  )?.active
            }
            readReceipts={readReceipts}
            quotedMessageSender={
              activeChannelPinnedMessage.quotedMessage &&
              (activeChannelPinnedMessage.quotedMessage.userId ===
              currentUser.id
                ? currentUser.name
                : groupUsers?.find(
                    (user) =>
                      user.id ===
                      activeChannelPinnedMessage.quotedMessage.userId
                  )?.name)
            }
            showReadIndicator={activeChannel.type !== "public"}
            sender={
              activeChannelPinnedMessage.userId === currentUser.id
                ? currentUser.name
                : groupUsers?.find(
                    (user) => user.id === activeChannelPinnedMessage.userId
                  )?.name
            }
            pinned={true}
            messageActionHandler={(action, vars) =>
              messageActionHandler(action, vars)
            }
            message={activeChannelPinnedMessage}
            currentUserId={currentUser.id}
            showUserMessage={showUserMessage}
          />
        )}

        {messages.map((message, index) => {
          return (
            !message.deleted && (
              <Message
                key={message.timetoken}
                received={currentUser.id !== message.userId}
                avatarUrl={
                  message.userId === currentUser.id
                    ? currentUser.profileUrl
                    : groupUsers?.find((user) => user.id === message.userId)
                        ?.profileUrl
                }
                isOnline={
                  message.userId === currentUser.id
                    ? currentUser.active
                    : groupUsers?.find((user) => user.id === message.userId)
                        ?.active
                }
                readReceipts={readReceipts}
                quotedMessageSender={
                  message.quotedMessage &&
                  (message.quotedMessage.userId === currentUser.id
                    ? currentUser.name
                    : groupUsers?.find(
                        (user) => user.id === message.quotedMessage.userId
                      )?.name)
                }
                showReadIndicator={activeChannel.type !== "public"}
                sender={
                  message.userId === currentUser.id
                    ? currentUser.name
                    : groupUsers?.find((user) => user.id === message.userId)
                        ?.name
                }
                pinned={false}
                messageActionHandler={(action, vars) =>
                  messageActionHandler(action, vars)
                }
                message={message}
                currentUserId={currentUser.id}
                showUserMessage={showUserMessage}
              />
            )
          );
        })}
      </div>
    </div>
  );
}
