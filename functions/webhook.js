exports.handler = async (event) => {  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  try {  
    const bodyString = event.body;  
  
    // ---- ĐÂY LÀ PHẦN THAY ĐỔI QUYẾT ĐỊNH ----  
    // Dùng Regex để tìm giá trị của "seatalk_challenge" trong chuỗi body  
    const match = bodyString.match(/"seatalk_challenge":"([^"]+)"/);  
    const challenge = match ? match[1] : null;  
  
    if (challenge) {  
      console.log("✅ SUCCESS with REGEX: Challenge found! Responding with:", challenge);  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    // Nếu không phải verification, forward về Make  
    console.log("INFO: No challenge found with Regex. Forwarding to Make...");  
    if (MAKE_WEBHOOK_URL) {  
      await fetch(MAKE_WEBHOOK_URL, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: bodyString,  
      });  
    }  
  
    return { statusCode: 200, body: "OK - Forwarded" };  
  
  } catch (error) {  
    console.error("❌ CRITICAL ERROR:", error.message);  
    return { statusCode: 500, body: "Internal Server Error" };  
  }  
};
