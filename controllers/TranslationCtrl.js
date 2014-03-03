var Translation = (function () {

  var parseTranslationTextXML = function (translationTextXML) {
    translationTextXML = angular.element(translationTextXML);
    return {
      text: translationTextXML.text(),
      language: translationTextXML.attr('xml:lang')
    }
  }

  var parseTranslationUnitXML = function (translationUnitXML) {
    translationUnitXML = angular.element(translationUnitXML);
    return {
      source: parseTranslationTextXML(translationUnitXML.find('Source')),
      targets: _.map(translationUnitXML.find('Target'), parseTranslationTextXML)
    }
  }

  var parseTranslationXML = function (translationXML) {
    translationXML = angular.element(translationXML);
    
    this.title = translationXML.find('Title').text();
    this.url = translationXML.find('URL').text();
    this.author = translationXML.find('Author').text();
    this.translator = translationXML.find('Translator').text();
    this.date = new Date(translationXML.find('Date').text());
    this.translationUnits = _.map(translationXML.find('TranslationUnit'), parseTranslationUnitXML);
  }

  var getSourceMainLanguage = function () {
    var frequencies = _.chain(this.translationUnits)
      .pluck('source').pluck('language')
      .reduce(function(frequencies, value) {
        frequencies[value] = frequencies[value] ? frequencies[value] + 1 : 1;
        return frequencies;
      }, {}).value();

    var mainLanguage = _.chain(frequencies)
      .keys()
      .max(function (lang) { return frequencies[lang]; })
      .value();

    return mainLanguage;
  }

  var groupTargets = function () {
    return _.chain(this.translationUnits)
      .pluck('targets')
      .reduce(function (groupedTargets, targets, index) {
        return _.reduce(targets, function (groupedTargets, targetLang) {
          if (!groupedTargets[targetLang.language]) {
            groupedTargets[targetLang.language] = []
          }
          groupedTargets[targetLang.language].push({
            text: targetLang.text,
            index: index
          });
          return groupedTargets;
        }, groupedTargets);
      }, {}).value();
  };


  function Translation() {

  }

  Translation.fromXML = function () {
    var translation = new Translation();
    parseTranslationXML.apply(translation, arguments);

    translation.mainLanguage = getSourceMainLanguage.apply(translation);
    translation.groupedTargets = groupTargets.apply(translation);
    translation.targetLanguages = _.keys(translation.groupedTargets);
    return translation;
  }

  return Translation;
})();

app.controller('TranslationCtrl', function ($scope, $http, $location) {

  $scope.selectedTranslationIndex = null;

  $scope.$on('$locationChangeSuccess', function () {
    NProgress.start();
    $http.get('translations' + $location.path()).
      then(function (response) {
        $scope.translation = Translation.fromXML(response.xml);
        console.log($scope.translation);
        NProgress.done();
      });
  });

  $scope.highlightUnit = function (index) {
    $scope.selectedTranslationIndex = index;
  };

  $scope.unhighlightUnit = function (index) {
    if ($scope.selectedTranslationIndex === index) {
      $scope.selectedTranslationIndex = null;
    }
  };
});
