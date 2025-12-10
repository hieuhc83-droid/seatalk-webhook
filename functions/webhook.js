exports.handler = async (event) => {  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  console.log("--- START: RAW BODY ---");  
  console.log(event.body);  
  console.log("Type of body:", typeof event.body);  
  console.log("--- END: RAW BODY ---");  
  
  try {  
    // ---- ĐÂY LÀ PHẦN SỬA QUAN TRỌNG NHẤT ----  
    // Kiểm tra xem body là chuỗi hay object. Nếu là chuỗi thì mới parse.  
    const body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body;  
      
    // Lấy challenge một cách an toàn  
    const challenge = body?.event?.sealtalk_challenge;  
  
    // Nếu tìm thấy challenge, trả về ngay lập tức  
    if (challenge) {  
      console.log("✅ SUCCESS: Challenge found! Responding with:", challenge);  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    // Nếu không, forward về Make  
    console.log("INFO: Not a verification request. Forwarding to Make...");  
    if (MAKE_WEBHOOK_URL) {  
      // Gửi lại body gốc để đảm bảo định dạng  
      await fetch(MAKE_WEBHOOK_URL, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: event.body,   
      });  
    }  
  
    return { statusCode: 200, body: "OK - Forwarded" };  
  
  } catch (error) {  
    console.error("❌ CRITICAL ERROR:", error.message);  
    return { statusCode: 500, body: "Internal Server Error" };  
  }  
};
