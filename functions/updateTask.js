const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,PUT",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  let result;
  try {
    result = await updateTask(event);
  } catch (err) {
    return {
      statusCode: 500,
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

const updateTask = async (event) => {
  if (!event.body) {
    throw new Error("Body запиту відсутній");
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    throw new Error("Невалідний JSON у body");
  }

  const {userId, taskId, ...updates} = body;

  if (!userId || !taskId) {
    throw new Error("Missing required keys: userId або taskId");
  }

  if (!TABLE_NAME) {
    throw new Error("Environment variable TASKS_TABLE не задано");
  }

  const keysToUpdate = Object.keys(updates);
  if (keysToUpdate.length === 0) {
    throw new Error("Немає полів для оновлення");
  }

  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};
  const setClauses = [];

  keysToUpdate.forEach((attr) => {
    if (attr === "userId" || attr === "taskId") return;

    ExpressionAttributeNames[`#${attr}`] = attr;
    ExpressionAttributeValues[`:${attr}`] = updates[attr];
    setClauses.push(`#${attr} = :${attr}`);
  });

  if (setClauses.length === 0) {
    throw new Error("Спроба оновити лише userId або taskId, що заборонено");
  }

  const UpdateExpression = "SET " + setClauses.join(", ");

  const params = {
    TableName: TABLE_NAME,
    Key: {userId, taskId},
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  const {Attributes} = await docClient.send(new UpdateCommand(params));

  if (!Attributes) {
    throw new Error("Запис не знайдено або не оновлено");
  }

  return Attributes;
};
