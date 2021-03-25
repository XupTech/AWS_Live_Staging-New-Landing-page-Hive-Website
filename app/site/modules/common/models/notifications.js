var app = angular.module('handyforall.site');
app.factory('notify', notify);
function notify($rootScope) {
  var socket = io.connect('/notify');

  socket.on('reconnect', function () {
    socket.emit('join network', { user: $rootScope.userId });
  });

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}
