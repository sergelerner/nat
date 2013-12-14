'use strict';

angular.module('nat').controller('footerCtrl', function ($scope) {

	$scope.socials = [
		{
			title: "Facebook",
			image: "../images/social/facebook.png",
			link : ""
		},
		{
			title: "Linkedin",
			image: "../images/social/linkedin.png",
			link : ""
		},
		{
			title: "Instagram",
			image: "../images/social/instagram.png",
			link : ""
		},
		{
			title: "Pinterest",
			image: "../images/social/pinterest.png",
			link : ""
		},
		{
			title: "Mail",
			image: "../images/social/mail.png",
			link : ""
		}
	];

	$scope.scrolTop = function() {
		window.scrollTo(0,0);
	}
});
