const crypto = require('crypto');  
  
exports.handler = async (event) => {  
  const SIGNING_SECRET = process.env.SEATALK_SIGNING_SECRET;  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  try {  
    const signature = event.headers['signature'];  
  
    // --- CHỈNH SỬA: LẤY TIMESTAMP TỪ BODY, KHÔNG PHẢI TỪ HEADER ---  
    const body = JSON.parse(event.body);  
    const timestamp = body.timestamp; // SeaTalk gửi timestamp trong body  
  
    if (!SIGNING_SECRET || !signature || !timestamp) {  
      console.error("Missing required data from body or signing secret.");  
      console.log("Body:", body);  
      console.log("Signature:", signature);  
      console.log("Timestamp from body:", timestamp);  
      return { statusCode: 400, body: "Configuration Error" };  
    }  
  
    // Công thức tạo chữ ký: timestamp + \n + body  
    const stringToSign = timestamp + "\n" + event.body;  
    const expectedSignature = crypto  
      .createHmac('sha256', SIGNING_SECRET)  
      .update(stringToSign)  
      .digest('hex');  
  
    if (signature !== expectedSignature) {  
      console.error("Signature Mismatch!");  
      console.log("Received Signature:", signature);  
      console.log("Expected Signature:", expectedSignature);  
      return { statusCode: 401, body: "Invalid Signature" };  
    }  
  
    console.log("✅ Signature Verified! Proceeding...");  
  
    const challenge = body?.event?.sealtalk_challenge;  
  
    if (challenge) {  
      console.log("✅ Challenge found! Responding with:", challenge);  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    if (MAKE_WEBHOOK_URL) {  
      await fetch(MAKE_WEBHOOK_URL, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: event.body,  
      });  
    }  
    return { statusCode: 200, body: "OK" };  
  
  } catch (error) {  
    console.error("❌ Error:", error.message);  
    return { statusCode: 500, body: "Internal Server Error" };  
  }  
};
