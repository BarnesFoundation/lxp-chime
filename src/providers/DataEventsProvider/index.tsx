import { useAudioVideo, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { DataMessage } from 'amazon-chime-sdk-js';
import React, { useEffect, useReducer, createContext, useContext, FC, useCallback } from 'react';
import { DATA_MESSAGE_LIFETIME_MS, DATA_EVENT_TOPIC } from '../../constants';
import { useAppState } from '../AppStateProvider';
import { DataEventsActionType, initialState, CanvasDataEvent, reducer } from './state';

interface DataEventsStateContextType {
  sendEvent: (message: string) => void;
  events: CanvasDataEvent[];
}

const DataEventsStateContext = createContext<DataEventsStateContextType | undefined>(undefined);

export const DataEventsProvider: FC = ({ children }) => {
  const { localUserName } = useAppState();
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    audioVideo.realtimeSubscribeToReceiveDataMessage(DATA_EVENT_TOPIC, handler);
    return () => {
      audioVideo.realtimeUnsubscribeFromReceiveDataMessage(DATA_EVENT_TOPIC);
    };
  }, [audioVideo]);

  const handler = useCallback(
    (dataEvent: DataMessage) => {
      if (!dataEvent.throttled) {
        const isSelf =
          dataEvent.senderAttendeeId === meetingManager.meetingSession?.configuration.credentials?.attendeeId;
        if (isSelf) {
          dispatch({
            type: DataEventsActionType.ADD,
            payload: {
              event: new TextDecoder().decode(dataEvent.data),
              senderAttendeeId: dataEvent.senderAttendeeId,
              timestamp: dataEvent.timestampMs,
              senderName: dataEvent.senderExternalUserId,
              isSelf: true,
            },
          });
        } else {
          const data = dataEvent.json();
          dispatch({
            type: DataEventsActionType.ADD,
            payload: {
              event: data.message,
              senderAttendeeId: dataEvent.senderAttendeeId,
              timestamp: dataEvent.timestampMs,
              senderName: data.senderName,
              isSelf: false,
            },
          });
        }
      } else {
        console.warn('DataMessage is throttled. Please resend');
      }
    },
    [meetingManager]
  );

  const sendEvent = useCallback(
    (message: string) => {
      if (
        !meetingManager ||
        !meetingManager.meetingSession ||
        !meetingManager.meetingSession.configuration.credentials ||
        !meetingManager.meetingSession.configuration.credentials.attendeeId ||
        !audioVideo
      ) {
        return;
      }
      const payload = { message, senderName: localUserName };
      const senderAttendeeId = meetingManager.meetingSession.configuration.credentials.attendeeId;
      audioVideo.realtimeSendDataMessage(DATA_EVENT_TOPIC, payload, DATA_MESSAGE_LIFETIME_MS);
      handler(
        new DataMessage(
          Date.now(),
          DATA_EVENT_TOPIC,
          new TextEncoder().encode(message),
          senderAttendeeId,
          localUserName
        )
      );
    },
    [meetingManager, audioVideo]
  );

  const value = {
    sendEvent,
    events: state.events,
  };
  return <DataEventsStateContext.Provider value={value}>{children}</DataEventsStateContext.Provider>;
};

export const useDataEvents = (): {
  sendEvent: (message: string) => void;
  events: CanvasDataEvent[];
} => {
  const meetingManager = useMeetingManager();
  const context = useContext(DataEventsStateContext);
  if (!meetingManager || !context) {
    throw new Error(
      'Use useDataEvents hook inside DataEventsProvider. Wrap DataEventsProvider under MeetingProvider.'
    );
  }
  return context;
};
