(function (window, angular, undefined) {
  'use strict';
  var ngMobile = angular.module('ngMobile', []);
  ngMobile.factory('$swipe', [function () {
      var MOVE_BUFFER_RADIUS = 10;
      var totalX, totalY;
      var startCoords;
      var lastPos;
      var active = false;
      function getCoordinates(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var e = event.changedTouches && event.changedTouches[0] || event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches[0] || touches[0].originalEvent || touches[0];
        return {
          x: e.clientX,
          y: e.clientY
        };
      }
      return {
        bind: function (element, events) {
          element.bind('touchstart mousedown', function (event) {
            startCoords = getCoordinates(event);
            active = true;
            totalX = 0;
            totalY = 0;
            lastPos = startCoords;
            events['start'] && events['start'](startCoords);
          });
          element.bind('touchcancel', function (event) {
            active = false;
            events['cancel'] && events['cancel']();
          });
          element.bind('touchmove mousemove', function (event) {
            if (!active)
              return;
            if (!startCoords)
              return;
            var coords = getCoordinates(event);
            totalX += Math.abs(coords.x - lastPos.x);
            totalY += Math.abs(coords.y - lastPos.y);
            lastPos = coords;
            if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
              return;
            }
            if (totalY > totalX) {
              active = false;
              return;
            } else {
              event.preventDefault();
              events['move'] && events['move'](coords);
            }
          });
          element.bind('touchend mouseup', function (event) {
            if (!active)
              return;
            active = false;
            events['end'] && events['end'](getCoordinates(event));
          });
        }
      };
    }]);
  ngMobile.config([
    '$provide',
    function ($provide) {
      $provide.decorator('ngClickDirective', [
        '$delegate',
        function ($delegate) {
          $delegate.shift();
          return $delegate;
        }
      ]);
    }
  ]);
  ngMobile.directive('ngClick', [
    '$parse',
    '$timeout',
    '$rootElement',
    function ($parse, $timeout, $rootElement) {
      var TAP_DURATION = 750;
      var MOVE_TOLERANCE = 12;
      var PREVENT_DURATION = 2500;
      var CLICKBUSTER_THRESHOLD = 25;
      var lastPreventedTime;
      var touchCoordinates;
      function hit(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
      }
      function checkAllowableRegions(touchCoordinates, x, y) {
        for (var i = 0; i < touchCoordinates.length; i += 2) {
          if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y)) {
            touchCoordinates.splice(i, i + 2);
            return true;
          }
        }
        return false;
      }
      function onClick(event) {
        if (Date.now() - lastPreventedTime > PREVENT_DURATION) {
          return;
        }
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        if (x < 1 && y < 1) {
          return;
        }
        if (checkAllowableRegions(touchCoordinates, x, y)) {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
      }
      function onTouchStart(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        touchCoordinates.push(x, y);
        $timeout(function () {
          for (var i = 0; i < touchCoordinates.length; i += 2) {
            if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y) {
              touchCoordinates.splice(i, i + 2);
              return;
            }
          }
        }, PREVENT_DURATION, false);
      }
      function preventGhostClick(x, y) {
        if (!touchCoordinates) {
          $rootElement[0].addEventListener('click', onClick, true);
          $rootElement[0].addEventListener('touchstart', onTouchStart, true);
          touchCoordinates = [];
        }
        lastPreventedTime = Date.now();
        checkAllowableRegions(touchCoordinates, x, y);
      }
      return function (scope, element, attr) {
        var clickHandler = $parse(attr.ngClick), tapping = false, tapElement, startTime, touchStartX, touchStartY;
        function resetState() {
          tapping = false;
        }
        element.bind('touchstart', function (event) {
          tapping = true;
          tapElement = event.target ? event.target : event.srcElement;
          if (tapElement.nodeType == 3) {
            tapElement = tapElement.parentNode;
          }
          startTime = Date.now();
          var touches = event.touches && event.touches.length ? event.touches : [event];
          var e = touches[0].originalEvent || touches[0];
          touchStartX = e.clientX;
          touchStartY = e.clientY;
        });
        element.bind('touchmove', function (event) {
          resetState();
        });
        element.bind('touchcancel', function (event) {
          resetState();
        });
        element.bind('touchend', function (event) {
          var diff = Date.now() - startTime;
          var touches = event.changedTouches && event.changedTouches.length ? event.changedTouches : event.touches && event.touches.length ? event.touches : [event];
          var e = touches[0].originalEvent || touches[0];
          var x = e.clientX;
          var y = e.clientY;
          var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));
          if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
            preventGhostClick(x, y);
            if (tapElement) {
              tapElement.blur();
            }
            scope.$apply(function () {
              clickHandler(scope, { $event: event });
            });
          }
          tapping = false;
        });
        element.onclick = function (event) {
        };
        element.bind('click', function (event) {
          scope.$apply(function () {
            clickHandler(scope, { $event: event });
          });
        });
      };
    }
  ]);
  function makeSwipeDirective(directiveName, direction) {
    ngMobile.directive(directiveName, [
      '$parse',
      '$swipe',
      function ($parse, $swipe) {
        var MAX_VERTICAL_DISTANCE = 75;
        var MAX_VERTICAL_RATIO = 0.3;
        var MIN_HORIZONTAL_DISTANCE = 30;
        return function (scope, element, attr) {
          var swipeHandler = $parse(attr[directiveName]);
          var startCoords, valid;
          function validSwipe(coords) {
            if (!startCoords)
              return false;
            var deltaY = Math.abs(coords.y - startCoords.y);
            var deltaX = (coords.x - startCoords.x) * direction;
            return valid && deltaY < MAX_VERTICAL_DISTANCE && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && deltaY / deltaX < MAX_VERTICAL_RATIO;
          }
          $swipe.bind(element, {
            'start': function (coords) {
              startCoords = coords;
              valid = true;
            },
            'cancel': function () {
              valid = false;
            },
            'end': function (coords) {
              if (validSwipe(coords)) {
                scope.$apply(function () {
                  swipeHandler(scope);
                });
              }
            }
          });
        };
      }
    ]);
  }
  makeSwipeDirective('ngSwipeLeft', -1);
  makeSwipeDirective('ngSwipeRight', 1);
}(window, window.angular));
angular.module('angular-carousel', ['ngMobile']);
angular.module('angular-carousel').directive('rnCarouselIndicators', [function () {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        items: '=',
        index: '='
      },
      template: '<div class="rn-carousel-indicator">' + '<span ng-repeat="item in items" ng-class="{active: $index==$parent.index}">\u25cf</span>' + '</div>'
    };
  }]);
angular.module('angular-carousel').directive('rnCarouselInfinite', [
  '$parse',
  '$compile',
  function ($parse, $compile) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: true,
      template: '<ul rn-carousel rn-carousel-buffered><li ng-transclude></li></ul>',
      compile: function (tElement, tAttrs, linker) {
        var repeatExpr = tAttrs.rnCarouselCurrent + ' in items';
        tElement.find('li').attr('ng-repeat', repeatExpr);
        return function (scope, iElement, iAttrs) {
          scope.items = [$parse(iAttrs.rnCarouselCurrent)(scope)];
          scope.$watchCollection('carouselCollection.position', function (newValue) {
            $parse(iAttrs.rnCarouselCurrent).assign(scope.$parent, scope.items[newValue]);
          });
        };
      }
    };
  }
]);
angular.module('angular-carousel').directive('rnCarousel', [
  '$compile',
  '$parse',
  '$swipe',
  '$document',
  '$window',
  'CollectionManager',
  function ($compile, $parse, $swipe, $document, $window, CollectionManager) {
    var carousels = 0;
    return {
      restrict: 'A',
      scope: true,
      compile: function (tElement, tAttrs) {
        tElement.addClass('rn-carousel-slides');
        var liAttributes = tElement.find('li')[0].attributes, repeatAttribute = liAttributes['ng-repeat'], isBuffered = false, originalCollection, fakeArray;
        if (!repeatAttribute)
          repeatAttribute = liAttributes['data-ng-repeat'];
        if (!repeatAttribute)
          repeatAttribute = liAttributes['x-ng-repeat'];
        if (!repeatAttribute) {
          var liChilds = tElement.find('li');
          if (liChilds.length < 2) {
            throw new Error('carousel: cannot find the ngRepeat attribute OR no childNodes detected');
          }
          originalCollection = 'fakeArray';
          fakeArray = Array.prototype.slice.apply(liChilds);
        } else {
          var exprMatch = repeatAttribute.value.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/), originalItem = exprMatch[1], trackProperty = exprMatch[3] || '';
          originalCollection = exprMatch[2];
          isBuffered = angular.isDefined(tAttrs['rnCarouselBuffered']);
          repeatAttribute.value = originalItem + ' in carouselCollection.cards ' + trackProperty;
        }
        return function (scope, iElement, iAttrs, controller) {
          carousels++;
          var carouselId = 'rn-carousel-' + carousels, swiping = 0, startX = 0, startOffset = 0, offset = 0, minSwipePercentage = 0.1, containerWidth = 0, skipAnimation = true;
          var carousel = iElement.wrap('<div id=\'' + carouselId + '\' class=\'rn-carousel-container\'></div>'), container = carousel.parent();
          if (fakeArray) {
            scope.fakeArray = fakeArray;
          }
          function getTransformCoordinates(el) {
            var results = angular.element(el).css('transform').match(/translate3d\((-?\d+(?:px)?),\s*(-?\d+(?:px)?),\s*(-?\d+(?:px)?)\)/);
            if (!results)
              return [
                0,
                0,
                0
              ];
            return results.slice(1, 3);
          }
          function transitionEndCallback(event) {
            if (event.target && event.target === carousel[0] && (event.propertyName === 'transform' || event.propertyName === '-webkit-transform' || event.propertyName === '-moz-transform')) {
              scope.$apply(function () {
                checkEdges();
                scope.carouselCollection.adjustBuffer();
                updateSlidePosition(true);
              });
              carousel.css(translateSlideProperty(getTransformCoordinates(carousel[0]), true));
            }
          }
          function updateSlides(method, items) {
            function cb() {
              skipAnimation = true;
              scope.carouselCollection[method](items, true);
            }
            if (!scope.$$phase) {
              scope.$apply(cb);
            } else {
              cb();
            }
          }
          function addSlides(position, items) {
            var method = position === 'after' ? 'push' : 'unshift';
            if (items) {
              if (angular.isObject(items.promise)) {
                items.promise.then(function (items) {
                  if (items) {
                    updateSlides(method, items);
                  }
                });
              } else if (angular.isFunction(items.then)) {
                items.then(function (items) {
                  if (items) {
                    updateSlides(method, items);
                  }
                });
              } else {
                updateSlides(method, items);
              }
            }
          }
          function checkEdges() {
            var position = scope.carouselCollection.position, lastIndex = scope.carouselCollection.getLastIndex(), slides = null;
            if (position === 0 && angular.isDefined(iAttrs.rnCarouselPrev)) {
              slides = $parse(iAttrs.rnCarouselPrev)(scope, { item: scope.carouselCollection.cards[0] });
              addSlides('before', slides);
            }
            if (position === lastIndex && angular.isDefined(iAttrs.rnCarouselNext)) {
              slides = $parse(iAttrs.rnCarouselNext)(scope, { item: scope.carouselCollection.cards[scope.carouselCollection.cards.length - 1] });
              addSlides('after', slides);
            }
          }
          var collectionModel = $parse(originalCollection);
          var collectionParams = {};
          var initialIndex = 0;
          if (iAttrs.rnCarouselIndex) {
            var indexModel = $parse(iAttrs.rnCarouselIndex);
            if (angular.isFunction(indexModel.assign)) {
              scope.$watch('carouselCollection.index', function (newValue) {
                indexModel.assign(scope.$parent, newValue);
              });
              initialIndex = indexModel(scope);
              scope.$parent.$watch(indexModel, function (newValue, oldValue) {
                if (newValue !== undefined) {
                  scope.carouselCollection.goToIndex(newValue, true);
                }
              });
            } else if (!isNaN(iAttrs.rnCarouselIndex)) {
              initialIndex = parseInt(iAttrs.rnCarouselIndex, 10);
            }
          }
          if (angular.isDefined(iAttrs.rnCarouselCycle)) {
            collectionParams.cycle = true;
          }
          collectionParams.index = initialIndex;
          if (isBuffered) {
            collectionParams.bufferSize = 3;
            collectionParams.buffered = true;
          }
          scope.carouselCollection = CollectionManager.create(collectionParams);
          scope.$watch('carouselCollection.updated', function (newValue, oldValue) {
            if (newValue)
              updateSlidePosition();
          });
          var collectionReady = false;
          scope.$watch(collectionModel, function (newValue, oldValue) {
            scope.carouselCollection.setItems(newValue, collectionReady);
            collectionReady = true;
            if (containerWidth === 0)
              updateContainerWidth();
            updateSlidePosition();
          });
          if (angular.isDefined(iAttrs.rnCarouselWatch)) {
            scope.$watch(originalCollection, function (newValue, oldValue) {
              scope.carouselCollection.setItems(newValue, false);
              collectionReady = true;
              if (containerWidth === 0)
                updateContainerWidth();
              updateSlidePosition();
            }, true);
          }
          var vendorPrefixes = [
              'webkit',
              'moz'
            ];
          function genCSSProperties(property, value) {
            var css = {};
            css[property] = value;
            angular.forEach(vendorPrefixes, function (prefix, idx) {
              css['-' + prefix.toLowerCase() + '-' + property] = value;
            });
            return css;
          }
          function translateSlideProperty(offset, is3d) {
            if (is3d) {
              return genCSSProperties('transform', 'translate3d(' + offset + 'px,0,0)');
            } else {
              return genCSSProperties('transform', 'translate(' + offset + 'px,0)');
            }
          }
          carousel[0].addEventListener('webkitTransitionEnd', transitionEndCallback, false);
          carousel[0].addEventListener('transitionend', transitionEndCallback, false);
          window.addEventListener('orientationchange', resize);
          window.addEventListener('resize', resize);
          function resize() {
            updateContainerWidth();
            updateSlidePosition();
          }
          function updateContainerWidth() {
            container.css('width', 'auto');
            skipAnimation = true;
            var slides = carousel.find('li');
            if (slides.length === 0) {
              containerWidth = carousel[0].getBoundingClientRect().width;
            } else {
              containerWidth = slides[0].getBoundingClientRect().width;
            }
            container.css('width', containerWidth + 'px');
            return containerWidth;
          }
          if (angular.isDefined(iAttrs.rnCarouselIndicator)) {
            var indicator = $compile('<div id=\'' + carouselId + '-indicator\' index=\'carouselCollection.index\' items=\'carouselCollection.items\' data-rn-carousel-indicators class=\'rn-carousel-indicator\'></div>')(scope);
            container.append(indicator);
          }
          function updateSlidePosition(forceSkipAnimation) {
            skipAnimation = !!forceSkipAnimation || skipAnimation;
            if (containerWidth === 0)
              updateContainerWidth();
            offset = scope.carouselCollection.getRelativeIndex() * -containerWidth;
            if (skipAnimation === true) {
              carousel.removeClass('rn-carousel-animate').addClass('rn-carousel-noanimate').css(translateSlideProperty(offset, false));
            } else {
              carousel.removeClass('rn-carousel-noanimate').addClass('rn-carousel-animate').css(translateSlideProperty(offset, true));
            }
            skipAnimation = false;
          }
          function swipeEnd(coords) {
            $document.unbind('mouseup', documentMouseUpEvent);
            if (containerWidth === 0)
              updateContainerWidth();
            if (swiping > 1) {
              var lastIndex = scope.carouselCollection.getLastIndex(), position = scope.carouselCollection.position, slideOffset = offset < startOffset ? 1 : -1, tmpSlideIndex = Math.min(Math.max(0, position + slideOffset), lastIndex);
              var delta = coords.x - startX;
              if (Math.abs(delta) <= containerWidth * minSwipePercentage) {
                tmpSlideIndex = position;
              }
              var changed = position !== tmpSlideIndex;
              if (!changed) {
                scope.$apply(function () {
                  updateSlidePosition();
                });
              } else {
                scope.$apply(function () {
                  if (angular.isDefined(iAttrs.rnCarouselCycle)) {
                    scope.carouselCollection.position = tmpSlideIndex;
                    updateSlidePosition();
                  }
                  scope.carouselCollection.goTo(tmpSlideIndex, true);
                });
              }
            }
            swiping = 0;
          }
          function documentMouseUpEvent(event) {
            swipeEnd({
              x: event.clientX,
              y: event.clientY
            });
          }
          var lastMove = null, moveDelay = $window.jasmine || $window.navigator.platform == 'iPad' ? 0 : 50;
          $swipe.bind(carousel, {
            start: function (coords) {
              if (swiping === 0) {
                swiping = 1;
                startX = coords.x;
              }
              $document.bind('mouseup', documentMouseUpEvent);
            },
            move: function (coords) {
              if (swiping === 0)
                return;
              var deltaX = coords.x - startX;
              if (swiping === 1 && deltaX !== 0) {
                swiping = 2;
                startOffset = offset;
              } else if (swiping === 2) {
                var now = new Date().getTime();
                if (lastMove && now - lastMove < moveDelay)
                  return;
                lastMove = now;
                var lastIndex = scope.carouselCollection.getLastIndex(), position = scope.carouselCollection.position;
                var ratio = 1;
                if (position === 0 && coords.x > startX || position === lastIndex && coords.x < startX)
                  ratio = 3;
                offset = startOffset + deltaX / ratio;
                carousel.css(translateSlideProperty(offset, true)).removeClass('rn-carousel-animate').addClass('rn-carousel-noanimate');
              }
            },
            end: function (coords) {
              swipeEnd(coords);
            }
          });
        };
      }
    };
  }
]);
angular.module('angular-carousel').service('CollectionManager', [function () {
    function CollectionManager(options) {
      var initial = {
          bufferSize: 0,
          bufferStart: 0,
          buffered: false,
          cycle: false,
          cycleOffset: 0,
          index: 0,
          position: 0,
          items: [],
          cards: [],
          updated: null,
          debug: false
        };
      var i;
      if (options)
        for (i in options)
          initial[i] = options[i];
      for (i in initial)
        this[i] = initial[i];
      angular.extend(this, initial, options);
      this.init();
    }
    CollectionManager.prototype.log = function () {
      if (this.debug) {
        console.log.apply(console, arguments);
      }
    };
    CollectionManager.prototype.getPositionFromIndex = function (index) {
      return (index + this.cycleOffset) % this.length();
    };
    CollectionManager.prototype.goToIndex = function (index, delayedUpdate) {
      index = Math.max(0, Math.min(index, this.getLastIndex()));
      if (this.updated && index === this.index) {
        this.log('skip position change(same)');
        return false;
      }
      var position = this.getPositionFromIndex(index);
      return this.goTo(position, delayedUpdate);
    };
    CollectionManager.prototype.goTo = function (position, delayedUpdate) {
      this.log('goto start', position, delayedUpdate);
      if (this.length() === 0) {
        this.log('empty, skip gotoIndex');
        return;
      }
      position = Math.max(0, Math.min(position, this.getLastIndex()));
      var cycled = false;
      if (this.cycle) {
        if (position === 0) {
          this.log('cycleAtBeginning', position);
          this.cycleAtBeginning();
          position = 1;
          this.cycleOffset++;
          cycled = true;
        } else if (position === this.getLastIndex()) {
          this.log('cycleAtEnd', position);
          this.cycleAtEnd();
          position--;
          this.cycleOffset--;
          cycled = true;
        }
        this.cycleOffset %= this.length();
      }
      this.position = Math.max(0, Math.min(position, this.getLastIndex()));
      var realIndex = (this.position - this.cycleOffset + this.length()) % this.length();
      this.index = Math.max(0, Math.min(realIndex, this.getLastIndex()));
      if (!delayedUpdate) {
        this.adjustBuffer();
      }
      if (!cycled)
        this.updated = new Date();
    };
    CollectionManager.prototype.next = function () {
      if (this.cycle) {
        this.goTo((this.position + 1) % this.length());
      } else {
        this.goTo(Math.min(this.position + 1, this.getLastIndex()));
      }
    };
    CollectionManager.prototype.prev = function () {
      if (this.cycle) {
        this.goTo((this.position - 1 + this.length()) % this.length());
      } else {
        var prevIndex = this.length() > 0 ? Math.max(0, (this.position - 1) % this.length()) : 0;
        this.goTo(prevIndex);
      }
    };
    CollectionManager.prototype.setBufferSize = function (length) {
      this.log('setBufferSize', length);
      this.bufferSize = length;
      this.adjustBuffer();
    };
    CollectionManager.prototype.isBuffered = function () {
      return this.buffered;
    };
    CollectionManager.prototype.getRelativeIndex = function () {
      var relativeIndex = Math.max(0, Math.min(this.getLastIndex(), this.position - this.bufferStart));
      return relativeIndex;
    };
    CollectionManager.prototype.adjustBuffer = function () {
      var maxBufferStart = (this.getLastIndex() + 1 - this.bufferSize) % this.length();
      this.log('maxBufferStart', maxBufferStart);
      this.bufferStart = Math.max(0, Math.min(maxBufferStart, this.position - 1));
      this.cards = this.items.slice(this.bufferStart, this.bufferStart + this.bufferSize);
      this.log('adjustBuffer from', this.bufferStart, 'to', this.bufferStart + this.bufferSize);
    };
    CollectionManager.prototype.length = function () {
      return this.items.length;
    };
    CollectionManager.prototype.getLastIndex = function () {
      var lastIndex = Math.max(0, this.length() - 1);
      return lastIndex;
    };
    CollectionManager.prototype.init = function () {
      this.setBufferSize(this.isBuffered() ? this.bufferSize : this.length());
      if (this.length() > 0)
        this.goToIndex(this.index);
    };
    CollectionManager.prototype.setItems = function (items, reset) {
      this.log('setItems', items, reset);
      if (reset) {
        this.index = 0;
        this.position = 0;
      }
      this.items = items || [];
      this.init();
    };
    CollectionManager.prototype.cycleAtEnd = function () {
      this.push(this.items.shift());
    };
    CollectionManager.prototype.push = function (slide, updateIndex) {
      this.log('push item(s)', slide, updateIndex);
      this.items.push(slide);
      if (updateIndex) {
        this.adjustBuffer();
        this.updated = new Date();
      }
      if (!this.buffered) {
        this.bufferSize++;
      }
    };
    CollectionManager.prototype.unshift = function (slide, updateIndex) {
      this.log('unshift item(s)', slide, updateIndex);
      this.items.unshift(slide);
      if (!this.buffered) {
        this.bufferSize++;
      }
      if (updateIndex) {
        this.position++;
        this.adjustBuffer();
        this.updated = new Date();
      }
    };
    CollectionManager.prototype.cycleAtBeginning = function () {
      this.unshift(this.items.pop());
    };
    return {
      create: function (options) {
        return new CollectionManager(options);
      }
    };
  }]);