exports.handler = async () => {
  const logoutUrl = new URL(
    "https://us-east-1atoghhejc.auth.us-east-1.amazoncognito.com/logout"
  );

  logoutUrl.searchParams.set("client_id", "16jtunov7n5jlg34414vi7p84u");
  logoutUrl.searchParams.set(
    "logout_uri",
    "https://galagadiv.github.io/To-do-list-aws/"
  );

  return {
    statusCode: 302,
    headers: {
      Location: logoutUrl.toString(),
    },
  };
};
