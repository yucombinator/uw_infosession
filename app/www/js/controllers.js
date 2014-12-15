angular.module('starter.controllers', ['ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$state,$cordovaInAppBrowser) {
    // Form data for the calendar modal
    $scope.selectedDate = new Date();

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/calendar.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeDateChooser = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.selectMonth = function() {
        $scope.modal.show();
    };

    // Perform the search action when the user submits the login form
    $scope.doCalendar= function() {
        console.log('Changing date');
        $state.go('app.events/:year/:month',{year:$scope.selectedDate.getFullYear(),month:$scope.selectedDate.getMonth()});
        //$scope.load($selectedDate);
    };
    $scope.open = function(url,dest){
        // Using the plugin with default options
        var frame = '_blank';
        if(dest){
            frame = '_system';
        };
        $cordovaInAppBrowser
        .open(url, frame)
        .then(function(event) {
            // success
        }, function(event) {
            // error
        });

    }
})

.controller('EventsCtrl', function($scope,$http,$q,$stateParams) {
    $scope.year = $stateParams.year;
    $scope.month = $stateParams.month;
    $scope.isPastFilteringEnabled = true;

    $scope.loaded = false;
    $scope.load = function(datetime){
        $scope.current = datetime;
        console.log("Load month: " + $scope.current.getMonth());
        var month = parseInt(datetime.getMonth())+1;
        var url = 'http://uw-infosession.herokuapp.com/api/calendar/'
        +datetime.getFullYear()+
            "/"+month;
        //console.log(url);
        $http.get(url).
        success(function(data, status, headers, config) {
            //$scope.events = data;
            //console.log($scope.events);
            //Load up more details
            var promises = [];
            angular.forEach(data, function(event_info) {
                //console.log(event_info.id);
                var request = $http.get('http://uw-infosession.herokuapp.com/api/event/'+event_info.id);
                promises.push(request); //QUEUE THE REQUEST
            });
            $q.all(promises).then(function(values) {
                //console.log(values);
                for (var i = 0; i < values.length; ++i) {
                    data[i].details = values[i].data;
                    data[i].visible = true; //so the filter shows it
                    $scope.events.push(data[i]);
                }
                //console.log($scope.events);
                $scope.$parent.events = $scope.events; //pass to parent scope
                $scope.loaded = true;
            });
        }).
        error(function(data, status, headers, config) {
            // log error
        });
    };

    $scope.nextMonth = function(){
        $scope.loaded = false;
        $scope.current.setMonth($scope.current.getMonth()+1);
        //console.log("Load month: " + $scope.current.getMonth());
        $scope.load($scope.current);
    }
    $scope.a = true;
    //cache it locally
    if($scope.year || $scope.month){
        //is this calendar view? if so, disable past dats filtering
        console.log("isPastFilteringEnabled");
        $scope.events = [];
        $scope.$parent.events == null; //clear cache
        $scope.isPastFilteringEnabled = false;
        $scope.current = new Date($scope.year, $scope.month, 1, 1, 1, 1, 1);
        $scope.load($scope.current);

        //set title
        $scope.title = "Events in " + $scope.year +"/" +$scope.month;
    }else{
        $scope.title = "Upcoming Events"
        if($scope.$parent.events == null){
            $scope.events = [];
            //console.log("TEST");
            $scope.load(new Date());
            //load more items if near end of month
            if(new Date().getDate() >20){
                $scope.nextMonth();
            }
            //Load more if current month is empty
            if($scope.a){
                $scope.loaded = false;
                $scope.nextMonth();
                $scope.a = false;
            }
        }else{
            //cached data found?
            $scope.events = $scope.$parent.events;
            $scope.loaded = true;
        }
    }

    /* $scope.events = [
        { company: 'Loading...'}
      ];    */


})
.filter('isPast', function() {         //Date comparator
    return function(items,enabled) {
        //console.log("yes");
        if (enabled == false){
            return items; // no filtering done
        }
        //console.log("no");
        var current = new Date();
        current.setDate(current.getDate() - 1); //yesterday
        try{
            angular.forEach(items, function(item) {
                if(item.details.datetime != null){
                    //console.log(item)
                    //console.log(new Date(item) >= current)
                    if(new Date(item.details.datetime) >= current) {
                        //console.log(new Date(item) >= current)
                        item.visible = true;
                    }else{
                        item.visible = false;
                    }
                }
            });
        }catch(e){

        }
        return items;
    };
})
.controller('EventCtrl', function($scope, $stateParams,$http,$cordovaCalendar,$ionicPopup) {
    $scope.id = $stateParams.id;
    $scope.item = {company:"Loading..."};

    $http.get('http://uw-infosession.herokuapp.com/api/event/'+$scope.id).
    success(function(data, status, headers, config) {
        $scope.item = data;
    }).
    error(function(data, status, headers, config) {
        // log error
    });

    $scope.addtoCalendar = function(){
        //TODO Fix this
        return; //end todo
        $scope.start = new Date($scope.item.datetime);
        $scope.end = $scope.start.setHours($scope.start.getHours() + 1)
        console.log($scope.item);
        console.log($scope.start);
        console.log($scope.end);
        $cordovaCalendar.createEvent({
            title: $scope.item.company,
            location: $scope.item.location,
            notes: $scope.item.description,
            startDate: $scope.start,
            endDate: $scope.start.setHours($scope.start.getHours() + 1)
        }).then(function (result) {
            // success
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Added to Calendar'
            });
        }, function (err) {
            // error
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Calendar event creation failed!'
            });
        });

    };

});
