const crypto = require('crypto');  
  
exports.handler = async (event) => {  
  const SIGNING_SECRET = process.env.SEATALK_SIGNING_SECRET;  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  // --- CHỈNH SỬA: KIỂM TRA NHIỀU TÊN HEADER ---  
  const signature = event.headers['signature'];  
  const timestampHeaderNames = ['x-lark-request-timestamp', 'timestamp', 'x-sea-request-timestamp'];  
  let timestamp = null;  
  
  // Duyệt qua danh sách tên header  
  for (const name of timestampHeaderNames) {  
    if (event.headers[name]) {  
      timestamp = event.headers[name];  
      console.log("Found timestamp in header:", name);  
      break;  
    }  
  }  
  
  if (!SIGNING_SECRET || !signature || !timestamp) {  
    console.error("Missing required headers or signing secret.");  
    console.log("Signature:", signature);  
    console.log("Timestamp:", timestamp);  
    console.log("Headers available:", Object.keys(event.headers));  
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
  
  try {  
    const body = JSON.parse(event.body);  
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
