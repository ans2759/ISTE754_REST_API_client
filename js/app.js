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
    self.optList = [];
    self.tabs = [];
    self.orgId = "";
    self.tabInfo = {};
    self.tab = "General";
    self.locInfo = [];
    self.lat;
    self.long;
    self.map;
    //self.numCities = 0;

    self.getCities = function (state) {
        self.state = state || "NY";

        $http.get( url, {
            method: "GET",
            params: {path: "/Cities?state="+ self.state},
            responseType: "document"
        }).success(function (data) {
            if ($(data).find("error").length !== 0) {
                console.log("AJAX error");
            }
            else if ($(data).find("row").length === 0) {
                self.cities = ["There are no cities in " + self.state];
            }
            else {
                self.cities = [];
                $("row", data).each(function () {
                    self.cities.push(($(this).find("city").text()));
                });
            }
        });
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
        }).success(function (data) {
            if ($(data).find("error").length !== 0) {
                console.log("AJAX error");
            }
            else {
                self.orgsList = [];
                self.optList = [];
                $("row", data).each(function(){
                    var type = $("type", this).text();
                    if(self.optList.indexOf(type) === -1) {
                        self.optList.push(type);
                    }
                    self.orgsList.push({
                        orgId : $("OrganizationID", this).text(),
                        type : type,
                        name : $("Name", this).text(),
                        city : $("city", this).text(),
                        county : $("CountyName", this).text(),
                        state : $("State", this).text(),
                        zip : $("zip", this).text()
                    });
                });
                $("#adv_search, #results_disp").show();
            }
        });
    };

    self.getTabs = function (id) {
        self.tab = "General";
        self.orgId = id;
        $http.get( url, {
            method: "GET",
            params: {path: "/Application/Tabs?orgId=" + id},
            responseType: "document"
        }).success(function(data) {
            self.tabs = [];
            $("row", data).each(function() {
                self.tabs.push($("Tab", this).text());
            });
            $("#tabs_modal").modal().load(function(){
                $("#tabs_modal").easytabs({
                    defaultTab: "li:first-child"
                });
            });

        });
    };

    self.getTabInfo = function (tab) {
        console.log(tab);
        self.tab = tab;
        self.tabInfo = {};
        $http.get(url, {
            method: "GET",
            params: {path: "/" + self.orgId + "/" + tab},
            responseType: "document"
        }).success(function(data){
            if(tab === 'General') {
                var n = $("name", data).text(),
                    e = $("email", data).text(),
                    w = $("website", data).text(),
                    d = $("description", data).text(),
                    nm = $("nummembers", data).text(),
                    nc = $("numcalls", data).text(),
                    s = $("serviceArea", data).text();

                if(n != "" && n != null && n != 'null')
                    self.tabInfo.name = n;
                if(e != "" && e != null && e != 'null')
                    self.tabInfo.email = e;
                if(w != "" && w != null && w != 'null')
                    self.tabInfo.website = w;
                if(d != "" && d != null && d != 'null')
                    self.tabInfo.description = d;
                if(nm != "" && nm != null && nm != 'null')
                    self.tabInfo.nummembers = nm;
                if(nc != "" && nc != null && nc != 'null')
                    self.tabInfo.numcalls = nc;
                if(s != "" && s != null && s != 'null')
                    self.tabInfo.servicearea = s;
            }
            else if(tab === 'Locations') {
                self.locInfo = [];
                var locals = $("location", data);
                $.each(locals, function(i){
                    var la = parseFloat($("latitude", this).text()),
                        lo = parseFloat($("longitude", this).text());
                    if(i == 0) {
                        self.setMap(la,lo);
                    }
                    self.locInfo.push({
                        type: $("type", this).text(),
                        add: $("address1", this).text(),
                        city: $("city", this).text(),
                        state: $("state", this).text(),
                        zip: $("zip", this).text(),
                        phone: $("phone", this).text(),
                        tty: $("ttyPhone", this).text(),
                        fax: $("fax", this).text(),
                        lat: la,
                        long: lo,
                        site: $("siteId", this).text()
                    });
                });
            }
        });
    };

    self.setMap = function(la, lo, site){
        self.lat = la;
        self.long = lo;
        if(site) {
            self.lat = self.locInfo[site-1].lat;
            self.long = self.locInfo[site-1].long;
        }
        if((self.lat != "" && self.lat != null && self.lat != 'null') && (self.long != "" && self.long != null && self.long != 'null')) {
            //console.log(self.map);
            if(self.map) {
                self.map.setCenter({lat: self.lat, lng: self.long});

            }
            self.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: self.lat, lng: self.long},
                zoom: 14
            });
        }
    };

    self.getCities();

    //return self;
}]);

myApp.utils = (function() {
    var me = {};

}());

