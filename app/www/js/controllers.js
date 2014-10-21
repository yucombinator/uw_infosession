angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$location) {
  // Form data for the calendar modal
  $scope.calendarData = {};

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

  // Perform the login action when the user submits the login form
  $scope.doCalendar= function() {
    console.log('Changing date');

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('EventsCtrl', function($scope,$http,$q) {
    $scope.loaded = false;
    $scope.load = function(datetime){
        $scope.current = datetime;
        //console.log("Loading " + datetime.getFullYear()+"/"+datetime.getMonth());
        $http.get('http://uw-infosession.herokuapp.com/api/calendar/'+datetime.getFullYear()+"/"+datetime.getMonth()+1).
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
                $scope.events.push(data[i]);
            }
             console.log($scope.events);
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
        console.log("Load month: " + $scope.current.getMonth());
        $scope.load($scope.current);
    }
    
    //cache it locally
    if($scope.$parent.events == null){
        $scope.events = [];
        $scope.load(new Date());
    }else{
      $scope.events = $scope.$parent.events;
      $scope.loaded = true;
    }
      /* $scope.events = [
        { company: 'Loading...'}
      ];    */

    
})
.filter('isPast', function() {         //Date comparator
  return function(items) {
    var filtered = [];
    var current = new Date();
    current.setDate(current.getDate() - 1); //yesterday
    try{
        angular.forEach(items, function(item) {
          if(item.details.datetime != null){
              //console.log(item)
              if(new Date(item.details.datetime) >= current) {     
                console.log(new Date(item) >= current)
                filtered.push(item);
              }
          }
        });
    }catch(e){
        
    }
    return filtered;
  };
})
.controller('EventCtrl', function($scope, $stateParams,$http) {
    $scope.id = $stateParams.id;
    $scope.item = {company:"Loading..."};

    $http.get('http://uw-infosession.herokuapp.com/api/event/'+$scope.id).
    success(function(data, status, headers, config) {
      $scope.item = data;
    }).
    error(function(data, status, headers, config) {
      // log error
    });
});
