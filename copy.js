var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;
console.log(argv);
_argv = argv._;

var srcdir = _argv[0];
var destdir = _argv[1];
var overwrite = !!argv.f;
var move = !!argv.m;
//console.log(overwrite);

var EXCEPT_FOLDER = 'node_modules';


// console.log('srcdir: ' + srcdir);
// console.log('destdir: ' + destdir);
walk(srcdir);

// function localDel(_path, isFile) {
// 	var del;
// 	if (isFile) {
// 		del = spawn("cmd", ['/c', "del /F/Q " + _path], {
// 			stdio: "inherit"
// 		});
// 	} else {
// 		del = spawn("cmd", ['/c', "rd /S/Q " + _path], {
// 			stdio: "inherit"
// 		});
// 	}
// }

function nodeDel(_path, isFile) {
	var delFunc = isFile ? fs.unlinkSync : fse.removeSync;
	delFunc(_path);
	console.log('success delete:' + _path);
}


function del(_path, isFile) {
	isFile = !!isFile;
	console.log('you want to del: ' + _path + '  is: ' + (isFile ? 'file' : 'folder'));
	try {
		if (move) {
			nodeDel(_path, isFile);
		}
	} catch (err) {
		console.log(err);
	}
}


function walk(dir) {
	try {
		var files = fs.readdirSync(dir);
		for (var i in files) {
			var file = files[i];
			var _path = path.join(dir, file);
			// console.log(_path);
			var _stat = fs.statSync(_path);
			var _destpath = _path.replace(srcdir, destdir);
			// console.log('srcpath: ' + _path);
			// console.log('destpath: ' + _destpath);
			if (_stat.isDirectory()) {
				if (_path.indexOf(EXCEPT_FOLDER) === -1) {

					fse.ensureDirSync(_destpath);
					// console.log('start walk: ' + _path);
					walk(_path);
				} else {
					console.log('node modules path: ' + _path);
					del(_path);
				}
			} else if (_stat.isFile()) {
				// console.log('ready to copy: ' + _path);
				fse.copySync(_path, _destpath);
				del(_path, true);
			}
		}
		del(dir);
	} catch (err) {
		console.log(err);
	}

}