var gulp = require('gulp'),
    jshint = require('gulp-jshint');


gulp.task('jsLint', function () {
    gulp.src('public/javascripts/*/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter());
});

gulp.task('default',['jsLint']);

