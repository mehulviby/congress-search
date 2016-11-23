var app = angular.module('congressDataApp', ['angularUtils.directives.dirPagination']);

app.controller('congressController', function($scope, $http, $filter){

	$scope.totalBillData = [];
	$scope.totalLegisData = [];
	$scope.totalComitteeData = [];

	$scope.displayLegisHouseUsers = [];
	$scope.displayLegisSenateUsers = [];

	$scope.displayLegisUsers = [];
	$scope.displayLegisUsersCommittee = [];
	$scope.displayLegisUsersBills = [];
	$scope.displayBillData = [];

	$scope.favoriteLegisData = [];
	$scope.favoriteBillsData = [];
	$scope.favoriteCommitteeData = [];

	$scope.favoriteLegisDataIds = [];
	$scope.favoriteBillsDataIds = [];
	$scope.favoriteCommitteeDataIds = [];

	$scope.LoadLegisData = function(){
		if($scope.totalLegisData.length == 0){
			legislatorServerRequest();
			billServerRequest();
			committeeServerRequest();
		}
	}
	function legislatorServerRequest(){
		var url = "index.php";
		var parameter = { 'type':'legislator', 'get':'all' };
		// $http({
		// 	method: 'GET',
		// 	url: url,
		// 	data: $.param({'data' : parameter}),
		// 	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		// }).
		$http.get(url, {
			params: parameter,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		}).
		success(function(response) {
			$scope.displayLegisUsers = response.results;
			$scope.totalLegisData = response.results;
			$scope.displayLegisHouseUsers = $filter('filter')($scope.totalLegisData, {chamber : 'house'});
			$scope.displayLegisSenateUsers = $filter('filter')($scope.totalLegisData, {chamber : 'senate'});
			$scope.sortLegis();
		}).
		error(function(response) {
			console.log("Error" + response);
		});
	}
	function billServerRequest(){
		var url = "index.php";
		var parameter = { 'type':'bills', 'get':'all' };
		// $http({
		// 	method: 'GET',
		// 	url: url,
		// 	data: $.param({'data' : parameter}),
		// 	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		// }).
		$http.get(url, {
			params: parameter,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		}).
		success(function(response) {
			$scope.totalBillData = response;
			$scope.displayActiveBillData = $filter('filter')($scope.totalBillData, {history : { active : true}});
			$scope.displayNewBillData = $filter('filter')($scope.totalBillData, {history : { active : false}});
			$scope.sortBills('introduced_on');
		}).
		error(function(response) {
			console.log("Error" + response);
		});
	}
	function committeeServerRequest(){
		var url = "index.php";
		var parameter = { 'type':'committee', 'get':'all' };
		// $http({
		// 	method: 'GET',
		// 	url: url,
		// 	data: $.param({'data' : parameter}),
		// 	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		// }).
		$http.get(url, {
			params: parameter,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		}).
		success(function(response) {
			$scope.totalComitteeData = response.results;
			$scope.displayCommitteeHouseData = $filter('filter')($scope.totalComitteeData, {chamber : 'house'});
			$scope.displayCommitteeSenateData = $filter('filter')($scope.totalComitteeData, {chamber : 'senate'});
			$scope.displayCommitteeJointData = $filter('filter')($scope.totalComitteeData, {chamber : 'joint'});

			if($scope.favoriteCommitteeDataIds.length > 0){
				angular.forEach($scope.totalComitteeData, function(item){
					item.favorite = $scope.favoriteCommitteeDataIds.indexOf(item.committee_id) == -1 ? false : true;
				});
			}
			else{
				angular.forEach($scope.totalComitteeData, function(item){
					item.favorite = false;
				});
			}
			$scope.sortCommittees('committee_id');
		}).
		error(function(response) {
			console.log("Error" + response);
		});
	}

	$scope.LoadFavoriteData = function(){
		$scope.favoriteLegisData = JSON.parse(localStorage.getItem("favoriteLegisData"));
		if($scope.favoriteLegisData == null){
			$scope.favoriteLegisData = [];
		}
		else{
			angular.forEach($scope.favoriteLegisData, function(item){
				$scope.favoriteLegisDataIds.push(item.bioguide_id)
           	});
		}

		$scope.favoriteBillsData = JSON.parse(localStorage.getItem("favoriteBillsData"));
		if($scope.favoriteBillsData == null)
			$scope.favoriteBillsData = [];
		else{
			angular.forEach($scope.favoriteBillsData, function(item){
				$scope.favoriteBillsDataIds.push(item.bill_id)
           	});
		}

		$scope.favoriteCommitteeData = JSON.parse(localStorage.getItem("favoriteCommitteeData"));
		if($scope.favoriteCommitteeData == null)
			$scope.favoriteCommitteeData = [];
		else{
			angular.forEach($scope.favoriteCommitteeData, function(item){
				$scope.favoriteCommitteeDataIds.push(item.committee_id)
           	});
		}
	}
	$scope.LoadFavoriteData();
	$scope.LoadLegisData();

	$scope.sortLegis = function(){
		$scope.sortKeyLegis = ['state_name', 'last_name']
		$scope.sortKey = 'last_name';
	}

	$scope.sortBills = function(keyname){
		$scope.sortBillKey = keyname;
	}

	$scope.sortCommittees = function(keyname){
		$scope.sortCommitteeKey = keyname;
	}

	$scope.filterState = function(keyname){
		if(keyname == 'all')
			$scope.displayLegisUsers = $scope.totalLegisData;
		else
			$scope.displayLegisUsers = $filter('filter')($scope.totalLegisData, keyname);
	}

	$scope.viewDetailsLegis = function(user){
		user.userimgSrc = "https://theunitedstates.io/images/congress/original/"+user.bioguide_id+".jpg";
		user.chamberCap = user.chamber.capitalizeFirst();
		var start_time = new Date(user.term_start).getTime();
		var end_time = new Date(user.term_end).getTime();
		var termProgress = (Date.now() - start_time) / (end_time - start_time);
		termProgress *= 100;
		user.termProgress = Math.round(termProgress);
		user.termProgressStyle = {width: user.termProgress + '%'};

		if($scope.favoriteLegisDataIds.length > 0 && $scope.favoriteLegisDataIds.indexOf(user.bioguide_id) != -1){
			user.favorite = true;
		}
		else{
			user.favorite = false;
		}

		$scope.viewDetailCurrentUser = user;

		var url = "index.php";
		var parameter = { 'type':'legislator', 'get': 'both', 'bioguide_id':user.bioguide_id };

		// $http({
	    //     method: 'GET',
	    //     url: url,
	    //     data: $.param({'data' : parameter}),
	    //     headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    // }).
		$http.get(url, {
			params: parameter,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		}).
	    success(function(response) {
			$scope.displayLegisUsersCommittee = response.committee;
			$scope.displayLegisUsersBills = response.bills;
		}).
		error(function(response) {
	        console.log("Error" + response);
		});
	}

	$scope.favoriteViewDetailsLegis = function(user){
		user.userimgSrc = "https://theunitedstates.io/images/congress/original/"+user.bioguide_id+".jpg";
		user.chamberCap = user.chamber.capitalizeFirst();
		var start_time = new Date(user.term_start).getTime();
		var end_time = new Date(user.term_end).getTime();
		var termProgress = (Date.now() - start_time) / (end_time - start_time);
		termProgress *= 100;
		user.termProgress = Math.round(termProgress);
		user.termProgressStyle = {width: user.termProgress + '%'};

		if($scope.favoriteLegisDataIds.length > 0 && $scope.favoriteLegisDataIds.indexOf(user.bioguide_id) != -1){
			user.favorite = true;
		}
		else{
			user.favorite = false;
		}

		$scope.favoriteViewDetailCurrentUser = user;
		var url = "index.php";
		var parameter = { 'type':'legislator', 'get': 'both', 'bioguide_id':user.bioguide_id };

		// $http({
	    //     method: 'GET',
	    //     url: url,
	    //     data: $.param({'data' : parameter}),
	    //     headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    // }).
		$http.get(url, {
			params: parameter,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		}).
	    success(function(response) {
			$scope.favoriteDisplayLegisUsersCommittee = response.committee;
			$scope.favoriteDisplayLegisUsersBills = response.bills;
		}).
		error(function(response) {
	        console.log("Error" + response);
		});

		$(".favorite-view-detail-legis").show();
		$(".favorite-view-detail-bills").hide();
	}

	$scope.favoriteViewDetailsBills = function(viewDetailCurrentBill){
		if($scope.favoriteBillsDataIds.length > 0 && $scope.favoriteBillsDataIds.indexOf(viewDetailCurrentBill.bill_id) != -1){
			viewDetailCurrentBill.favorite = true;
		}
		else{
			viewDetailCurrentBill.favorite = false;
		}
		$scope.favoriteViewDetailCurrentBill = viewDetailCurrentBill;
		console.log($scope.favoriteViewDetailCurrentBill);
		$(".favorite-view-detail-legis").hide();
		$(".favorite-view-detail-bills").show();
	}


	$scope.addFavorite = function($event, currentData){
		if(currentData.bioguide_id != null){
			if($scope.favoriteLegisDataIds.length > 0 && $scope.favoriteLegisDataIds.indexOf(currentData.bioguide_id) != -1){
				$scope.deleteFavorite('legis', currentData);
			}
			else{
				currentData.favorite = true;
				$scope.favoriteLegisData.push(currentData);
				$scope.favoriteLegisDataIds.push(currentData.bioguide_id);
				localStorage.setItem("favoriteLegisData", JSON.stringify($scope.favoriteLegisData));
			}
		}
		else if(currentData.bill_id != null){
			if($scope.favoriteBillsDataIds.length > 0 && $scope.favoriteBillsDataIds.indexOf(currentData.bill_id) != -1){
				$scope.deleteFavorite('bills', currentData);
			}
			else{
				currentData.favorite = true;
				$scope.favoriteBillsData.push(currentData);
				$scope.favoriteBillsDataIds.push(currentData.bill_id);
				localStorage.setItem("favoriteBillsData", JSON.stringify($scope.favoriteBillsData));
			}
		}
		else if(currentData.committee_id != null){
			if($scope.favoriteCommitteeDataIds.length > 0 && $scope.favoriteCommitteeDataIds.indexOf(currentData.committee_id) != -1){
				$scope.deleteFavorite('committee', currentData);
			}
			else{
				currentData.favorite = true;
				$scope.favoriteCommitteeData.push(currentData);
				$scope.favoriteCommitteeDataIds.push(currentData.committee_id);
				localStorage.setItem("favoriteCommitteeData", JSON.stringify($scope.favoriteCommitteeData));
			}
		}
		$($event.currentTarget).children().toggleClass("active");
	}

	$scope.deleteFavorite = function(type, item){
		if(type == 'legis'){
			item.favorite = false;
			var index = $scope.favoriteLegisData.indexOf(item);
			var indexIds = $scope.favoriteLegisDataIds.indexOf(item.bioguide_id);
			$scope.favoriteLegisDataIds.splice(indexIds, 1);
			$scope.favoriteLegisData.splice(index, 1);
			localStorage.setItem("favoriteLegisData", JSON.stringify($scope.favoriteLegisData));
		}
		else if(type == 'bills'){
			item.favorite = false;
			var index = $scope.favoriteBillsData.indexOf(item);
			var indexIds = $scope.favoriteBillsDataIds.indexOf(item.bill_id);
			$scope.favoriteBillsDataIds.splice(indexIds, 1);
			$scope.favoriteBillsData.splice(index, 1);
			localStorage.setItem("favoriteBillsData", JSON.stringify($scope.favoriteBillsData));
		}
		else if(type == 'committee'){
			item.favorite = false;
			if(item.chamber == 'joint'){
				angular.forEach($scope.displayCommitteeJointData, function(eachItem){
					if(eachItem.committee_id == item.committee_id){
						eachItem.favorite = false;
					}
				});
			}
			else if(item.chamber == 'senate'){
				angular.forEach($scope.displayCommitteeSenateData, function(eachItem){
					if(eachItem.committee_id == item.committee_id){
						eachItem.favorite = false;
					}
				});
			}
			else if(item.chamber == 'house'){
				angular.forEach($scope.displayCommitteeHouseData, function(eachItem){
					if(eachItem.committee_id == item.committee_id){
						eachItem.favorite = false;
					}
				});
			}
			var index = $scope.favoriteCommitteeData.indexOf(item);
			var indexIds = $scope.favoriteCommitteeDataIds.indexOf(item.committee_id);
			$scope.favoriteCommitteeDataIds.splice(indexIds, 1);
			$scope.favoriteCommitteeData.splice(index, 1);
			localStorage.setItem("favoriteCommitteeData", JSON.stringify($scope.favoriteCommitteeData));
		}
	}

	$scope.viewDetailsBills = function(viewDetailCurrentBill){
		if($scope.favoriteBillsDataIds.length > 0 && $scope.favoriteBillsDataIds.indexOf(viewDetailCurrentBill.bill_id) != -1){
			viewDetailCurrentBill.favorite = true;
		}
		else{
			viewDetailCurrentBill.favorite = false;
		}
		$scope.viewDetailCurrentBill = viewDetailCurrentBill;
	}

	$scope.LoadBillData = function(){
		$scope.displayBillData = $filter('filter')($scope.totalBillData, {history : { active : true}});
	}

	$scope.LoadCommitteeData = function(){
		$scope.displayCommitteeHouseData = $filter('filter')($scope.totalComitteeData, {chamber : 'house'});
		$scope.displayCommitteeSenateData = $filter('filter')($scope.totalComitteeData, {chamber : 'senate'});
		$scope.displayCommitteeJointData = $filter('filter')($scope.totalComitteeData, {chamber : 'joint'});
	}

	$scope.formatDate = function(curDate){
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
			  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			];
		var dateValue = new Date(curDate);
		var formatedDate = monthNames[dateValue.getMonth()] + " " + dateValue.getUTCDate() + ", " + dateValue.getFullYear();
		return formatedDate;
	}
});

String.prototype.capitalizeFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.capitalize = function() {
    return this.toUpperCase();
}

$(document).ready(function() {
    eventHandlers();
	legislatorEvents();
	billEvents();
	committeeEvents();
	favoriteEvents();
});

function eventHandlers(){
	//localStorage.clear();

	$("#legislatorContent").fadeIn("slow").siblings("div").hide();
    $("#menu-toggle").on('click', function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("active");
    });
    $("a[name=\"legislator\"]").on('click', function(e){
        $('.sidebar-nav a.active').removeClass('active');
        $(this).addClass('active');
        $("#legislatorContent").fadeIn("slow").siblings("div").hide();
        e.preventDefault();
		legislatorEvents();
    });
    $("a[name=\"bill\"]").on('click', function(e){
        $('.sidebar-nav a.active').removeClass('active');
        $(this).addClass('active');
        $("#billContent").fadeIn("slow").siblings("div").hide();
        e.preventDefault();
		billEvents();
    });
    $("a[name=\"committee\"]").on('click', function(e){
        $('.sidebar-nav a.active').removeClass('active');
        $(this).addClass('active');
        $("#committeeContent").fadeIn("slow").siblings("div").hide();
        e.preventDefault();
		committeeEvents();
    });
    $("a[name=\"favorite\"]").on('click', function(e){
        $('.sidebar-nav a.active').removeClass('active');
        $(this).addClass('active');
        $("#favoriteContent").fadeIn("slow").siblings("div").hide();
        e.preventDefault();
		favoriteEvents();
    });
}
function legislatorEvents()
{
	$(".table-header-state").show();
	$(".table-header-house").hide();
	$(".table-header-senate").hide();
	$("#legis-nav-toggle li").removeClass('active');
	$("#legis-nav-toggle li:first").addClass('active');
	$("#legis-nav-toggle").on('click', function(e) {
		if($(e.target).is("a")){
			$('li').removeClass('active');
			var value = $(e.target).parent().val();
			if(value == 0){
				$(".table-header-state").show();
				$(".table-header-house").hide();
				$(".table-header-senate").hide();
			}
			else if (value == 1) {
				$(".table-header-state").hide();
				$(".table-header-house").show();
				$(".table-header-senate").hide();
			}
			else if (value == 2) {
				$(".table-header-state").hide();
				$(".table-header-house").hide();
				$(".table-header-senate").show();
			}
			$(e.target).parent().addClass('active');
			e.preventDefault();
		}
	});
	$(".legis-state-dropdown-menu li a").on('click', function(e){
		e.preventDefault();
		var selText = $(this).text();
		$(".legis-state-dropdown-menu li").children().show();
		$(this).hide();
		$(this).parents('.btn-group').find('.legis-state-dropdown').html(selText+' <span class="caret"></span>');
	});
}

function billEvents(){
	$(".table-header-active-bills").show();
	$(".table-header-new-bills").hide();
	$("#bills-nav-toggle li").removeClass('active');
	$("#bills-nav-toggle li:first").addClass('active');
	$("#bills-nav-toggle").on('click', function(e) {
		if($(e.target).is("a")){
			$('li').removeClass('active');
			var value = $(e.target).parent().val();
			if(value == 0){
				$(".table-header-active-bills").show();
				$(".table-header-new-bills").hide();
			}
			else if (value == 1) {
				$(".table-header-active-bills").hide();
				$(".table-header-new-bills").show();
			}
			$(e.target).parent().addClass('active');
			e.preventDefault();
		}
	});
}

function committeeEvents()
{
	$(".table-header-house-committee").show();
	$(".table-header-senate-committee").hide();
	$(".table-header-joint-committee").hide();
	$("#committee-nav-toggle li").removeClass('active');
	$("#committee-nav-toggle li:first").addClass('active');
	$("#committee-nav-toggle").on('click', function(e) {
		if($(e.target).is("a")){
			$('li').removeClass('active');
			var value = $(e.target).parent().val();
			if(value == 0){
				$(".table-header-house-committee").show();
				$(".table-header-senate-committee").hide();
				$(".table-header-joint-committee").hide();
			}
			else if (value == 1) {
				$(".table-header-house-committee").hide();
				$(".table-header-senate-committee").show();
				$(".table-header-joint-committee").hide();
			}
			else if (value == 2) {
				$(".table-header-house-committee").hide();
				$(".table-header-senate-committee").hide();
				$(".table-header-joint-committee").show();
			}
			$(e.target).parent().addClass('active');
			e.preventDefault();
		}
	});
}
function favoriteEvents() {
	$(".table-header-legis-favorite").show();
	$(".table-header-bills-favorite").hide();
	$(".table-header-committee-favorite").hide();
	$("#favorite-nav-toggle li").removeClass('active');
	$("#favorite-nav-toggle li:first").addClass('active');
	$("#favorite-nav-toggle").on('click', function(e) {
		if($(e.target).is("a")){
			$('li').removeClass('active');
			var value = $(e.target).parent().val();
			if(value == 0){
				$(".table-header-legis-favorite").show();
				$(".table-header-bills-favorite").hide();
				$(".table-header-committee-favorite").hide();
			}
			else if (value == 1) {
				$(".table-header-legis-favorite").hide();
				$(".table-header-bills-favorite").show();
				$(".table-header-committee-favorite").hide();
			}
			else if (value == 2) {
				$(".table-header-legis-favorite").hide();
				$(".table-header-bills-favorite").hide();
				$(".table-header-committee-favorite").show();
			}
			$(e.target).parent().addClass('active');
			e.preventDefault();
		}
	});
}
