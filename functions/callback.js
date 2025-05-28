// functions/callback.js

const {Issuer} = require("openid-client");

exports.handler = async (event) => {
  const {
    COGNITO_ISSUER_URL,
    COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET, // <-- читаємо секрет
    REDIRECT_URI_CALLBACK,
    FRONTEND_URL,
  } = process.env;

  // Перевірка змінних середовища
  if (
    !COGNITO_ISSUER_URL ||
    !COGNITO_CLIENT_ID ||
    !COGNITO_CLIENT_SECRET ||
    !REDIRECT_URI_CALLBACK ||
    !FRONTEND_URL
  ) {
    console.error("Missing env vars", {
      COGNITO_ISSUER_URL,
      COGNITO_CLIENT_ID,
      COGNITO_CLIENT_SECRET,
      REDIRECT_URI_CALLBACK,
      FRONTEND_URL,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({error: "Server configuration error"}),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  }

  // Ініціалізація OIDC-клієнта з секретом
  let client;
  try {
    const issuer = await Issuer.discover(COGNITO_ISSUER_URL);
    client = new issuer.Client({
      client_id: COGNITO_CLIENT_ID,
      client_secret: COGNITO_CLIENT_SECRET, // <-- передаємо secret
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

  // Обмінюємо код на токени
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

  // Редіректимо на фронтенд з токенами в фрагменті URL
  const redirectUrl = [
    FRONTEND_URL,
    `#access_token=${tokenSet.access_token}`,
    `&id_token=${tokenSet.id_token}`,
    `&refresh_token=${tokenSet.refresh_token || ""}`,
  ].join("");

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
      "Access-Control-Allow-Origin": "*",
    },
  };
};
