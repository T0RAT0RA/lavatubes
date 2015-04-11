define("io", ["/socket.io/socket.io.js"], function(io){ return io; });
define(["lib/class", "underscore", "jquery", "jquery-ui", "less"], function(){
    $(document).ready(function(){
        require(["modules/game"]);
    });
});
