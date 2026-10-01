'use client';

import { useState } from 'react';

import { MainContext, NotificationListType, SpaceListType } from './MainContext';

type Props = {
  space_list: SpaceListType;
  notification_list: NotificationListType;
  children: React.ReactNode;
};

export function MainStateProvider({
  space_list: _space_list,
  notification_list: _notification_list,
  children,
}: Props) {
  const [space_list, setSpaceList] = useState(_space_list);
  const [notification_list, setNotificationList] = useState(_notification_list);

  return (
    <MainContext.Provider
      value={{
        space_list,
        setSpaceList,
        notification_list,
        setNotificationList,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
