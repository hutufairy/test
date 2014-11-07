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