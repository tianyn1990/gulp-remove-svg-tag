'use strict';

let through2 = require('through2'),
    gutil = require('gulp-util'),
    convert = require('xml-js'),
    path = require('path');

module.exports = options => {

    let StringDecoder = require('string_decoder').StringDecoder;
    let decoder = new StringDecoder('utf8');

    const _toStr = Object.prototype.toString;
    const _isArrayWithContent = (ary) => {
        return _toStr.call(ary).toLowerCase() === '[object array]' && ary.length !== 0;
    };

    let settings = options || {};
    if(!_isArrayWithContent(settings.tagNames)) {
        throw new Error('gulp-remove-svg-tag: `tagNames` is not defined in parameter');
    }

    return through2.obj(function (file, encoding, next) {

        let self = this;
        function emitError(errmsg = '') {
            self.emit('error', new gutil.PluginError('gulp-remove-svg-tag', errmsg));
        }

        function findByTagName(jsXml, tagNames, callback, parentElement) {
            if(~tagNames.indexOf(jsXml.name)) {
                callback(jsXml, parentElement);
            }
            (jsXml.elements || []).forEach((subJsXml) => {
                findByTagName(subJsXml, tagNames, callback, jsXml);
            });
        }

        if (path.extname(file.path).toLowerCase() !== '.svg' || !file.contents.toString('utf8')) {
            this.push(file);
            return next(null, file);
        }

        if (file.isStream()) {
            console.log('file is stream');

            // wrong!
            // let stream = file.contents;
            // let stringXml = decoder.write(stream.read());
            // let result = convert.xml2js(stringXml, {compact: false, spaces: 4});
            // console.log(result.declaration);

            emitError('cannot convert a stream.');

            this.push(file);
            return next(null, file);
        }

        if (file.isBuffer()) {
            console.log('file is buffer');

            let stringXml = file.contents.toString('utf8');
            let jsXml = convert.xml2js(stringXml, {compact: false, spaces: 4});
            // console.log(`\n\n---------from----------\n\n`);
            // console.log(jsXml);

            // remove element by tag name.
            findByTagName(jsXml, settings.tagNames, function(element, parentElement) {
                // console.log(element, parentElement);
                // delete
                let index = 0;
                if(
                    !_isArrayWithContent(parentElement.elements) ||
                    !element ||
                    !~(index = parentElement.elements.indexOf(element))
                ) {
                    return;
                }
                parentElement.elements.splice(index, 1);
            });


            stringXml = convert.js2xml(jsXml, {compact: false, spaces: 4});
            // console.log('\n\n---------to----------\n\n');
            // console.log(stringXml);

            file.contents = new Buffer(stringXml);
            this.push(file);
            return next(null, file);
        }

        this.push(file);
        return next(null, file);

    });

};
