angular.module('BoShamRowApp').controller('FindMatchController', function($scope, $http, Facebook, Login, $timeout) {
  $scope.show = "loading";
  $scope.loadingMessage = "Waiting for Facebook";

  // Here, usually you should watch for when Facebook is ready and loaded
  $scope.$watch(function() {
    return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
  }, function(newVal) {
    if (newVal) {
      console.log("facebook ready: ", newVal);
      $scope.loadingMessage = undefined;
      $scope.getLoginStatus();
    }
    // $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
  });

  function fetchGameStatus() {
    Login.getPlayerEmail().then(function(playerEmail) {
      $http.get('/api/v1/active_games', { params: {email: playerEmail}})
      .success(function(result) {
        if (result.length > 0) {
          $scope.opponent = result[0];
        } else {
          $timeout(fetchGameStatus, 2000);
        }
      });
    });
  }

  // From now on you can use the Facebook service just as Facebook api says
  // Take into account that you will need $scope.$apply when inside a Facebook function's scope and not angular
  $scope.login = function() {
    Facebook.login(function(response) {
      console.log("Finished FB login");
      $scope.getLoginStatus();
    }, {scope: 'email'});
  };

  $scope.getLoginStatus = function() {
    $scope.show = 'loading';
    $scope.loadingMessage = "Checking for login";
    console.log("start get FB status");
    Login.checkLogin(function(user) {
      $scope.user = user;
      $scope.user.score = 150;
      $scope.show = 'map';
      $scope.loadingMessage = undefined;
    }, function() {
      $scope.$apply(function() {
        $scope.show = 'login';
      });
    });
  };

  $scope.didClickButton = function () {
    $scope.findingMatch = true;
    Login.getPlayerEmail().then(function(playerEmail) {
      $http.post('/api/v1/match_requests', null, {params: { email: playerEmail} })
      .success(function(data) {
        fetchGameStatus();
      }).error(function(err) {
        $scope.findingMatch = false;
        $scope.errorMessage = "Sorry, we can't find a match right now.";
      });
    });
  };
});
