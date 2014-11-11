var cluster = require("cluster");
var config = {host: '127.0.0.1', port: 3000, redisPort: 6379};

// Routing
if (cluster.isMaster) {
    var net = require('net');
    var numCPUs = require('os').cpus().length;
    var workers = [];

    var spawn = function(i) {
        workers[i] = cluster.fork();

        // Optional: Restart worker on exit
        workers[i].on('exit', function(worker, code, signal) {
            // console.log('respawning worker', i);
            console.error((new Date()).toISOString()+": " + "worder "+worker.process.pid+" died");
            spawn(i);
        });
    };
    for (var i = 0; i < numCPUs; i++) {
        spawn(i);
    }

    var worker_index = function(ip, len) {//根据IP对CPU个数取余，来分配连接请求
        var s = '';
        for (var i = 0, _len = ip.length; i < _len; i++) {
            if (ip[i] !== '.') {
                s += ip[i];
            }
        }

        return Number(s) % len;
    };

    var server = net.createServer(function(connection) {//监听指定接口，当有连接请求时，分配给相应的子进程
        var worker = workers[worker_index(connection.remoteAddress, numCPUs)];
        worker.send('sticky-session:connection', connection);
    }).listen(config.port);

} else {
    var sio = require('socket.io');
    var sio_redis = require('socket.io-redis');
    var express = require('express');
    var app = express();
    var server = app.listen(0, config.host);//不指定监听接口
    var io = sio(server);

    var usernames = {};
    var numUsers = 0;

    io.adapter(sio_redis({ host: config.host, port: config.redisPort }));

    app.use(express.static(__dirname + '/'));

    app.get('/', function(req, res){
        res.sendFile(__dirname + '/views/index.html');
    });

    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }
        server.emit('connection', connection);//监听到连接请求时，建立连接
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
            if(typeof usernames[username] !== 'undefined'){
                socket.emit('login', { status: false, message: '呢称被占用' });
            }else{
                addedUser = true;
                socket.username = username;
                usernames[username] = username;
                ++numUsers;
                socket.emit('login', { status: true, numUsers: numUsers, userlist: usernames });

                socket.broadcast.emit('user joined', { username: username, numUsers: numUsers });//广播给所有人（发送者除外）
                console.log('user ' + socket.username +' enter');
            }
        });

    });

    
}
