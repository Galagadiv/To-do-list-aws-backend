const {Issuer, generators} = require("openid-client");

exports.handler = async (event) => {
  try {
    const issuer = await Issuer.discover(
      "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_atOGhHEJc"
    );
    const client = new issuer.Client({
      client_id: "16jtunov7n5jlg34414vi7p84u",
      client_secret: "rnb5pm73aha7rp0oh5rhhmu9f7v9a8jtakf7p7fouk46vb881hp",
      redirect_uris: ["https://galagadiv.github.io/To-do-list-aws/task-list"],
      response_types: ["code"],
    });

    const state = generators.state();
    const nonce = generators.nonce();

    const url = client.authorizationUrl({
      scope: "openid email phone",
      state,
      nonce,
    });

    return {
      statusCode: 302,
      headers: {
        Location: url,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: err.message}),
    };
  }
};
