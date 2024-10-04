import Image from "next/image";
import styles from "./styles.module.scss";

export default function PinnedMessagePill({}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.text}>Pinned message</div>
      <Image
        src="/icons/pin.svg"
        alt="Remove"
        style={{ paddingLeft: "4px" }}
        width={12}
        height={12}
        priority
      />
    </div>
  );
}
