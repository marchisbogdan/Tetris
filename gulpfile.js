var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');
var jslint = require('gulp-jslint');
var imagemin = require('gulp-imagemin');
var babel = require('gulp-babel');

// PATHS
var PATH = {
	jsSrc: 'app/js/*.js',
	jsToMinify: 'app/js/babelScript.js',
	jsBabelDest: 'app/js/',
	jsToIgnore: '!app/js/babelScript.js',
	jsDest: 'dist/js/',
	cssSrc: 'app/css/*.css',
	cssDest: 'dist/css/',
	scssFilesSrc: 'app/scss/**/*.scss',
	mainScssSrc: 'app/scss/main.scss',
	mainScssDest: 'app/css',
	htmlFilesSrc: 'app/*.html',
	htmlSrc:'app/index.html',
	imgSrc: 'app/images/**/*.+(png|jpg|gif|svg)',
	imgDest: 'dist/images'
}


function errorLog(message) {
	console.log(message.message);
}
/* to check if gulp is working*/
gulp.task('hi', function() {
	console.log("Hello mate!");
});

gulp.task('test', function() {
	gulp.src('app/scss/thiss.scss')
		.pipe(sass({
			//outputStyle: 'compressed'
		})) // Using gulp-sass
		.pipe(gulp.dest(PATH.mainScssDest))
});

gulp.task('sass', function() {
	gulp.src(PATH.mainScssSrc)
		.pipe(sourcemaps.init())
		.pipe(sass({
			errLogToConsole: true,
			outputStyle: 'expanded'
				//outputStyle: 'compressed'
		}))
		.on('error', errorLog)
		.pipe(sourcemaps.write())
		.pipe(autoprefixer({ browsers: ["last 2 versions", '> 5%'] }))
		.pipe(gulp.dest(PATH.mainScssDest))
});

gulp.task('create-dist', function() {
	gulp.src(PATH.htmlSrc)
		.pipe(gulp.dest('dist/'))
});

gulp.task('js-minifier', function() {
	gulp.src(PATH.jsToMinify)
		.pipe(sourcemaps.init())
		.pipe(concat('script.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.on('error', errorLog)
		.pipe(gulp.dest(PATH.jsDest))
});

gulp.task('js-hinter', function() {
	gulp.src(PATH.jsSrc)
		.pipe(jshint())
		//.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('css-minifier', function() {
	gulp.src(PATH.cssSrc)
		.pipe(concat('main.css'))
		.pipe(minify())
		.on('error', errorLog)
		.pipe(gulp.dest(PATH.cssDest))
});

gulp.task('images',function () {
	gulp.src(PATH.imgSrc)
		.pipe(imagemin({
			interlaced: true
		}))
		.pipe(gulp.dest(PATH.imgDest))
});

gulp.task('babel',function () {
	gulp.src([PATH.jsSrc, PATH.jsToIgnore])
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat("babelScript.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(PATH.jsBabelDest));
});

gulp.task('watch', function() {
	var filesToWatch = [PATH.scssFilesSrc, PATH.jsSrc, PATH.cssSrc];
	console.log("Started looking at files from " + filesToWatch);
	gulp.watch(PATH.scssFilesSrc, function() {   
		gulp.run(['sass']);  
	});
	gulp.watch(PATH.cssSrc, function() {   
		gulp.run(['css-minifier']);  
	});
	gulp.watch(PATH.imgSrc, function(){
		gulp.run(['images']);
	});
	gulp.watch(PATH.jsSrc, function() {   
		gulp.run(['js-hinter', 'babel', 'js-minifier']);  
	});
	gulp.watch(PATH.htmlFilesSrc, function() {   
		gulp.run(['create-dist']);  
	});
})

// just for js hinting
gulp.task('watch-js',function(){
		gulp.watch(PATH.jsSrc, function() {
			gulp.run(['js-hinter']);
		});
})

gulp.task('default', ['sass', 'js-hinter', 'js-minifier', 'css-minifier', 'create-dist', 'watch']);
// gulp.src(config.path.styles.src)
//        .pipe(concat(config.path.concat.style))
//        .pipe(sass({
//            //to have my sass css compresed:
//            outputStyle: 'compressed'
//            //outputStyle: 'extended'
//        }))
//        .on('error', errorLog)
//        .pipe(prefix({
//            browsers: ['last 2 versions', 'safari 5'],
//            cascade: false
//        }))
//        .pipe(gulp.dest(config.path.styles.dest))
