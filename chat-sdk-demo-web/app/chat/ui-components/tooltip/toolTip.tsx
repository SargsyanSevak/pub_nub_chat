import Image from "next/image";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function ToolTip({ className, tip, messageActionsTip = true }) {
  return (
    <div
      className={classNames(
        styles.block,
        messageActionsTip && styles.message_actions_tip
      )}
    >
      <div
        className={classNames(
          styles.content,
          messageActionsTip && styles.centered
        )}
      >
        <div className={styles.tip}>{tip}</div>
        <Image
          src="/icons/caret.svg"
          alt="Caret"
          className={styles.img}
          width={12}
          height={7}
          priority
        />
      </div>
    </div>
  );
}
