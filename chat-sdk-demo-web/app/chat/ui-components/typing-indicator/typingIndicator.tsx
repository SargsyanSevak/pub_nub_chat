import Avatar from '../avatar/avatar'
import { PresenceIcon } from '@/app/types'
import styles from './styles.module.scss'

export default function TypingIndicator ({ typers, users }) {
  return (
    users &&
    typers && (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.avatar}>
                    {typers.map((typer, index) => (
                        <Avatar
                            key={index}
                            present={
                                users[users.findIndex(user => user.id == typer)]?.active
                                    ? PresenceIcon.ONLINE
                                    : PresenceIcon.OFFLINE
                            }
                            border={true}
                            avatarUrl={
                                users[users.findIndex(user => user.id == typer)]?.profileUrl
                            }
                        />
                    ))}
                </div>
                <div className={styles.user}>
                    {typers.map((typer, index) => (
                        <div className='' key={index}>
                            {users[users.findIndex(user => user.id == typer)]?.name}
                            {index < typers.length - 1 ? ', ' : ''}
                        </div>
                    ))}
                    {typers.length == 0
                        ? ''
                        : typers.length == 1
                            ? ' is typing...'
                            : ' are typing...'}
                </div>
            </div>
        </div>
    )
  )
}
