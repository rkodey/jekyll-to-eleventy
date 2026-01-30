import  fs_node                     from 'node:fs';
import  path_node                   from 'node:path';
import  proc_node                   from 'node:child_process';
// import  * as yaml                   from 'js-yaml';
// import  * as sass                   from 'sass';

(() => {

  const CONF  = {
    current   : String.raw `..\rkodey.github.io`,
    source    : String.raw `..\jekyll-theme-chirpy`,
    dest      : String.raw `.`,
  };

    // "build:purgecss": "node scripts/purgecss.js",
    // "build:sass": "sass _sass:_site/assets/css --style=compressed",

  // const site  = yaml.load(
  //   fs_node.readFileSync( path_node.resolve('_data', 'site.yml'), 'utf8' )
  // );
  // const SiteConfig = /** @type { SiteConfig } */ (site);


  function scanDir({ path, callbackAll, callbackDir, callbackFile, filter }: {
    path            : string;
    callbackAll   ? : (path: string) => void;
    callbackDir   ? : (path: string) => void;
    callbackFile  ? : (path: string) => void;
    filter        ? : Set<string>; },
  ) {

    const files       = fs_node.readdirSync(path, { withFileTypes: true });
    for (const file of files) {
      if (!filter?.has(file.name.toLowerCase())) {
        const pathCur = path_node.resolve(file.parentPath, file.name);

        if (callbackAll) callbackAll(pathCur);

        if (callbackFile && file.isFile()) callbackFile(pathCur);

        if (file.isDirectory()) {
          if (callbackDir) callbackDir(pathCur);
          scanDir({ path: pathCur, callbackAll, callbackDir, callbackFile, filter });
        }

      }
    }
  }

  function exec(...args: string[]) {
    console.log(...args);
    const cmd = args.shift() ?? '';
    proc_node.spawnSync(cmd, args, { shell: true, stdio: 'inherit', encoding: 'utf8' });
  }

  function patchLiquidTemplate(path: string) {
    console.log(path);
    let   content = fs_node.readFileSync(path, 'utf8');

    content       = content.replace(/{% +include_cached/g,    '{% include');

    const outFile = path_node.relative(CONF.source, path);
    const parsed  = path_node.parse(outFile);
    if (!fs_node.existsSync(parsed.dir)) {
      fs_node.mkdirSync(parsed.dir, { recursive: true });
    }
    fs_node.writeFileSync(outFile, content, 'utf8');
    console.log(outFile, content.length);
  }

  function copyFilterOnlyChanged(src: string, dest: string) {
    const sStat   = fs_node.statSync(src, { throwIfNoEntry: false });
    const dStat   = fs_node.statSync(dest, { throwIfNoEntry: false });
    // console.log('copyFilterOnlyChanged', src, dest, !!sStat, !!dStat, sStat.isDirectory(), sStat.size, dStat.size, sStat.mtimeMs, dStat.mtimeMs);
    const ret     = (() => {
      if (!sStat) return false;
      if (sStat.isDirectory()) return true;
      if (!dStat) return true;
      if (sStat.size !== dStat.size) return true;
      if (Math.abs(sStat.mtimeMs - dStat.mtimeMs) > 1000) return true;
      return false;
    })();
    if (ret && !(sStat?.isDirectory())) console.log('  copy', src, '=>', dest);
    return ret;
  }

  function mirror({ src, dest, fRecursive = true, fOnlyChanged = true }: { src: string; dest: string; fRecursive?: boolean; fOnlyChanged?: boolean; }) {
    console.log('mirror', src.padEnd(CONF.source.length + 14), '=>', dest);
    const sStat = fs_node.statSync(src, { throwIfNoEntry: false });
    const dStat = fs_node.statSync(dest, { throwIfNoEntry: false });
    if (!sStat) return;
    // if (!dStat?.isDirectory()) fs_node.mkdirSync(dest, { recursive: true });
    fs_node.cpSync(src, dest, { recursive: fRecursive, preserveTimestamps: true, filter: fOnlyChanged ? copyFilterOnlyChanged : undefined });
  }

  // scanDir({
  //   path          : String.raw `${CONF.source}\_includes`,
  //   callbackFile  : patchLiquidTemplate,
  // });
  // scanDir({
  //   path          : String.raw `${CONF.source}\_layouts`,
  //   callbackFile  : patchLiquidTemplate,
  // });

  mirror({ src: path_node.join(CONF.source,   '_includes'),     dest: path_node.join(CONF.dest, '_includes') });
  mirror({ src: path_node.join(CONF.source,   '_layouts'),      dest: path_node.join(CONF.dest, '_layouts') });
  mirror({ src: path_node.join(CONF.source,   '_data'),         dest: path_node.join(CONF.dest, '_data', 'site', 'data') });
  mirror({ src: path_node.join(CONF.source,   '_sass'),         dest: path_node.join(CONF.dest, '_sass') });
  mirror({ src: path_node.join(CONF.source,   '_posts'),        dest: path_node.join(CONF.dest, 'content', 'posts') });

  mirror({ src: path_node.join(CONF.source,   '_config.yml'),   dest: path_node.join(CONF.dest, '_data', 'site.example.yml') });
  mirror({ src: path_node.join(CONF.source,   'purgecss.js'),   dest: path_node.join(CONF.dest, 'scripts', 'purgecss.js') });
  mirror({ src: path_node.join(CONF.source,   'index.html'),    dest: path_node.join(CONF.dest, 'content', 'index.md') });

  mirror({ src: path_node.join(CONF.current,  'assets'),        dest: path_node.join(CONF.dest, 'content', 'assets') });
  mirror({ src: path_node.join(CONF.current,  '_config.yml'),   dest: path_node.join(CONF.dest, '_data', 'site.yml') });


  // console.log(SiteConfig);
  exec(String.raw `node scripts/purgecss.js`);
  // exec(String.raw `pnpm exec sass content/assets/css:_site/assets/css`, '-I _sass', SiteConfig?.sass?.style ? `--style=${SiteConfig?.sass?.style}` : '');
  // exec(String.raw `pnpm exec sass _sass:_site/assets/css`, SiteConfig?.sass?.style ? `--style=${SiteConfig?.sass?.style}` : '');
  // fs_node.renameSync(String.raw `_site/assets/css/main.css`, String.raw `_site/assets/css/jekyll-theme-chirpy.css`);

  process.env.DEBUG = 'Eleventy*';
  exec(String.raw `pnpm run build:eleventy`);

})();
