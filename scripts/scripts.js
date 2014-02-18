'use strict';
var nat = angular.module('nat', [
    'ngResource',
    'angular-carousel'
  ]).config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/', {
        templateUrl: '../views/catView.html',
        controller: 'mainCtrl'
      }).when('/:categoryId', {
        templateUrl: '../views/catView.html',
        controller: 'categoryCtrl'
      }).when('/single/:singleId', {
        templateUrl: '../views/singleView.html',
        controller: 'singleCtrl'
      }).when('/about-me', {
        templateUrl: '../views/aboutView.html',
        controller: 'aboutCtrl'
      }).otherwise({ redirectTo: '/' });
    }
  ]);
'use strict';
angular.module('nat').controller('mainCtrl', [
  '$scope',
  'workServ',
  function ($scope, workServ) {
    $scope.works = workServ.getCategories('selected-work');
  }
]);
'use strict';
angular.module('nat').controller('categoryCtrl', [
  '$scope',
  '$routeParams',
  'workServ',
  function ($scope, $routeParams, workServ) {
    $scope.works = workServ.getCategories($routeParams.categoryId);
    console.log('categoryCtrl');
    $(window).scrollTop(500, 200);
  }
]);
'use strict';
angular.module('nat').controller('singleCtrl', [
  '$scope',
  '$routeParams',
  'workServ',
  function ($scope, $routeParams, workServ) {
    $scope.singles = workServ.getSingels($routeParams.singleId);
    $scope.currentSlide = 0;
  }
]);
'use strict';
angular.module('nat').controller('navCtrl', [
  '$scope',
  function ($scope) {
    $scope.items = [
      {
        fisrtLine: 'PRESENTATIONS',
        secodLine: '& ARTICLES',
        categoryId: 'presentations&articles'
      },
      {
        fisrtLine: 'COMMERCIAL',
        secodLine: 'WORK',
        categoryId: 'comercial-work'
      },
      {
        fisrtLine: 'EXPERIMENTAL',
        secodLine: 'PROJECTS',
        categoryId: 'expirimental-projects'
      },
      {
        fisrtLine: 'ABOUT',
        secodLine: 'ME',
        categoryId: 'about-me'
      }
    ];
  }
]);
'use strict';
angular.module('nat').controller('aboutCtrl', [
  '$scope',
  function ($scope) {
  }
]);
'use strict';
angular.module('nat').controller('footerCtrl', [
  '$scope',
  function ($scope) {
    $scope.socials = [
      {
        title: 'Facebook',
        image: 'images/social/facebook.png',
        link: ''
      },
      {
        title: 'Linkedin',
        image: 'images/social/linkedin.png',
        link: ''
      },
      {
        title: 'Instagram',
        image: 'images/social/instagram.png',
        link: ''
      },
      {
        title: 'Pinterest',
        image: 'images/social/pinterest.png',
        link: ''
      },
      {
        title: 'Mail',
        image: 'images/social/mail.png',
        link: ''
      }
    ];
    $scope.scrolTop = function () {
      window.scrollTo(0, 0);
    };
  }
]);
'use strict';
angular.module('nat').factory('workServ', [
  '$http',
  '$q',
  function ($http, $q) {
    return {
      getCategories: function (workId) {
        var deferred = $q.defer();
        $http.get('data/' + workId + '.json').success(function (data, status, header, config) {
          deferred.resolve(data);
        }).error(function (data, status, header, config) {
          deferred.reject(status);
        });
        return deferred.promise;
      },
      getSingels: function (workId) {
        var deferred = $q.defer();
        $http.get('data/single/' + workId + '.json').success(function (data, status, header, config) {
          deferred.resolve(data);
        }).error(function (data, status, header, config) {
          deferred.reject(status);
        });
        return deferred.promise;
      }
    };
  }
]);
angular.module('nat').directive('carouselDrct', function () {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      var slider = {
          el: {
            slider: $(element),
            allSlides: $('.slide'),
            sliderNav: $('.left-arrow'),
            allNavButtons: $('.slider-nav > a')
          },
          timing: 800,
          slideWidth: 300,
          init: function () {
            console.log('init');
            this.el.slider.on('scroll', function (event) {
              slider.moveSlidePosition(event);
            });
            this.el.sliderNav.on('click', 'a', function (event) {
              slider.handleNavClick(event, this);
            });
          },
          moveSlidePosition: function (event) {
            this.el.allSlides.css({ 'background-position': $(event.target).scrollLeft() / 6 - 100 + 'px 0' });
          },
          handleNavClick: function (event, el) {
            event.preventDefault();
            var position = $(el).attr('href').split('-').pop();
            this.el.slider.animate({ scrollLeft: position * this.slideWidth }, this.timing);
            this.changeActiveNav(el);
          },
          changeActiveNav: function (el) {
            this.el.allNavButtons.removeClass('active');
            $(el).addClass('active');
          }
        };
      console.log('-------------------');
      slider.init();
    }
  };
});