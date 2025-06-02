const {Issuer} = require("openid-client");

exports.handler = async (event) => {
  const {
    COGNITO_ISSUER_URL,
    COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET,
    REDIRECT_URI_CALLBACK,
    FRONTEND_URL,
  } = process.env;

  let client;
  try {
    const issuer = await Issuer.discover(COGNITO_ISSUER_URL);
    client = new issuer.Client({
      client_id: COGNITO_CLIENT_ID,
      client_secret: COGNITO_CLIENT_SECRET,
    });
  } catch (err) {
    console.error("OIDC init error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "OIDC initialization failed",
        details: err.message,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  }

  // Приймаємо code із запиту
  const {code, state} = event.queryStringParameters || {};
  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: "Missing authorization code"}),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  }

  let tokenSet;
  try {
    tokenSet = await client.callback(REDIRECT_URI_CALLBACK, {code, state});
  } catch (err) {
    console.error("Token exchange error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Token exchange failed",
        details: err.message,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  }

  let claims;
  try {
    claims = tokenSet.claims();
  } catch (err) {
    console.error("Error extracting claims:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to extract claims",
        details: err.message,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  }

  const stableUserId = claims.sub;

  const redirectUrl = [
    FRONTEND_URL,
    `#sub=${encodeURIComponent(stableUserId)}`,
  ].join("");

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
      "Access-Control-Allow-Origin": "*",
    },
  };
};
