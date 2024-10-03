import Avatar from "../avatar/avatar";
import UnreadIndicator from "../unreadindicator/unreadIndicator";
import { useState } from "react";
import ToolTip from "../toolTip";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function ChatMenuItem({
  avatarUrl,
  text,
  present,
  avatarBubblePrecedent = "",
  count = "",
  markAsRead = false,
  markAsReadAction = (e) => {},
  setActiveChannel = () => {},
}) {
  const [showToolTip, setShowToolTip] = useState(false);

  const handleMouseEnter = (e) => {
    setShowToolTip(true);
  };
  const handleMouseLeave = (e) => {
    setShowToolTip(false);
  };

  return (
    <div
      className={styles.chatMenuItem}
      onClick={() => {
        setActiveChannel();
      }}
    >
      <div className={styles.block}>
        <div className={styles.avatar}>
          <Avatar
            present={present}
            bubblePrecedent={avatarBubblePrecedent}
            avatarUrl={avatarUrl}
          />
          {text}
        </div>
        <div className={styles.idicator}>
          <UnreadIndicator count={count} />
          {markAsRead && (
            <div
              className={classNames(
                styles.markAsRead,
                showToolTip && styles.showToolTip
              )}
              onClick={(e) => markAsReadAction(e)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div style={{ position: "relative" }}>
                <ToolTip
                  className={classNames(
                    styles.toolTip,
                    !showToolTip && styles.hidden
                  )}
                  tip="Read"
                  messageActionsTip={false}
                />
              </div>
              <svg viewBox="0 0 18 14">
                <path d="M5.79508 10.8749L1.62508 6.70492L0.205078 8.11492L5.79508 13.7049L17.7951 1.70492L16.3851 0.294922L5.79508 10.8749Z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
