const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let db = null;

const initialzeDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at localhost");
    });
  } catch (e) {
    console.log(`DB Error '${e.message}'`);
    process.exit(1);
  }
};

initialzeDBAndServer();
const statusProperty = (query) => {
  return query.status !== undefined;
};
const priorityProperty = (query) => {
  return query.priority !== undefined;
};
const priorityAndStatus = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};
const searchByProperty = (query) => {
  return query.search_q !== undefined;
};
const categoryAndStatus = (query) => {
  return query.category !== undefined && query.status !== undefined;
};
const categoryProperty = (query) => {
  return query.category !== undefined;
};
const categoryAndPriority = (query) => {
  return query.category !== undefined && query.priority !== undefined;
};
const dbResponseToObject = (todoObject) => {
  return {
    id: todoObject.id,
    todo: todoObject.todo,
    priority: todoObject.priority,
    status: todoObject.status,
    category: todoObject.category,
    dueDate: todoObject.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  //   const selectUser = `SELECT * FROM todo;`;
  //   const dbResponse = await db.all(selectUser);
  //   response.send(dbResponse);
  const { status, priority, search_q = "", category } = request.query;
  let selectQuery;
  let dbResponse;
  switch (true) {
    case statusProperty(request.query):
      selectQuery = `SELECT * FROM todo WHERE status LIKE '${status}';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
      break;
    case priorityProperty(request.query):
      selectQuery = `SELECT * FROM todo WHERE priority LIKE '${priority}';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
      break;
    case priorityAndStatus(request.query):
      selectQuery = `SELECT * FROM todo WHERE priority LIKE '${priority}' AND status LIKE '${status}';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
      break;
    case searchByProperty(request.query):
      selectQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
      break;
    case categoryAndStatus(request.query):
      selectQuery = `SELECT * FROM todo WHERE category LIKE '${category}' AND status LIKE '${status}';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
      break;
    case categoryProperty(request.query):
      selectQuery = `SELECT * FROM todo WHERE category LIKE '${category}';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
      break;
    case categoryAndPriority(request.query):
      selectQuery = `SELECT * FROM todo WHERE category LIKE '${category}' AND priority LIKE '${priority}';`;
      dbResponse = await db.all(selectQuery);
      response.send(
        dbResponse.map((todoObject) => dbResponseToObject(todoObject))
      );
  }
});
