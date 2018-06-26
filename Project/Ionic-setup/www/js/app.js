// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.cloud', 'starter.controllers', 'starter.services', 'ngMap', 'auth0.auth0', 'auth0.lock', 'angular-jwt'])
.config(function($ionicCloudProvider, angularAuth0Provider, appConfig) {
  $ionicCloudProvider.init({
    "core": {
      "app_id": "f2b4b1a8"
    },
	"push": {
      "sender_id": "130749830575",
      "pluginConfig": {
        "ios": {
          "badge": true,
          "sound": true
        },
        "android": {
          "iconColor": "#343434"
        }
      }
    }
  });
  // Initialization for the angular-auth0 library
    angularAuth0Provider.init({
      clientID: appConfig.CLIENT_ID_AUTH0,
      domain: appConfig.DOMAIN_AUTH0
    });
})
.run(function($ionicPlatform, $ionicPopup, $rootScope, AppService, appConfig, $injector, AuthService) {
  $ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
		  // org.apache.cordova.statusbar required
		  StatusBar.styleDefault();
		}
		try {
			if(appConfig.ENABLE_PUSH_PLUGIN) {
				var NotificationService = $injector.get('NotificationService');
				NotificationService.init();
			}
		}
		catch(err) {
			$ionicPopup.alert({
				title: $rootScope.appLanguage.MESSAGE_TEXT,
				template: 'Push Notification plugin not found'
			});
		}
                // Use the authManager from angular-jwt to check for
                // the user's authentication state when the page is
                // refreshed and maintain authentication
                AuthService.checkAuthOnRefresh();

                // Process the auth token if it exists and fetch the profile
                AuthService.authenticateAndGetProfile();
	});
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, appConfig) {

  $ionicConfigProvider.platform.android.tabs.position('bottom');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    controller: 'AppCtrl',
    templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tabs.html'
  })
  
  .state('tab.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  
  .state('tab.categories', {
    url: '/categories/:categoryId',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-categories.html',
        controller: 'CategoriesCtrl'
      }
    }
  })
  .state('tab.promotions', {
    url: '/promotions',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-promotions.html',
        controller: 'HomeCtrl'
      }
    }
  })
  
  .state('tab.category', {
    url: '/category/:categoryId',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-category.html',
        controller: 'SingleCategoryCtrl'
      }
    }
  })
  
  .state('tab.wishlist', {
    url: '/wishlist',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-wishlist.html',
        controller: 'WishlistCtrl'
      }
    }
  })
  
  .state('tab.product', {
    url: '/product/:productId',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-product.html',
        controller: 'ProductCtrl'
      }
    }
  })
  
  .state('tab.search', {
    url: '/search',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-search.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('tab.blog', {
    url: '/blog',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-blog.html',
        controller: 'BlogCtrl'
      }
    }
  })

  .state('tab.blog-category', {
    url: '/blog-category/:categoryId',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-blog-category.html',
        controller: 'BlogCategoryCtrl'
      }
    }
  })

  .state('tab.blog-single', {
    url: '/blog/:blogId',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-blog-single.html',
        controller: 'SingleBlogCtrl'
      }
    }
  })
  
  .state('tab.cart', {
    url: '/cart',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-cart.html',
        controller: 'CartCtrl'
      }
    }
  })
  
  .state('tab.notification', {
    url: '/notification',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-notification.html',
        controller: 'NotificationCtrl'
      }
    }
  })

  .state('tab.orders', {
    url: '/orders',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-orders.html',
        controller: 'OrdersCtrl'
      }
    }
  })

  .state('tab.order', {
    url: '/order/:orderId',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-order.html',
        controller: 'OrderDetailCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })
  
  .state('tab.contactus', {
    url: '/contactus',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-contactus.html',
        controller: 'ContactUsCtrl'
      }
    }
  })
  
  .state('tab.settings', {
    url: '/settings',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })
  
  .state('tab.language', {
    url: '/language',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/tab-language.html',
        controller: 'LanguageCtrl'
      }
    }
  })

  .state('tab.checkout', {
    url: '/checkout',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/checkout/login.html',
        controller: 'CheckoutCtrl'
      }
    }
  })

  .state('tab.checkout-billing', {
    url: '/checkout-billing',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/checkout/billing.html',
        controller: 'CheckoutBillingCtrl'
      }
    }
  })

  .state('tab.checkout-note', {
    url: '/checkout-note',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/checkout/note.html',
        controller: 'CheckoutNoteCtrl'
      }
    }
  })

  .state('tab.checkout-payment', {
    url: '/checkout-payment',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/checkout/payment.html',
        controller: 'CheckoutPaymentCtrl'
      }
    }
  })
  
  .state('tab.checkout-success', {
    url: '/checkout-success',
    views: {
      'mainContent': {
        templateUrl: 'templates/'+appConfig.ENABLE_THEME+'/checkout/success.html',
        controller: 'CheckoutSuccessCtrl'
      }
    }
  })
  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
