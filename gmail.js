const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

// OAuth2 credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Set credentials
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Create Gmail API client
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

async function listEmails() {
  try {
    // Get list of emails from inbox
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: 10 // Adjust as needed
    });

    const messages = response.data.messages;

    if (!messages || messages.length === 0) {
      console.log('No messages found.');
      return;
    }

    // Get details for each email
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });

      const headers = email.data.payload.headers;
      const subject = headers.find(header => header.name === 'Subject')?.value;
      const from = headers.find(header => header.name === 'From')?.value;
      const date = headers.find(header => header.name === 'Date')?.value;

      console.log('------------------------');
      console.log('From:', from);
      console.log('Subject:', subject);
      console.log('Date:', date);
    }

  } catch (error) {
    console.error('Error fetching emails:', error);
  }
}

// Call the function
listEmails();
