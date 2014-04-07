var app = angular.module('BoShamRowApp', ['facebook']);

app.config(['FacebookProvider', function(FacebookProvider) {
  FacebookProvider.init('1417732778486013');
}]);
