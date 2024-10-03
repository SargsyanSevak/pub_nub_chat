import styles from './styles.module.scss';
export default function UnreadIndicator ({ count }) {
  return (
    count != null &&
    count != '' && (
      <div className={styles.wrapper}>
        {count}
      </div>
    )
  )
}
