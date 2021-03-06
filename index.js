const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const chalk = require('chalk')
const process = require ('process')

//getting the first argument, used as port number
const args = process.argv.slice(2);
const port = args[0];

const users = [];

//all calls to expect from client while client is connected
io.on('connection', client => {
  client.on('username', username => {
    const user = {
      id: client.id,
      name: username
    };
    users.push(user);
    console.log(chalk.green('User connected, username: ' + username + " id: " + client.id));
    io.emit("users", getUserNames());
    printAllUsers();
  })
  client.on('disconnect', () => {
    console.log(chalk.red("User disconnected, id: " + client.id));
    removeUser(client.id)
    io.emit('users', getUserNames());
  })
  client.on('msg', msg => {
    const user = users.find(user => user.id === client.id);
    var username = user.name;
    console.log(chalk.cyan("New message, content: " + msg + " from: "+ username + " id: " + client.id));
    io.emit("msg", {
      sender: username,
      text: msg,
    })
  })
})


//Utils
function removeUser(id) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      users.splice(i, 1);
    }
  }
}

function printAllUsers() {
  console.log("All users: ")
  for (var i = 0; i<users.length; i++) {
    console.log("User #" + i + " username: " + users[i].name + " id: " + users[i].id);
  }
}

function getUserNames() {
  const usernames = []
  for (var i = 0; i<users.length; i++) {
    usernames.push(users[i].name);
  }
  return usernames;
}

http.listen(port, () => {
  console.log(chalk.bold(`Listening on ${port}`));
});