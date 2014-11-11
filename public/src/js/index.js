var inputFilter = angular.module('inputFilter', []);
var chatApp = angular.module('chatApp', ['inputFilter']);
inputFilter.filter('checkinput', function(){
    return function(input){
        return input;
    }
});

chatApp.factory('socket', function($rootScope){
    var socket = io();
    return {
        on: function(eventName, callback){
            socket.on(eventName, function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback){
            socket.emit(eventName, data, function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    if(callback) callback.apply(socket, args);
                });
            });
        }
    };
});

chatApp.controller('chatController', function($scope, socket){
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
      ];

    $scope.room = {
        number: 0,
        notices: [],
        messages: [],
        userlist: {}, //用户列表
        welcome: function(){
            return '驾到~';
        },
        bye: function(){
            return '默默的离开了';
        },
        assignCoat: function(username){
         // Compute hash code
            var hash = 7;
            for (var i = 0; i < username.length; i++) {
               hash = username.charCodeAt(i) + (hash << 5) - hash;
            }
            // Calculate color
            var index = Math.abs(hash % COLORS.length);
            return COLORS[index];
        },
        login: function(e){
            $scope.user.errormsg = '';
            if(e.keyCode !== 13 || $scope.user.name == '') return;
            socket.emit('add user', $scope.user.name);
        },
        adduser: function(username){
            var coat = this.assignCoat(username);
            this.userlist[username] = coat;
            return {username: username, coat: coat};
        },
        removeuser: function(username){
            var data = this.userlist[username];
            delete this.userlist[username];
            return data;
        },
        getuser: function(username){
            if(!username || typeof this.userlist[username] === 'undefined') return false;
            return {username: username, coat: this.userlist[username]};
        },
        enter: function(data){
            angular.extend(data, this.adduser(data.username));
            this.number = data.numUsers;
            data.message = this.welcome();
            this.notice(data, 'notices', true);
        },
        leave: function(data){
            this.number = data.numUsers;
            data.message = this.bye();
            this.notice(data, 'notices', true);
            this.removeuser(data.username);
        },
        chat: function(data){
            this.notice(data, 'messages', false);
        },
        notice: function(data, obj, inverse){//inverse 先入先出
            if(typeof data.username === 'undefined') data.username = $scope.user.name;
            var d = this.getuser(data.username);
            if(!d) return false;
            angular.extend(data, d);
            if(inverse) this[obj].unshift(data);
            else this[obj].push(data);
        }
    };

    $scope.user = {
        name: '',
        loginstatus: false,
        message: '',
        errormsg: '',
        send: function(e){
            if(e.keyCode !== 13 || this.name  == '' || this.message == '') return;
            socket.emit('chat message', this.message);
            $scope.room.chat({'message': this.message});
            this.message = '';
        }
    };

    socket.on('login', function(data){
        if(data.status){
            data.username = $scope.user.name;
            angular.forEach(data.userlist, function(v, k){
                $scope.room.adduser(v);
            });
            $scope.room.enter(data);
            $scope.user.loginstatus = true;
        }else{
            $scope.user.errormsg = data.message;
        }
    });

    socket.on('user joined', function(data){//用户加入
        $scope.room.enter(data);
    });

    socket.on('user left', function(data){//用户离开
        $scope.room.leave(data);
    });

    socket.on('chat message', function(data){
        $scope.room.chat(data);
    });
});