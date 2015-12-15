//$(document).foundation();
var myApp = angular.module('myApp', []);

myApp.controller("ResponseController", ['$http', function ($http) {
    var self = this;
    var url = "http://people.rit.edu/dmgics/754/23/proxy.php";
    self.states = [ "AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN",
        "KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY",
        "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];

    self.orgsList = [];
    self.orgTypes = [];
    self.state = "NY";
    self.cities = [];
    self.optList = [];
    self.tabs = [];
    self.orgId = "";
    self.tabInfo = {};
    self.tab = "General";
    self.locInfo = [];
    self.tInfo = [];
    self.trainInfo = [];
    self.facInfo = [];
    self.phyInfo = [];
    self.pInfo = [];
    self.equip = [];

    /**
     * getCities
     *
     * @param state
     *
     * populates an array representing the cities in that state
     * if state is not specified, it defaults to NY
     */
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

    /**
     * getOrgTypes
     *
     * populates the select box that is used to filter organizations by type
     */
    self.getOrgTypes = function() {
        self.orgTypes = [];
        $http.get( url, {
            method: "GET",
            params: {path: "/OrgTypes"},
            responseType: "document"
        }).success(function (data) {
            $("row", data).each(function(){
                self.orgTypes.push({
                    id: $("typeId", this).text(),
                    type: $("type", this).text()
                });
            });
        });
    };

    /**
     * getOrgs
     *
     * @param bool
     *
     * populates the results display with the organizations that meet the search criteria
     * If true is passed in, the function will search for physicians instead of organizations
     */
    self.getOrgs = function(bool) {
        var state = $("#state");
        if(!state.val()) {
            state.val("NY");
        }
        if(bool) {
            var ext = "/Organizations?type=Physician&" + $("#searchForm").serialize();
        }
        else {
            var ext = "/Organizations?" + $("#searchForm").serialize();
        }
        $http.get( url, {
            method: "GET",
            params: {path: ext},
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
                //initializa jquery auto-complete plugin for use in filtering results
                $("#name").autoComplete({
                    minChars: 1,
                    source: function(term, sug) {
                        term = term.toLowerCase();
                        var suggestions = [];
                        for(var i = 0; i < self.orgsList.length; i++) {
                            if (~self.orgsList[i].name.toLowerCase().indexOf(term)) suggestions.push(self.orgsList[i].name);
                        }
                        sug(suggestions);
                    }
                });
                //auto-complete for zip codes
                $("#zip").autoComplete({
                    minChars: 1,
                    source: function(term, sug) {
                        term = term.toLowerCase();
                        var suggestions = [];
                        for(var i = 0; i < self.orgsList.length; i++) {
                            if (~self.orgsList[i].zip.toLowerCase().indexOf(term)) suggestions.push(self.orgsList[i].zip);
                        }
                        sug(suggestions);
                    }
                });
                //auto-complete for counties
                $("#county").autoComplete({
                    minChars: 1,
                    source: function(term, sug) {
                        term = term.toLowerCase();
                        var suggestions = [];
                        for(var i = 0; i < self.orgsList.length; i++) {
                            if (~self.orgsList[i].county.toLowerCase().indexOf(term)) suggestions.push(self.orgsList[i].county);
                        }
                        sug(suggestions);
                    }
                });
                //custom plugin, move elements when we have received ajax response
                $("#searcher").moveElements("displayData", [
                    ["filter", "results_disp"],
                    ["medium-3","columns"],
                    ["25%", "10px"]
                ]);
            }
        });
    };

    /**
     * getTabs
     *
     * @param id
     *
     * populates an array representing the tabs related to an organization
     */
    self.getTabs = function (id) {
        self.tab = "General";
        self.orgId = id;
        $http.get( url, {
            method: "GET",
            params: {path: "/Application/Tabs?orgId=" + id},
            responseType: "document"
        }).success(function(data) {
            self.getTabInfo(self.tab);
            self.tabs = [];
            $("row", data).each(function() {
                self.tabs.push($("Tab", this).text());
            });
            //open modal with tabs related to clicked on organization
            $("#tabs_modal").modal().load(function(){
                $("#tabs_modal").easytabs({
                    defaultTab: "li:first-child"
                });
            });

        });
    };

    /**
     * getTabInfo
     *
     * @param tab
     *
     * gets tabular info for selected organization
     */
    self.getTabInfo = function (tab) {
        //for some reason this is returned as 'Treatment', but needs to be passed in as 'Treatments'
        if(tab === 'Treatment') {
            tab += "s";
        }
        self.tab = tab;
        self.tabInfo = {};
        $http.get(url, {
            method: "GET",
            params: {path: "/" + self.orgId + "/" + tab},
            responseType: "document"
        }).success(function(data){
            //handle data based upon which tab was clicked on
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
                $.each($("location", data), function(i){
                    //get lat and lon from result
                    var la = parseFloat($("latitude", this).text()),
                        lo = parseFloat($("longitude", this).text());
                    //initialize map to first location
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
            //these tabs are very similar data, so they can be handled the same way
            else if(tab === 'Treatments' || tab === "Training") {
                self.tInfo = [];
                self.count = parseInt($("count", data).text());
                if (self.count > 0) {
                    if(tab === 'Treatments'){
                        var sel = 'treatment'
                    }
                    else {
                        var sel = 'training';
                    }
                    $(sel, data).each(function(){
                        self.tInfo.push({
                            type: $("type", this).text(),
                            abb: $("abbreviation", this).text()
                        });
                    });
                }
            }
            else if(tab === 'Facilities') {
                self.facInfo = [];
                self.count = parseInt($("count", data).text());
                if (self.count > 0) {
                    $("facility", data).each(function(){
                        self.facInfo.push({
                            type: $("type", this).text(),
                            qty: $("quantity", this).text(),
                            desc: $("description", this).text()
                        });
                    });
                }
            }
            else if(tab === 'Physicians') {
                self.phyInfo = [];
                self.count = parseInt($("count", data).text());
                if (self.count > 0) {
                    $("physician", data).each(function(){
                        self.phyInfo.push({
                            name: $("fName", this).text() + " " + $("mName", this).text() + " " + $("lName", this).text(),
                            license: $("license", this).text(),
                            phone: $("phone", this).text()
                        });
                    });
                }
            }
            else if(tab === 'People') {
                self.pInfo = [];
                self.locals = [];
                $("site", data).each(function(){
                    var people = [];
                    var siteId = $(this).attr("siteId");
                    var local = {
                        id: siteId,
                        add: $(this).attr("address"),
                        type: $(this).attr("siteType")
                    };
                    $("person", this).each(function(){
                        people.push({
                            name: $("honorific", this).text() + " " + $("fName", this).text() + " " + $("mName", this).text()
                                + " " + $("lName", this).text(),
                            role: $("role", this).text(),
                            loc: siteId
                        })
                    });
                    self.locals.push(local);
                    self.pInfo.push(people);
                });
            }
            else if(tab === 'Equipment') {
                self.equip =[];
                self.count = parseInt($("count", data).text());
                if(self.count > 0) {
                    $("equipment", data).each(function(){
                        self.equip.push({
                            type: $("type", this).text(),
                            qty: $("quantity", this).text(),
                            desc: $("description", this).text()
                        });
                    });
                }
            }
        });
    };

    /**
     * setMap
     *
     * @param la - latitude
     * @param lo - longitude
     * @param site - selected site for the organization
     *
     * utility function used to center the map at specified lat and lon
     * If site is specified, lat and lon will be determined by a different site in the list of sites for that organization
     */
    self.setMap = function(la, lo, site){
        self.lat = la;
        self.long = lo;
        if(site) {
            //sites are not zero indexed
            self.lat = self.locInfo[site-1].lat;
            self.long = self.locInfo[site-1].long;
        }
        if((self.lat != "" && self.lat != null && self.lat != 'null') && (self.long != "" && self.long != null && self.long != 'null')) {
            if(self.map) {
                //map has already been initialized, so just update center
                self.map.setCenter({lat: self.lat, lng: self.long});
            }
            self.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: self.lat, lng: self.long},
                zoom: 14
            });
        }
    };

    //run these methods on page load
    self.getCities();
    self.getOrgTypes();
    $("#searcher").moveElements({
        classes: ["medium-3", "columns"]
    });
    //maintains active tab
    var activeTab = "";
    document.getElementById("tabs_modal").addEventListener("click", function(e) {
       if(e.target.nodeName === "A"  && e.target.parentNode.classList.contains("tb1") > -1) {
           if(activeTab != "") {
               activeTab.classList.remove("active");
           }
           activeTab = e.target;
           e.target.classList.add("active");
       }


    });
}]);



