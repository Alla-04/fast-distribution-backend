import express from "express"; // Web server framework for handling routes
import cors from "cors";       // Allows frontend pages to access this backend
import dotenv from "dotenv";   // Loads environment variables from .env file
import twilio from "twilio";   // Twilio library used to send SMS messages

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// This creates a Twilio connection for sending SMS
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID, // Twilio account identifier
    process.env.TWILIO_AUTH_TOKEN   // Secret key to authorize sending messages
);

// SEND SMS
// Frontend sends: { phoneList: [...], message: "text" }
// Backend loops through numbers and sends SMS one by one
app.post("/twilio-send", async (req, res) => {
    const { phoneList, message } = req.body;

    // Validate that both fields exist
    if (!phoneList || !message) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        const results = []; // Store Twilio message SIDs (IDs for each SMS sent)

         // Loop through every phone number sent from frontend
        for (const num of phoneList) {
            const msg = await client.messages.create({
                from: process.env.TWILIO_FROM_NUMBER, // Twilio phone number
                to: num,                              // Receiver number
                body: message                         // SMS text   
            });

            results.push(msg.sid); // Save SID so frontend knows it was sent
        }

        // If everything succeeded then return results
        return res.json({ success: true, results });

    } catch (error) {
        // Any Twilio or network error lands here
        console.error(error);
        // Send readable error back to frontend
        return res.json({ success: false, message: error.message });
    }
});

// START THE SERVER
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Twilio SMS backend running on port ${PORT}`);
});
