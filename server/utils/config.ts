import dotenv from 'dotenv';

dotenv.config();

export const Config = {
  port: process.env.PORT,
  meetingsTableName: process.env.MEETINGS_TABLE_NAME,
  attendeesTableName: process.env.ATTENDEES_TABLE_NAME,
};


// const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
// const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
// const sqsQueueArn = process.env.SQS_QUEUE_ARN;
// const provideQueueArn = process.env.USE_EVENT_BRIDGE === 'false';
// const logGroupName = process.env.BROWSER_LOG_GROUP_NAME;