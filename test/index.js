#!/usr/bin/env node

/**
 * PNG Main
 */

var fs = require('fs');
var path = require('path');
var util = require('util');
var cp = require('child_process');

/**
 * Main
 */

var PNG = require('../');

PNG.prototype.testOutput = function() {
  var self = this
    , lines;

  lines = this.bmp.reduce(function(lines, pixels) {
    var line = '  [\n';
    pixels.forEach(function(pixel) {
      line += '    ' +
        JSON.stringify([pixel.r, pixel.g, pixel.b, pixel.a])
        + ',\n'
    });
    line += '  ],\n';
    lines += line;
    return lines;
  }, '[\n') + ']';

  lines = lines
    .replace(/\],(\s*)\]/g, ']$1]')
    .replace(/\],(\s*)\]/g, ']$1]');

  fs.writeFileSync(__dirname + '/../png.json', lines);

  if (this.frames && pngs.length === 1) {
    this.play(function render(bmp, cellmap) {
      var img;
      process.stdout.write('\x1b[H\x1b[J');
      if (argv.full) {
        img = self.renderANSI(bmp);
      } else {
        img = self.renderANSI(cellmap);
      }
      process.stdout.write(img + '\n');
    });
    // setTimeout(function() {
    //   self.pause();
    //   setTimeout(function() {
    //     self.play();
    //     setTimeout(function() {
    //       self.stop();
    //       setTimeout(function() {}, 2 * 1000);
    //     }, 2 * 1000);
    //   }, 2 * 1000);
    // }, 3 * 1000);
    return;
  }

  var img;
  if (argv.full) {
    img = this.renderANSI(this.bmp);
  } else {
    img = this.renderANSI(this.cellmap);
  }

  process.stdout.write(img + '\n');
};

function render(file, filename) {
  try {
    var img = PNG(file, {
      log: debug,
      ascii: argv.ascii,
      optimization: argv.optimization,
      scale: argv.scale,
      width: argv.width,
      height: argv.height,
      speed: argv.speed,
      filename: filename
    });
    img.testOutput();
  } catch (e) {
    console.log(e.stack + '');
  }
  return img;
}

/**
 * Debug
 */

function debug() {
  var out = '';
  var cb = typeof arguments[arguments.length - 1] === 'function'
    ? arguments[arguments.length - 1]
    : function() {};

  if (!debug.stream) {
    process.on('uncaughtException', function(err) {
      debug(err.stack + '\n', function() {
        process.stderr.write(err.stack + '\n');
        process.exit(1);
      });
    });
    debug.stream = fs.createWriteStream(__dirname + '/../debug.log');
  }

  Array.prototype.slice.call(arguments).forEach(function(data) {
    if (typeof data === 'object') {
      out += util.inspect(data, false, 20, true) + '\n';
    } else if (typeof data === 'function') {
      ;
    } else {
      out += data + '\n';
    }
  });

  return debug.stream.write(out, cb);
}

function curl(url) {
  try {
    return cp.execFileSync('curl',
      ['-s', '-A', '', url],
      { stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    ;
  }
  try {
    return cp.execFileSync('wget',
      ['-U', '', '-O', '-', url],
      { stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    ;
  }
  throw new Error('curl or wget failed.');
}

/**
 * Execute
 */

var argv = {};

process.argv = process.argv.map(function(arg, i) {
  if (~arg.indexOf('=')) {
    arg = arg.split('=');
    if (/^[0-9.]+$/.test(arg[1])) arg[1] = +arg[1];
    argv[arg[0].replace(/^-+/, '')] = arg[1];
    return;
  }
  if (arg.indexOf('--') === 0) {
    arg = arg.slice(2);
    argv[arg] = true;
    return;
  }
  return arg;
}).filter(Boolean);

var defaultFile = __dirname + '/misc/qr.png';
var file = defaultFile;
var pngs = fs.readdirSync(__dirname + '/png').map(function(file) {
  return path.resolve(__dirname, 'png', file);
}).filter(function(file) {
  return path.extname(file) === '.png';
});

var interlaced = [
  'basi0g01.png',
  'basi0g02.png',
  'basi0g04.png',
  'basi0g08.png',
  'basi0g16.png',
  'basi2c08.png',
  'basi2c16.png',
  'basi3p01.png',
  'basi3p02.png',
  'basi3p04.png',
  'basi3p08.png',
  'basi4a08.png',
  'basi4a16.png',
  'basi6a08.png',
  'basi6a16.png',
  'bgai4a08.png',
  'bgai4a16.png',
  's01i3p01.png',
  's02i3p01.png',
  's03i3p01.png',
  's04i3p01.png',
  's05i3p02.png',
  's06i3p02.png',
  's07i3p02.png',
  's08i3p02.png',
  's09i3p02.png',
  's32i3p04.png',
  's33i3p04.png',
  's34i3p04.png',
  's35i3p04.png',
  's36i3p04.png',
  's37i3p04.png',
  's38i3p04.png',
  's39i3p04.png',
  's40i3p04.png'
].map(function(file) {
  return path.resolve(__dirname, 'png', file);
});

var arg = process.argv[2];

if (argv.i) {
  argv.all = true;
  pngs = interlaced;
}

if (argv.rand) {
  file = pngs[Math.random() * pngs.length | 0];
  setImmediate(function() {
    console.log(file);
  });
} else if (/^[0-9]+$/.test(arg)) {
  file = pngs[arg];
  setImmediate(function() {
    console.log(file);
  });
} else if (arg) {
  pngs = process.argv.slice(2);
  argv.all = true;
}

if (argv.all) {
  var i = 0;
  (function next() {
    var file;
    if (argv.rand) {
      file = pngs[Math.random() * pngs.length | 0];
    } else {
      file = pngs[i++];
    }
    if (!file) return;
    console.log(file);
    if (/^https?:/.test(file) ) {
      var buf = curl(file);
      render(buf, file);
    } else {
      // render(fs.readFileSync(file), file);
      render(file);
    }
    if (argv.feh) {
      try {
        cp.execSync('killall feh; feh -g 200x300 -Z ' + file, { stdio: 'ignore' });
      } catch (e) {
        ;
      }
    }
    setTimeout(next, 100);
  })();
  return;
}

if (file === defaultFile) argv.full = true;

render(file);
