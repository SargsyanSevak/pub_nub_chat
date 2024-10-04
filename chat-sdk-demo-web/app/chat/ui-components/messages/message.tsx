import Avatar from "../avatar/avatar";
import Image from "next/image";
import { useState, useCallback } from "react";
import MessageActions from "../message-actions/messageActions";
import PinnedMessagePill from "../pinnedMessagePill";
import QuotedMessage from "../quotedMessage";
import MessageReaction from "../message-reaction/messageReaction";
import { MessageActionsTypes, ToastType } from "@/app/types";
import ToolTip from "../toolTip";
import { TimetokenUtils, MixedTextTypedElement } from "@pubnub/chat";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function Message({
  received,
  inThread = false,
  inPinned = false,
  avatarUrl,
  readReceipts,
  showReadIndicator = true,
  quotedMessageSender = "",
  sender,
  messageActionHandler = (a, b) => {},
  pinned = false,
  unpinMessageHandler = () => {},
  message,
  currentUserId,
  isOnline = -1,
  showUserMessage = (a, b, c, d) => {},
}) {
  const [showToolTip, setShowToolTip] = useState(false);
  const [actionsShown, setActionsShown] = useState(false);
  let messageHovered = false;
  let actionsHovered = false;

  const handleMessageMouseEnter = (e) => {
    messageHovered = true;
    setActionsShown(true);
  };
  const handleMessageMouseLeave = (e) => {
    messageHovered = false;
    setActionsShown(false);
  };

  function testIfActionsHovered() {
    if (messageHovered) return;
    if (!actionsHovered) {
      setActionsShown(false);
    }
  }

  function handleMessageActionsEnter() {
    actionsHovered = true;
    setActionsShown(true);
  }

  function handleMessageActionsLeave() {
    actionsHovered = false;
    if (!messageHovered) {
      setActionsShown(false);
    }
  }

  function copyMessageText(messageText) {
    navigator.clipboard.writeText(messageText);
  }

  function openLink(url) {
    window.open(url, "_blank");
  }

  function userClick(userId, userName) {
    showUserMessage(
      "@Mentioned User Clicked:",
      `You have Clicked on user with ID ${userId} and name ${userName}`,
      "https://www.pubnub.com/docs/chat/chat-sdk/build/features/users/mentions",
      ToastType.INFO
    );
  }

  function channelClick(channelId, channelName) {
    showUserMessage(
      "#Referenced Channel Clicked:",
      `You have Clicked on channel with ID ${channelId} and name ${channelName}`,
      "https://www.pubnub.com/docs/chat/chat-sdk/build/features/channels/references",
      ToastType.INFO
    );
  }

  async function reactionClicked(emoji, timetoken) {
    await message?.toggleReaction(emoji);
  }

  const determineUserReadableDate = useCallback((timetoken) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = TimetokenUtils.timetokenToDate(timetoken);
    const datetime = `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    } ${(date.getHours() + "").padStart(2, "0")}:${(
      date.getMinutes() + ""
    ).padStart(2, "0")}`;

    return datetime;
  }, []);

  //  Originally I was not writing the 'lastTimetoken' for messages I was sending myself, however
  //  that caused the Chat SDK's notion of an unread message count inconsistent, so I am removing
  //  readReceipts I set myself in this useCallback
  const determineReadStatus = useCallback((timetoken, readReceipts) => {
    if (!readReceipts) return false;
    let returnVal = false;
    for (var i = 0; i < Object.keys(readReceipts).length; i++) {
      const receipt = Object.keys(readReceipts)[i];
      const findMe = readReceipts[receipt].indexOf(currentUserId);
      if (findMe > -1) {
        readReceipts[receipt].splice(findMe, 1);
      }
      if (readReceipts[receipt].length > 0 && receipt >= timetoken) {
        return true;
      }
    }
    return false;
  }, []);

  const renderMessagePart = useCallback(
    (messagePart: MixedTextTypedElement, index: number) => {
      if (messagePart?.type === "text") {
        return <span key={index}>{messagePart.content.text}</span>;
      }
      if (messagePart?.type === "plainLink") {
        return (
          <span
            key={index}
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => openLink(`${messagePart.content.link}`)}
          >
            {messagePart.content.link}
          </span>
        );
      }
      if (messagePart?.type === "textLink") {
        return (
          <span
            key={index}
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => openLink(`${messagePart.content.link}`)}
          >
            {messagePart.content.link}
          </span>
        );
      }
      if (messagePart?.type === "mention") {
        return (
          <span
            key={index}
            onClick={() =>
              userClick(
                `${messagePart.content.id}`,
                `${messagePart.content.name}`
              )
            }
            className={styles.mention}
          >
            @{messagePart.content.name}
          </span>
        );
      }

      if (messagePart?.type === "channelReference") {
        return (
          <span
            key={index}
            onClick={() =>
              channelClick(
                `${messagePart.content.id}`,
                `${messagePart.content.name}`
              )
            }
            className={styles.channel_reference}
          >
            #{messagePart.content.name}
          </span>
        );
      }
      return "error";
    },
    []
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={classNames(
          styles.block,
          inThread && styles.inThread,
          !received && !inThread && styles.self_end
        )}
      >
        {received && !inThread && !inPinned && (
          <div style={{ minWidth: "44px" }}>
            {!inThread && (
              <Avatar
                present={isOnline}
                avatarUrl={avatarUrl ? avatarUrl : "/avatars/placeholder.png"}
              />
            )}
          </div>
        )}

        <div className={styles.content}>
          <div
            className={classNames(
              styles.pinned_msg_pill,
              inThread || inPinned || (received && styles.justify_between)
            )}
          >
            {pinned && !received && (
              <div className={styles.msg_pill}>
                <PinnedMessagePill />
              </div>
            )}
            {(inThread || inPinned || received) && (
              <div className={styles.sender}>
                {sender}
                {(inThread || inPinned) && !received && " (you)"}
                {pinned && <PinnedMessagePill />}
              </div>
            )}
            <div className={styles.sender}>
              {determineUserReadableDate(message.timetoken)}
            </div>
          </div>

          <div
            className={classNames(
              styles.pin,
              received && styles.received,
              !received && styles.sent
            )}
            onMouseEnter={handleMessageMouseEnter}
            onMouseMove={handleMessageMouseEnter}
            onMouseLeave={handleMessageMouseLeave}
          >
            {inPinned && (
              <div
                style={{ cursor: "pointer" }}
                onClick={() => unpinMessageHandler()}
                onMouseEnter={() => {
                  setShowToolTip(true);
                }}
                onMouseLeave={() => {
                  setShowToolTip(false);
                }}
              >
                <div className={styles.close_tooltip}>
                  <div style={{ position: "relative" }}>
                    <ToolTip
                      className={classNames(
                        showToolTip ? styles.visible : styles.hidden
                      )}
                      tip="Unpin"
                      messageActionsTip={false}
                    />
                  </div>
                  <Image
                    src="/icons/close.svg"
                    alt="Close"
                    className=""
                    width={20}
                    height={20}
                    priority
                  />
                </div>
              </div>
            )}
            <div className={styles.quoted}>
              {message.quotedMessage && (
                <QuotedMessage
                  originalMessage={message}
                  originalMessageReceived={received}
                  quotedMessage={message.quotedMessage}
                  quotedMessageSender={quotedMessageSender}
                  setQuotedMessage={null}
                  displayedWithMesageInput={false}
                />
              )}
              {/* Will chase with the chat team to see why I need these conditions (get an error about missing 'type' if they are absent) */}
              <div className={styles.text_types}>
                {(message.content.text ||
                  message.content.plainLink ||
                  message.content.textLink ||
                  message.content.mention ||
                  message.content.channelReference) &&
                  message
                    .getMessageElements()
                    .map((msgPart, index) => renderMessagePart(msgPart, index))}
                {message.actions && message.actions.edited && (
                  <span style={{ color: "#4b5563" }}>&nbsp;&nbsp;(edited)</span>
                )}
                {message.files && message.files.length > 0 && (
                  <Image
                    src={`${message.files[0].url}`}
                    alt="PubNub Logo"
                    style={{ position: "absolute", right: "8px", top: "8px" }}
                    width={25}
                    height={25}
                  />
                )}
              </div>
            </div>
            {!received && showReadIndicator && (
              <Image
                src={`${
                  determineReadStatus(message.timetoken, readReceipts)
                    ? "/icons/read.svg"
                    : "/icons/sent.svg"
                }`}
                alt="Read"
                style={{ position: "absolute", right: "10px", bottom: "14px" }}
                width={21}
                height={10}
                priority
              />
            )}
            <div className={styles.reactions}>
              {/*arrayOfEmojiReactions*/}
              {message.reactions
                ? Object?.keys(message.reactions)
                    .slice(0, 18)
                    .map((emoji, index) => (
                      <MessageReaction
                        emoji={emoji}
                        messageTimetoken={message.timetoken}
                        count={message.reactions[emoji].length}
                        reactionClicked={reactionClicked}
                        key={index}
                      />
                    ))
                : ""}
            </div>
            {!inThread && message.hasThread && (
              <div
                className={styles.msg_actions}
                onClick={() => {
                  messageActionHandler(
                    MessageActionsTypes.REPLY_IN_THREAD,
                    message
                  );
                }}
              >
                {/*Whether or not there is a threaded reply*/}
                <div className={styles.replies}>
                  <Image
                    src="/icons/reveal-thread.svg"
                    alt="Expand"
                    className=""
                    width={20}
                    height={20}
                    priority
                  />
                  <div className={styles.replies_txt}>
                    Replies
                  </div>
                </div>
              </div>
            )}
            {/* actions go here for received */}
            {received && !inThread && !inPinned && (
              <MessageActions
                received={received}
                actionsShown={actionsShown}
                timetoken={message.timetoken}
                isPinned={pinned}
                messageActionsEnter={() => handleMessageActionsEnter()}
                messageActionsLeave={() => handleMessageActionsLeave()}
                replyInThreadClick={() =>
                  messageActionHandler(
                    MessageActionsTypes.REPLY_IN_THREAD,
                    message
                  )
                }
                quoteMessageClick={() =>
                  messageActionHandler(MessageActionsTypes.QUOTE, message)
                }
                pinMessageClick={() => {
                  messageActionHandler(MessageActionsTypes.PIN, message);
                }}
                showEmojiPickerClick={(data) => {
                  messageActionHandler(MessageActionsTypes.SHOW_EMOJI, data);
                }}
                copyMessageClick={() => {
                  copyMessageText(message.content.text);
                  messageActionHandler(MessageActionsTypes.COPY, {
                    text: message.content.text,
                  });
                }}
              />
            )}
          </div>
          {/* actions go here for sent */}
          {!received && !inThread && !inPinned && (
            <MessageActions
              received={received}
              actionsShown={actionsShown}
              timetoken={message.timetoken}
              isPinned={pinned}
              messageActionsEnter={() => handleMessageActionsEnter()}
              messageActionsLeave={() => handleMessageActionsLeave()}
              replyInThreadClick={() =>
                messageActionHandler(
                  MessageActionsTypes.REPLY_IN_THREAD,
                  message
                )
              }
              quoteMessageClick={() =>
                messageActionHandler(MessageActionsTypes.QUOTE, message)
              }
              pinMessageClick={() => {
                messageActionHandler(MessageActionsTypes.PIN, message);
              }}
              showEmojiPickerClick={(data) => {
                messageActionHandler(MessageActionsTypes.SHOW_EMOJI, data);
              }}
              copyMessageClick={() => {
                copyMessageText(message.content.text);
                messageActionHandler(MessageActionsTypes.COPY, {
                  text: message.content.text,
                });
              }}
            />
          )}
        </div>
      </div>
      {inPinned && (
        <div ></div>
      )}
    </div>
  );
}
