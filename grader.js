#!/usr/bin/env node

var fs=require('fs');
var program = require('commander');
var cheerio=require('cheerio');
var HTMLFILE_DEFAULT="index.html";
var CHECKSFILE_DEFAULT="check.json";
var rest = require('restler');

var assertFileExists = function(infile) {
   
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist/ Exiting.",instr);
	process.exit(1);
     }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

var final=function(out){
    console.log(out);
    fs.writeFileSync("result.txt",out);
}

var buildfn = function(checkJson,chk){
    var func=function(result,resonse) {
    if(result instanceof Error){
	console.error('Error: '+util.format(response.message));
	process.exit(1);
     } 
    else {
	 //console.log("getting response");
	fs.writeFileSync("out.txt",result);
	checkJson = checkHtmlFile("out.txt",chk);
	var outJson = JSON.stringify(checkJson,null,4);
	//console.log("Result : "+outJson);
	final(outJson);
     } 

};
return func;
};

if(require.main == module) {
    program
          .option('-c, --checks <check_file>','Path to checks.json',clone(assertFileExists),CHECKSFILE_DEFAULT)
          .option('-f, --file <html_file>','Path to index.html', clone(assertFileExists))
          .option('-u, --url <url>','url link')
          .parse(process.argv);
 
    var checkJson;
    var fl=program.file;
    var chk = program.checks;
   if(program.file){
     //  console.log("file is provided");
      checkJson = checkHtmlFile(program.file,program.checks);
       var outJson = JSON.stringify(checkJson,null,4);
       //console.log("Result : " + outJson);
       final(outJson);
   }
    else if(program.url){
	func=buildfn(checkJson,chk);
	rest.get(program.url).on('complete',func);
	//checkJson = checkHtmlFile("out.txt",program.checks);
    }
    else{
	console.log("URL/File is missing");
	process.exit(1);
    }
//console.log("parsing done");
  //  var outJson = JSON.stringify(checkJson,null,4);
   // console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
