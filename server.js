const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

let todos = [];

app.get("/", function (req, res) {
  fs.readFile("data.txt", "utf-8", function (error, data) {
    if (error) {
      console.log(error);
      res.status(500).send("Error reading file");
    } else {
      res.status(200).json({
        todos: JSON.parse(data),
      });
    }
  });
});

app.post("/create", function (req, res) {
  fs.readFile("data.txt", "utf-8", function (error, data) {
    if (error) {
      console.error("Error reading file: ", error);
      return res.status(500).json({
        message: "Error reading file",
      });
    }

    try {
      const todos = JSON.parse(data || "[]");

      /*
        Math.max(todos);  
        // This will return NaN, because Math.max() doesn't accept arrays.

        Math.max(...todos.map(todo => todo.id));  
        // This will return 5

        todos.map(todo => todo.id) will give an array of IDs: [1, 3, 5]

        The spread operator ... expands this array into individual arguments for Math.max(): 1, 3, 5
        Now Math.max(1, 3, 5) returns 5, which is the highest value.
      */

      const newId =
        todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;

      const newTodo = {
        id: newId,
        todo: req.body.todo,
      };

      todos.push(newTodo);

      const dataString = JSON.stringify(todos, null, 2);

      fs.writeFile("data.txt", dataString, (error) => {
        if (error) {
          console.error("Error writing file: ", error);
          return res.status(500).json({
            message: "Error creating a new todo",
          });
        }

        console.log("Todo created successfully");
        res.status(201).json({
          message: "Todo created successfully",
          todo: newTodo,
        });
      });
    } catch (error) {
      console.error("Error : ", error);
      res.status(500).json({
        message: "Error processing existing todos",
      });
    }
  });
});

app.delete("/delete/:id", function (req, res) {
  const id = Number(req.params.id);

  fs.readFile("data.txt", "utf-8", function (error, data) {
    if (error) {
      console.log(error);
      res.status(500).send("Error reading file");
    } else {
      const todos = JSON.parse(data);
      const newTodos = todos.filter((data) => data.id != id);

      console.log("Updated Todos : " + newTodos);

      const dataString = JSON.stringify(newTodos, null, 2);

      fs.writeFile("data.txt", dataString, function (error) {
        if (error) {
          console.error("Error writing a file: " + error);
          res.status(500).json({
            message: "Error deleting a todo",
          });
        } else {
          console.log("Todo deleted");
          res.status(200).json({
            message: "Todo deleted",
          });
        }
      });
    }
  });
});

app.put("/update/:id", function (req, res) {
  const id = Number(req.params.id);
  const todo = req.body.todo;

  fs.readFile("data.txt", "utf-8", function (error, data) {
    if (error) {
      console.log(error);
      res.status(500).send("Error reading file");
    }

    try {
      const todos = JSON.parse(data);
      const updateTodo = todos.find((data) => data.id === id);

      if (!updateTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }

      updateTodo.todo = todo;

      const dataString = JSON.stringify(todos, null, 2);

      fs.writeFile("data.txt", dataString, function (error) {
        if (error) {
          console.log("Error writing file:", error);
          return res.status(500).send("Error writing file");
        }

        res.status(200).json({
          message: "Todo updated successfully",
          todo: updateTodo,
        });
      });
    } catch (error) {
      console.log("Error parsing JSON:", error);
      res.status(500).send("Error processing data");
    }
  });
});

app.listen(3000, function (res, req) {
  console.log("Server is running on port 3000");
});
