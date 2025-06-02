# ☁️ To-Do List Backend — Serverless на AWS

Це бекенд-частина застосунку **To-Do List**, побудована на базі архітектури Serverless із використанням **AWS Lambda**, **DynamoDB**, **API Gateway** та **Cognito**.

[Фронтенд репозиторій](https://github.com/Galagadiv/To-do-list-aws)

[Сайт](https://us-east-1atoghhejc.auth.us-east-1.amazoncognito.com/login?client_id=16jtunov7n5jlg34414vi7p84u&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fubu9jz8e3f.execute-api.us-east-1.amazonaws.com%2Fdev%2Fcallback)

## 🔧 Основні можливості

### 🔐 Авторизація через Cognito (OIDC)

- `/login` — перенаправлення користувача до Cognito Login
- `/callback` — обробка authorization code, видача access токена, редирект із токеном у fragment URL
- `/logout` — вихід користувача з Cognito-сесії
- `/logout-success` — редирект на сторінку логіну після logout

### ✅ CRUD для завдань (DynamoDB)

- `POST /addTask` — створення нового завдання
- `GET /getUserTasks` — отримання усіх завдань користувача (опціонально — фільтрація за статусом `completed`)
- `GET /getUserTaskByID` — отримання конкретного завдання по `taskId`
- `PUT /updateTask` — оновлення завдання (title, description, completed)
- `DELETE /deleteTask` — видалення завдання

## 🧾 Структура

```
functions/
├── addTask.js
├── callback.js
├── deleteTask.js
├── getUserTaskByID.js
├── getUserTasks.js
├── login.js
├── logout.js
├── logout-success.js
└── updateTask.js
serverless.yml
.env
package.json
```

## ⚙️ Деплой через Serverless Framework

1. Встановити залежності:
   ```bash
   npm install
   ```
2. Створити файл .env:

```dotenv
COGNITO_ISSUER_URL=
COGNITO_CLIENT_ID=
COGNITO_CLIENT_SECRET=
FRONTEND_URL=
REDIRECT_URI_CALLBACK=
TASKS_TABLE=ToDoTasksTable
```

3. Задеплоїти:

```bash
npx serverless deploy
```

🛡 Безпека та CORS
Усі функції підтримують CORS (OPTIONS запити)

Access токен передається через fragment URL (#sub=...) або явно у запиті

Оновлення та видалення завдань можливе лише за userId та taskId

📎 Призначення
Бекенд створено в межах навчального проєкту для демонстрації повного циклу — автентифікації, збереження та обробки даних у хмарному середовищі.
