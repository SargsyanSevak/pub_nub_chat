import Avatar from '../avatar/avatar'
import {roboto} from '@/app/fonts'
import styles from './styles.module.scss'


export default function NewMessageUserRow({user, present, clickAction}) {
    return (
        <div
            className={styles.wrapper}
            onClick={() => clickAction(user)}
        >
            <Avatar
                present={present}
                avatarUrl={
                    user.profileUrl ? user.profileUrl : '/avatars/placeholder.png'
                }
            />
            <div className=''>{user.name}</div>
        </div>
    )
}
