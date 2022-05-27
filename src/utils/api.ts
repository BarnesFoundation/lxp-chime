// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import axios from 'axios';

export type MeetingFeatures = {
  Audio: {[key: string]: string};
}

export type CreateMeetingResponse = {
  MeetingFeatures: MeetingFeatures;
  MediaRegion: string;
}

export type JoinMeetingInfo = {
  Meeting: CreateMeetingResponse;
  Attendee: string;
}

interface MeetingResponse {
  JoinInfo: JoinMeetingInfo;
}

interface GetAttendeeResponse {
  name: string;
}

export async function fetchMeeting(
  meetingId: string,
  name: string,
  region: string,
  echoReductionCapability = false
): Promise<MeetingResponse> {
  const params = {
    title: encodeURIComponent(meetingId),
    name: encodeURIComponent(name),
    region: encodeURIComponent(region),
    ns_es: String(echoReductionCapability),
  };

  const res = await axios('/api/join?' + new URLSearchParams(params), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.data;
  console.log(data);

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

export async function getAttendee(
  meetingId: string,
  chimeAttendeeId: string
): Promise<GetAttendeeResponse> {
  const params = {
    title: encodeURIComponent(meetingId),
    attendee: encodeURIComponent(chimeAttendeeId),
  };

  const res = await axios('/api/attendee?' + new URLSearchParams(params), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status !== 200) {
    throw new Error('Invalid server response');
  }

  const data = await res.data;
  console.log(data);
  return {
    name: data.AttendeeInfo.Name,
  };
}

export async function endMeeting(meetingId: string): Promise<void> {
  const params = {
    title: encodeURIComponent(meetingId),
  };

  const res = await axios('/api/end?' + new URLSearchParams(params), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(res);

  if (res.status !== 200) {
    throw new Error('Server error ending meeting');
  }
}

export const createGetAttendeeCallback = (meetingId: string) =>
  (chimeAttendeeId: string): Promise<GetAttendeeResponse> =>
    getAttendee(meetingId, chimeAttendeeId);
