import Image from "next/image";
import ToolTip from "../tooltip/toolTip";
import { useState } from "react";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function MessageActions({
  received,
  actionsShown,
  timetoken,
  isPinned,
  messageActionsEnter,
  messageActionsLeave,
  replyInThreadClick,
  quoteMessageClick,
  pinMessageClick,
  copyMessageClick,
  showEmojiPickerClick,
}) {
  const [emoteToolTip, setEmoteToolTip] = useState(false);
  const [quoteToolTip, setQuoteToolTip] = useState(false);
  const [pinToolTip, setPinToolTip] = useState(false);
  const [replyToolTip, setReplyToolTip] = useState(false);
  const [copyToolTip, setCopyToolTip] = useState(false);

  function copyClick(e) {
    copyMessageClick();
  }
  function copyEnter() {
    setCopyToolTip(true);
  }
  function copyLeave() {
    setCopyToolTip(false);
  }

  function replyClick(e) {
    replyInThreadClick();
  }

  function replyEnter() {
    setReplyToolTip(true);
  }

  function replyLeave() {
    setReplyToolTip(false);
  }

  function pinClick(e) {
    pinMessageClick();
  }

  function pinEnter() {
    setPinToolTip(true);
  }

  function pinLeave() {
    setPinToolTip(false);
  }

  function quoteClick(e) {
    quoteMessageClick();
  }

  function quoteEnter() {
    setQuoteToolTip(true);
  }

  function quoteLeave() {
    setQuoteToolTip(false);
  }

  function emoteClick(e) {
    showEmojiPickerClick({
      isShown: true,
      mouseX: e.clientX,
      mouseY: e.clientY,
      messageTimetoken: timetoken,
    });
  }

  function emoteEnter() {
    setEmoteToolTip(true);
  }

  function emoteLeave() {
    setEmoteToolTip(false);
  }

  const handleMessageActionsMouseEnter = (e) => {
    messageActionsEnter();
  };
  const handleMessageActionsMouseLeave = (e) => {
    messageActionsLeave();
  };

  return (
    <div className={classNames(!received && styles.not_received)}>
      <div
        className={classNames(
          styles.block,
          received && styles.received,
          !actionsShown && styles.hidden
        )}
        onMouseEnter={handleMessageActionsMouseEnter}
        onMouseLeave={handleMessageActionsMouseLeave}
      >
        <div
          className={styles.copy}
          onClick={(e) => copyClick(e)}
          onMouseEnter={(e) => copyEnter()}
          onMouseLeave={(e) => copyLeave()}
        >
          <Image
            src="/icons/copy.svg"
            alt="Copy"
            style={{ margin: "12px" }}
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={classNames(copyToolTip ? styles.visible : styles.hidden)}
            tip="Copy to clipboard"
          />
        </div>
        <div
          className={styles.copy}
          onClick={(e) => replyClick(e)}
          onMouseEnter={(e) => replyEnter()}
          onMouseLeave={(e) => replyLeave()}
        >
          <Image
            src="/icons/reply.svg"
            alt="Reply"
            style={{ margin: "12px" }}
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={classNames(
              replyToolTip ? styles.visible : styles.hidden
            )}
            tip="Reply in thread"
          />
        </div>
        <div
          className={styles.copy}
          onClick={(e) => pinClick(e)}
          onMouseEnter={() => pinEnter()}
          onMouseLeave={() => pinLeave()}
        >
          <Image
            src="/icons/pin.svg"
            alt="Pin"
            style={{ margin: "12px" }}
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={classNames(pinToolTip ? styles.visible : styles.hidden)}
            tip={`${isPinned ? "Unpin message" : "Pin message"}`}
          />
        </div>
        <div
          className={styles.copy}
          onClick={(e) => quoteClick(e)}
          onMouseEnter={() => quoteEnter()}
          onMouseLeave={() => quoteLeave()}
        >
          <Image
            src="/icons/quote.svg"
            alt="Quote"
            style={{ margin: "12px" }}
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={classNames(
              quoteToolTip ? styles.visible : styles.hidden
            )}
            tip="Quote message"
          />
        </div>
        <div
          className={styles.copy}
          onClick={(e) => emoteClick(e)}
          onMouseEnter={() => emoteEnter()}
          onMouseLeave={() => emoteLeave()}
        >
          <Image
            src="/icons/smile.svg"
            alt="Smile"
            style={{ margin: "12px" }}
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={classNames(
              emoteToolTip ? styles.visible_and_bottom : styles.hidden
            )}
            tip="React to message"
          />
        </div>
      </div>
    </div>
  );
}
