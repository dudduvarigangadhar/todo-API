const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority } = request.query;
  console.log(search_q, status, priority);
  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };
  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };
  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };
  let getQuery;
  let dbResponse;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      console.log("both");
      getQuery = `SELECT * FROM todo WHERE
      todo LIKE '%${search_q}%'
      AND priority = '${priority}'
      AND status = '${status}';`;
      dbResponse = await db.all(getQuery);
      console.log(dbResponse);
      response.send(dbResponse);
      break;
    case hasPriorityProperty(request.query):
      console.log("priority");
      getQuery = `SELECT * FROM todo WHERE 
      priority = '${priority}';`;
      dbResponse = await db.all(getQuery);
      response.send(dbResponse);
      break;
    case hasStatusProperty(request.query):
      console.log("status");
      getQuery = `SELECT * FROM todo WHERE 
      todo LIKE '%${search_q}%
      AND status = '${status}';`;
      dbResponse = await db.all(getQuery);
      console.log(dbResponse);
      response.send(dbResponse);
      break;
  }
});
const convertDBToResponse = (response) => {
  return {
    id: response.id,
    todo: response.todo,
    priority: response.priority,
    status: response.status,
  };
};
app.get("/todos/", async (request, response) => {
  const { priority } = request.query;
  const getQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse.map((response) => convertDBToResponse(response)));
});

// app.get("/todos/", async (request, response) => {

//   let data = null;
//   let getTodosQuery = "";
//   const { search_q = "", priority, status } = request.query;
//   switch (true) {
//     case hasPriorityAndStatusProperties(request.query):
//       getTodosQuery = `SELECT * FROM todo WHERE
//                         todo LIKE '%${search_q}%' AND status = '${status}'
//                         AND priority = '${priority}';`;
//       break;
//     case hasPriorityProperty(request.query):
//       getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}'
//         AND priority = '${priority}';
//             `;
//       break;
//     case hasStatusProperty(request.query):
//       getTodosQuery = `SELECT * FROM todo WHERE
//                              todo LIKE '%${search_q}%
//                              AND status = '${status}';`;

//       break;

//     default:
//       getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;

//       break;
//   }
//   const dbResponse = await db.all(getTodosQuery);
//   console.log(dbResponse);
//   //   response.send(dbResponse.map((response) => convertDBToResponse(response)));
// });

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const todoResponse = await db.get(getTodo);
  response.send(todoResponse);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodo = `INSERT INTO todo(id,todo,priority,status)
    VALUES(
        '${id}',
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  const dbResponse = db.run(addTodo);
  response.send("Todo Succcessfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  let updateTodo;
  let dbResponse;

  const { todoId } = request.params;
  const { todo, status, priority } = request.body;
  console.log(status, todoId, priority, todo);
  const statusUpdate = (requestBody) => {
    return requestBody.status !== undefined;
  };
  const priorityUpdate = (requestBody) => {
    return requestBody.priority !== undefined;
  };
  const todoUpdate = (requestBody) => {
    return requestBody.todo !== undefined;
  };
  switch (true) {
    case statusUpdate(request.body):
      updateTodo = `UPDATE todo SET
        status = '${status}' WHERE id = ${todoId};
        `;
      dbResponse = await db.run(updateTodo);
      response.send("Status Updated");
      break;
    case priorityUpdate(request.body):
      updateTodo = `UPDATE todo SET
        priority = '${priority}' WHERE id = '${todoId}';
        `;
      dbResponse = await db.run(updateTodo);
      response.send("Priority Updated");
      break;
    case todoUpdate(request.body):
      updateTodo = `UPDATE todo SET
        todo = '${todo}' WHERE id = '${todoId}';
        `;
      dbResponse = await db.run(updateTodo);
      response.send("Todo Updated");
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `DELETE FROM todo WHERE id = '${todoId}';`;
  const dbResponse = await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
