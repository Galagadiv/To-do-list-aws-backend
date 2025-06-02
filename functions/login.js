const {Issuer, generators} = require("openid-client");

exports.handler = async (event) => {
  const {COGNITO_ISSUER_URL, COGNITO_CLIENT_ID, REDIRECT_URI} = process.env;
  if (!COGNITO_ISSUER_URL || !COGNITO_CLIENT_ID || !REDIRECT_URI) {
    console.error("Missing env vars", {
      COGNITO_ISSUER_URL,
      COGNITO_CLIENT_ID,
      REDIRECT_URI,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({error: "Server configuration error"}),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  let client;
  try {
    const issuer = await Issuer.discover(COGNITO_ISSUER_URL);
    client = new issuer.Client({client_id: COGNITO_CLIENT_ID});
  } catch (err) {
    console.error("OIDC initialization error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({error: "OIDC initialization error"}),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  try {
    const state = generators.state();
    const nonce = generators.nonce();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const authorizationUrl = client.authorizationUrl({
      scope: "openid email profile",
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      statusCode: 302,
      headers: {
        Location: authorizationUrl,
        "Set-Cookie": `code_verifier=${codeVerifier}; HttpOnly; Path=/; Max-Age=600; SameSite=None`,
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error("Login handler error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({error: err.message}),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
};
