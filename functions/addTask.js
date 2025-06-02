const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocumentClient, PutCommand} = require("@aws-sdk/lib-dynamodb");
const {randomUUID} = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

exports.handler = async (event) => {
  // Обробляємо preflight (OPTIONS) запит
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  if (!TABLE_NAME) {
    console.error("Environment variable TASKS_TABLE is not set");
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({error: "Server configuration error"}),
    };
  }

  let result;
  try {
    result = await createTask(event);
  } catch (err) {
    console.error("Error in createTask:", err);
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({error: err.message}),
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(result),
  };
};

const createTask = async (event) => {
  if (!event.body) {
    throw new Error("Empty request body");
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    throw new Error("Request body must be valid JSON");
  }

  const {userId, title, description} = payload;
  // За замовчуванням нове завдання — незавершене
  const completed = false;

  if (!userId || !title) {
    throw new Error("Missing required fields: userId or title");
  }

  const item = {
    userId,
    taskId: randomUUID(),
    title: title.trim(),
    completed,
    createdAt: new Date().toISOString(),
    ...(description ? {description: description.trim()} : {}),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
};
