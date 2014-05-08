module.exports = function(grunt) {

  // 1. All configuration goes here
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/RYPP.css': 'public/css/source/RYPP.css.scss'
        }
      }
    },
    watch: {
      css: {
        files: ['**/*.css', '**/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
          livereload: true,
        },
      }
    }

  });

  // Plugins we use
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Tell Grunt what to do when we type "grunt" into the terminal.
  grunt.registerTask('default', ['sass']);
};
