const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TASKS_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,DELETE",
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
    result = await deleteTask(event);
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

const deleteTask = async (event) => {
  let userId, taskId;

  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      userId = body.userId;
      taskId = body.taskId;
    } catch (_e) {
      console.log("Помилка у видалені");
    }
  }

  if (!userId || !taskId) {
    const qs = event.queryStringParameters || {};
    userId = qs.userId;
    taskId = qs.taskId;
  }

  if (!userId || !taskId) {
    throw new Error("Missing required keys: userId or taskId");
  }
  if (!TABLE_NAME) {
    throw new Error("Environment variable TASKS_TABLE не задано");
  }

  const {Attributes} = await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {userId, taskId},
      ReturnValues: "ALL_OLD",
    })
  );

  if (!Attributes) {
    throw new Error("Запис не знайдено або вже видалено");
  }
  return Attributes;
};
