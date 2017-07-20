var gulp = require('gulp');
var header = require('gulp-header');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

var banner = ['/*!\n',
	' * CactoJS - v<%= pkg.version %>\n',
	' * Licensed under <%= pkg.license %>\n',
	' */\n',
	''
].join('');

gulp.task('minify-js', function() {
	return gulp.src('js/cacto.js')
		.pipe(uglify())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'));
});

gulp.task('copy', function() {
	gulp.src(['node_modules/jquery/dist/jquery.min.js'])
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['minify-js', 'copy']);