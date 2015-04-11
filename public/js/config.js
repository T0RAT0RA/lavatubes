//Fix console.log on IE < 9
if (!window.console) {
    window.console = {log: function() {}}
}

require.config({
    baseUrl: '/js',
    paths: {
        'jquery'            : 'lib/vendor/jquery.min',
        'jquery-ui'         : 'lib/vendor/jquery-ui.min',
        'underscore'        : 'lib/vendor/underscore-min',
        'bootstrap'         : 'lib/vendor/bootstrap.min',
        'toastr'            : 'lib/vendor/toastr',
        'less'              : '//cdnjs.cloudflare.com/ajax/libs/less.js/1.7.0/less.min'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        }
    }
});