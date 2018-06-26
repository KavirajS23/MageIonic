angular.module('starter')
.directive('actualSrc', function () {
	return {
		link: function postLink(scope, element, attrs) {
			attrs.$observe('actualSrc', function(newVal){
				 if(newVal !== undefined){
					 var img = new Image();
					 img.src = attrs.actualSrc;
					 angular.element(img).bind('load', function () {
						 element.attr("src", attrs.actualSrc);
					 });
				 }
			});

		}
	};
})
.directive('date', function ($filter) {
	return {
		link: function postLink(scope, element, attrs) {
			element.text($filter('date')(attrs.date, "MMM d, yyyy"));
		}
	};
})
.directive('price', function (AppService) {
	return {
		scope: {
            price: "@"
        },
		link: function postLink(scope, element, attrs) {
			scope.$watch('price', function(newValue, oldValue) {
				if (newValue !== oldValue) {
					var appSetting = AppService.getAppSetting();
					var attrsPrice = Number(attrs.price).toFixed(appSetting.number_decimals);
					attrsPrice = attrsPrice.split('.');
					attrsPrice[0] = attrsPrice[0].split("");
					attrsPrice[0] = attrsPrice[0].reverse();
					var newNumber = []; //thousand_separator
					for(var i = 0; i < attrsPrice[0].length; i++){
						newNumber.push(attrsPrice[0][i]);
						if((i+1) < attrsPrice[0].length && (i + 1)%3 === 0) {
							newNumber.push(appSetting.thousand_separator);
						}
					}
					newNumber = newNumber.reverse();
					attrsPrice[0] = newNumber.join("");
					attrsPrice = attrsPrice.join(appSetting.decimal_separator);
					var price = appSetting.samplePriceHtml.replace(appSetting.samplePrice, attrsPrice);
					element.html(price);
				}
			}, true);
			var appSetting = AppService.getAppSetting();
			var attrsPrice = Number(attrs.price).toFixed(appSetting.number_decimals);
			attrsPrice = attrsPrice.split('.');
			attrsPrice[0] = attrsPrice[0].split("");
			attrsPrice[0] = attrsPrice[0].reverse();
			var newNumber = []; //thousand_separator
			for(var i = 0; i < attrsPrice[0].length; i++){
				newNumber.push(attrsPrice[0][i]);
				if((i+1) < attrsPrice[0].length && (i + 1)%3 === 0) {
					newNumber.push(appSetting.thousand_separator);
				}
			}
			newNumber = newNumber.reverse();
			attrsPrice[0] = newNumber.join("");
			attrsPrice = attrsPrice.join(appSetting.decimal_separator);
			var price = appSetting.samplePriceHtml.replace(appSetting.samplePrice, attrsPrice);
			element.html(price);
		}
	};
})
.directive('hideTabs', function($rootScope, $ionicHistory) {
	var stateViews = [];
  	return {
      	link: function(scope, $el) {
          	$rootScope.hideTabs = 'tabs-item-hide';
			if(stateViews.indexOf($ionicHistory.currentStateName()) < 0) {
				stateViews.push($ionicHistory.currentStateName());
			}
          	scope.$on('$destroy', function() {
				if(stateViews.indexOf($ionicHistory.currentStateName()) < 0){
					$rootScope.hideTabs = '';
				}
	        });
		}
  	};
})
;
