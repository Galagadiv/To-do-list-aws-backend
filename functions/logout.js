const {Issuer} = require("openid-client");

exports.handler = async () => {
  const logoutUrl =
    "https://us-east-1atoghhejc.auth.us-east-1.amazoncognito.com/logout" +
    "?client_id=16jtunov7n5jlg34414vi7p84u" +
    "&logout_uri=" +
    encodeURIComponent(
      "https://ubu9jz8e3f.execute-api.us-east-1.amazonaws.com/dev/logout-success"
    );

  return {
    statusCode: 302,
    headers: {
      Location: logoutUrl,
      "Access-Control-Allow-Origin": "*",
    },
  };
};
