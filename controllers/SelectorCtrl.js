app.controller('SelectorCtrl', function ($scope, $location) {
  $scope.translations = ['t1.xml', 't2.xml', 't3.xml'];

  $scope.$on('$locationChangeSuccess', function () {
    $scope.selectedTranslation = $location.path().substr(1);
  });
});
