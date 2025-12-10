// Cần thư viện crypto của Node.js  
const crypto = require('crypto');  
  
exports.handler = async (event) => {  
  const SIGNING_SECRET = process.env.SEATALK_SIGNING_SECRET;  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  try {  
    // --- BƯỚC 1: XÁC THỰC CHỮ KÝ (PHIÊN BẢN SỬA LỖI) ---  
    const signature = event.headers['signature'];  
    const timestamp = event.headers['x-lark-request-timestamp']; // Hoặc 'timestamp'  
  
    // ---- ĐÂY LÀ PHẦN THAY ĐỔI QUYẾT ĐỊNH ----  
    // Công thức tạo chữ ký đúng: timestamp + DẤU XUỐNG DÒNG + body  
    const stringToSign = timestamp + "\n" + event.body;  
  
    const expectedSignature = crypto  
      .createHmac('sha256', SIGNING_SECRET)  
      .update(stringToSign)  
      .digest('hex');  
  
    // So sánh chữ ký  
    if (signature !== expectedSignature) {  
      console.error("Signature Mismatch!");  
      console.log("Received Signature:", signature);  
      console.log("Expected Signature:", expectedSignature);  
      return { statusCode: 401, body: "Invalid Signature" };  
    }  
  
    // --- NẾU CHỮ KÝ HỢP LỆ, TIẾP TỤC XỬ LÝ ---  
    console.log("✅ Signature Verified!");  
  
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
