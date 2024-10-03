import Image from 'next/image'
import { ToastType } from '@/app/types'
import styles from './styles.module.scss';


export default function UserMessage ({
  userMsgShown,
  title = 'Please Note:',
  message,
  href = '',
  type = ToastType.INFO,
  closeToastAction
}) {
  return (
      <div className={`${styles.toast} ${userMsgShown ? styles.visible : styles.hidden} ${styles[type]}`}>
          <div className={styles.info}>
              {type === ToastType.INFO && (
                  <Image
                      src='/icons/toast_info.svg'
                      alt='Info'
                      className=''
                      width={24}
                      height={24}
                      priority
                  />
              )}
              {type === ToastType.CHECK && (
                  <Image
                      src='/icons/toast_check.svg'
                      alt='Check'
                      className=''
                      width={24}
                      height={24}
                      priority
                  />
              )}
              {type === ToastType.ERROR && (
                  <Image
                      src='/icons/toast_error.svg'
                      alt='Error'
                      className=''
                      width={24}
                      height={24}
                      priority
                  />
              )}
          </div>
          <div className={styles.container}>
              <div className={styles.title}>
                  {title || 'Please Note: '}
              </div>
              <div className={styles.message}>
                  {message}
              </div>
              {href != '' && (
                  <div className={styles.learn}>
                      <a href={href} target='_new'>
                          Learn More...
                      </a>
                      <Image
                          src='/icons/arrow_forward.svg'
                          alt='Info'
                          width={16}
                          height={16}
                      />
                  </div>
              )}
          </div>
          <div
              className={styles.close}
              onClick={() => closeToastAction()}
          >
              <Image
                  src='/icons/close.svg'
                  alt='Error'
                  className='m-3'
                  width={24}
                  height={24}
              />
          </div>
      </div>
  )
}
