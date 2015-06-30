# tng

A full-featured PNG renderer for the terminal, built for [blessed][blessed].

Convert any `.png` file (or `.gif`, see below) to an ANSI image and display it
as an element or ANSI text.

Blessed uses an internal from-scratch PNG reader because no other javascript
PNG reader supports Adam7 interlaced images (much less pass the png test
suite).

The blessed PNG reader supports adam7 deinterlacing, animation (APNG), all
color types, bit depths 1-32, alpha, alpha palettes, and outputs scaled bitmaps
(cellmaps) in blessed for efficient rendering to the screen buffer. It also
uses some code from libcaca/libcucul to add density ASCII characters in order
to give the image more detail in the terminal.

`.gif` files are also supported via a javascript implementation (they are
internally converted to bitmaps and fed to the PNG renderer). Any other image
format is support only if the user has imagemagick (`convert` and `identify`)
installed.


## Example

``` js
var tng = require('tng');

var img = tng(process.env.HOME + '/helloworld.png', {
  // less memory on animation (handle blending and dispose while rendering):
  optimization: 'mem',
  // add ascii characters for more detail (similar to libcaca):
  ascii: true,
  // scale cellmap to 20%:
  scale: 0.20,
  // OR:
  // ensure a width of 30 cells, maintains aspect ratio:
  // width: 30,
  // OR:
  // ensure a height of 10 cells, maintains aspect ratio:
  // height: 10
});

if (img.frames) {
  img.play(function render(bmp, cellmap) {
    // Executed on each frame:
    var ansi = img.renderANSI(cellmap);
    process.stdout.write('\x1b[H\x1b[J');
    process.stdout.write(ansi + '\n');
  });
  setTimeout(function() {
    img.pause();
    setTimeout(function() {
      img.play();
    }, 2000);
  }, 3000);
} else {
  var ansi = img.renderANSI(img.cellmap);
  process.stdout.write(ansi + '\n');
}
```


### Test Output

``` bash
$ cd ./tng
$ node test test/apng/spinfox.png
$ node test full test/png/*
```


## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`


## License

Copyright (c) 2015, Christopher Jeffrey. (MIT License)

See LICENSE for more info.

[blessed]: https://github.com/chjj/blessed
