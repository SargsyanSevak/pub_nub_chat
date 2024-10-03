import Avatar from "../avatar/avatar";
import { PresenceIcon } from "@/app/types";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function ManagedMember({ user, name, lastElement = false }) {
  return (
    <div
      className={classNames(styles.wrapper, !lastElement && styles.bordered)}
    >
      <div className={styles.avatar}>
        <Avatar
          present={user.active ? PresenceIcon.ONLINE : PresenceIcon.OFFLINE}
          avatarUrl={user.profileUrl}
        />
        <div className={styles.name}>{name}</div>
      </div>
    </div>
  );
}
