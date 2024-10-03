"use client";

import Image from "next/image";
import { useState } from "react";
import ChatMenuItem from "../chat-menu-item/chatMenuItem";
import { PresenceIcon, useBreakpoints } from "@/app/types";
import styles from "./styles.module.scss";
import classNames from "classnames";

export default function ChatSelectionMenu({
  chatSelectionMenuMinimized,
  setChatSelectionMenuMinimized,
  chat,
  setCreatingNewMessage,
  setShowThread,
  unreadMessages,
  publicChannels,
  publicChannelsMemberships,
  privateGroups,
  privateGroupsUsers,
  privateGroupsMemberships,
  directChats,
  directChatsUsers,
  directChatsMemberships,
  activeChannel,
  setActiveChannel,
  setActiveChannelPinnedMessage,
  updateUnreadMessagesCounts,
  currentUserProfileUrl,
  showUserMessage,
}) {
  const [unreadExpanded, setUnreadExpanded] = useState(true);
  const [publicExpanded, setPublicExpanded] = useState(true);
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [directMessagesExpanded, setDirectMessagesExpanded] = useState(true);
  const { isLg } = useBreakpoints();
  const [searchChannels, setSearchChannels] = useState("");

  function handleChatSearch(term: string) {
    setSearchChannels(term);
  }

  return (
    <div
      id="chats-menu"
      className={classNames(
        styles.wrapper,
        !isLg && chatSelectionMenuMinimized && styles.minimized
      )}
    >
      <div
        className={classNames(
          styles.expand,
          isLg && !chatSelectionMenuMinimized && styles.hidden
        )}
      >
        <div
          style={{ display: "flex", cursor: "pointer" }}
          onClick={(e) => {
            setChatSelectionMenuMinimized(!chatSelectionMenuMinimized);
            setShowThread(false);
          }}
        >
          <Image
            src="/icons/close-rooms.svg"
            alt="Expand Chats"
            className={styles.close_rooms_icon}
            width={36}
            height={36}
            priority
          />
        </div>
      </div>
      <div
        className={classNames(
          styles.search_box,
          !isLg && chatSelectionMenuMinimized && styles.hidden
        )}
      >
        <div className={styles.search}>
          <input
            id="chats-search-input"
            value={searchChannels}
            placeholder="Search"
            onChange={(e) => {
              handleChatSearch(e.target.value);
            }}
          />
          <Image
            src="/icons/search.svg"
            alt="Search Icon"
            className={styles.close_rooms_icon}
            width={12}
            height={12}
            priority
          />
        </div>

        {unreadExpanded && (
          <div>
            {unreadMessages?.map(
              (unreadMessage, index) =>
                unreadMessage.channel.id !== activeChannel?.id &&
                (
                  (unreadMessage.channel.type === "direct" && directChats
                    ? directChatsUsers[
                        directChats.findIndex(
                          (dmChannel) =>
                            dmChannel.id == unreadMessage.channel.id
                        )
                      ]?.find((user) => user.id !== chat.currentUser.id)?.name
                    : unreadMessage.channel.name) ?? ""
                )
                  .toLowerCase()
                  ?.indexOf(searchChannels.toLowerCase()) > -1 && (
                  <ChatMenuItem
                    key={index}
                    avatarUrl={
                      unreadMessage.channel.type === "group"
                        ? currentUserProfileUrl
                          ? currentUserProfileUrl
                          : "/avatars/placeholder.png"
                        : unreadMessage.channel.type == "public"
                        ? unreadMessage.channel.custom?.profileUrl
                          ? unreadMessage.channel.custom?.profileUrl
                          : "/avatars/placeholder.png"
                        : unreadMessage.channel.type == "direct" && directChats
                        ? directChatsUsers[
                            directChats.findIndex(
                              (dmChannel) =>
                                dmChannel.id == unreadMessage.channel.id
                            )
                          ]?.find((user) => user.id !== chat.currentUser.id)
                            ?.profileUrl
                          ? directChatsUsers[
                              directChats.findIndex(
                                (dmChannel) =>
                                  dmChannel.id == unreadMessage.channel.id
                              )
                            ]?.find((user) => user.id !== chat.currentUser.id)
                              ?.profileUrl
                          : "/avatars/placeholder.png"
                        : "/avatars/placeholder.png"
                    }
                    avatarBubblePrecedent={
                      unreadMessage.channel.type === "group" && privateGroups
                        ? privateGroupsUsers[
                            privateGroups.findIndex(
                              (group) => group.id == unreadMessage.channel.id
                            )
                          ]?.map((user) => user.id !== chat.currentUser.id)
                          ? `+${
                              privateGroupsUsers[
                                privateGroups.findIndex(
                                  (group) =>
                                    group.id == unreadMessage.channel.id
                                )
                              ]?.map((user) => user.id !== chat.currentUser.id)
                                .length - 1
                            }`
                          : ""
                        : ""
                    }
                    text={
                      unreadMessage.channel.type === "direct" && directChats
                        ? directChatsUsers[
                            directChats.findIndex(
                              (dmChannel) =>
                                dmChannel.id == unreadMessage.channel.id
                            )
                          ]?.find((user) => user.id !== chat.currentUser.id)
                            ?.name
                        : unreadMessage.channel.name
                    }
                    present={PresenceIcon.NOT_SHOWN}
                    count={"" + unreadMessage.count}
                    markAsRead={true}
                    markAsReadAction={async (e) => {
                      e.stopPropagation();
                      if (
                        unreadMessage.channel.type === "public" &&
                        publicChannelsMemberships &&
                        publicChannels
                      ) {
                        const index = publicChannelsMemberships.findIndex(
                          (membership) =>
                            membership.channel.id == unreadMessage.channel.id
                        );
                        if (index > -1) {
                          const lastMessage = await publicChannels[
                            index
                          ]?.getHistory({ count: 1 });
                          if (lastMessage && lastMessage.messages) {
                            await publicChannelsMemberships[
                              index
                            ].setLastReadMessage(lastMessage.messages[0]);
                            updateUnreadMessagesCounts();
                          }
                        }
                      } else if (
                        unreadMessage.channel.type === "group" &&
                        privateGroupsMemberships &&
                        privateGroups
                      ) {
                        const index = privateGroupsMemberships.findIndex(
                          (membership) =>
                            membership.channel.id == unreadMessage.channel.id
                        );
                        if (index > -1) {
                          const lastMessage = await privateGroups[
                            index
                          ]?.getHistory({ count: 1 });
                          if (lastMessage && lastMessage.messages) {
                            await privateGroupsMemberships[
                              index
                            ].setLastReadMessage(lastMessage.messages[0]);
                            updateUnreadMessagesCounts();
                          }
                        }
                      } else if (
                        unreadMessage.channel.type === "direct" &&
                        directChatsMemberships &&
                        directChats
                      ) {
                        const index = directChatsMemberships.findIndex(
                          (membership) =>
                            membership.channel.id == unreadMessage.channel.id
                        );
                        if (index > -1) {
                          const lastMessage = await directChats[
                            index
                          ]?.getHistory({ count: 1 });
                          if (lastMessage && lastMessage.messages) {
                            await directChatsMemberships[
                              index
                            ].setLastReadMessage(lastMessage.messages[0]);
                            updateUnreadMessagesCounts();
                          }
                        }
                      }
                    }}
                    setActiveChannel={() => {
                      setActiveChannelPinnedMessage(null);
                      setCreatingNewMessage(false);
                      if (
                        unreadMessage.channel.type === "public" &&
                        publicChannels
                      ) {
                        const index = publicChannels.findIndex(
                          (channel) => channel.id == unreadMessage.channel.id
                        );
                        if (index > -1) {
                          setActiveChannel(publicChannels[index]);
                        }
                      } else if (
                        unreadMessage.channel.type === "group" &&
                        privateGroups
                      ) {
                        const index = privateGroups.findIndex(
                          (group) => group.id == unreadMessage.channel.id
                        );
                        if (index > -1) {
                          setActiveChannel(privateGroups[index]);
                        }
                      } else if (
                        unreadMessage.channel.type === "direct" &&
                        directChats
                      ) {
                        const index = directChats.findIndex(
                          (dmChannel) =>
                            dmChannel.id == unreadMessage.channel.id
                        );
                        if (index > -1) {
                          setActiveChannel(directChats[index]);
                        }
                      }
                    }}
                  ></ChatMenuItem>
                )
            )}
          </div>
        )}

        {unreadMessages && unreadMessages.length > 0 && (
          <div className="w-full border border-navy200 mt-4"></div>
        )}

        {publicExpanded && (
          <div>
            {publicChannels?.map(
              (publicChannel, index) =>
                (publicChannel.name ?? "")
                  .toLowerCase()
                  .indexOf(searchChannels.toLowerCase()) > -1 && (
                  <ChatMenuItem
                    key={index}
                    avatarUrl={
                      publicChannel.custom.profileUrl
                        ? publicChannel.custom.profileUrl
                        : "/avatars/placeholder.png"
                    }
                    text={publicChannel.name}
                    present={PresenceIcon.NOT_SHOWN}
                    setActiveChannel={() => {
                      setCreatingNewMessage(false);
                      setActiveChannelPinnedMessage(null);
                      setActiveChannel(publicChannels[index]);
                    }}
                  ></ChatMenuItem>
                )
            )}
          </div>
        )}

        <div className="w-full border border-navy200 mt-4"></div>

        {groupsExpanded && (
          <div>
            {privateGroups?.map(
              (privateGroup, index) =>
                (privateGroup.name ?? "")
                  .toLowerCase()
                  .indexOf(searchChannels.toLowerCase()) > -1 && (
                  <ChatMenuItem
                    key={index}
                    avatarUrl={
                      currentUserProfileUrl
                        ? currentUserProfileUrl
                        : "/avatars/placeholder.png"
                    }
                    text={privateGroup.name}
                    present={PresenceIcon.NOT_SHOWN}
                    avatarBubblePrecedent={
                      privateGroupsUsers[index]?.map(
                        (user) => user.id !== chat.currentUser.id
                      )
                        ? `+${
                            privateGroupsUsers[index]?.map(
                              (user) => user.id !== chat.currentUser.id
                            ).length - 1
                          }`
                        : ""
                    }
                    setActiveChannel={() => {
                      setCreatingNewMessage(false);
                      setActiveChannelPinnedMessage(null);
                      setActiveChannel(privateGroups[index]);
                    }}
                  />
                )
            )}
          </div>
        )}

        {directMessagesExpanded && (
          <div>
            {directChats?.map(
              (directChat, index) =>
                (
                  directChatsUsers[index]?.find(
                    (user) => user.id !== chat.currentUser.id
                  )?.name ?? ""
                )
                  .toLowerCase()
                  .indexOf(searchChannels.toLowerCase()) > -1 && (
                  <ChatMenuItem
                    key={index}
                    avatarUrl={
                      directChatsUsers[index]?.find(
                        (user) => user.id !== chat.currentUser.id
                      )?.profileUrl
                        ? directChatsUsers[index]?.find(
                            (user) => user.id !== chat.currentUser.id
                          )?.profileUrl
                        : "/avatars/placeholder.png"
                    }
                    text={
                      directChatsUsers[index]?.find(
                        (user) => user.id !== chat.currentUser.id
                      )?.name
                    }
                    present={
                      directChatsUsers[index]?.find(
                        (user) => user.id !== chat.currentUser.id
                      )?.active
                        ? PresenceIcon.ONLINE
                        : PresenceIcon.OFFLINE
                    }
                    setActiveChannel={() => {
                      setCreatingNewMessage(false);
                      setActiveChannelPinnedMessage(null);
                      setActiveChannel(directChats[index]);
                    }}
                  />
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
