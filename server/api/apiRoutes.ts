import express from 'express';
import * as apiController from './apiController';

const apiRoutes = express.Router();

/**
 * ROUTES:
 * GET / -- index.handler
 * POST /meeting -- handlers.createMeeting
 * POST /join -- handlers.join
 * POST /end -- handlers.end
 * GET /attendee -- handlers.attendee
 * POST /logs -- handlers.logs
 */

apiRoutes.post('/meeting', ((request, response) => {
  return response.status(200).json({
    message: 'Success! /meeting',
  });
}));

apiRoutes.post('/join', apiController.join);

apiRoutes.get('/attendee', ((request, response) => {
  return response.status(200).json({
    message: 'Success! /attendee',
  });
}));

apiRoutes.post('/end', ((request, response) => {
  return response.status(200).json({
    message: 'Success! /end',
  });
}));

export default apiRoutes;