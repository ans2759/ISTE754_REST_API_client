//$(document).foundation();
var myApp = angular.module('myApp', []);

myApp.controller("ResponseController", ['$http', function ($http) {
    var self = this;
    var url = "http://people.rit.edu/dmgics/754/23/proxy.php";
    self.states = [ "AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN",
        "KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY",
        "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];

    self.state = "NY";
    self.cities = [];
    self.orgsList = [];
    //self.numCities = 0;

    self.getCities = function (state) {
        self.state = state || "NY";

        $http.get( url, {
            method: "GET",
            params: {path: "/Cities?state=" + self.state},
            responseType: "document"
        }).success(self.getCitiesCallback);
    };

    self.getCitiesCallback = function (data) {
        if ($(data).find("error").length !== 0) {
            console.log("AJAX error");
        }
        else if ($(data).find("row").length === 0) {
            self.cities = ["There are no cities in " + self.state];
        }
        else {
            self.cities = [];
            $("row", data).each(function () {
                self.addCity($(this).find("city").text());
            });
        }
    };

    self.addCity = function (city) {
        self.cities.push(city);
    };

    self.getOrgs = function() {
        var state = $("#state");
        if(!state.val()) {
            state.val("NY");
        }
        $http.get( url, {
            method: "GET",
            params: {path: "/Organizations?" + $("#searchForm").serialize()},
            responseType: "document"
        }).success(self.getOrgsCallback);
    };

    self.getOrgsCallback = function (data) {
        if ($(data).find("error").length !== 0) {
            console.log("AJAX error");
        }
        else {
            self.orgsList = [];
            $("row", data).each(function(){
                self.orgsList.push({
                    orgId : $("OrganizationID", this).text(),
                    type : $("type", this).text(),
                    name : $("Name", this).text(),
                    city : $("city", this).text(),
                    county : $("CountyName", this).text(),
                    state : $("State", this).text(),
                    zip : $("zip", this).text()
                });
            });
            console.log(self.orgsList);
        }
    };

    self.getCities();

    return self;
}]);

myApp.utils = (function() {
    var me = {};


}());