"use strict";var nat=angular.module("nat",["ngResource","angular-carousel"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/catView.html",controller:"mainCtrl"}).when("/:categoryId",{templateUrl:"views/catView.html",controller:"categoryCtrl"}).when("/single/:singleId",{templateUrl:"views/singleView.html",controller:"singleCtrl"}).when("/about-me",{templateUrl:"views/aboutView.html",controller:"aboutCtrl"}).otherwise({redirectTo:"/"})}]);angular.module("nat").controller("mainCtrl",["$scope","workServ",function(a,b){a.works=b.getCategories("selected-work")}]),angular.module("nat").controller("categoryCtrl",["$scope","$routeParams","workServ",function(a,b,c){a.works=c.getCategories(b.categoryId)}]),angular.module("nat").controller("singleCtrl",["$scope","$routeParams","workServ",function(a,b,c){a.singles=c.getSingels(b.singleId),a.currentSlide=0}]),angular.module("nat").controller("navCtrl",["$scope",function(a){a.items=[{fisrtLine:"PRESENTATIONS",secodLine:"& ARTICLES",categoryId:"presentations&articles"},{fisrtLine:"COMMERCIAL",secodLine:"WORK",categoryId:"comercial-work"},{fisrtLine:"EXPERIMENTAL",secodLine:"PROJECTS",categoryId:"expirimental-projects"},{fisrtLine:"ABOUT",secodLine:"ME",categoryId:"about-me"}]}]),angular.module("nat").controller("aboutCtrl",["$scope",function(){}]),angular.module("nat").controller("footerCtrl",["$scope",function(a){a.socials=[{title:"Facebook",image:"../images/social/facebook.png",link:""},{title:"Linkedin",image:"../images/social/linkedin.png",link:""},{title:"Instagram",image:"../images/social/instagram.png",link:""},{title:"Pinterest",image:"../images/social/pinterest.png",link:""},{title:"Mail",image:"../images/social/mail.png",link:""}],a.scrolTop=function(){window.scrollTo(0,0)}}]),angular.module("nat").factory("workServ",["$http","$q",function(a,b){return{getCategories:function(c){var d=b.defer();return a.get("data/"+c+".json").success(function(a){d.resolve(a)}).error(function(a,b){d.reject(b)}),d.promise},getSingels:function(c){var d=b.defer();return a.get("data/single/"+c+".json").success(function(a){d.resolve(a)}).error(function(a,b){d.reject(b)}),d.promise}}}]),angular.module("nat").directive("carouselDrct",function(){return{restrict:"A",link:function(a,b){var c={el:{slider:$(b),allSlides:$(".slide"),sliderNav:$(".left-arrow"),allNavButtons:$(".slider-nav > a")},timing:800,slideWidth:300,init:function(){console.log("init"),this.el.slider.on("scroll",function(a){c.moveSlidePosition(a)}),this.el.sliderNav.on("click","a",function(a){c.handleNavClick(a,this)})},moveSlidePosition:function(a){this.el.allSlides.css({"background-position":$(a.target).scrollLeft()/6-100+"px 0"})},handleNavClick:function(a,b){a.preventDefault();var c=$(b).attr("href").split("-").pop();this.el.slider.animate({scrollLeft:c*this.slideWidth},this.timing),this.changeActiveNav(b)},changeActiveNav:function(a){this.el.allNavButtons.removeClass("active"),$(a).addClass("active")}};console.log("-------------------"),c.init()}}});