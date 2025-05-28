// functions/logout.js

const {Issuer} = require("openid-client");

exports.handler = async (event) => {
  const {
    COGNITO_ISSUER_URL, // для discovery: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_atOGhHEJc
    COGNITO_CLIENT_ID,
    REDIRECT_URI_CALLBACK, // ваш /dev/callback endpoint
  } = process.env;

  // 1) Ініціалізуємо Issuer, щоб отримати базовий Hosted UI домен
  const issuer = await Issuer.discover(COGNITO_ISSUER_URL);
  // issuer.issuer ≃ "https://us-east-1atoghhejc.auth.us-east-1.amazoncognito.com"
  const hostedUiDomain = issuer.issuer;

  // 2) Формуємо URL для повторного входу в Hosted UI
  const loginUrl = [
    `${hostedUiDomain}/login`,
    `?client_id=${COGNITO_CLIENT_ID}`,
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI_CALLBACK)}`,
    `&response_type=code`,
    `&scope=email+openid+phone`,
  ].join("");

  // 3) Редіректимо користувача одразу на Hosted UI /login
  return {
    statusCode: 302,
    headers: {
      Location: loginUrl,
      "Access-Control-Allow-Origin": "*",
    },
  };
};
