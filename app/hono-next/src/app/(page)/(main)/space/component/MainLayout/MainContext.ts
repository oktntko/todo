import { createContext, Dispatch, SetStateAction } from 'react';

import { NotificationService } from '~/service/NotificationService';
import { SpaceService } from '~/service/SpaceService';

export type SpaceListType = Awaited<ReturnType<typeof SpaceService.listSpace>>;
export type NotificationListType = Awaited<ReturnType<typeof NotificationService.listNotification>>;

export type MainContextType = {
  space_list: SpaceListType;
  setSpaceList: Dispatch<SetStateAction<SpaceListType>>;
  notification_list: NotificationListType;
  setNotificationList: Dispatch<SetStateAction<NotificationListType>>;
};

export const MainContext = createContext<MainContextType | null>(null);
