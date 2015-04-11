require.config({
    paths:{
        "jquery"    : "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
        "jquery-ui" : "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min",
        "less"      : "http://cdnjs.cloudflare.com/ajax/libs/less.js/1.7.0/less.min"
    }
});

define("io", ["/socket.io/socket.io.js"], function(io){ return io; });
define(["lib/class", "lib/underscore.min", "jquery", "jquery-ui", "less"], function(){
    require(["app"]);
});
