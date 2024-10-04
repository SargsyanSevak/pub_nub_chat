import styles from "./styles.module.scss";

export default function MessageReaction({
  emoji,
  count,
  messageTimetoken,
  reactionClicked,
}) {
  return (
    emoji != "" &&
    count > 0 && (
      <div
        className={styles.block}
        onClick={() => reactionClicked(emoji, messageTimetoken)}
      >
        <div style={{ display: "flex", fontSize: "12px" }}>{emoji}</div>
        {count > 1 && (
          <div style={{ display: "flex", fontSize: "14px" }}>{count}</div>
        )}
      </div>
    )
  );
}
