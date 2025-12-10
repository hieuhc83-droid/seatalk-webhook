// Cần thư viện crypto của Node.js  
const crypto = require('crypto');  
  
exports.handler = async (event) => {  
  const SIGNING_SECRET = process.env.SEATALK_SIGNING_SECRET;  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  // --- BƯỚC 1: XÁC THỰC CHỮ KÝ (SIGNATURE VERIFICATION) ---  
  const signature = event.headers['signature'];  
  const timestamp = event.headers['timestamp']; // SeaTalk có thể gửi timestamp  
    
  if (!SIGNING_SECRET || !signature) {  
    console.error("Missing Signing Secret or Signature header.");  
    return { statusCode: 401, body: "Unauthorized" };  
  }  
  
  // Tạo chuỗi để hash, thường là body  
  const stringToSign = event.body;  
  const expectedSignature = crypto  
    .createHmac('sha256', SIGNING_SECRET)  
    .update(stringToSign)  
    .digest('hex');  
  
  // So sánh chữ ký  
  if (signature !== expectedSignature) {  
    console.error("Signature mismatch!");  
    return { statusCode: 401, body: "Invalid Signature" };  
  }  
  
  // --- NẾU CHỮ KÝ HỢP LỆ, TIẾP TỤC XỬ LÝ ---  
  console.log("✅ Signature Verified!");  
  
  try {  
    const body = JSON.parse(event.body);  
    const challenge = body?.event?.sealtalk_challenge;  
  
    if (challenge) {  
      console.log("✅ Challenge found! Responding:", challenge);  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    // Forward các event khác  
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
