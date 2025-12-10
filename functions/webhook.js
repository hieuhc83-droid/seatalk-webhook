exports.handler = async (event) => {  
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;  
  
  // --- BƯỚC 1: IN RA TOÀN BỘ REQUEST ĐỂ DEBUG ---  
  console.log("--- START OF REQUEST LOG ---");  
  console.log("METHOD:", event.httpMethod);  
  console.log("HEADERS:", JSON.stringify(event.headers, null, 2));  
  console.log("BODY:", event.body);  
  console.log("--- END OF REQUEST LOG ---");  
  
  try {  
    const body = JSON.parse(event.body);  
    const challenge = body?.event?.sealtalk_challenge;  
  
    // --- BƯỚC 2: XỬ LÝ SEATALK VERIFICATION ---  
    if (challenge) {  
      console.log("Found challenge, responding:", challenge);  
      return {  
        statusCode: 200,  
        headers: { "Content-Type": "text/plain" },  
        body: challenge,  
      };  
    }  
  
    // --- BƯỚC 3: FORWARD CÁC EVENT KHÁC ĐẾN MAKE ---  
    console.log("No challenge found, forwarding to Make...");  
    if (MAKE_WEBHOOK_URL) {  
      await fetch(MAKE_WEBHOOK_URL, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: event.body,  
      });  
    }  
  
    return {  
      statusCode: 200,  
      body: "OK",  
    };  
  
  } catch (error) {  
    console.error("Error processing request:", error);  
    return {  
      statusCode: 400,  
      body: "Bad Request or Error processing JSON.",  
    };  
  }  
};
