export interface CanvasDataEvent {
    event: string;
    senderAttendeeId: string;
    timestamp: number;
    senderName: string;
    isSelf: boolean;
}

export interface State {
    events: CanvasDataEvent[];
}

export enum DataEventsActionType {
    ADD,
}

export interface AddAction {
    type: DataEventsActionType.ADD;
    payload: CanvasDataEvent;
}

export const initialState: State = {
  events: [],
};

export type Action = AddAction;

export function reducer(state: State, action: Action): State {
  const { type, payload } = action;
  switch (type) {
    case DataEventsActionType.ADD:
      return { events: [...state.events, payload] };
    default:
      throw new Error('Incorrect action in DataEventsProvider reducer');
  }
}
