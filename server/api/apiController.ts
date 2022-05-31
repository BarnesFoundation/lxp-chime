import express from 'express';
import AWS from 'aws-sdk';
import { Config } from '../utils/config';
import { v4 as uuid } from 'uuid';

const ddb = new AWS.DynamoDB();
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

// Optional features like Echo Reduction is only available on Regional Meetings API
// https://docs.aws.amazon.com/chime/latest/APIReference/API_Operations_Amazon_Chime_SDK_Meetings.html
const chimeRegional = new AWS.ChimeSDKMeetings({ region: 'us-east-1' });
chimeRegional.endpoint = new AWS.Endpoint('https://meetings-chime.us-east-1.amazonaws.com');

const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

// Retrieve meeting from the meeting table by meeting title
const getMeeting = async (meetingTitle) => {
  const result = await ddb.getItem({
    TableName: Config.meetingsTableName,
    Key: {
      'Title': {
        S: meetingTitle,
      },
    },
  }).promise();
  return result.Item ? JSON.parse(result.Item.Data.S) : null;
};

// return regional API just for Echo Reduction for now.
function getClientForMeeting(meeting, echoReduction = 'false') {
  if (echoReduction === 'true' || (
    meeting &&
        meeting.Meeting &&
        meeting.Meeting.MeetingFeatures &&
        meeting.Meeting.MeetingFeatures.Audio &&
        meeting.Meeting.MeetingFeatures.Audio.EchoReduction === 'AVAILABLE')
  ) {
    return chimeRegional;
  }
  return chime;
}

// Add meeting in the meeting table
const putMeeting = async (title, meetingInfo) => {
  await ddb.putItem({
    TableName: Config.meetingsTableName,
    Item: {
      'Title': { S: title },
      'Data': { S: JSON.stringify(meetingInfo) },
      'TTL': {
        N: '' + oneDayFromNow,
      },
    },
  }).promise();
};

// Add attendee in the attendee table
const putAttendee = async (title, attendeeId, name) => {
  await ddb.putItem({
    TableName: Config.attendeesTableName,
    Item: {
      'AttendeeId': {
        S: `${title}/${attendeeId}`,
      },
      'Name': { S: name },
      'TTL': {
        N: '' + oneDayFromNow,
      },
    },
  }).promise();
};

export const createMeeting = async (
  request: express.Request,
  response: express.Response
) => {
  let status = 200;
  let body = '';
  const title = request.query.title as string;
  const region = request.query.region || 'us-east-1';
  const ns_es = request.query.ns_es as string;

  if (!title) {
    status = 400;
    body = 'Must provide title';

    return response.status(status).send(body);
  }

  let meetingInfo = await getMeeting(title);
  const client = getClientForMeeting(meetingInfo, ns_es);
  if (!meetingInfo) {
    const createMeetingRequest = {
      ClientcreateMeetingRequestToken: uuid(),
      MediaRegion: region,
      NotificationsConfiguration: {},
      ExternalMeetingId: title.substring(0, 64),
    };
    if (ns_es === 'true') {
      createMeetingRequest['MeetingFeatures'] = {
        Audio: {
          // The EchoReduction parameter helps the user enable and use Amazon Echo Reduction.
          EchoReduction: 'AVAILABLE',
        },
      };
    }
    console.info('Creating new meeting: ' + JSON.stringify(createMeetingRequest));
    // @ts-ignore
    meetingInfo = await client.createMeeting(createMeetingRequest).promise();
    await putMeeting(title, meetingInfo);
  }

  const joinInfo = {
    JoinInfo: {
      Title: title,
      Meeting: meetingInfo.Meeting,
    },
  };

  // @ts-ignore
  body = JSON.stringify(joinInfo);
  return response.status(status).send(body);
};

export const join = async (
  request: express.Request,
  response: express.Response
) => {
  let status = 200;
  let body = '';
  const title = request.query.title as string;
  const name = request.query.name;
  const region = request.query.region || 'us-east-1';
  const ns_es = request.query.ns_es as string;
  
  if (!title || !name) {
    status = 400;
    body = 'Must provide title and name';
    return response.status(status).send(body);
  }
  
  try {
    let meetingInfo = await getMeeting(title);
    const client = getClientForMeeting(meetingInfo, ns_es);
    if (!meetingInfo) {
      const createMeetingReq = {
        ClientRequestToken: uuid(),
        MediaRegion: region,
        NotificationsConfiguration: {},
        ExternalMeetingId: title.substring(0, 64),
      };
      if (ns_es === 'true') {
        createMeetingReq['MeetingFeatures'] = {
          Audio: {
            // The EchoReduction parameter helps the user enable and use Amazon Echo Reduction.
            EchoReduction: 'AVAILABLE',
          },
        };
      }
      console.info('Creating new meeting before joining: ' + JSON.stringify(createMeetingReq));
      // @ts-ignore
      meetingInfo = await client.createMeeting(createMeetingReq).promise();
      await putMeeting(title, meetingInfo);
    }
    
    console.info('Adding new attendee');
    const attendeeInfo = (await client.createAttendee({
      MeetingId: meetingInfo.Meeting.MeetingId,
      ExternalUserId: uuid(),
    }).promise());
    putAttendee(title, attendeeInfo.Attendee.AttendeeId, name);
    
    const joinInfo = {
      JoinInfo: {
        Title: title,
        Meeting: meetingInfo.Meeting,
        Attendee: attendeeInfo.Attendee,
      },
    };
    
    body = JSON.stringify(joinInfo);
    return response.status(status).send(body);
  } catch (e) {
      console.log(e)
    status = 500;
    body = JSON.stringify(e);
    return response.status(status).send(body);
  }
};
