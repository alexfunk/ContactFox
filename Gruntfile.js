module.exports = function(grunt) {
    var srcFileArray = ['js/c*.js', 'js/ContactFox.js'];
    var testFileArray = ['test/**.js'];
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %>, <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: srcFileArray,
                dest: 'dist/js/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            options: {
                banner: '/*! <%= pkg.name %>, <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: srcFileArray,
                dest: 'dist/js/<%= pkg.name %>.min.js'
            }
        },
        copy: {
            libs: {
                src: ['lib/jquery.mobile-1.4.0.js'],
                dest: 'dist/'
            },
            resources: {
                src: ['m.html', 'lib/jquery.mobile-1.4.0.css', 'lib/images/*', 'images/*'],
                dest: 'dist/'
            },
            locales: {
                src: ['locales/**'],
                dest: 'dist/'
            },
            jquery: {
                expand: true,
                files: [{
                    expand: true,
                    cwd: 'node_modules/jquery/dist/',
                    src: ['jquery.min.js'],
                    dest: 'dist/lib/'
                }]
            },
            i18next: {
                expand: true,
                files: [{
                    expand: true,
                    cwd: 'node_modules/i18next/lib/dep/',
                    src: ['i18next.min.js'],
                    dest: 'dist/lib/'
                }]
            }
        },
        jshint: {
            sources: {
                // eclipse requires some semicolons that jshint would not accept by default
                // so we tell that they should be ignored here.
                options: {
                    '-W032': true,
                },
                src: srcFileArray
            },
            tests: {
                src: testFileArray
            },
            locales: {
                src: 'locales/**/*.json'
            }
        },
        jsbeautifier: {
            sources: {
                src: srcFileArray
            },
            tests: {
                src: testFileArray
            },
            grunt: {
                src: 'Gruntfile.js'
            },
            locales: {
                src: 'locales/**/*.json'
            }
        },
        firefoxManifest: {
            options: {
                manifest: 'dist/manifest.webapp',
            },
            ContactFoxManifest: {}
        },
        clean: {
            dist: ['dist'],
            release: ['release'],
        },
        nodeunit: {
            all: testFileArray
        },
        prettify: {
            options: {
                indent: 2,
                indent_char: ' ',
                wrap_line_length: 78,
                brace_style: 'expand',
                unformatted: ['a']

            },
            files: {
                src: 'm.html',
                dest: 'dist/m.html'
            }
        },
        // make a zipfile
        compress: {
            main: {
                options: {
                    archive: 'release/<%= pkg.name %><%= pkg.version %>.zip'
                },
                files: [{
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: '/'
                    } // includes files in path and its subdirs
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-firefox-manifest');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-prettify');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task: compress the sources to create a distributable
    grunt.registerTask('default', ['uglify', 'copy', 'firefoxManifest', 'compress']);
    // for development: checkt the source, create a uncompressed version and copy it to the dist 
    grunt.registerTask('debug', [ 'jshint', 'nodeunit', 'concat', 'copy', 'firefoxManifest', 'compress']);
    // on demand w can automatically format the source from grunt
    grunt.registerTask('beutify' [ 'jsbeautifier','prettyfy']);

};
