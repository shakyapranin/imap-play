const imaps = require("imap-simple");
const dotEnv = require("dotenv");
dotEnv.config();

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false,
    },
    logger: console,
    connectionTimeout: 10000,
  },
};

async function fetchEmails({
  boxName = "INBOX",
  searchCriteria = ["ALL"],
  fetchFields = ["FROM", "TO", "SUBJECT", "DATE"],
  fetchBodies = ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
} = {}) {
  let connection;
  try {
    // Connect to IMAP server
    connection = await imaps.connect(config);

    // Open specified mailbox
    await connection.openBox(boxName);
      
    // Configure fetch options
    const fetchOptions = {
      bodies: fetchBodies,
      struct: true,
    };

    // Get messages
    const messages = await connection.search(searchCriteria, fetchOptions);

    const emails = [];
    for (const message of messages) {
      const header = message.parts.find(
        (part) => part.which === fetchBodies[0]
      );
      const body = message.parts.find((part) => part.which === fetchBodies[1]);

      const email = {};
      
      // Add requested header fields
      fetchFields.forEach(field => {
        const fieldLower = field.toLowerCase();
        if (header.body[fieldLower]) {
          email[fieldLower] = header.body[fieldLower][0];
        }
      });

      // Add body if requested
      if (body) {
        email.body = body.body;
      }

      emails.push(email);

      console.log("--------------------");
      Object.entries(email).forEach(([key, value]) => {
        console.log(`${key.charAt(0).toUpperCase() + key.slice(1)}:`, value);
      });
    }

    return emails;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Example usage:
// fetchEmails(); // Default parameters
// fetchEmails({ boxName: "Sent" }); // Different mailbox
// fetchEmails({ searchCriteria: ["UNSEEN"] }); // Only unread emails
// fetchEmails({ fetchFields: ["FROM", "SUBJECT"] }); // Only specific fields
