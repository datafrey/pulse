const fs = require('fs');
const path = require('path');

const gulp = require('gulp');
const browserSync = require('browser-sync');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const webpackStream = require('webpack-stream');
const changed = require('gulp-changed');
const dircompare = require('dir-compare');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminZopfli = require('imagemin-zopfli');
const imageminGiflossy = require('imagemin-giflossy');

const distPath = path.join(__dirname, 'dist');
const srcPath = path.join(__dirname, 'src');

const distHtmlPath = distPath;
const srcHtmlPath = srcPath;

const cssDir = 'css';
// const cssPreprocessorType = 'sass';
const cssPreprocessorType = 'scss';
const distStylesPath = path.join(distPath, cssDir);
const srcStylesPath = path.join(srcPath, cssPreprocessorType);

const jsDir = 'js';
const distScriptsPath = path.join(distPath, jsDir);
const srcScriptsPath = path.join(srcPath, jsDir);

const fontsDir = 'fonts';
const distFontsPath = path.join(distPath, fontsDir);
const srcFontsPath = path.join(srcPath, fontsDir);

const iconsDir = 'icons';
const distIconsPath = path.join(distPath, iconsDir);
const srcIconsPath = path.join(srcPath, iconsDir);

const imgDir = 'img';
const distImagesPath = path.join(distPath, imgDir);
const srcImagesPath = path.join(srcPath, imgDir);

gulp.task('start', () => {
  const fsCb = error => error 
    ? console.log(error.toString()) 
    : undefined;

  fs.mkdir(distPath, fsCb);
  fs.mkdir(srcPath, fsCb);

  const gitignoreContent = `/node_modules
/coverage
/build

.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*  
`;

  fs.writeFile(path.join(__dirname, '.gitignore'), gitignoreContent, fsCb);

  const eslintrcContent = `{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-var": "error",
    "semi": "error",
    "no-multi-spaces": "error",
    "space-in-parens": "error",
    "no-multiple-empty-lines": "error",
    "prefer-const": "error",
    "no-use-before-define": "warn",
    "max-len": "warn",
    "no-unused-vars": "warn"
  }
}`;

  fs.writeFile(path.join(__dirname, '.eslintrc.json'), eslintrcContent, fsCb);

  [
    distStylesPath,
    distFontsPath,
    distIconsPath,
    distImagesPath,
    distScriptsPath,
    srcStylesPath,
    srcFontsPath,
    srcIconsPath,
    srcImagesPath,
    srcScriptsPath
  ].forEach(folder => fs.mkdir(folder, fsCb));

  fs.writeFile(path.join(distHtmlPath, 'index.html'), 
    '<head></head><body></body>', fsCb);
  fs.writeFile(path.join(distStylesPath, 'style.min.css'), '', fsCb);
  fs.writeFile(path.join(distScriptsPath, 'bundle.js'), '', fsCb);

  const indexHTMLContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="${ cssDir }/style.min.css">
</head>
<body>
  
  <script src="${ jsDir }/bundle.js"></script>
</body>
</html>`;

  fs.writeFile(path.join(srcPath, 'index.html'), indexHTMLContent, fsCb);

  fs.mkdir(path.join(srcScriptsPath, 'modules'), fsCb);
  fs.writeFile(path.join(srcScriptsPath, 'main.js'), '', fsCb);

  const styleSASSContent = `// libs imports

@import 'base/fonts'
@import 'base/variables'
@import 'base/mixins'
@import 'base/animations'

* 
  margin: 0
  padding: 0
  box-sizing: border-box

// blocks imports`;

  const styleSCSSContent = `// libs imports

@import 'base/fonts';
@import 'base/variables';
@import 'base/mixins';
@import 'base/animations';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// blocks imports`;

  switch (cssPreprocessorType) {
    case 'sass':
      fs.writeFile(
        path.join(srcStylesPath, 'style.sass'), styleSASSContent, fsCb);
      break;
    case 'scss':
      fs.writeFile(
        path.join(srcStylesPath, 'style.scss'), styleSCSSContent, fsCb);
      break;
  }
  
  [
    'base',
    'blocks',
    'libs'
  ].forEach(folder => fs.mkdir(path.join(srcStylesPath, folder), fsCb));

  [
    `_animations.${ cssPreprocessorType }`, 
    `_fonts.${ cssPreprocessorType }`, 
    `_mixins.${ cssPreprocessorType }`, 
    `_variables.${ cssPreprocessorType }` 
  ].forEach(filename => {
    fs.writeFile(path.join(srcStylesPath, 'base', filename), '', fsCb);
  });

  return gulp.src('.');
});

gulp.task('html', () => {
  return gulp.src(`${ srcHtmlPath }/*.html`)
          .pipe(htmlmin({ collapseWhitespace: true }))
          .pipe(gulp.dest(distHtmlPath))
          .pipe(browserSync.stream());
});

gulp.task('styles', () => {
  return gulp.src(`${ srcStylesPath }/**/*.+(scss|sass)`)
          .pipe(
            sass({ outputStyle: 'compressed' })
              .on('error', sass.logError)
          )
          .pipe(rename({ prefix: '', suffix: '.min' }))
          .pipe(autoprefixer({ cascade: false }))
          .pipe(cleanCSS({ compatibility: 'ie8' }))
          .pipe(gulp.dest(distStylesPath))
          .pipe(browserSync.stream());
});

gulp.task('scripts', () => {
  return gulp.src(`${ srcScriptsPath }/**/*.js`)
          .pipe(webpackStream({
            mode: 'development',
            entry: path.join(srcScriptsPath, 'main.js'),
            output: {
              filename: 'bundle.js',
              path: distScriptsPath
            },
            watch: false,
            devtool: 'source-map',
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  exclude: /(node_modules|bower_components)/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        [
                          '@babel/preset-env', 
                          {
                            debug: true,
                            corejs: 3,
                            useBuiltIns: 'usage'
                          }
                        ]
                      ]
                    }
                  }
                }
              ]
            }
          }))
          .pipe(gulp.dest(distScriptsPath))
          .pipe(browserSync.stream());
});

function cleanUnusedFiles(distFolderPath, srcFolderPath) {
  const options = { compareName: true };

  const foldersComparisonResult = 
    dircompare.compareSync(distFolderPath, srcFolderPath, options);

  if (foldersComparisonResult.differences > 0) {
    let lastRemovedDirectory;
    for (const set of foldersComparisonResult.diffSet) {
      if (set.type2 === 'missing') {
        switch (set.type1) {
          case 'file':
            if (lastRemovedDirectory) {
              if (lastRemovedDirectory === set.path1 || 
                  path.relative(lastRemovedDirectory, set.path1)) {
                continue;
              }
            }
            
            try {
              fs.unlinkSync(path.join(set.path1, set.name1));
            } catch(err) {
              console.log(err);
            }

            break;
          case 'directory':
            try {
              fs.rmdirSync(
                path.join(set.path1, set.name1), 
                { recursive: true }
              );
              lastRemovedDirectory = set.path1;
            } catch(err) {
              console.log(err);
            }
            
            break;
        }
      }
    }
  }
}

gulp.task('fonts', () => {
  cleanUnusedFiles(distFontsPath, srcFontsPath);
  return gulp.src(`${ srcFontsPath }/**/*`)
          .pipe(changed(distFontsPath))
          .pipe(gulp.dest(distFontsPath))
          .pipe(browserSync.stream());
});

gulp.task('icons', () => {
  cleanUnusedFiles(distIconsPath, srcIconsPath);
  return gulp.src(`${ srcIconsPath }/**/*`)
          .pipe(changed(distIconsPath))
          .pipe(gulp.dest(distIconsPath))
          .pipe(browserSync.stream());
});

gulp.task('images', () => {
  cleanUnusedFiles(distImagesPath, srcImagesPath);
  return gulp.src(`${ srcImagesPath }/**/*`)
          .pipe(changed(distImagesPath))
          .pipe(
            imagemin([
              imageminPngquant({
                speed: 1,
                quality: [ 0.95, 1 ]
              }),
              imageminZopfli({
                more: true
              }),
              imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3,
                lossy: 2
              }),
              imagemin.svgo({
                plugins: [
                  { removeViewBox: true }, 
                  { cleanupIDs: false }
                ]
              }),
              imagemin.mozjpeg({
                quality: 90,
                progressive: true
              })
            ])
          )
          .pipe(gulp.dest(distImagesPath))
          .pipe(browserSync.stream());
});

gulp.task('refresh-dist', gulp.parallel('html', 'styles', 'scripts', 
                                        'fonts', 'icons', 'images'));

function fixPathForGulpWatch(oldPath) {
  const pathString = oldPath;
  const fix = /\\{1,}|\/{1,}/;
  const userHome = require('os').homedir();

  return pathString.replace(new RegExp(fix, 'gm'), '/')
          .replace(new RegExp(fix, 'gm'), '/')
          .replace('~', userHome);
}

gulp.task('watch', () => {
  gulp.parallel('refresh-dist')();

  const bsPort = 3000;
  browserSync.init({
    server: distPath,
    port: bsPort,
    ui: {
      port: bsPort + 1
    },
    notify: true
  });

  gulp.watch(`${ fixPathForGulpWatch(srcHtmlPath) }/*.html`)
    .on('change', gulp.parallel('html'));
  gulp.watch(`${ fixPathForGulpWatch(srcStylesPath) }/**/*.+(scss|sass|css)`, 
    gulp.parallel('styles'));
  gulp.watch(`${ fixPathForGulpWatch(srcScriptsPath) }/**/*.js`)
    .on('change', gulp.parallel('scripts'));
  gulp.watch(`${ fixPathForGulpWatch(srcFontsPath) }/**/*`)
    .on('all', gulp.parallel('fonts'));
  gulp.watch(`${ fixPathForGulpWatch(srcIconsPath) }/**/*`)
    .on('all', gulp.parallel('icons'));
  gulp.watch(`${ fixPathForGulpWatch(srcImagesPath) }/**/*`)
    .on('all', gulp.parallel('images'));
});

gulp.task('build-production-scripts', () => {
  return gulp.src(`${ srcScriptsPath }/**/*.js`)
          .pipe(webpackStream({
            mode: 'production',
            entry: path.join(srcScriptsPath, 'main.js'),
            output: {
              filename: 'bundle.js',
              path: distScriptsPath
            },
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  exclude: /(node_modules|bower_components)/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        [
                          '@babel/preset-env', 
                          {
                            corejs: 3,
                            useBuiltIns: 'usage'
                          }
                        ]
                      ]
                    }
                  }
                }
              ]
            }
          }))
          .pipe(gulp.dest(distScriptsPath));
});

gulp.task('default', gulp.parallel('watch'));