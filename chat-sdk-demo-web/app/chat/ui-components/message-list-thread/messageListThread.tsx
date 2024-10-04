import Message from "../messages/message";
import { roboto } from "@/app/fonts";
import Image from "next/image";
import MessageInput from "../message-input/messageInput";
import { useState, useEffect, useRef } from "react";
import styles from "./styles.module.scss";

import { Message as pnMessage } from "@pubnub/chat";
import classNames from "classnames";

export default function MessageListThread({
  showThread,
  setShowThread,
  activeThreadChannel,
  activeThreadMessage,
  currentUser,
  groupUsers,
  setChatSelectionMenuMinimized,
}) {
  const [messages, setMessages] = useState<pnMessage[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);

  function uniqueById(items) {
    const set = new Set();
    return items.filter((item) => {
      const isDuplicate = set.has(item.timetoken);
      set.add(item.timetoken);
      return !isDuplicate;
    });
  }

  useEffect(() => {
    //  UseEffect to handle initial configuration of the thread, including loading historical messages
    if (!activeThreadMessage) return;
    if (!activeThreadChannel) return;
    async function initThreadMessages() {
      setMessages([]);
      activeThreadChannel
        .getHistory({ count: 20 })
        .then((historicalMessagesObj) => {
          setMessages((messages) => {
            return uniqueById([...historicalMessagesObj.messages]);
          });
        });
    }
    initThreadMessages();
  }, [activeThreadChannel, activeThreadMessage]);

  useEffect(() => {
    //  UseEffect to receive new messages sent to the thread
    if (!activeThreadMessage) return;
    if (!activeThreadChannel) return;
    return activeThreadChannel.connect((message) => {
      setMessages((messages) => {
        return uniqueById([...messages, message]);
      });
    });
  }, [activeThreadChannel, activeThreadMessage]);

  useEffect(() => {
    if (!messageListRef.current) return;
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current?.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ position: "relative" }}>
      <div className={classNames(styles.block, !showThread && styles.hidden)}>
        <div id="threads-header" className={styles.threads_header}>
          <div className={styles.replyInThread}>
            Reply in thread
            <div
              className={styles.showThread}
              onClick={(e) => {
                setShowThread(false);
                setChatSelectionMenuMinimized(false);
              }}
            >
              <Image
                src="/icons/close.svg"
                alt="Close Thread"
                className=""
                width={24}
                height={24}
                priority
              />
            </div>
          </div>
        </div>
        <div className={styles.list} ref={messageListRef}>
          {/* ORIGINAL MESSAGE */}
          {activeThreadMessage && (
            <Message
              key={activeThreadMessage.timetoken}
              received={currentUser.id !== activeThreadMessage.userId}
              inThread={true}
              avatarUrl={
                activeThreadMessage.userId === currentUser.id
                  ? currentUser.profileUrl
                  : groupUsers?.find(
                      (user) => user.id === activeThreadMessage.userId
                    )?.profileUrl
              }
              readReceipts={null}
              showReadIndicator={false}
              sender={
                activeThreadMessage.userId === activeThreadMessage.id
                  ? currentUser.name
                  : groupUsers?.find(
                      (user) => user.id === activeThreadMessage.userId
                    )?.name
              }
              pinned={false} //  Chat SDK supports pinning messages in threads, but this demo does not
              messageActionHandler={() => {}}
              message={activeThreadMessage}
              currentUserId={currentUser.id}
            />
          )}
          {/* THREAD BUBBLES */}
          {messages.map((message, index) => {
            return (
              <Message
                key={message.timetoken}
                received={currentUser.id !== message.userId}
                inThread={true}
                avatarUrl={
                  message.userId === currentUser.id
                    ? currentUser.profileUrl
                    : groupUsers?.find((user) => user.id === message.userId)
                        ?.profileUrl
                }
                readReceipts={null}
                showReadIndicator={false}
                sender={
                  message.userId === currentUser.id
                    ? currentUser.name
                    : groupUsers?.find((user) => user.id === message.userId)
                        ?.name
                }
                pinned={false}
                messageActionHandler={() => {}}
                message={message}
                currentUserId={currentUser.id}
              />
            );
          })}
        </div>

        <div className={styles.msg_input}>
          <MessageInput
            activeChannel={activeThreadChannel}
            replyInThread={true}
            quotedMessage={null}
            quotedMessageSender={""}
            creatingNewMessage={false}
          />
        </div>
      </div>
    </div>
  );
}
