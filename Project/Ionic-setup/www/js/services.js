angular.module('starter.services', [])

.factory('AppService', function($state, $ionicLoading, $http, $rootScope, $ionicPopup, appConfig, appValue) {
  	var appSetting = {'thousand_separator': ',', 'decimal_separator': '.', 'number_decimals': 2};
	var listCountry = [];
	var hasNotification = false;
	var disableApp = false;
  	return {
		getDisableApp: function() {
			return disableApp;
		},
		getListCountry: function() {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=list_countries'
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					listCountry = response.data.data;
					return listCountry;
				}
				else {
					return listCountry;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
			})
			;
		},
	    updateAppSetting: function() {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			var deviceToken = window.localStorage.getItem("deviceToken");;
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'settings?&token=' + deviceToken
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					appSetting = response.data.data;
					if(appSetting.disable_app && appSetting.disable_app === "1"){
						$ionicPopup.alert({
							title: $rootScope.appLanguage.MAINTAIN_TEXT,
							template: appSetting.disable_app_message
						});
						disableApp = true;
					}
					window.localStorage.setItem("appSetting", JSON.stringify(appSetting));
					return appSetting;
				}
				else {
					window.localStorage.setItem("appSetting", JSON.stringify(appSetting));
					return appSetting;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
			})
			;
	    },
		getAppSetting: function() {
			if(window.localStorage.getItem("appSetting")){
				return  JSON.parse(window.localStorage.getItem("appSetting"));
			}
			else {
				return {};
			}
		}
  	};
})

.factory('AuthService', function($rootScope, angularAuth0, authManager, jwtHelper, $ionicPopup, $http, appValue, appConfig, $ionicLoading){
            var userProfile = JSON.parse(localStorage.getItem('profile')) || {};
            var pageScopeObject = "";
            return {

                    loginWithGoogle : function ($pageScopeObject) {
                        $ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
                        pageScopeObject = $pageScopeObject;
                        var thisObject = this;
                        angularAuth0.login({
                          connection: 'google-oauth2',
                          responseType: 'token',
                          popup: true
                        }, function(error, authResult) {
                            thisObject.callbackAuth0LoginWithGoogle(error, authResult);
                        }, null);
                    },
                    
                    loginWithFacebook : function ($pageScopeObject) {
                        $ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
                        pageScopeObject = $pageScopeObject;
                        var thisObject = this;
                        angularAuth0.login({
                          connection: 'facebook',
                          responseType: 'token',
                          popup: true
                        }, function(error, authResult){
                            thisObject.callbackAuth0LoginWithFacebook(error, authResult);
                        }, null);
                    },

                    authenticateAndGetProfile : function () {
                        var result = angularAuth0.parseHash(window.location.hash);

                        if (result && result.idToken) {
                          callbackAuth0LoginWithGoogle(null, result);
                        } else if (result && result.error) {
                          callbackAuth0LoginWithGoogle(result.error);
                        }
                    },
                    requestLoginWithSocial : function(profileData, platform) {
                        return $http({
                                    method: 'POST',
                                    url: appConfig.DOMAIN_URL + appValue.API_URL + 'users?&task=loginSocial&socialPlatform=' + platform,
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                    transformRequest: function(obj) {
                                            var str = [];
                                            for(var p in obj)
                                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                            return str.join("&");
                                    },
                                    data: profileData
                            })
                            .then(function(response) {
                                $ionicLoading.hide();
                                    // handle success things
                                    if(response.data.status === appValue.API_SUCCESS){
                                            window.localStorage.setItem("is_login", true);
                                            window.localStorage.setItem("userInfo", JSON.stringify(response.data.data));
                                            pageScopeObject.closeModalLogin();
                                    }
                                    else {
                                            $ionicPopup.alert({
                                                title: $rootScope.appLanguage.MESSAGE_TEXT,
                                                template: 'vdfvdfvdf'
                                            });
                                            return false;
                                    }
                            }, function error(response){
                                $ionicLoading.hide();
                                    $ionicPopup.alert({
                                            title: $rootScope.appLanguage.MESSAGE_TEXT,
                                            template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
                                    });
                                    return false;
                            });
                    },
                    callbackAuth0LoginWithFacebook : function (error, authResult) {
                        if (error) {
                            $ionicLoading.hide();
                          return $ionicPopup.alert({
                            title: 'Login failed!',
                            template: error
                          });
                        }
                        var loginStatus = false;
                        localStorage.setItem('id_token', authResult.idToken);
                        authManager.authenticate();
                        var thisObject = this;
                        angularAuth0.getProfile(authResult.idToken, function (error, profileData) {
                            if (error) {
                                $ionicLoading.hide();
                                return $ionicPopup.alert({
                                    title: 'Login failed!',
                                    template: error
                                });
                            }
                            localStorage.setItem('profile', JSON.stringify(profileData));
                            thisObject.requestLoginWithSocial(profileData, 'facebook');
                        });
                    },
                    callbackAuth0LoginWithGoogle : function (error, authResult) {
                        if (error) {
                            $ionicLoading.hide();
                          return $ionicPopup.alert({
                            title: 'Login failed!',
                            template: error
                          });
                        }
                        var loginStatus = false;
                        localStorage.setItem('id_token', authResult.idToken);
                        authManager.authenticate();
                        var thisObject = this;
                        angularAuth0.getProfile(authResult.idToken, function (error, profileData) {
                            if (error) {
                                $ionicLoading.hide();
                                console.log(error);
                                return $ionicPopup.alert({
                                    title: 'Login failed!',
                                    template: error
                                });
                            }
                            localStorage.setItem('profile', JSON.stringify(profileData));
                            thisObject.requestLoginWithSocial(profileData, 'google');
                        });
                    },

                    checkAuthOnRefresh : function () {
                        var token = localStorage.getItem('id_token');
                        if (token) {
                          if (!jwtHelper.isTokenExpired(token)) {
                            if (!$rootScope.isAuthenticated) {
                              authManager.authenticate();
                            }
                          }
                        }
                    }
                };
})

.factory('UserService', function($ionicLoading, $http, $ionicPopup, $rootScope, appConfig, appValue, authManager) {
  	var loginStatus = false;
  	return {
		isLoggedIn: function() {
			if(window.localStorage.getItem("is_login") !== null && window.localStorage.getItem("is_login") === 'true'){
				return true;
			}
			else {
				return false;
			}
		},
				
		logout: function() {
			window.localStorage.setItem("is_login", false);
			window.localStorage.setItem("userInfo", '');
                        window.localStorage.removeItem('id_token');
                        window.localStorage.removeItem('profile');
                        authManager.unauthenticate();
		},
				
	    login: function($loginData) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'users?&task=login',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: $loginData
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					window.localStorage.setItem("is_login", true);
					window.localStorage.setItem("userInfo", JSON.stringify(response.data.data));
					loginStatus = true;
					return loginStatus;
				}
				else {
					$ionicPopup.alert({
					    title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: response.data.message
					});
					return loginStatus;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return loginStatus;
			});
	    },
		register: function($registerData) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'users?&task=register',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: $registerData
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					window.localStorage.setItem("is_login", true);
					window.localStorage.setItem("userInfo", JSON.stringify(response.data.data));
					loginStatus = true;
					return loginStatus;
				}
				else {
					$ionicPopup.alert({
					    title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: response.data.message
					});
					return loginStatus;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return loginStatus;
			});
		},
		forgotpass: function($forgotpassData) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'users?&task=forgot',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: $forgotpassData
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: 'We sent a message to your email so you can pick your new password.'
				});
				return true;
			},function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return true;
			});
		},
		editAccount: function($editAccountFormData) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'users?&task=update',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: $editAccountFormData
			})
			.then(function(response) {
				$ionicLoading.hide();
				if(response.data.status === appValue.API_SUCCESS){
					$ionicPopup.alert({
						title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: 'Account details changed successfully'
					});
					return true;
				}
				else {
					$ionicPopup.alert({
						title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: response.data.message
					});
					return false;
				}
			},function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return false;
			});
		},
	    getUser: function() {
			if(window.localStorage.getItem("userInfo")){
				var userInfo = JSON.parse(window.localStorage.getItem("userInfo"));
				if(userInfo.billing && userInfo.billing.length === 0) {
					userInfo.billing = {"first_name":"","last_name":"","company":"","address_1":"","address_2":"","city":"","state":"","postcode":"","country":"","email":"","phone":""};
				}
				if(userInfo.shipping && userInfo.shipping.length === 0) {
					userInfo.shipping = {"first_name":"","last_name":"","company":"","address_1":"","address_2":"","city":"","state":"","postcode":"","country":"","email":"","phone":""};
				}
				return  userInfo;
			}
	    	else {
				return {
						"billing":{"first_name":"","last_name":"","company":"","address_1":"","address_2":"","city":"","state":"","postcode":"","country":"","email":"","phone":""}, 
						"shipping":{"first_name":"","last_name":"","company":"","address_1":"","address_2":"","city":"","state":"","postcode":"","country":"","email":"","phone":""},
						"email":"","first_name":"","last_name":"","username":""
				};
			}
	    },
		updateUser: function($user) {
			window.localStorage.setItem("userInfo", JSON.stringify($user));
	    },
	    getUserId: function(){
	    	var user = this.getUser();
			if(user) {
				return user.id;
			}
			else {
				return "";
			}
	    }
  	};
})

.factory('NotificationService', function($state, $ionicPopup, $rootScope, UserService) {
	return {
		saveDeviceToken: function(token) {
			window.localStorage.setItem("deviceToken", token);
		},
		getDeviceToken: function() {
			return window.localStorage.getItem("deviceToken");
		},
		doNotification: function(notification) {
			if(notification.payload.type === 'text') {
				this.textNotification(notification);
			}else if(notification.payload.type === 'order'){
				this.orderNotification(notification);
			}
		},
		textNotification: function(notification){
			window.localStorage.setItem("appNotificationPayload", JSON.stringify(notification.payload));
			if(!notification._raw.additionalData.foreground) {
				$state.go('tab.notification');
			}
			else {
				var confirmPopup = $ionicPopup.confirm({
					title: $rootScope.appLanguage.NOTIFICATION_TEXT,
					template: 'You have a new notification - go to it?'
				});
				confirmPopup.then(function(res) {
					if(res) {
						$state.go('tab.notification');
					}
				});
			}
		},
		orderNotification: function(notification){
			if(!notification._raw.additionalData.foreground) {
				$state.go('tab.orders');
			}
			else {
				var confirmPopup = $ionicPopup.confirm({
					title: $rootScope.appLanguage.NOTIFICATION_TEXT,
					template: 'You have a new notification - go to it?'
				});
				confirmPopup.then(function(res) {
					if(res) {
						$state.go('tab.orders');
					}
				});
			}
		}
  	};
})

.factory('CartService', function($ionicLoading, $rootScope, $http, appConfig, appValue) {
  
  var cartInfo = {};
  cartInfo.products = [];
  if(window.localStorage.getItem("cartInfo") && window.localStorage.getItem("cartInfo") !== "undefined") {
	  cartInfo = JSON.parse(window.localStorage.getItem("cartInfo"));
  }
  return {
	clearCart: function() {
		cartInfo = {};
		cartInfo.products = [];
		this.updateCartInfo();
		$rootScope.cartQuantity = this.getCartQuantity();
	},
    addProductToCart: function($productId, $quantity, $info) {
		var quantity = $quantity;
		var isNew = true;
		angular.forEach(cartInfo.products, function(product, key) {
			if (product[0] === $productId) {
				quantity = quantity + product[1];
				cartInfo.products[key][1] = quantity;
				isNew = false;
			}
		});
		if(isNew === true) {
			var product = [$productId, $quantity, $info];
			cartInfo.products.push(product);
		}
		this.updateCartInfo();
		
		return true;
    },
	updateCart: function($productId, $quantity) {
	  angular.forEach(cartInfo.products, function(product, key) {
		  if (product[0] === $productId) {
			  cartInfo.products[key][1] = $quantity;
			  isNew = false;
		  }
	  });

	  this.updateCartInfo();
	  return true;
	},
	removeProductFromCart: function($productId) {
		angular.forEach(cartInfo.products, function(product, key) {
			if (product[0] === $productId) {
				cartInfo.products.splice(key, 1);
			}
		});
		this.updateCartInfo();
		$rootScope.cartQuantity = this.getCartQuantity();
		return true;
    },
	getCartInfo: function() {
		return cartInfo;
	},
    getCartQuantity: function() {
		var total = 0;
		angular.forEach(cartInfo.products, function(product, key) {
			total = total + product[1];
		});
		return total;
	},
	getCartTotal: function() {
		var total = 0;
		angular.forEach(cartInfo.products, function(product, key) {
			total = total + product[2].price * product[1];
		});
		return total;
	},
	updateCartInfo: function() {
		window.localStorage.setItem("cartInfo", JSON.stringify(cartInfo));
	}
  };
})

.factory('ProductService', function( $http, $ionicPopup, $rootScope, $ionicLoading, appConfig, appValue) {
  	var listProduct = [];
  	var products = [];
  	return {
	    getProducts: function($page, $url, $isLoading) {
	    	if($isLoading){
	    		$ionicLoading.show({
					template: '<ion-spinner></ion-spinner>'
				});
	    	}
	    	var _url = appConfig.DOMAIN_URL + appValue.API_URL + 'products?&page=' + $page + '&per_page=10';
	    	if(typeof $url != "undefined"){
	    		_url += $url;
	    	}
			return $http({
				method: 'GET',
				url: _url
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					products = response.data.data;
					return products;
				}
				else {
					//handle errors
					return products;
				}
			},function error(response){
				// $ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return false;
			});
	    }
  	};
})

.factory('ListCategoryService', function($ionicLoading, $ionicPopup, $rootScope, $http, appConfig, appValue) {
  
  var listCategory = [];
  return {
    getListCategory: function() {
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>'
		});
		return $http({
			method: 'GET',
			url: appConfig.DOMAIN_URL + appValue.API_URL + 'categories?&per_page=all'
		})
		.then(function(response) {
			$ionicLoading.hide();
			// handle success things
			if (response.data.status === appValue.API_SUCCESS) {
				listCategory = response.data.data;
				return listCategory;
			}
			else {
				//handle errors
				return listCategory;
			}
		},function error(response){
			$ionicLoading.hide();
			$ionicPopup.alert({
				title: $rootScope.appLanguage.MESSAGE_TEXT,
				template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
			});
			return listCategory;
		});
    }
  };
})

.factory('ReviewsService', function($ionicLoading, $http, appConfig, appValue) {
  
  	var reviews = [];
	var submitReviewStatus = false;
  	return {
	    getProductReviews: function($productId) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'reviews?&id='+$productId
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if (response.data.status === appValue.API_SUCCESS) {
					reviews = response.data.data;
					return reviews;
				}
				else {
					//handle errors
				}
			});
	    },
		submitProductReview: function($productId, $userId, $first_name, $last_name, $email, $comment, $rating) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'reviews?&task=add',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: {
					'id': $productId,
					'user_id': $userId,
					'user_login': $first_name + ' ' + $last_name,
					'user_email': $email,
					'comment': $comment,
					'rating': $rating
				}
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					submitReviewStatus = true;
					return submitReviewStatus;
				}
				else {
					return submitReviewStatus;
				}
			});
		}
  	};
})

.factory('AnimationService', function($timeout, $ionicPosition) {
  	return {
	    action: function($id, $effect, $out) {
	    	if (typeof($out) === "undefined"){
	    		$out = 1000;
	    	}
			var element = angular.element(document.getElementById($id));
			element.addClass('animated '+$effect);
			$timeout(function(){
		        element.removeClass('animated '+$effect);
	  		},$out);
	    },
	    actionByClass: function($class, $effect, $out) {
	    	if (typeof($out) === "undefined"){
	    		$out = 1000;
	    	}
			var element = angular.element(document.getElementsByClassName($class));
			element.addClass('animated '+$effect);
			$timeout(function(){
		        element.removeClass('animated '+$effect);
	  		},$out);
	    },
		moveProductToCartAnimation: function() {
			var parentElem 			= angular.element(document.getElementById("single-product")),
			parentPosition 			= $ionicPosition.position(parentElem),
			offsetTopCart 			= 10,
			offsetLeftCart			= parentPosition.width - 65,
			imgElem 				= angular.element(document.getElementsByClassName("single-main-img")),
			imgSrc 					= imgElem.prop("src"),
			imgClone 				= angular.element('<img class="itemaddedanimate" src="' + imgSrc + '"/>');
			imgClone.css({
				'position': 'absolute',
				'top': ($ionicPosition.position(imgElem).width/2 - $ionicPosition.position(imgClone).height/2) +'px',
				'left': (parentPosition.width/2 - 75) +'px',
				'opacity': 0.5
			});

			parentElem.append(imgClone);

			$timeout(function() {
				imgClone.css({
					'width': '75px',
					'top': offsetTopCart +'px',
					'left': offsetLeftCart + 'px',
					'opacity': 0.5
				});
			}, 300);

			$timeout(function () {
				imgClone.remove();
			}, 1000);
		}
  	};
})

.factory('LayoutService', function($rootScope) {
  	
})

.factory('WishlistService', function($rootScope) {
  var wishlistInfo = {};
  wishlistInfo.products = [];
  if(window.localStorage.getItem("wishlistInfo") && window.localStorage.getItem("wishlistInfo") !== "undefined") {
	  wishlistInfo = JSON.parse(window.localStorage.getItem("wishlistInfo"));
  }
  return {
	clearWishlist: function() {
		wishlistInfo = {};
		wishlistInfo.products = [];
		this.updateWishlistInfo();
		$rootScope.wishlistQuantity = this.getWishlistQuantity();
	},
	checkProductInWishlist: function($productId) {
		var isInWishlist = false;
		angular.forEach(wishlistInfo.products, function(product, key) {
			if (product[0] === $productId) {
				isInWishlist = true;
			}
		});
		return isInWishlist;
	},
    addProductToWishlist: function($productId, $quantity, $info) {
		var quantity = $quantity;
		var isNew = true;
		angular.forEach(wishlistInfo.products, function(product, key) {
			if (product[0] === $productId) {
				quantity = quantity + product[1];
				wishlistInfo.products[key][1] = quantity;
				isNew = false;
			}
		});
		if(isNew === true) {
			var product = [$productId, $quantity, $info];
			wishlistInfo.products.push(product);
		}
		this.updateWishlistInfo();
		
		return true;
    },
	removeProductFromWishlist: function($productId) {
		angular.forEach(wishlistInfo.products, function(product, key) {
			if (product[0] === $productId) {
				wishlistInfo.products.splice(key, 1);
			}
		});
		this.updateWishlistInfo();
		$rootScope.wishlistQuantity = this.getWishlistQuantity();
		return true;
    },
	getWishlistInfo: function() {
		return wishlistInfo;
	},
    getWishlistQuantity: function() {
		var total = 0;
		angular.forEach(wishlistInfo.products, function(product, key) {
			total = total + 1;
		});
		return total;
	},
	updateWishlistInfo: function() {
		window.localStorage.setItem("wishlistInfo", JSON.stringify(wishlistInfo));
	}
  };
})

.factory('OrderService', function($ionicLoading, $http, $ionicPopup, $rootScope, AppService, appConfig, appValue) {
	var listOrder = [];
	var orderInfo = {};
	var orderReceivedInfo = {};
	var orderDiscountCost = 0;
	var orderGrandTotal = 0;
	var orderCurrency = 'USD';
  	return {
		updateServerCartId: function($cartId) {
			orderInfo.cart_id = $cartId;
		},
		updateOrderReceivedInfo: function($orderReceivedInfo) {
			orderReceivedInfo = $orderReceivedInfo;
		},
		clearOrderInfo: function() {
			orderInfo = {};
	   	},
		getOrderCurrency: function() {
			return orderCurrency;
		},
		setOrderGrandTotal: function($orderGrandTotal) {
			orderGrandTotal = $orderGrandTotal;
		},
		getOrderGrandTotal: function() {
			return orderGrandTotal;
		},
		getOrderDiscountCost: function() {
			return orderDiscountCost;
		},
	   	getListOrder: function($userid, $page){
	   		$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=list_customer_order&per_page=10&customer_id='+$userid+'&page='+$page
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if (response.data.status === appValue.API_SUCCESS) {
					listOrder = response.data.data;
					return listOrder;
				}
				else {
					//handle errors
				}
			});
	   	},
	   	getOrderDetail: function($orderid) {

	   	},
		createServeCart: function($coupon, $products, $country, $state, $postcode){
			//add product in cart to order
			var line_items = [];
			angular.forEach($products, function(product, key) {
                                var name = product[2].name.replace(/"/g,'\'');
				if(product[2].product_id !== undefined){
					line_items.push({product_id: product[2].product_id, product_name: name, variation_id: product[0], quantity: product[1]});
				}
				else {
					line_items.push({product_id: product[0], product_name: name, quantity: product[1]});
				}
			});
			this.updateOrderInfoLineItems(line_items);
			this.updateOrderInfoCoupon($coupon);
	   		$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=create_cart',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: this.getOrderInfo()
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if (response.data.status === appValue.API_SUCCESS) {
					//update order grand total
					orderGrandTotal = parseFloat(response.data.data.price.total);
					//update order currency
					orderCurrency = response.data.data.price.currency;
					//update order discount cost
					orderDiscountCost = response.data.data.price.discount_total;
					//update list payment
					var listpayment = [];
					listpayment = response.data.data.payment_methods;
					var listzones = [];
					listzones = response.data.data.shipping_methods;
					var listshipping = [];
					angular.forEach(listzones.zones, function(zone, key) {
						if(zone.zone_locations.indexOf($country) >= 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($state) >= 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($postcode) >= 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($country+':'+$state) >= 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($country+'-'+$postcode) >= 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($country+':'+$state+'-'+$postcode) >= 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
					});
					if(listshipping.length === 0 ){
						//find shipping method at default zone
						listshipping = listzones.default.shipping_methods;
					}
					var result = {};
					result.shipping_methods = listshipping;
					result.payment_methods = listpayment;
					result.server_cart_id = response.data.data.cart_id;
					return result;
				}
				else {
					//handle errors
				}
			});
	   	},
	   	getPaymentMethod: function(){
	   		$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=list_payment'
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if (response.data.status === appValue.API_SUCCESS) {
					var listpayment = [];
					listpayment = response.data.data;
					return listpayment;
				}
				else {
					//handle errors
				}
			});
	   	},
		getShippingMethod: function($country, $state, $postcode){
	   		$ionicLoading.show({
				template: 'Loading...'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=list_shipping'
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if (response.data.status === appValue.API_SUCCESS) {
					var listzones = [];
					listzones = response.data.data;
					var listshipping = [];
					angular.forEach(listzones.zones, function(zone, key) {
						if(zone.zone_locations.indexOf($country) > 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($state) > 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($postcode) > 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($country+':'+$state) > 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
						if(zone.zone_locations.indexOf($country+':'+$state+'-'+$postcode) > 0){
							listshipping = zone.shipping_methods;
							return listshipping;
						}
					});
					if(listshipping.length === 0 ){
						//find shipping method at default zone
						listshipping = listzones.default.shipping_methods;
					}
					return listshipping;
				}
				else {
					//handle errors
				}
			});
	   	},
	   	getOrderInfo: function() {
			return orderInfo;
		},
		getOrderReceivedInfo: function() {
			return orderReceivedInfo;
		},
		updateOrderInfoCustomerId: function($customerId) {
			orderInfo.customer_id = $customerId;
		},
		updateOrderInfoBilling: function($billingInfo) {
			orderInfo.billing = JSON.stringify($billingInfo);
		},
		updateOrderInfoShipping: function($shippingInfo) {
			orderInfo.shipping = JSON.stringify($shippingInfo);
		},
		updateOrderInfoCustomerNote: function($customerNote) {
			orderInfo.customer_note = $customerNote;
		},
		updateOrderInfoCoupon: function($coupon) {
			orderInfo.coupon = $coupon;
		},
		updateDeviceToken: function($token){
			orderInfo.device_token = $token;
		},
		updateOrderInfoPaymentMethod: function($payment, $title, $data) {
			orderInfo.payment_method = $payment;
			orderInfo.payment_method_title = $title;
			orderInfo.payment_method_data = $data;
		},
		validateOrderInfoBilling: function() {
			var billing = JSON.parse(orderInfo.billing);
			if(billing.first_name !== "" && billing.last_name !== "" && billing.email !== "" && billing.city !== "" && billing.phone !== "" && billing.country !== "" && billing.address_1 !== "" && billing.state !== "" && billing.postcode !== "") {
				return true;
			}
			return false;
		},
		updateOrderInfoShippingMethod: function($shipping_lines) {
			orderInfo.shipping_lines = JSON.stringify($shipping_lines);
		},
		updateOrderInfoLineItems: function($line_items) {
			orderInfo.line_items = JSON.stringify($line_items);
		},
		getOrderInfoLineItems: function() {
			return JSON.parse(orderInfo.line_items);
		},
		validateOrderInfoShipping: function() {
			var shipping = JSON.parse(orderInfo.shipping);
			if(shipping.first_name !== "" && shipping.last_name !== "" && shipping.country !== "" && shipping.address_1 !== "" && shipping.state !== "" && shipping.city !== "" && shipping.postcode !== "") {
				return true;
			}
			return false;
		},
		getCartPrice: function() {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=get_price',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: this.getOrderInfo()
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					//update order grand total
					orderGrandTotal = response.data.data.total;
					//update order currency
					orderCurrency = response.data.data.currency;
					//update order discount cost
					orderDiscountCost = response.data.data.discount_total;
					return true;
				}
				else {
					return false;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return false;
			});
		},
		changeOrderStatus: function($id) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=change_order_status',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: {
					'id': $id, 
					'status': 'processing'
				}
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					return true;
				}
				else {
					return false;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return false;
			});
		},
		createOrder: function() {
			if(AppService.getDisableApp()) {
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MAINTAIN_TEXT,
					template: AppService.getAppSetting().disable_app_message
				});
				return true;
			}
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'orders?&task=create_order',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: this.getOrderInfo()
			})
			.then(function(response) {
				$ionicLoading.hide();
				// handle success things
				if(response.data.status === appValue.API_SUCCESS){
					orderReceivedInfo = response.data.data;
					orderReceivedInfo.payment_method = orderInfo.payment_method;
					orderReceivedInfo.payment_method_data = orderInfo.payment_method_data;
					return true;
				}
				else {
					$ionicPopup.alert({
					    title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: response.data.message
					});
					return false;
				}
			}, function error(response){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: $rootScope.appLanguage.MESSAGE_TEXT,
					template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
				});
				return false;
			});
		}
  	};
})



.factory('BlogService', function($ionicLoading, $ionicPopup, $rootScope, $http, appConfig, appValue) {

	var listBlog = [];
	return {
		getListBlog: function($page, $perpage) {
			$page = $page ? $page : 1;
			$perpage = $perpage ? $perpage : 10;

			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'blogs?&page=' + $page + '&per_page=' + $perpage
			})
				.then(function(response) {
					$ionicLoading.hide();
					// handle success things
					if (response.data.status === appValue.API_SUCCESS) {
						listBlog = response.data.data;
						return listBlog;
					}
					else {
						//handle errors
						return listBlog;
					}
				},function error(response){
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
					});
					return listBlog;
				});
		},
		getListBlogByCategory: function($categoryId, $page, $perpage) {
			$page = $page ? $page : 1;
			$perpage = $perpage ? $perpage : 10;

			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'blogs?&type=category&param=' + $categoryId + '&page=' + $page + '&per_page=' + $perpage
			})
				.then(function(response) {
					$ionicLoading.hide();
					// handle success things
					if (response.data.status === appValue.API_SUCCESS) {
						return response.data.data;
					}
					else {
						//handle errors
						return [];
					}
				},function error(response){
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
					});
					return [];
				});
		},
		getListBlogCategory: function() {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'blogs?&type=get_category'
			})
				.then(function(response) {
					$ionicLoading.hide();
					// handle success things
					if (response.data.status === appValue.API_SUCCESS) {
						return response.data.data;
					}
					else {
						//handle errors
						return [];
					}
				},function error(response){
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
					});
					return [];
				});
		},
		getSingleBlog: function($blogId) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'GET',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'blogs?&type=single&param=' + $blogId
			})
				.then(function(response) {
					$ionicLoading.hide();
					// handle success things
					if (response.data.status === appValue.API_SUCCESS) {
						return response.data.data;
					}
					else {
						//handle errors
						return [];
					}
				},function error(response){
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: $rootScope.appLanguage.MESSAGE_TEXT,
						template: $rootScope.appLanguage.NETWORK_OFFLINE_TEXT
					});
					return [];
				});
		},
		submitComment: function($blogId, $userId, $name, $email, $comment) {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});
			return $http({
				method: 'POST',
				url: appConfig.DOMAIN_URL + appValue.API_URL + 'blogs?&type=add&param=' + $blogId,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: {
					'user_id': $userId,
					'user_login': $name,
					'user_email': $email,
					'comment': $comment
				}
			})
				.then(function(response) {
					$ionicLoading.hide();
					// handle success things
					if (response.data.status === appValue.API_SUCCESS){
						$ionicPopup.alert({
							title: $rootScope.appLanguage.MESSAGE_TEXT,
							template: 'Your comment is awaiting approval'
						});
						return true;
					} else {
						$ionicPopup.alert({
							title: $rootScope.appLanguage.MESSAGE_TEXT,
							template: response.data.message
						});
						return false;
					}
				});
		}
	};
})

.factory('LanguageService', function($state, $ionicPopup, $rootScope) {
	return {
		saveLanguage: function(language) {
			window.localStorage.setItem("appLanguage", language);
		},
		getLanguage: function() {
			if(window.localStorage.getItem("appLanguage")) {
				return window.localStorage.getItem("appLanguage");
			}
			else {
				return 'en';
			}
			
		}
  	};
})
;
