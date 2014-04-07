angular.module('BoShamRowApp').service('Login', function($q, Facebook, $http) {
  var playerEmailPromise = $q.defer();

  function getFacebookInfo(success) {
    Facebook.api('/me', function(response) {
      console.log(response);
      // Here you could re-check for user status (just in case)

      if (!response.email) { console.log("ERROR: no email from Facebook") }
      $http.get('/api/v1/login', {params: {email: response.email}})
      .success(function() {
        playerEmailPromise.resolve(response.email);
        success(response);
      });
    });
  }

  return {
    checkLogin: function(success, failure) {
      Facebook.getLoginStatus(function(response) {
        if(response.status == 'connected') {
          getFacebookInfo(success);
        } else {
          failure();
        }
      });
    },

    getPlayerEmail: function() {
      return playerEmailPromise.promise;
    }
  };
});
