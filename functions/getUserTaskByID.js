const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocumentClient, QueryCommand} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

exports.handler = async (event) => {
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

  const userId = event.queryStringParameters?.userId;
  const taskId = event.queryStringParameters?.taskId;
  if (!userId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({error: "Missing userId"}),
    };
  }
  if (!taskId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({error: "Missing taskId"}),
    };
  }

  let items;
  try {
    items = await queryTaskById(userId, taskId);
  } catch (err) {
    console.error("Error in queryTaskById:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({error: err.message}),
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(items),
  };
};

const queryTaskById = async (userId, taskId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :u AND taskId = :t",
    ExpressionAttributeValues: {
      ":u": userId,
      ":t": taskId,
    },
  };

  const {Items} = await docClient.send(new QueryCommand(params));
  return Items;
};
