const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];


function modifyDescription(todos = [], id, title, deadline) {
 const len = todos.length
 for (var i = 0; i < len; i++) {
  if(todos[i].id == id) {
   todos[i].title = title
   todos[i].deadline = deadline
   return todos[i].id
  }
 }

return 123
}
function modifyState(todos = [], id) {
 const len = todos.length
 for (var i = 0; i < len; i++) {
  if(todos[i].id == id) {
   todos[i].type = "finished"
   return todos[i].id
  }
 }
 return 123
}
function deleteTodo(todos = [], id) {
 const len = todos.length
 for (var i = 0; i < len; i++) {
  if(todos[i].id == id) {
   todos.splice(todos[i], 1);
   return id
  }
 }
 return 123
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username);

  if(!user) {
   return response.status(400).json({error: "User not found!"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;


  const nameAlreadyExists = users.some(
    (user) => user.name === name
  )
  const userNameAlreadyExists = users.some(
    (user) => user.username === username
  )

  if(userNameAlreadyExists) {
    return response.status(400).json({error:"UserName Already Exists!"})
  }
  if(nameAlreadyExists) {
    return response.status(400).json({error:"Name Already Exists!"})
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: []
  })

  return response.status(201).send();
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
 const { user } = request;

 return response.json(user.todos)
})

app.post("/todo", checksExistsUserAccount, (request, response) => {
 const { user } = request;

 const { title, deadline } = request.body;
 
 const todoOperation = {
  title,
  deadline,
  id: uuidv4(),
  created_at: new Date(),
  type: "In progress"
 }

  user.todos.push(todoOperation)

  return response.status(201).send();
})

app.put("/todo/:id", checksExistsUserAccount, (request, response) => { // falta essa parte
 const { user } = request;
 const { id } = request.params;
 const { title, deadline } = request.body;
 const idTodo = modifyDescription(user.todos,id,title,deadline)
 if(id != idTodo) {
  return response.status(400).json({error:"id not found!"}); 
 }
 return response.status(201).send();
})

app.put("/todo/complete/:id",checksExistsUserAccount, (request, response) => {
 const { user } = request;
 const { id } = request.params;

 const idTodo = modifyState(user.todos, id)
 if(id != idTodo) {
  return response.status(400).json({error:"id not found!"}); 
 }
 return response.status(201).send();

} )

app.delete("/todo/delete/:id",checksExistsUserAccount, (request, response) => {
 const { user } = request;
 const { id } = request.params;

 const todoId = deleteTodo(user.todos, id)
 if(todoId != id) {
  return response.status(400).json({error:"id not found!"}); 
 }

 return response.status(200).json(user.todos) 
})



app.listen(3333);