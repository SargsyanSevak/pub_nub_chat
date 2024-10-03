import Image from 'next/image'
import { roboto } from '@/app/fonts'
import styles from './styles.module.scss'

export default function RoomSelector ({
  roomSelectorVisible,
  setRoomSelectorVisible
}) {
  return (
      <div
          className={`${!roomSelectorVisible ? styles.hidden : ''} ${styles.roomSelector}`}
      >
        <div
            className={`${roboto.className} ${styles.rooms}`}
        >
          Rooms
          <div
              className={styles.roomsVisible}
              onClick={e => setRoomSelectorVisible(false)}
          >
            <Image
                src='/icons/close-rooms.svg'
                alt='Close Rooms'
                className={styles.image}
                width={36}
                height={36}
                priority
            />
          </div>
        </div>

        <div
            className={`${roboto.className} ${styles.changeRoom}`}
        >
          Change room
        </div>

        <div className={styles.information}>
          <div className={styles.informationContent}>
            <div className={styles.images}>
              <Image
                  src='/pn-logo-red-tint.png'
                  alt='PubNub Logo'
                  className={styles.logo}
                  width={23.81}
                  height={17.07}
                  priority
              />
            </div>
            PubNub
          </div>
          <div className={styles.selectedBlock}>
            <Image
                src='/icons/check.svg'
                alt='Selected'
                className={styles.image}
                width={48}
                height={48}
                priority
            />
          </div>
        </div>
      </div>
  )
}
