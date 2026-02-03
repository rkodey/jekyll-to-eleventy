import path_node from 'node:path';
import url_node from 'node:url';
import * as liquid from 'liquidjs';
import * as luxon from 'luxon';
import * as sass from 'sass';
import * as yaml from 'js-yaml';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import syntaxHighlightPlugin from '@11ty/eleventy-plugin-syntaxhighlight';
export function getMarkdownIt() {
    return markdownIt({
        html: true,
        xhtmlOut: true,
        // linkify: true,
        // typographer: true,
    })
        .use(markdownItAnchor)
        .use(markdownItEmoji);
}
export function getSyntaxHighlightPlugin() {
    return syntaxHighlightPlugin;
}
export function loadYamlData(contents, filePath) {
    console.log('loadYamlData', filePath);
    return yaml.load(contents ?? '');
}
export function dateParser(dateValue) {
    console.log('dateParser', dateValue);
    if (!dateValue)
        return;
    // date: 2019-08-08 11:33:00 +0800
    return luxon.DateTime.fromFormat(dateValue, 'yyyy-MM-dd hh:mm:ss ZZZ');
}
export function absoluteUrlFilter(pageUrl) {
    const path = url_node.resolve('', pageUrl ?? ''); // @TODO baseurl, and verify we get an absolute URL
    // console.log('absoluteUrlFilter', path);
    return path;
}
export function relativeUrlFilter(pageUrl) {
    const path = url_node.resolve('', pageUrl ?? ''); // @TODO baseurl, and verify we get a relative URL
    // console.log('relativeUrlFilter', path);
    return path;
}
export function includeTag(liquidEngine, includesDir) {
    return {
        parse: function (tagToken) {
            // console.log('includeTag parse', tagToken.args);
            this.args = tagToken.args;
        },
        render(context) {
            // console.log('includeTag render');
            const args = this.args ?? '';
            // console.log('--> includeTag render args', args);
            // assume the first parsed value is the include filename
            const tokenizer = new liquid.Tokenizer(args);
            const file = tokenizer.readValue()?.getText() ?? '';
            const path = path_node.join(includesDir, file);
            // and the rest of the args are data parameters
            const include = { file, path };
            const hash = new liquid.Hash(tokenizer.remaining(), true);
            for (const key of Object.keys(hash.hash)) {
                const value = String(liquidEngine.evalValueSync(hash.hash[key]?.getText() ?? '', context));
                // console.log('--> includeTag render key value', key, value);
                if (value) {
                    include[key] = value;
                }
            }
            // console.log('--> includeTag render include', include);
            const site = context.getSync(['site']);
            const collections = context.getSync(['collections']);
            // @INFO  Chirpy bug:  sidebar.html tab_name lookup into locales doesn't work.
            //        1) the split needs a | last, and 2) the index into tabs shouldn't have a "."
            //        The hack here didn't work because the Home tab relies on the data being here.  Ugh.
            // const env         = context.environments as eleventy.LiquidPseudoScope;
            // env.site.data.locales.en.tabs = { home: env.site.data.locales.en.tabs.home };
            if (include.file === 'sidebar.html') {
                for (const [key, collection] of Object.entries(collections)) {
                    // if (key === 'tabs') console.log('--> includeTag render context collection', collection);
                    if (key !== 'all') {
                        for (const page of collection) {
                            // Copy the icon from front matter data into the page root
                            // @TODO we should probably copy all keys
                            page.icon = page.data.icon;
                            page.title = page.data.title ?? page.fileSlug;
                        }
                        site[key] ?? (site[key] = collection);
                    }
                    // console.log('--> includeTag render context collection', key);
                }
                console.log('<--');
            }
            // Push a new frame instead of manipulating the current context
            context.push({ include, site });
            const rendered = String(liquidEngine.renderFileSync(path, context));
            context.pop();
            return rendered;
        },
    };
}
export function seoTag(liquidEngine) {
    // @TODO seoTag
    return {
        parse: function (tagToken) {
            // console.log('seoTag parse', tagToken.args);
            this.args = tagToken.args;
        },
        render: function (context) {
            // console.log('seoTag render');
            // console.log('seoTag render context', context);
            return '';
        },
    };
}
export function sassExtension() {
    return {
        outputFileExtension: 'css',
        useLayouts: false,
        compile: (content, inputPath) => {
            console.log('sassExtension compile', inputPath);
            const parsed = path_node.parse(inputPath);
            // Don't compile file names that start with an underscore
            if (parsed.name.startsWith('_')) {
                return;
            }
            const result = sass.compileString(content, { loadPaths: [parsed.dir || '.', '_sass',] }).css;
            return () => result;
        },
    };
}
