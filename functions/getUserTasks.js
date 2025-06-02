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
  const completedParam = event.queryStringParameters?.completed;
  if (!userId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({error: "Missing userId"}),
    };
  }

  let items;
  try {
    items = await queryTasksByUser(userId, completedParam);
  } catch (err) {
    console.error("Error in queryTasksByUser:", err);
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

const queryTasksByUser = async (userId, completedParam) => {
  const expressionValues = {":u": userId};
  let keyCondition = "userId = :u";
  let filterExpr;

  if (typeof completedParam !== "undefined") {
    const completedBoolean = completedParam === "true";
    expressionValues[":c"] = completedBoolean;
    filterExpr = "completed = :c";
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: expressionValues,
  };

  if (filterExpr) {
    params.FilterExpression = filterExpr;
  }

  const {Items} = await docClient.send(new QueryCommand(params));
  return Items;
};
