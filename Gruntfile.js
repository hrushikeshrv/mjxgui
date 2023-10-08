module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        htmlmin: {
            src: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'src/modules/editor.min.html': 'src/modules/editor.html'
                }
            }
        },
        injectHTML: {
            options: {
                html: 'src/modules/editor.min.html',
                src: 'src/modules/ui.js'
            },
        },
        concat: {
            build: {
                src: ['src/modules/expression-backend.js', 'src/modules/cursor.js', 'src/modules/ui.js'],
                dest: 'src/mjxgui.js',
            },
            buildExample: {
                src: ['src/modules/expression-backend.js', 'src/modules/cursor.js', 'src/modules/ui.js'],
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
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    grunt.registerTask('injectHTML', function() {
        const options = this.options();
        const template = grunt.file.read(options.html);
        const src = grunt.file.read(options.src);

        const content = src.replace(/\{\{\seditor_html\s}}/, template);
        grunt.file.write(options.src, content);
    })

    grunt.registerTask('default', ['htmlmin', 'injectHTML', 'concat', 'uglify']);
    grunt.registerTask('inject-ui', ['htmlmin', 'injectHTML']);
}