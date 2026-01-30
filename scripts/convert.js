import fs_node from 'node:fs';
import path_node from 'node:path';
import proc_node from 'node:child_process';
// import  * as yaml                   from 'js-yaml';
// import  * as sass                   from 'sass';
(() => {
    const CONF = {
        current: String.raw `..\rkodey.github.io`,
        source: String.raw `..\jekyll-theme-chirpy`,
        dest: String.raw `.`,
    };
    // const site  = yaml.load(
    //   fs_node.readFileSync( path_node.resolve('_data', 'site.yml'), 'utf8' )
    // );
    // const SiteConfig = /** @type { SiteConfig } */ (site);
    function scanDir({ path, callbackAll, callbackDir, callbackFile, filter }) {
        const files = fs_node.readdirSync(path, { withFileTypes: true });
        for (const file of files) {
            if (!filter?.has(file.name.toLowerCase())) {
                const pathCur = path_node.resolve(file.parentPath, file.name);
                if (callbackAll)
                    callbackAll(pathCur);
                if (callbackFile && file.isFile())
                    callbackFile(pathCur);
                if (file.isDirectory()) {
                    if (callbackDir)
                        callbackDir(pathCur);
                    scanDir({ path: pathCur, callbackAll, callbackDir, callbackFile, filter });
                }
            }
        }
    }
    function exec(...args) {
        console.log(...args);
        const cmd = args.shift() ?? '';
        proc_node.spawnSync(cmd, args, { shell: true, stdio: 'inherit', encoding: 'utf8' });
    }
    function patchLiquidTemplate(path) {
        console.log(path);
        let content = fs_node.readFileSync(path, 'utf8');
        content = content.replace(/{% +include_cached/g, '{% include');
        const outFile = path_node.relative(CONF.source, path);
        const parsed = path_node.parse(outFile);
        if (!fs_node.existsSync(parsed.dir)) {
            fs_node.mkdirSync(parsed.dir, { recursive: true });
        }
        fs_node.writeFileSync(outFile, content, 'utf8');
        console.log(outFile, content.length);
    }
    // scanDir({
    //   path          : String.raw `${CONF.source}\_includes`,
    //   callbackFile  : patchLiquidTemplate,
    // });
    // scanDir({
    //   path          : String.raw `${CONF.source}\_layouts`,
    //   callbackFile  : patchLiquidTemplate,
    // });
    exec(String.raw `robocopy /mir  ${CONF.source}\_includes    ${CONF.dest}\_includes`);
    exec(String.raw `robocopy /mir  ${CONF.source}\_layouts     ${CONF.dest}\_layouts`);
    exec(String.raw `robocopy /mir  ${CONF.source}              ${CONF.dest}\scripts          purgecss.js`);
    exec(String.raw `robocopy /mir  ${CONF.source}\_data        ${CONF.dest}\_data\site\data`);
    exec(String.raw `copy           ${CONF.source}\_config.yml  ${CONF.dest}\_data\site.example.yml`);
    exec(String.raw `copy           ${CONF.current}\_config.yml ${CONF.dest}\_data\site.yml`);
    exec(String.raw `robocopy /mir  ${CONF.source}\_sass        ${CONF.dest}\_sass`);
    exec(String.raw `robocopy /mir  ${CONF.source}\_posts       ${CONF.dest}\content\posts`);
    exec(String.raw `copy           ${CONF.source}\index.html   ${CONF.dest}\content\index.md`);
    exec(String.raw `robocopy /mir  ${CONF.current}\assets      ${CONF.dest}\content\assets`);
    // console.log(SiteConfig);
    exec(String.raw `node purgecss.js`);
    // exec(String.raw `pnpm exec sass content/assets/css:_site/assets/css`, '-I _sass', SiteConfig?.sass?.style ? `--style=${SiteConfig?.sass?.style}` : '');
    // exec(String.raw `pnpm exec sass _sass:_site/assets/css`, SiteConfig?.sass?.style ? `--style=${SiteConfig?.sass?.style}` : '');
    // fs_node.renameSync(String.raw `_site/assets/css/main.css`, String.raw `_site/assets/css/jekyll-theme-chirpy.css`);
    process.env.DEBUG = 'Eleventy*';
    exec(String.raw `pnpm run build:eleventy`);
})();
