'use strict';

app.controller('bodyCtrl', function($scope, $rootScope, Current, tabService, dialogService, users, posts) {
	$scope.topInit = function() {
		$scope.$apply(function() {
					// 一覧ページの遷移先
				Current.initialize();
			  authService.autoLogin();
				$rootScope.$on('login_complate', function(event, data) {
			        if (data.role) {
			        	Current.setCurrent(data, true);
			        }
				});
			
				$rootScope.displayPage = 'list_ghest';
				$rootScope.user = Current.getCurrent();
				if (Current.isLogin()) {
					$rootScope.displayPage = 'list_select';
				}

				// 対応完了のお知らせを取得
				$scope.isLoad = false;
				var dataStore = posts.getPosts().equalTo("correspond", "2").limit(5);
				var promise = posts.findAsync(dataStore);
				promise.then(function(results){
					//成功時
					$scope.items = results;
					$scope.isLoad = true;
				});
		});
	}

	$scope.toHome = function() {
        tabService.setActiveTab(0);
    }

	$scope.toDisplayPage = function() {
		tabService.setActiveTab(2);
	}

    $scope.toLoginPage = function() {
        tabService.setActiveTab(3);
    }

    $scope.toPostPage = function() {
        if (!navigator.geolocation) {
            dialogService.error('位置情報が取得できないため、この機能は使用できません。');
        } else if (!$rootScope.settings.isDebug) {
								dialogService.error('宝塚市内ではないため投稿できません');
				} else {
					tabService.setActiveTab(1);
				}
    }

		$scope.toDetail = function (objectId) {
			myNavigator.pushPage('display/detail.html', {id : objectId});

		}

		$scope.signOut = function() {
			dialogService.confirm('ログアウトしてもよろしいですか？');
			$scope.$on('confirm:ok', function() {
				users.logout();
				$scope.$on('logout:success', function(event) {
					Current.initialize();
					//　初回起動(匿名ユーザー登録)
					users.loginAsAnonymous();
					$scope.topInit();
					$scope.$emit('toHome:success', 'ログアウトしました');
				});
			});
		}

		// トップ画面を初期化した後にダイアログ表示。
		$scope.$on('toHome:success', function(event, msg) {
			dialogService.complete(msg);
		});
});
