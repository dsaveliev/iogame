// npm install --global gulp-cli
// npm install --save-dev gulp
// npm install --save-dev gulp-concat
// npm install --save-dev gulp-uglify
// npm install --save-dev gulp-order

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
// var order = require("gulp-order");

gulp.task('minify', function() {
  gulp.src(['./public/js/bindings.js',
            './public/js/minimap.js',
            './public/js/player.js',
            './public/js/raycasting.js',
            './public/js/websocket.js',
            './public/js/main.js'])
    .pipe(concat('bundle.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('./public/js/'))
});

gulp.task('default', ['minify']);
