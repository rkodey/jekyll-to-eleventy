// @ts-check
import  path_node                   from 'node:path';
// import  url_node                    from 'node:url';

import  * as luxon                  from 'luxon';
import  * as sass                   from 'sass';
import  * as yaml                   from 'js-yaml';
import  { Tokenizer }               from 'liquidjs';
import  syntaxHighlight             from '@11ty/eleventy-plugin-syntaxhighlight';
import  markdownIt                  from 'markdown-it';
import  markdownItAnchor            from 'markdown-it-anchor';
import  { full as markdownItEmoji } from 'markdown-it-emoji';


/** @param { import('./src/eleventy.types').UserConfig } eleventyConfig */
const conf = (eleventyConfig) => {

  const CONFIG = {
    dir: {
      input     : 'content',
      includes  : '../_includes',
      layouts   : '../_layouts',
      data      : '../_data',
    },
    markdownTemplateEngine: false,
  }

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy('content/assets');
  eleventyConfig.addDataExtension('yml,yaml', (contents, filePath) => yaml.load(contents));

  eleventyConfig.setLiquidOptions({
    jekyllInclude     : true,   // allow "=" syntax
    jekyllWhere       : true,
    dynamicPartials   : false,
    strictFilters     : false,  // undefined filters get skipped
    // keyValueSeparator : '=',
  });

  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      xhtmlOut: true,
      // linkify: true,
      // typographer: true,
    })
      .use(markdownItAnchor)
      .use(markdownItEmoji),
  );

  eleventyConfig.addDateParsing((dateValue) => {
    console.log(`--> addDateParsing [${dateValue}]`);
    if (!dateValue) return;
    // date: 2019-08-08 11:33:00 +0800
    return luxon.DateTime.fromFormat(dateValue, 'yyyy-MM-dd hh:mm:ss ZZZ');
  });

  // eleventyConfig.addFilter(
  //   'absolute_url',
  //   /** @param { string } pageUrl */
  //   (pageUrl) => {
  //     // const path = path_node.relative(pageUrl, config);
  //     const temp = `--> absolute_url ${pageUrl}`;
  //     console.log(temp);
  //     return temp;
  //   },
  // );

  // eleventyConfig.addFilter(
  //   'relative_url',
  //   /**
  //    * @param    { string } [pageUrl]
  //    * @returns  { string }
  //    * */
  //   (pageUrl) => {
  //     const path = url_node.resolve('', pageUrl ?? '');   // @TODO baseurl
  //     console.log(`--> relative_url [${path}]`);
  //     return path;
  //   },
  // );

  // eleventyConfig.addShortcode(
  //   'include_cached',
  //   /** @param { string } arg1 */
  //   (arg1) => {
  //     const temp = `--> include_cached ${arg1}`;
  //     console.log(temp);
  //     return temp;
  //   },
  // );

  // eleventyConfig.addShortcode(
  //   'seo',
  //   /** @param { string } title */
  //   (title) => {
  //     const temp = `--> seo ${title}`;
  //     console.log(temp);
  //     return temp;
  //   },
  // );

  // eleventyConfig.addLiquidTag('include', (liquidEngine) => {
  //   return {
  //     parse: (tagToken, remainingTokens) => {
  //       // this.str = tagToken.args; // myVar or "alice"
  //       console.log('--> include_cached tag parse', tagToken.args);
  //     },
  //     render: (context, hash) => {
  //       // // Resolve variables
  //       // var str = await this.liquid.evalValue(this.str, context); // "alice"
  //       // return str.toUpperCase(); // "ALICE"
  //       // console.log('--> include_cached tag render', context, hash);
  //       return '--> include_cached tag render';
  //     },
  //   };
  // });

  // eleventyConfig.addLiquidTag('include_cached', (liquidEngine) => {
  //   return {
  //     parse: (tagToken, remainingTokens) => {
  //       // this.str = tagToken.args; // myVar or "alice"
  //       console.log('--> include_cached tag parse', tagToken.args);
  //     },
  //     render: (context, hash) => {
  //       // // Resolve variables
  //       // var str = await this.liquid.evalValue(this.str, context); // "alice"
  //       // return str.toUpperCase(); // "ALICE"
  //       // console.log('--> include_cached tag render', context, hash);
  //       return '--> include_cached tag render';
  //     },
  //   };
  // });


  eleventyConfig.addLiquidTag('include_cached', function (liquidEngine) {
    return {
      parse: function (tagToken) {
        // console.log('--> include_cached parse', this.args, tagToken.args);
        this.args = tagToken.args;
      },
      render: function (context, hash) {
        // console.log('--> include_cached render context', context);
        // console.log('--> include_cached render hash', hash);
        console.log('--> include_cached render args', this.args);

        const tokenizer = new Tokenizer(this.args ?? '');
        let   value;
        const args = [];
        while ((value = tokenizer.readValue()) !== undefined) {
          args.push(value.getText());
          tokenizer.skipBlank();
          while (tokenizer.peek() === ',') tokenizer.advance();
        }
        console.log('--> include_cached render items', args);

        // const values = args.map((token) => liquidEngine.evalValueSync(token, context));
        // console.log('--> include_cached render values', values);

        const includePath = path_node.join(CONFIG.dir.includes, args[0]);
        console.log('--> include_cached render includePath', includePath);

        try {
          /** @type { unknown } */
          const ret = liquidEngine.renderFileSync(includePath, context);
          return ret
        }
        catch (error) {
          console.error('[include_cached] Error rendering', includePath, error);
        }
      },
    };
  });

  eleventyConfig.addLiquidTag('seo', function (liquidEngine) {
    return {
      parse: (tagToken) => {
        console.log('--> seo parse', tagToken.args);
      },
      render: (context, hash) => {
        // console.log('--> seo render context', context);
        // console.log('--> seo render hash', hash);
        return '';
      },
    };
  });


  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    useLayouts: false,

    compile: (content, inputPath) => {
      console.log('--> scss compile', inputPath);

      let parsed = path_node.parse(inputPath);
      // Don’t compile file names that start with an underscore
      if(parsed.name.startsWith('_')) {
        return;
      }

      const result = sass.compileString(content, { loadPaths: [ parsed.dir || '.', '_sass', ] }).css;

      // Map dependencies for incremental builds
      // this.addDependencies(inputPath, result.loadedUrls);

      return () => result;
      // return async (data) => {
      //   let content = await this?.defaultRenderer(data);
      //   return sass.compileString(content, { loadPaths: [ parsed.dir || '.', '_sass', ] }).css;
      // };
    },
  });


  return CONFIG;

};
export default conf;
