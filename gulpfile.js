var
  gulp       = require('gulp'),
  gutil      = require('gulp-util'),
  sass       = require('gulp-sass'),
  watch      = require('gulp-watch'),
  rename     = require('gulp-rename'),
  size       = require('gulp-size'),
  livereload = require('gulp-livereload'),
  plumber    = require('gulp-plumber');

var pkg = require('./package.json');

// ------------------------------------
// Error handler
var onError = function (err) {
  gutil.beep();
  gutil.log(gutil.colors.red(err));
  this.emit( 'end' );
};

// ------------------------------------
// Combine and compile SCSS / CSS
gulp.task('css', function(){
  gulp.src([
    'css/scss/RYPP.scss',
  ])
  .pipe(plumber({errorHandler: onError}))
  .pipe(sass())
  .pipe(rename('RYPP.css'))
  .pipe(gulp.dest('css'))
  .pipe(size())
  .pipe(livereload());
});

// ------------------------------------
// Gulp watch
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('./css/scss/**/*', ['css']);
});

// ------------------------------------
// Default task code
gulp.task('default', ['css']);
