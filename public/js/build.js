({
    name: 'app',
    out: 'built/app.js',
    paths: {
        'jquery'            : 'lib/vendor/jquery.min',
        'jquery-ui'         : 'lib/vendor/jquery-ui.min',
        'underscore'        : 'lib/vendor/underscore-min',
        'bootstrap'         : 'lib/vendor/bootstrap.min',
        'toastr'            : 'lib/vendor/toastr',
        'less'              : 'empty:'
    },
    include: [
        'lib/vendor/require.js',
        'config.js'
    ]
})
