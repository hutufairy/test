var express = require('express'),
    numCPUs = require('os').cpus().length,
    cluster = require("cluster");

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var httpConfig = {host: '127.0.0.1', port: 3000};
var usernames = {};
var numUsers = 0;

// Routing
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        console.log("cluster: "+(i+1)+" start");
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.error((new Date()).toISOString()+": " + "worder "+worker.process.pid+" died");
        cluster.fork();
    });

    cluster.on('listening', function(worker, address) {
        console.log("Server has started to listening "+address.address+':'+address.port );
    });

} else {
    app.use(express.static(__dirname + '/public'));

    app.get('/', function(req, res){
        res.sendFile(__dirname + '/views/index.html');
    });

    io.on('connection', function(socket){
        var addedUser = false;
        socket.on('chat message', function(data){
            socket.broadcast.emit('chat message', {username: socket.username, message: data});
        });
        socket.on('disconnect', function(){
            if(addedUser){
                console.log('user ' + socket.username +' disconnected');
                delete usernames[socket.username];
                --numUsers;
                socket.broadcast.emit('user left', { username: socket.username, numUsers: numUsers });
            }
        });
        socket.on('add user', function(username){
            addedUser = true;
            socket.username = username;
            usernames[username] = username;
            ++numUsers;
            socket.emit('login', { numUsers: numUsers });

            socket.broadcast.emit('user joined', { username: username, numUsers: numUsers });//广播给所有人（发送者除外）
            console.log('user ' + socket.username +' enter');
        });

    });

    http.listen(httpConfig.port, function(){
        console.log('listening on *:3000');
    });
}
