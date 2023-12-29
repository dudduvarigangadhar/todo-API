const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const date = require("date-fns");
const app = express();
let db = null;
const initalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error "{e.message}"`);
    process.exit(1);
  }
};
initalizeDBAndServer();

const hasStatusProperty = (requestQuery) => {
  if (requestQuery.status !== undefined) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const dbResponseToObject = (todo) => {
  return {
    id: todo.id,
    todo: todo.todo,
    priority: todo.priority,
    status: todo.status,
    Category: todo.category,
    dueDate: todo.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let getQuery;
  let dbResponse;
  switch (true) {
    case hasStatusProperty(request.query):
      getQuery = `SELECT * FROM todo WHERE status LIKE '%${status}';`;
      dbResponse = await db.all(getQuery);
      response.send(dbResponse.map((todo) => dbResponseToObject(todo)));
      break;
    case hasPriorityProperty(request.query):
      break;
    case hasCategoryProperty(request.query):
      break;
  }
});
