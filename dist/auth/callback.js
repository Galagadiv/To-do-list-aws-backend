// import {Issuer} from "openid-client";
// const issuer = await Issuer.discover(process.env.COGNITO_ISSUER_URL);
// const client = new issuer.Client({
//   client_id: process.env.COGNITO_CLIENT_ID,
//   client_secret: process.env.COGNITO_CLIENT_SECRET,
//   redirect_uris: [process.env.COGNITO_REDIRECT_URI],
//   response_types: ["code"],
// });
// export const handler = async (event) => {
//   const queryString = event.queryStringParameters;
//   const params = {
//     code: queryString.code,
//     state: queryString.state,
//   };
//   const tokenSet = await client.callback(
//     process.env.COGNITO_REDIRECT_URI,
//     params,
//     {} // nonce, state якщо зберігаєш у клієнта (наприклад, в cookie або sessionStorage)
//   );
//   if (!tokenSet.access_token) {
//     throw new Error("Missing access token");
//   }
//   const userInfo = await client.userinfo(tokenSet.access_token);
//   return {
//     statusCode: 200,
//     body: JSON.stringify({userInfo}),
//   };
// };

const {Issuer} = require("openid-client");

exports.handler = async (event) => {
  try {
    const issuer = await Issuer.discover(
      "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_a"
    );
    const client = new issuer.Client({
      client_id: "16jtunovi7p84u",
      client_secret: "rnb5p7fouk46vb881hp",
      redirect_uris: ["https://galagadiv.github.io/To-do-list-aws/task-list"],
      response_types: ["code"],
    });

    const query = event.queryStringParameters || {};
    const {code, state} = query;

    if (!code || !state) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: "Missing code or state parameter"}),
      };
    }

    const tokenSet = await client.callback(
      "https://galagadiv.github.io/To-do-list-aws/task-list",
      {code, state},
      {
        // Тут треба перевірку на state/nonce, якщо ти його десь зберігаєш (наприклад, cookie/sessionStorage)
      }
    );

    if (!tokenSet.access_token) {
      return {
        statusCode: 401,
        body: JSON.stringify({error: "Missing access token"}),
      };
    }

    const userInfo = await client.userinfo(tokenSet.access_token);

    return {
      statusCode: 302,
      headers: {
        Location: `https://galagadiv.github.io/To-do-list-aws/task-list?name=${encodeURIComponent(
          userInfo.name || ""
        )}`,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: err.message || "Internal Server Error"}),
    };
  }
};
