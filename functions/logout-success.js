exports.handler = async () => ({
  statusCode: 302,
  headers: {
    Location:
      "https://us-east-1atoghhejc.auth.us-east-1.amazoncognito.com/login" +
      "?client_id=16jtunov7n5jlg34414vi7p84u" +
      "&response_type=code" +
      "&scope=email+openid+phone" +
      "&redirect_uri=" +
      encodeURIComponent(
        "https://ubu9jz8e3f.execute-api.us-east-1.amazonaws.com/dev/callback"
      ),
    "Access-Control-Allow-Origin": "*",
  },
});
