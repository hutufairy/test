// (function($){
//     var $window = $(window),
//         $login = $('.page-login'),
//         $chat = $('.page-chat'),
//         $numUser = $('#numUser');
//         $usernameInput = $login.find('.input-username'),
//         $messages = $chat.find('#messages'),
//         $messageInput = $chat.find('.input-message'),
//         $notices = $chat.find('#notices'),
//         $numUser = $chat.find('#numUser');

//     var $messageTemplete = $('<p><span class="username"></span>: <span class="message"></span></p>') ;

//     var $currentInput = $usernameInput.focus();
//     var socket = io();

//     var username,
//         connected = false;

//     var welcomeMsg = '驾到~', leftMsg = '默默的离开了';

//     $window.on('keydown', function(event){ //键盘触发事件
//         if (!(event.ctrlKey || event.metaKey || event.altKey)) {
//             $currentInput.focus();
//         }

//         if(event.which == 13){ //回车
//             var v = trimInput($currentInput.val());
//             if(!v) return true;
//             if(username){
//                 if(connected){
//                     $currentInput.val('');
//                     socket.emit('chat message', v);
//                     updateMessage({username: username, message: v});
//                 }
//             }else{
//                 username = v;
//                 $currentInput = $messageInput.focus();
//                 socket.emit('add user', username);
//             }
//         }
//     })

//     $login.on('click', function(){
//         $usernameInput.focus();
//     });

//     $chat.on('click', '.footer', function(){
//         $messageInput.focus();
//     })

//     socket.on('login', function(data){
//         connected = true;
//         $login.fadeOut();
//         $chat.fadeIn();
//         $login.off('click');
//         data.username = username;
//         updateNotice(data);
//     });

//     socket.on('user joined', function(data){//用户加入
//         updateNotice(data);
//     });

//     socket.on('user left', function(data){//用户离开
//         updateNotice(data, leftMsg);
//     })

//     socket.on('chat message', function(data){
//         updateMessage(data);
//     });


//     function trimInput (input) {
//         return $('<div/>').text($.trim(input)).text();
//     }

//     function updateMessage(data){
//         try{
//             var $item = $messageTemplete.clone();
//             if(data.username === username) $item.addClass('self');
//             $item.find('.username').text(data.username).end().find('.message').text(data.message);
//             $item.appendTo($messages).animate({opacity: 1}, 500, 'linear');
//             $messages[0].scrollTop = $messages[0].scrollHeight;
//         }catch(e){

//         }
//     }

//     function updateNotice(data, msg){
//         try{
//             var self = data.username === username;
//             notify('<span class="username">' + data.username + '</span>' + (msg||welcomeMsg), self);
//             $numUser.text(data.numUsers);
//         }catch(e){
//             console.log('[update notice] error:' + e);
//         }
//     }

//     function notify(t, self){
//         var c = 'notice' + (self ? ' self' : '');
//         var $item = $('<p>').addClass(c).html(t).prependTo($notices);

//         $item.animate({opacity: 1}, 500, 'linear');
//     }


// })(window.jQuery);
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
                    if(e.keyCode !== 13 || $scope.user.name == '') return;
                    socket.emit('add user', $scope.user.name);
                },
                enter: function(data){
                    var coat = this.assignCoat(data.username);
                    this.userlist[data.username] = coat;
                    this.number = data.numUsers;
                    data.message = this.welcome();
                    this.notice(data, 'notices', true);
                },
                leave: function(data){
                    this.number = data.numUsers;
                    data.message = this.bye();
                    this.notice(data, 'notices', true);
                    delete this.userlist[data.username];
                },
                chat: function(data){
                    this.notice(data, 'messages', false);
                },
                notice: function(data, obj, inverse){//inverse 先入先出
                    if(typeof data.username === 'undefined') data.username = $scope.user.name;
                    var coat = this.userlist[data.username];
                    if(typeof coat === 'undefined') return;
                    data.coat = coat;
                    var d = {username: data.username, coat: coat, message: data.message};
                    if(inverse) this[obj].unshift(d);
                    else this[obj].push(d);
                }
            };

            $scope.user = {
                name: '',
                loginstatus: false,
                message: '',
                send: function(e){
                    if(e.keyCode !== 13 || this.name  == '' || this.message == '') return;
                    // socket.emit('chat message', this.message);
                    $scope.room.chat({'message': this.message});
                }
            };

            socket.on('login', function(data){
                data.username = $scope.user.name;
                $scope.room.enter(data);
                $scope.user.loginstatus = true;
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