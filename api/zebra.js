var fs = require('fs');
var path = require('path');
var buf = require('buffer');
var getDirName = require("path").dirname;

var config, srcPath, outPath;
var basePath = process.cwd();
var folders = [];
var timeHanlder, watchTimer;

function traverse(path, floor) {
	if(timeHanlder){
		clearTimeout(timeHanlder);
	}
	timeHanlder = setTimeout(function(){
		doPack();
	}, 1000);
    floor++;
    fs.readdir(path, function(err, files) {
        if (err) {
            console.log('read dir error');
            handleFile(path, floor);  
        } else {
        	folders.push(path);
            files.forEach(function(item, index) {
                var tmpPath = path + '/' + item;  
                fs.stat(tmpPath, function(err1, stats) {
                    if (err1) {
                        console.log('stat error'); 
                    } else {
                        if (stats.isDirectory()) {
                            traverse(tmpPath, floor);  
                        } else {
                            handleFile(tmpPath, floor);  
                        }
                    }
                });
            });
        }
    });  
}

function handleFile(path, floor){
    var ext = path.split('.');
    ext = ext[ext.length-1];
	switch(ext.toLowerCase()){
		case 'js':
			preproccessJs(path);
		break;
		case 'json':
			preproccessFile(path);
		break;
		case 'css':
			preproccessCss(path);
		break;
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'svg':
			preproccessImage(path);
		break;
		case 'html':
			preproccessHTML(path);
		break;
		default:
			preproccessFile(path);
		break;
	}
}

function getConfig(){
	var jsData = fs.readFileSync(basePath + '/zebra-config.json', "utf-8");  
	config = JSON.parse(jsData);
}

function relative2absolute(path, base) {
    if (path.match(/^\//)) {
        return path;
    }
    var pathParts = path.split('/');
    var basePathParts = base.split('/');

    var item = pathParts[0];
    while(item === '.' || item === '..') {
        if (item === '..') {
            basePathParts.pop();
        }
        pathParts.shift();
        item = pathParts[0];
    }
    return basePathParts.join('/') + '/' + pathParts.join('/');
}

function preproccessJs(path){
	var jsData = fs.readFileSync(path,"utf-8");
	var relativeOutPath = outPath.replace(basePath, ''), // /build
        relativePath = path.replace(srcPath, ''), // /build/dust/..
        relativeDir = getDirName(path).replace(srcPath, '');  // /dust/...
	var outFile = outPath + relativePath;

    //给module注入路径
	var reg = /module\s*\(\s*(function\s*\(.*?\)\s*\{)/;
	jsData = jsData.replace(reg, function(s0, s1){
		return 'module("'+ relativeOutPath + relativePath+'", ' + s1;
	});

    //将require的相对路径换成绝对路径
    var reg2 = /require\(([^\)]+)\)/g;
    jsData = jsData.replace(reg2, function(s0, s1){
        var rpath = s1.slice(1, -1);
        if(/^(\.\/)|(\.\.\/)/.test(rpath)){
            rpath = relative2absolute(rpath, relativeDir);
        }
        if(rpath.slice(-3) != '.js'){
            rpath += '.js';
        }
        console.log('>> [', relativeOutPath + rpath, ']');
        return 'require("'+ relativeOutPath + rpath +'")';
    });

    //将inline的内容注入
    var reg3 = /__inline\(([^\)]+)\)/g;
    jsData = jsData.replace(reg3, function(s0, s1){
        var rpath = s1.slice(1, -1);
        if(/^(\.\/)|(\.\.\/)/.test(rpath)){
            rpath = srcPath + relative2absolute(rpath, relativeDir);
        }
        return '"' + getFileAsString(rpath) + '"';
    });
    
    writeFile(outFile, jsData, 'utf-8');
}

function doPack(){
	var js = config.rules.js;
	if(js.pack){
		for(var p in js.pack){
			var outFile = outPath + p;
			var files = js.pack[p];
			var packTemp = [];
			files.forEach(function(item, idx){
				var filePath = outPath + item;
				packTemp.push(fs.readFileSync(filePath, "utf-8"));
				fs.unlinkSync(filePath);
			});
			writeFile(outFile, packTemp.join(''), 'utf-8');
		}
	}
	doWatch();
}

function preproccessCss(path){
	var css = config.rules.css;
	css && css.copy && copyFile(path);
}

function preproccessImage(path){
	var image = config.rules.image;
	image && image.copy && copyFile(path);
}

function preproccessHTML(path){
	var html = config.rules.html;
	html && html.copy && copyFile(path);
}

function preproccessFile(path){
	var other = config.rules.other;
	other && other.copy && copyFile(path);
}


function getFileAsString(path) {
    var fileData = fs.readFileSync(path,"utf-8");
    fileData = fileData.replace(/\r\n|\n/mg, '\\n'); // \n
    fileData = fileData.replace(/'/mg, "\\'");  // '
    fileData = fileData.replace(/"/mg, '\\"');  // "
    return fileData;
}

function writeFile(path, contents, type) {
    var dir = getDirName(path);
	var dirs = dir.split('/'), temp = dirs.shift();
	while(dirs.length > 0){
		temp += '/' + dirs.shift();
		if(!fs.existsSync(temp)){
			fs.mkdirSync(temp);
		}
	}
	if(type == 'binary'){
		fs.writeFileSync(path, contents.toString('binary'), "binary");
	} else {
		fs.writeFileSync(path, contents, 'utf-8');
	}
}

function copyFile(path) {
	var data = fs.readFileSync(path, "binary");
	var relativeOutPath = outPath.replace(basePath, ''), // /build
        relativePath = path.replace(srcPath, ''); // /build/dust/..
	var outFile = outPath + relativePath;
	writeFile(outFile, data, "binary");
}

function setup(){
	getConfig();
	srcPath = relative2absolute(config.base, basePath);
	outPath = relative2absolute(config.output, basePath);

	traverse(srcPath, 0);
}

function watchDir(path){
	fs.watch(path, {persistent: true}, function(type, file){
		console.log('>>', path + '/' + file);
		if(watchTimer){
			clearTimeout(watchTimer);
		}
		watchTimer = setTimeout(function(){
			traverse(srcPath, 0);
			//handleFile(path + '/' + file, 0);
		}, 500);
	});
}

function doWatch(){
	console.log('[watch]...');
	folders.forEach(function(item, index){
		watchDir(item);
	});
}

setup();
