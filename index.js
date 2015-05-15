var utilities  = require('./utilities');
var parsePath  = require('parse-filepath');
var vinylPaths = require('vinyl-paths');
var elixir     = require('laravel-elixir');
var rev        = require('gulp-rev');
var gulp       = require('gulp');
var del        = require('del');
var fs         = require('fs');

var publicDir = elixir.config.publicDir;

/*
 |----------------------------------------------------------------
 | Versioning / Cache Busting
 |----------------------------------------------------------------
 |
 | This task will append a small hash on the end of your file
 | and generate a manifest file which contains the current
 | "version" of the filename for the application to use.
 |
 */

elixir.extend('versions', function (src, buildDir) {
	src = utilities.prefixDirToFiles(publicDir, src);
	if (!elixir.config.versionfiles) {
		elixir.config.versionfiles = new Array();
	}
	elixir.config.versionfiles.push({
		src     : src,
		buildDir: buildDir
	});
	buildTask(src, buildDir);

	this.registerWatcher('versions', src);

	return this.queueTask('versions');
});


/**
 * Build the "version" Gulp task.
 *
 * @param  {string} src
 * @param  {string} buildDir
 * @return {object}
 */
var buildTask = function (src, buildDir) {

	gulp.task('versions', function () {

		elixir.config.versionfiles.map(function (version) {
			src      = version.src;
			buildDir = getBuildDir(version.buildDir);

			var files = vinylPaths();

			utilities.logTask("Versioning", src);

			// To start, we'll clear out the build directory,
			// so that we can start from scratch.
			del.sync(buildDir + '/*', {force: true});

			return gulp.src(src, {base: './' + publicDir})
				.pipe(gulp.dest(buildDir))
				.pipe(files)
				.pipe(rev())
				.pipe(gulp.dest(buildDir))
				.pipe(rev.manifest())
				.pipe(gulp.dest(buildDir))
				.on('end', function () {
					src      = version.src;
					buildDir = getBuildDir(version.buildDir);
					// We'll get rid of the duplicated file that
					// usually gets put in the "build" folder,
					// alongside the suffixed version.
					del(files.paths, {force: true});

					// We'll also copy over relevant sourcemap files.
					copyMaps(src, buildDir);
				});
		});
	});

};


/**
 * Prepare the path to the build directory.
 *
 * @param  {string} buildDir
 * @return {string}
 */
var getBuildDir = function (buildDir) {
	var baseDir = buildDir || publicDir;

	return baseDir + '/build';
};


/**
 * Copy source maps to the build directory.
 *
 * @param  {string} src
 * @param  {string} buildDir
 * @return {object}
 */
var copyMaps = function (src, buildDir) {

	// We'll first get any files from the src
	// array that have companion .map files.
	var mappings = [];

	src.forEach(function (file) {
		var map = file + '.map';

		if (fs.existsSync(map)) {
			mappings.push(map);
		}
	});

	// And then we'll loop over this mapping array
	// and copy each over to the build directory.
	mappings.forEach(function (mapping) {
		var map = mapping.replace(publicDir, buildDir);

		gulp.src(mapping).pipe(gulp.dest(parsePath(map).dirname));
	});
};
