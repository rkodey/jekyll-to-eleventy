// @ts-check
import  * as jeky11ty               from './scripts/jeky11ty.js';


/** @param { jeky11ty.UserConfig } eleventyConfig */
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

  eleventyConfig.addPassthroughCopy('content/assets');
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.setLiquidOptions({
  //   jekyllInclude     : true,   // allow "=" syntax
  //   jekyllWhere       : true,
    // dynamicPartials   : false,
    strictFilters     : true
  //   // keyValueSeparator : '=',
  });

  eleventyConfig.addPlugin(jeky11ty.getSyntaxHighlightPlugin());
  eleventyConfig.setLibrary('md', jeky11ty.getMarkdownIt());

  eleventyConfig.addCollection('posts', (collection) => {
    return collection.getFilteredByGlob('content/posts/**/*.md');
  });
  eleventyConfig.addCollection('tabs', (collection) => {
    return collection.getFilteredByGlob('content/tabs/**/*.md');
  });

  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', jeky11ty.sassExtension());
  eleventyConfig.addDataExtension('yml,yaml', (contents, filePath) => {
    return jeky11ty.loadYamlData(contents, filePath);
  });


  eleventyConfig.addDateParsing((dateValue) => {
    return jeky11ty.dateParser(dateValue);
  });


  eleventyConfig.addFilter('absolute_url', (pageUrl) => {
    return jeky11ty.absoluteUrlFilter(pageUrl);
  });

  eleventyConfig.addFilter('relative_url', (pageUrl) => {
    return jeky11ty.relativeUrlFilter(pageUrl);
  });


  // Eleventy doesn't have include_cached, so we implement it here
  eleventyConfig.addLiquidTag('include_cached', function (liquidEngine) {
    return jeky11ty.includeTag(liquidEngine, CONFIG.dir.includes);
  });
  // ...and for consistency we also override include
  eleventyConfig.addLiquidTag('include', function (liquidEngine) {
    return jeky11ty.includeTag(liquidEngine, CONFIG.dir.includes);
  });


  eleventyConfig.addLiquidTag('seo', function (liquidEngine) {
    return jeky11ty.seoTag(liquidEngine);
  });


  // eleventyConfig.addPreprocessor('tabs', '*', (data, content) => {
  //   console.log('--> addPreprocessor tabs');
  //   console.log('--> addPreprocessor data', data);
  //   // return false to skip the template
  //   // return undefined or nothing to ensure no changes to the input
  //   // if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
  //   // 	return false;
  //   // }
  // });

  return CONFIG;

};
export default conf;
