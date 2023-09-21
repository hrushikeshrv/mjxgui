module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                src: ['src/modules/expression-backend.js', 'src/modules/controller.js', 'src/modules/ui.js'],
                dest: 'src/mjxgui.js',
            },
            buildExample: {
                src: ['src/modules/expression-backend.js', 'src/modules/controller.js', 'src/modules/ui.js'],
                dest: 'docs/js/mjxgui.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! mjxgui <%= grunt.template.today("yyyy-mm-dd") %> | (C) Hrushikesh Vaidya (@hrushikeshrv) | MIT License */',
            },
            build: {
                src: 'src/mjxgui.js',
                dest: 'src/mjxgui.min.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
}