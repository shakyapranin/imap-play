const { ImapFlow } = require("imapflow");

async function fetchEmailsWithImapFlow() {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password", // Use OAuth2 tokens if required
    },
  });

  try {
    await client.connect();

    // Select the INBOX
    const mailbox = await client.mailboxOpen("INBOX");

    // Fetch unseen emails
    for await (const message of client.fetch("1:*", {
      envelope: true,
      source: true,
      seen: false,
    })) {
      console.log("From:", message.envelope.from[0].address);
      console.log("Subject:", message.envelope.subject);
    }

    await client.logout();
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchEmailsWithImapFlow();
