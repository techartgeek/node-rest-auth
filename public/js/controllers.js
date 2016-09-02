angular.module('starter')
    .controller('LoginCtrl', function ($scope, AuthService, $state) {
        $scope.user = {
            name: '',
            password: ''
        };

        $scope.login = function () {
            AuthService.login($scope.user).then(function (msg) {
                $state.go('inside');
            }, function (errMsg) {
                console.log({
                    title: 'Login failed!',
                    template: errMsg
                });
            });
        };
    })
    .controller('RegisterCtrl', function ($scope, AuthService, $state) {
        $scope.user = {
            user: '',
            password: ''
        };

        $scope.signup = function () {
            AuthService.register($scope.user).then(function (msg) {
                $state.go('outside.login');
                console.log({
                    title: 'Register Success!',
                    template: msg
                });
            }, function (errMsg) {
                console.log({
                    title: 'Register failed!',
                    template: errMsg
                });
            });
        };
    })
    .controller('InsideCtrl', function ($scope, AuthService, API_ENDPOINT, $http, $state) {
        $scope.destroySession = function () {
            AuthService.logout();
        };

        $scope.getInfo = function () {
            $http.get(API_ENDPOINT.url + '/memberinfo').then(function (result) {
                $scope.memberinfo = result.data.msg;
            });
        };

        $scope.logout = function () {
            AuthService.logout();
            $state.go('outside.login');
        };
    })
    .controller('AppCtrl', function ($scope, AuthService, AUTH_EVENTS, $state) {
        $scope.$on(AUTH_EVENTS.nonAuthenticated, function (event) {
            AuthService.logout();
            $state.go('outside.login');
            console.log({
                title: 'Session Lost!',
                template: 'Sorry, you have to login again.'
            });
        });
    });
