import styles from "./styles.module.scss";

export default function MentionSuggestions({
  suggestedUsers,
  suggestedChannels,
  pickSuggestedUser,
  pickSuggestedChannel,
}) {
  return (
    <div className={styles.wrapper}>
      {suggestedUsers?.map((user, index) => {
        return (
          <div
            key={index}
            className={styles.name}
            onClick={() => {
              pickSuggestedUser(user);
            }}
          >
            {user?.name}
          </div>
        );
      })}
      {suggestedChannels?.map((channel, index) => {
        return (
          <div
            key={index}
            className={styles.channel_name}
            onClick={() => {
              pickSuggestedChannel(channel);
            }}
          >
            {channel?.name}
          </div>
        );
      })}
    </div>
  );
}
