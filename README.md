# gulp-remove-svg-tag

[![Build Status](https://travis-ci.org/tianyn1990/gulp-remove-svg-tag.svg?branch=master)](https://travis-ci.org/tianyn1990/gulp-remove-svg-tag)

A gulp plugin for removing file elements by tag name.

## Install

```
$ npm install --save-dev gulp-remove-svg-tag
```


## Usage

```js
let grst = require('gulp-remove-svg-tag');

gulp.task('svg_opt', () => {

    return gulp.src('src/svg/*')
        .pipe(grst({
            tagNames: ['style', 'script']
        }))
        .pipe(gulp.dest('dest/svg'));
});
```


## Options

