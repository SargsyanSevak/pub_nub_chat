import Image from 'next/image'
import styles from './styles.module.scss'

export default function NewMessageUserPill ({
  user,
  removePillAction,
  isMe = false
}) {
  return (
      <div className={styles.wrapper}>
        <div className=''>{user.name}</div>
        {!isMe && (
            <div
                className={styles.content}
                onClick={() => removePillAction(user.id)}
            >
              <Image
                  src='/icons/close.svg'
                  alt='Remove'
                  className='ml-2'
                  width={24}
                  height={24}
                  priority
              />
            </div>
        )}
      </div>
  )
}
