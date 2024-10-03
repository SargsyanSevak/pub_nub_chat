import {useState} from 'react'
import {roboto} from '@/app/fonts'
import {Chat, User} from '@pubnub/chat'
import Avatar from '../avatar/avatar'
import Message from '../message'
import Image from 'next/image'
import NewMessageUserRow from '../newMessageUserRow'
import NewMessageUserPill from '../newMessageUserPill'
import {ChatEventTypes, ToastType, PresenceIcon} from '@/app/types'
import {actionCompleted} from 'pubnub-demo-integration'
import styles from './styles.module.scss' ;


export default function NewMessageGroup({
                                            chat,
                                            currentUser,
                                            setCreatingNewMessage,
                                            showUserMessage,
                                            sendChatEvent,
                                            invokeRefresh
                                        }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [newDraftGroupUsers, setNewDraftGroupUsers] = useState<User[]>([
        currentUser
    ])
    const [creationInProgress, setCreationInProgress] = useState(false)

    function handleUserSearch(term: string) {
        setSearchTerm(term)
        if (!chat) return
        chat
            .getUsers({
                limit: 10,
                filter: `name LIKE "*${term}*" || id LIKE "*${term}*"`
            }) //  Could also filter by Profile URL:  || profileUrl LIKE "*${term}*"
            .then(userResults => {
                setSearchResults(userResults.users)
            })
    }

    function onSearchResultClicked(newUser: User) {
        const alreadyPresent = newDraftGroupUsers.find(
            user => user.id === newUser.id
        )
        if (alreadyPresent) {
            showUserMessage(
                'User Already Selected',
                `${newUser.name} is already selected for this new group`,
                '',
                ToastType.ERROR
            )
        } else if (newDraftGroupUsers.length >= 10) {
            showUserMessage(
                'Demo Limitation',
                'Though the Chat SDK supports groups of up to 100 members, this demo caps the maximum member count at 10',
                'https://www.pubnub.com/docs/chat/chat-sdk/build/features/channels/create#input-1',
                ToastType.ERROR
            )
        } else {
            setNewDraftGroupUsers(newDraftGroupUsers => [
                ...newDraftGroupUsers,
                newUser
            ])
            setSearchTerm('')
        }
    }

    function onRemovePill(removingUserId) {
        const filteredArray = newDraftGroupUsers.filter(
            user => user.id !== removingUserId
        )
        setNewDraftGroupUsers(filteredArray)
    }

    async function createGroup() {
        setCreationInProgress(true)
        //  Call createGroup or direct conversation, depending on which one it is.
        //  Send joined events to all participants to let them know they are in a new group
        //  Refresh all my membership arrays from the server
        //  Set the new group as the active chat session

        let desiredChannelId = ''
        let createdChannel = null
        if (newDraftGroupUsers.length == 2) {
            //  Creating a 1:1 conversation
            const otherUser = newDraftGroupUsers.find(
                user => user.id !== chat.currentUser.id
            )
            const {channel} = await chat.createDirectConversation({
                user: otherUser
            }) //  Accepting defaults for channel ID and channel Data
            desiredChannelId = channel.id
            createdChannel = channel
            actionCompleted({
                action: 'Create a new 1:1 (Direct) Chat',
                blockDuplicateCalls: false,
                debug: false
            })
        } else {
            //  Creating a group conversation
            const randomNewChannelName = 'Group ' + Math.floor(Math.random() * 1000)
            const others = newDraftGroupUsers.filter(
                user => user.id !== chat.currentUser.id
            )
            const {channel} = await chat.createGroupConversation({
                users: others,
                channelData: {name: randomNewChannelName}
            })
            desiredChannelId = channel.id
            createdChannel = channel
            actionCompleted({
                action: 'Create a new Private Group',
                blockDuplicateCalls: false,
                debug: false
            })
        }
        if (createdChannel) {
            invokeRefresh(desiredChannelId, createdChannel['type'])
        }
        setCreatingNewMessage(false)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <div className={styles.sendBlock}>
                    <div className={styles.row}>
                        <div
                            className={styles.send}
                            onClick={e => setCreatingNewMessage(false)}
                        >
                            {/*<Image*/}
                            {/*  src='/icons/west.svg'*/}
                            {/*  alt='Send'*/}
                            {/*  className='m-3'*/}
                            {/*  width={24}*/}
                            {/*  height={24}*/}
                            {/*  priority*/}
                            {/*/>*/}

                        </div>
                        New Message / Group
                    </div>
                    <div className={styles.avatarBlock}>
                        <div className={styles.avatar}>
                            {newDraftGroupUsers?.map((user, index) => (
                                <Avatar
                                    key={index}
                                    present={PresenceIcon.NOT_SHOWN}
                                    avatarUrl={
                                        user.profileUrl
                                            ? user.profileUrl
                                            : '/avatars/placeholder.png'
                                    }
                                    border={true}
                                    width={36}
                                    height={36}
                                />
                            ))}
                            hamoooo
                        </div>
                        <div className={styles.newGroup}>
                            {newDraftGroupUsers?.length == 1
                                ? 'Please Choose some friends'
                                : newDraftGroupUsers?.length == 2
                                    ? 'New Direct Conversation'
                                    : 'New Private Group'}
                        </div>
                    </div>
                </div>

                <div className={styles.searchByName}>
                    <input className={styles.searchByName}
                           placeholder='Search by name'
                           value={searchTerm}
                           onChange={e => {
                               handleUserSearch(e.target.value)
                           }}
                    />
                </div>

                {/* Search Results */}
                {searchTerm.length > 0 && (
                    <div className={styles.searchResult}>
                        <div className={styles.searchContainer}>
                            <div className={styles.searchResults}>
                                {/* Search Results */}

                                {searchResults?.map((user, index) => (
                                    <NewMessageUserRow
                                        key={index}
                                        user={user}
                                        present={
                                            user.active ? PresenceIcon.ONLINE : PresenceIcon.OFFLINE
                                        }
                                        clickAction={user => onSearchResultClicked(user)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.pill}>
                    {newDraftGroupUsers?.map((user, index) => (
                        <NewMessageUserPill
                            key={index}
                            user={user}
                            isMe={user.id == chat.currentUser.id}
                            removePillAction={userId => onRemovePill(userId)}
                        />
                    ))}
                </div>
            </div>
            <div className={`${styles.containerGroup} ${newDraftGroupUsers.length < 2 ? styles.hidden : ''}`}>
                <div
                    className={`${roboto.className} ${styles.createGroup}`}
                    onClick={e => createGroup()}
                >
                    <div
                        className={`${styles.createProgress},${creationInProgress && styles.hidden}`}
                    >
                        Create
                    </div>
                    <div
                        className={`${creationInProgress ? styles.hiddenProgress :styles.isProgress}`}
                    >
                        <Image
                            src='/icons/loading.png'
                            alt='Chat Icon'
                            className=''
                            width={40}
                            height={40}
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
