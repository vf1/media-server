/*jslint node: true */
"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodewebkit: {
            options: {
                app_name: 'media-server',
                version: '0.9.2',
                build_dir: './nw',
                mac: true,
                win: true,
                linux32: true,
                linux64: true,
                keep_nw: true
            },
            src: [
                './src/**/*',
                './public/**/*',
                './node_modules/**/*',
                '!./node_modules/grunt/**/*',
                '!./node_modules/grunt-*/**/*',
                './server.js',
                './package.json',
                'README.md'
            ]
        },
        copy: {
            nw: {
                src: './nw/releases/media-server/media-server.nw',
                dest: './nw/<%= pkg.name %>-<%= pkg.version %>.nw'
            }
        },
        compress: {
            win: {
                options: {
                    mode: 'zip',
                    archive: './nw/<%= pkg.name %>-<%= pkg.version %>-win-x86.zip'
                },
                expand: true,
                cwd: './nw/releases/media-server/win/media-server',
                src: ['**/*']
            },
            linux32: {
                options: {
                    mode: 'tgz',
                    archive: './nw/<%= pkg.name %>-<%= pkg.version %>-linux-ia32.tar.gz'
                },
                expand: true,
                cwd: './nw/releases/media-server/linux32/media-server',
                src: ['**/*']
            },
            linux64: {
                options: {
                    mode: 'tgz',
                    archive: './nw/<%= pkg.name %>-<%= pkg.version %>-linux-x64.tar.gz'
                },
                expand: true,
                cwd: './nw/releases/media-server/linux64/media-server',
                src: ['**/*']
            },
            macos: {
                options: {
                    mode: 'zip',
                    archive: './nw/<%= pkg.name %>-<%= pkg.version %>-osx-ia32.zip'
                },
                expand: true,
                cwd: './nw/releases/media-server/mac',
                src: ['**/*']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-node-webkit-builder');

    grunt.registerTask('default', ['nodewebkit', 'copy', 'compress']);
};
