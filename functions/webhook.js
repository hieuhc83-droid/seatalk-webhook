exports.handler = async (event) => {  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  console.log("--- RAW BODY RECEIVED ---");  
  console.log(event.body);  
    
  try {  
    // Luôn parse body để đảm bảo nó là object  
    const body = JSON.parse(event.body || "{}");  
      
    // Kiểm tra challenge một cách an toàn nhất  
    const challenge = body && body.event && body.event.sealtalk_challenge;  
  
    if (challenge) {  
      console.log("SUCCESS: Challenge found! Responding with:", challenge);  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    // Nếu không phải verification, forward về Make  
    console.log("INFO: Not a verification request. Forwarding to Make...");  
    if (MAKE_WEBHOOK_URL) {  
      await fetch(MAKE_WEBHOOK_URL, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: event.body,  
      });  
    }  
  
    return {  
      statusCode: 200,  
      body: "OK - Forwarded",  
    };  
  
  } catch (error) {  
    console.error("CRITICAL ERROR:", error.message);  
    return {  
      statusCode: 500,  
      body: "Internal Server Error",  
    };  
  }  
};
