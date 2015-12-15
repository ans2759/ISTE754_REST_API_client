/**
 * Created by alexs on 12/11/2015.
 */
// jQuery Plugin Boilerplate
// A boilerplate for kick-starting jQuery plugins development
// version 1.2, April 29th, 2011
// by Stefan Gabos
// with help from Steven Black, Rob Lifford
// http://stefangabos.ro/jquery/jquery-plugin-boilerplate/

// remember to change every instance of "pluginName" to the name of your plugin!
(function($) {

    // here it goes!
    $.fn.moveElements = function(method) {

        // plugin's default options
        var defaults = {

            classes: ["medium-3", "columns"],
            widthFrom: "30%",
            widthTo: "25%",
            marginFrom: "7%",
            marginTo: 0

        }

        // this will hold the merged default and user-provided properties
        // you will have to access the plugin's properties through this object!
        // settings.propertyName
        var settings = {
            /*classes: method.classes,
            widthFrom: method.widthFrom,
            widthTo: method.widthTo,
            marginFrom: method.merginFrom,
            marginTo: method.marginTo*/
        }

        // public methods
        // to keep the $.fn namespace uncluttered, collect all of the plugin's methods in an object literal and call
        // them by passing the string name of the method to the plugin
        //
        // public methods can be called as
        // $(selector).pluginName('methodName', arg1, arg2, ... argn)
        // where "pluginName" is the name of your plugin and "methodName" is the name of a function available in
        // the "methods" object below; arg1 ... argn are arguments to be passed to the method
        //
        // or, from within the plugin itself, as
        // methods.methodName(arg1, arg2, ... argn)
        // where "methodName" is the name of a function available in the "methods" object below
        var methods = {

            // this the constructor method that gets called when the object is created
            init : function(options) {

                // the plugin's final properties are the merged default and user-provided properties (if any)
                // this has the advantage of not polluting the defaults, making the same instace re-usable with
                // new options
                settings = $.extend({}, defaults, options)

                // iterate through all the DOM elements we are attaching the plugin to
                return this.each(function() {

                    var
                        $element = $(this), // reference the jQuery version of the current DOM element
                        element = this; // reference to the actual DOM element
                    helpers.toggleC($element);

                    $element
                        /*.toggleClass("medium-3")
                        .toggleClass("columns")
                        .css("width", "30%")
                        .css("margin", "15% auto");*/
                        .css("width", settings.widthFrom)
                        .css("margin", settings.marginFrom + " auto");


                    // code goes here

                });

            },
            //public methods
            displayData: function(data) {
                // code goes here
                var ids = data[0],
                    cls = data[1],
                    opts = data[2];

                var len = ids.length;
                for(var i = 0; i < len; i++) {
                    document.getElementById(ids[i]).style.display = "block";
                }
                //move searcher back to original spot
                for(var i = 0; i < cls.length; i++) {
                    $(this).addClass(cls[i]);
                }
                $(this)
                    .css("width", opts[0])
                    .css("margin", opts[1]);
            }

        }

        // private methods
        // these methods can be called only from within the plugin
        //
        // private methods can be called as
        // helpers.methodName(arg1, arg2, ... argn)
        // where "methodName" is the name of a function available in the "helpers" object below; arg1 ... argn are
        // arguments to be passed to the method
        var helpers = {

            // a private method. for demonstration purposes only - remove it!
            foo_private_method: function() {

                // code goes here

            },
            toggleC: function($e) {
                for(var i = 0; i < settings.classes.length; i++) {
                    $e.toggleClass(settings.classes[i]);
                }
            }

        }

        // if a method as the given argument exists
        if (methods[method]) {

            // call the respective method
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

            // if an object is given as method OR nothing is given as argument
        } else if (typeof method === 'object' || !method) {

            // call the initialization method
            return methods.init.apply(this, arguments);

            // otherwise
        } else {

            // trigger an error
            $.error( 'Method "' +  method + '" does not exist in pluginName plugin!');

        }

    }

})(jQuery);