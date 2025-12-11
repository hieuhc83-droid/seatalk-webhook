exports.handler = async (event) => {  
  const body = JSON.parse(event.body);  
  const challenge = body?.event?.sealtalk_challenge;  
  
  if (challenge) {  
    return {  
      statusCode: 200,  
      headers: { "Content-Type": "text/plain" },  
      body: challenge,  
    };  
  }  
  
  // Forward tiếp sang Make nếu muốn  
  return { statusCode: 200, body: "OK" };  
};
