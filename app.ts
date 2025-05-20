import express, {Request, Response, NextFunction} from "express";
import session from "express-session";
import {Issuer, generators} from "openid-client";
import dotenv from "dotenv";

dotenv.config();
const app = express();

let client: any;

// Ініціалізація OpenID клієнта
async function initializeClient() {
  const issuer = await Issuer.discover(process.env.COGNITO_ISSUER_URL!);
  client = new issuer.Client({
    client_id: process.env.COGNITO_CLIENT_ID!,
    client_secret: process.env.COGNITO_CLIENT_SECRET!,
    redirect_uris: [process.env.COGNITO_REDIRECT_URI!],
    response_types: ["code"],
  });
}
initializeClient().catch(console.error);

// Налаштування сесії
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware перевірки автентифікації
const checkAuth = (req: any, res: Response, next: NextFunction) => {
  req.isAuthenticated = !!req.session.userInfo;
  next();
};

// Головна сторінка
app.get("/", checkAuth, (req: any, res: Response) => {
  res.send(`
    <h1>Home</h1>
    ${
      req.isAuthenticated
        ? `<p>Привіт, ${
            req.session.userInfo.name || "користувачу"
          }!</p><a href="/logout">Вийти</a>`
        : '<a href="/login">Увійти</a>'
    }
  `);
});

// Перехід на Cognito для логіну
app.get("/login", (req: any, res: Response) => {
  const nonce = generators.nonce();
  const state = generators.state();

  req.session.nonce = nonce;
  req.session.state = state;

  const authUrl = client.authorizationUrl({
    scope: "openid email phone",
    state,
    nonce,
  });

  res.redirect(authUrl);
});

// Callback після логіну
app.get("/callback", async (req: any, res: Response) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(
      process.env.COGNITO_REDIRECT_URI!,
      params,
      {
        nonce: req.session.nonce,
        state: req.session.state,
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);
    req.session.userInfo = userInfo;

    res.redirect("/");
  } catch (err) {
    console.error("Callback error:", err);
    res.redirect("/");
  }
});

// Вихід
app.get("/logout", (req: any, res: Response) => {
  req.session.destroy(() => {
    const logoutUrl = `https://us-east-1atoghhejc.auth.us-east-1.amazoncognito.com/logout?client_id=${
      process.env.COGNITO_CLIENT_ID
    }&logout_uri=${encodeURIComponent(
      process.env.COGNITO_LOGOUT_REDIRECT_URI!
    )}`;
    res.redirect(logoutUrl);
  });
});

// Запуск сервера
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server started on http://localhost:${port}`);
});

app.set("view engine", "ejs");
