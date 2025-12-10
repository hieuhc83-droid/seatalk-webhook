exports.handler = async (event) => {  
  // Biến môi trường sẽ được lấy từ Netlify settings  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  try {  
    const body = JSON.parse(event.body);  
    const challenge = body?.event?.sealtalk_challenge;  
  
    // 1. Xử lý SeaTalk verification  
    if (challenge) {  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    // 2. Forward các event khác đến Make  
    if (MAKE_WEBHOOK_URL) {  
      await fetch(MAKE_WEBHOOK_URL, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: event.body, // Gửi lại body gốc  
      });  
    }  
  
    return {  
      statusCode: 200,  
      body: "OK",  
    };  
  } catch (error) {  
    return {  
      statusCode: 400,  
      body: "Bad Request or Error",  
    };  
  }  
};
