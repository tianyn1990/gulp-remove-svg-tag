/*global describe, before, it*/
'use strict';
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var GRST = require('./');
var expect = require('chai').expect;

function noop() {}

describe('gulp-remove-svg-tag', function () {

  var cwd = process.cwd();

  before(function () {
    var exists = fs.existsSync('tmp');
    if (!exists) { fs.mkdirSync('tmp'); }
  });

  after(function () {
    // var exists = fs.existsSync('tmp');
    // if (exists) {
    //   fs.unlinkSync('tmp/style.svg');
    //   fs.unlinkSync('tmp/script.svg');
    //   fs.rmdirSync('tmp');
    // }
  });

  it('remove style tag', function (done) {
    let grst = GRST({
      tagNames: ['style', 'script']
    });
    var content = fs.readFileSync('test/style.svg');
    grst.on('data', function(file) {
      fs.writeFileSync(`tmp/style.svg`, file.contents.toString('utf8'));
    });
    grst.on('end', function () {
      fs.readFile('tmp/style.svg', function (err, svgfile) {
        expect(svgfile).to.be.exist;
        done();
      });
    });

    grst.write(new gutil.File({
      cwd: cwd,
      base: cwd + '/tmp/',
      path: cwd + '/tmp/style.svg',
      contents: new Buffer(content)
    }));

    grst.end();
  });

  it('remove script tag', function (done) {
    let grst = GRST({
      tagNames: ['style', 'script']
    });
    var content = fs.readFileSync('test/script.svg');
    grst.on('data', function(file) {
      fs.writeFileSync('tmp/script.svg', file.contents.toString('utf8'));
    });
    grst.on('end', function () {
      fs.readFile('tmp/script.svg', function (err, svgfile) {
        // console.log(err, svgfile)
        expect(svgfile).to.be.exist;
        done();
      });
    });

    grst.write(new gutil.File({
      cwd: cwd,
      base: cwd + '/tmp/',
      path: cwd + '/tmp/script.svg',
      contents: new Buffer(content)
    }));

    grst.end();
  });

  it('remove script & style tag', function (done) {
    let grst = GRST({
      tagNames: ['style', 'script']
    });
    var content = fs.readFileSync('test/script1style.svg');
    grst.on('data', function(file) {
      fs.writeFileSync('tmp/script1style.svg', file.contents.toString('utf8'));
    });
    grst.on('end', function () {
      fs.readFile('tmp/script1style.svg', function (err, svgfile) {
        // console.log(err, svgfile)
        expect(svgfile).to.be.exist;
        done();
      });
    });

    grst.write(new gutil.File({
      cwd: cwd,
      base: cwd + '/tmp/',
      path: cwd + '/tmp/script1style.svg',
      contents: new Buffer(content)
    }));

    grst.end();
  });

});
