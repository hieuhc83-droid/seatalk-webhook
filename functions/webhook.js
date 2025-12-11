// Cần thư viện crypto của Node.js  
const crypto = require('crypto');  
  
exports.handler = async (event) => {  
  // ---- SỬA LỖI QUAN TRỌNG NHẤT: ĐỌC ĐÚNG TÊN BIẾN MÔI TRƯỜNG ----  
  const SIGNING_SECRET = process.env.SEATALK_SIGNING_SECRET; // Tên này phải khớp với Netlify  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  // In ra để kiểm tra xem biến đã được đọc đúng chưa  
  console.log("Found Signing Secret:", !!SIGNING_SECRET);  
  
  try {  
    const signature = event.headers['signature'];  
      
    // Header timestamp của SeaTalk thường là 'x-lark-request-timestamp'  
    const timestamp = event.headers['x-lark-request-timestamp'];  
  
    if (!SIGNING_SECRET || !signature || !timestamp) {  
      console.error("Missing required headers or signing secret.");  
      return { statusCode: 400, body: "Configuration Error" };  
    }  
  
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
    console.log("✅ Signature Verified! Proceeding...");  
  
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
    console.error("❌ Critical Error:", error.message);  
    return { statusCode: 500, body: "Internal Server Error" };  
  }  
};
