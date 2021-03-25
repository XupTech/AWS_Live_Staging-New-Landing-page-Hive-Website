var app = angular.module('handyforall.messages');
app.factory('sios', sios);
function sios($rootScope) {
  var socket = io.connect('/chat');
  return {
    on: function (name, callback) {
      ss(socket).on(name, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (name, stream, data, callback) {
      ss(socket).emit(name, stream, data, function () {
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
