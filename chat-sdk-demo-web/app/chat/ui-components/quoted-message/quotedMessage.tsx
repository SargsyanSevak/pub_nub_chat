import Image from "next/image";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function QuotedMessage({
  originalMessage,
  originalMessageReceived = false,
  quotedMessage,
  quotedMessageSender,
  setQuotedMessage,
  displayedWithMesageInput, //  Whether this component is rendered above the input control, or as part of a message
}) {
  return (
    <div
      className={classNames(
        styles.block,
        displayedWithMesageInput && styles.displayedWithMesageInput,
        originalMessage && !originalMessageReceived && styles.originalMessage,
        originalMessage &&
          originalMessageReceived &&
          styles.originalMessageReceived
      )}
    >
      <div className={styles.quotedMessageSender}>
        <div className={styles.text}>{quotedMessageSender}</div>
        <div className={styles.quotedMessage}>{quotedMessage.text}</div>
      </div>
      {displayedWithMesageInput && setQuotedMessage && (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setQuotedMessage(null)}
        >
          <Image
            src="/icons/close.svg"
            alt="Close"
            style={{ margin: "12px" }}
            width={20}
            height={20}
            priority
          />
        </div>
      )}
    </div>
  );
}
