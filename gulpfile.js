'use strict';

const eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  gUtil = require('gutil'),
  karma = require('karma'),
  KarmaServer = karma.Server,
  path = require('path'),
  jsPatterns = [
    'karma.conf.js',
    'gulpfile.js',
    'Gruntfile.js',
    'scripts/**/*.js',
    'src/**/*.js'
  ];

function runKarma(configFile) {
  return new Promise(function (resolve, reject) {
    const server = new KarmaServer({
      configFile: path.join(__dirname, configFile),
      singleRun: true
    }, function (exitCode) {
      console.log('karma exit code', exitCode);
      reject();
    });

    server.start();
  });
}

gulp.task('eslint', function () {
  return globby(jsPatterns).then(function (paths) {
    console.log('eslint', paths);
    // additional CLI options can be added here
    let code = eslint.execute(paths.join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

gulp.task('karma-main', function () {
  return runKarma('karma.main.conf.js');
});

gulp.task('karma-renderer', function () {
  return runKarma('karma.renderer.conf.js');
});

gulp.task('jsx', function () {
  return gulp.src('public/jsx/**/*.jsx')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .pipe(concat('startup.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('lint', ['eslint']);
gulp.task('test', ['lint', 'karma-renderer', 'karma-main']);
gulp.task('build', []);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch('public/**/*.js', ['karma-renderer']);
  gulp.watch('src/**/*.js', ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
