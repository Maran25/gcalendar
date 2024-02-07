import { google } from 'googleapis';
import dotenv from 'dotenv';
import express from 'express'
import dayjs from 'dayjs';

dotenv.config({})
const app = express();

const PORT = process.env.PORT || 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
)

const calendar = google.calendar({
  version: 'v3',
  auth: process.env.API_KEY,
})

const scopes = ['https://www.googleapis.com/auth/calendar']

app.get('/', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  res.redirect(url)
})

app.get('/google/redirect', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens)
  
  res.send({msg: 'you have successfully logged in'});
})

app.get('/schedule_event', async (req, res) => {
  const result = await calendar.events.insert({
    calendarId: 'primary',
    auth: oauth2Client,
    requestBody: {
      summary: 'This is a test event',
      location: 'Chennai',
      description: 'This is a test event description',
      start: {
        dateTime: dayjs(new Date()).add(1, 'day').toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: dayjs(new Date()).add(1, 'day').add(1, 'hour').toISOString(),
        timeZone: 'Asia/Kolkata'
      }
    }    
  })
  res.send({msg: 'successfully scheduled the event', data: result.data})
})

app.listen(PORT, () => {
  console.log('listening on port ' + PORT)
})