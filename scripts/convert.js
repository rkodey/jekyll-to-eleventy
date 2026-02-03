import fs_node from 'node:fs';
import path_node from 'node:path';
import proc_node from 'node:child_process';
// import  * as yaml                   from 'js-yaml';
// import  * as sass                   from 'sass';
(() => {
    // @TODO Move to config file
    const CONF = {
        current: String.raw `..\rkodey.github.io`,
        source: String.raw `..\jekyll-theme-chirpy`,
        dest: String.raw `.`,
    };
    function exec(...args) {
        console.log(...args);
        const cmd = args.shift() ?? '';
        proc_node.spawnSync(cmd, args, { shell: true, stdio: 'inherit', encoding: 'utf8' });
    }
    function copyFilterAndPatch(src, dest) {
        const sStat = fs_node.statSync(src, { throwIfNoEntry: false });
        const dStat = fs_node.statSync(dest, { throwIfNoEntry: false });
        // console.log('copyFilterAndPatch', src, dest, !!sStat, !!dStat, sStat?.isDirectory(), sStat?.size, dStat?.size, sStat?.mtimeMs, dStat?.mtimeMs);
        const ret = (() => {
            if (!sStat)
                return false;
            if (sStat.isDirectory())
                return true;
            if (!dStat)
                return true;
            if (sStat.size !== dStat.size)
                return true;
            if (Math.abs(sStat.mtimeMs - dStat.mtimeMs) > 1000)
                return true;
            return false;
        })();
        if (ret && !(sStat?.isDirectory()))
            console.log('  copy', src, '=>', dest);
        // @TODO Maybe move this to a config file for flexibility
        // PATCH files we can't correct any other way
        if (src.match(new RegExp(['includes', 'sidebar.html'].join('.'), 'i'))) {
            // console.log('copyFilterAndPatch', src, dest, !!sStat, !!dStat, sStat?.isDirectory(), sStat?.size, dStat?.size, sStat?.mtimeMs, dStat?.mtimeMs);
            console.log('  PATCHING theme bug', src, '=>', dest);
            const content = fs_node.readFileSync(src, 'utf8');
            fs_node.writeFileSync(dest, content.replace(/\.tabs\.\[tab_name\]/i, '.tabs[tab_name]'));
        }
        return ret;
    }
    function mirror({ src, dest, fRecursive = true, fOnlyChanged = true }) {
        console.log('mirror', src.padEnd(CONF.source.length + 14), '=>', dest);
        const sStat = fs_node.statSync(src, { throwIfNoEntry: false });
        const dStat = fs_node.statSync(dest, { throwIfNoEntry: false });
        if (!sStat)
            return;
        // if (!dStat?.isDirectory()) fs_node.mkdirSync(dest, { recursive: true });
        fs_node.cpSync(src, dest, { recursive: fRecursive, preserveTimestamps: true, filter: fOnlyChanged ? copyFilterAndPatch : undefined });
    }
    console.log('⚡ Turning your Jekyll theme up to 11...');
    mirror({ src: path_node.join(CONF.source, '_includes'), dest: path_node.join(CONF.dest, '_includes') });
    mirror({ src: path_node.join(CONF.source, '_layouts'), dest: path_node.join(CONF.dest, '_layouts') });
    mirror({ src: path_node.join(CONF.source, '_data'), dest: path_node.join(CONF.dest, '_data', 'site', 'data') });
    mirror({ src: path_node.join(CONF.source, '_sass'), dest: path_node.join(CONF.dest, '_sass') });
    mirror({ src: path_node.join(CONF.source, '_posts'), dest: path_node.join(CONF.dest, 'content', 'posts') });
    mirror({ src: path_node.join(CONF.source, '_tabs'), dest: path_node.join(CONF.dest, 'content', 'tabs') });
    mirror({ src: path_node.join(CONF.source, '_config.yml'), dest: path_node.join(CONF.dest, '_data', 'site.example.yml') });
    mirror({ src: path_node.join(CONF.source, 'purgecss.js'), dest: path_node.join(CONF.dest, 'scripts', 'purgecss.js') });
    mirror({ src: path_node.join(CONF.source, 'index.html'), dest: path_node.join(CONF.dest, 'content', 'index.md') });
    mirror({ src: path_node.join(CONF.current, 'assets'), dest: path_node.join(CONF.dest, 'content', 'assets') });
    mirror({ src: path_node.join(CONF.current, '_config.yml'), dest: path_node.join(CONF.dest, '_data', 'site.yml') });
    process.env.DEBUG = 'Eleventy*';
    exec(String.raw `node scripts/purgecss.js`);
    exec(String.raw `pnpm run build:eleventy`);
    console.log('🤘 Done. Your theme is now 1 louder!');
})();
