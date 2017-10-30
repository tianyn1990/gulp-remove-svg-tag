'use strict';

let through2 = require('through2'),
    gutil = require('gulp-util'),
    convert = require('xml-js'),
    path = require('path');

module.exports = options => {

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
            return next();
        }

        if (file.isStream()) {

            emitError('cannot convert a stream.');

            this.push(file);
            return next();
        }

        if (file.isBuffer()) {

            let stringXml = file.contents.toString('utf8');
            
            // remove script tag (before invoke function `convert.xml2js`)
            // jQuery uses this regex to remove script tags.
            // from: https://stackoverflow.com/a/6660315/3214001
            const scriptReg = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            if(Boolean(~settings.tagNames.indexOf('script'))) {
                stringXml = stringXml.replace(scriptReg, '');
            }
            // SVG file has `<script>` tag, but has not include in parameter `tagNames` to remove.
            else if(Boolean(~stringXml.indexOf('</script>'))) {
                emitError('SVG file has `<script>` tag, but has not include in parameter `tagNames` to remove.');
            }

            let jsXml = convert.xml2js(stringXml, {compact: false, spaces: 4});
            // console.log(`\n\n---------from----------\n\n`);
            // console.log(jsXml);

            // remove element by tag name.
            let dels = [];
            findByTagName(jsXml, settings.tagNames, function(element, parentElement) {
                // prepare to remove
                let index = 0;
                if(
                    !_isArrayWithContent(parentElement.elements) ||
                    !element ||
                    !~(index = parentElement.elements.indexOf(element))
                ) {
                    return;
                }
                parentElement.elements.splice(index, 1);
                parentElement.elements.unshift(element);
                let hasDel = dels.some((del) => {
                    let _has = del.key === parentElement;
                    if(_has) {
                        del.count ++;
                    }
                    return _has;
                });
                if(!hasDel) {
                    dels.push({
                        key: parentElement,
                        count: 1
                    });
                }
            });
            // truly removed
            dels.forEach((del) => {
                del.key.elements.splice(0, del.count);
            });


            stringXml = convert.js2xml(jsXml, {compact: false, spaces: 4});
            // console.log('\n\n---------to----------\n\n');
            // console.log(stringXml);

            file.contents = new Buffer(stringXml);
            this.push(file);
            return next();
        }

        this.push(file);
        return next();

    });

};
