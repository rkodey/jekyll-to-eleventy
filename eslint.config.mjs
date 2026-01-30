import    path                from 'node:path';
import    js                  from '@eslint/js';
import    tseslint            from 'typescript-eslint';
import    globals             from 'globals';
import  { includeIgnoreFile } from '@eslint/compat';
import    importPlugin        from 'eslint-plugin-import';
import    pluginUnicorn       from 'eslint-plugin-unicorn';


// 'env' : { 'es2017': true, 'browser': true, 'jest': true },
// 'env': { 'node': true, 'es6': true, 'browser': true },


export default tseslint.config(

  includeIgnoreFile(path.resolve(process.cwd(), '.gitignore')),

  { ignores: [] },

  // https://typescript-eslint.io/users/configs/#projects-with-type-checking
  { name: '--- eslint js recommended' },
  js.configs.recommended,
  tseslint.configs.eslintRecommended,     // This is recommended to be used after eslint.configs.recommended
  tseslint.configs.strictTypeChecked,     // strictTypeChecked contains recommended, recommendedTypeChecked, and strict
  tseslint.configs.stylisticTypeChecked,

  { name: '--- import plugin' },
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  // { name: '--- airbnb extend includes import plugin' },
  // ...compat.extends(
  //   'eslint-config-airbnb-base',
  // ),

  pluginUnicorn.configs.recommended,
  {
    name: '--- plugin unicorn',
    rules: {
      'unicorn/explicit-length-check'     : ['off'],
      'unicorn/filename-case'             : ['off'],
      'unicorn/no-array-sort'             : ['off'],
      'unicorn/no-immediate-mutation'     : ['off'],
      'unicorn/no-process-exit'           : ['off'],
      'unicorn/prefer-regexp-test'        : ['off'],
      'unicorn/prefer-single-call'        : ['off'],
      'unicorn/prefer-spread'             : ['off'],
      'unicorn/prefer-string-replace-all' : ['off'],
      'unicorn/prefer-ternary'            : ['off'],
      'unicorn/prefer-top-level-await'    : ['off'],
      'unicorn/prevent-abbreviations'     : ['off'],
    },
  },

  // {
  //   name: '--- plugin no-secrets',
  //   plugins: { 'no-secrets'  : pluginNoSecrets },
  //   rules: {
  //     'no-secrets/no-secrets': ['error'],
  //   },
  // },

  {
    name: '--- languageOptions',
    languageOptions: {
      ecmaVersion: 2020,   // 2015=ES6, 2017 for async, 2020 for nullish
      globals: {
        ...globals.browser,
        // ...globals.jquery,
        ...globals.node,
        ...globals.serviceworker,
        ...globals.webextensions,
      },
      parserOptions: {
        projectService: {
          // Use the files overrides below instead of allowDefaultProject
          allowDefaultProject: ['*.config.mjs'],
        },
      },
    },

  },

  {
    name: '--- base overrides',
    rules: {

      // Temporary rules during transition
      // '@typescript-eslint/no-empty-function'          : ['off'],
      // '@typescript-eslint/no-unsafe-argument'         : ['off'],
      // '@typescript-eslint/no-unsafe-assignment'       : ['off'],
      // '@typescript-eslint/no-unsafe-call'             : ['off'],
      // '@typescript-eslint/no-unsafe-member-access'    : ['off'],
      '@typescript-eslint/no-unused-vars'             : ['off'],  // SEE BELOW
      // '@typescript-eslint/no-floating-promises'       : ['off'],
      // '@typescript-eslint/prefer-nullish-coalescing'  : ['off'],
      // 'prefer-destructuring'                          : ['off'],  // SEE BELOW
      // Temporary rules during transition

      'camelcase'                     : ['off'],
      'class-methods-use-this'        : ['off'],
      'consistent-return'             : ['off'],
      'key-spacing'                   : ['off'],
      'linebreak-style'               : ['off'],
      'max-len'                       : ['off'],
      'no-await-in-loop'              : ['off'],
      'no-multi-spaces'               : ['off'],
      'no-underscore-dangle'          : ['off'],
      'padded-blocks'                 : ['off'],
      'prefer-regex-literals'         : ['off'],

      'brace-style'                   : ['error', 'stroustrup', { 'allowSingleLine': true }],
      'lines-between-class-members'   : ['error', 'always', { 'exceptAfterSingleLine': true }],
      'no-multiple-empty-lines'       : ['error', { 'max': 2, 'maxBOF': 1, 'maxEOF': 0 }],
      'no-param-reassign'             : ['error', { 'props': false }],
      'no-plusplus'                   : ['error', { 'allowForLoopAfterthoughts': true }],
      // 'no-sync'                       : ['error'],
      'no-void'                       : ['error', { 'allowAsStatement': true }],
      'object-curly-newline'          : ['error', { 'consistent': true }],
      'quote-props'                   : ['error', 'consistent'],
      // 'switch-colon-spacing'          : ['error', { 'after': true, 'before': true }],
      'template-tag-spacing'          : ['error', 'always'],
      'quotes'                        : ['error', 'single'],

      // Prefer typescript extended rules over default eslint rules
      // https://typescript-eslint.io/rules/dot-notation/
      // https://typescript-eslint.io/rules/no-unused-vars/
      'dot-notation'                      : ['off'],
      'no-unused-vars'                    : ['off'],
      '@typescript-eslint/dot-notation'   : ['error'],
      // '@typescript-eslint/no-unused-vars' : ['error', { 'caughtErrors': 'none', 'argsIgnorePattern': '^_' }],

      '@typescript-eslint/no-extraneous-class'            : ['off'],
      '@typescript-eslint/no-unnecessary-condition'       : ['off'],
      '@typescript-eslint/prefer-regexp-exec'             : ['off'],
      '@typescript-eslint/restrict-template-expressions'  : ['off'],

      'import/no-relative-packages'       : ['off'],
      'import/no-extraneous-dependencies' : ['error', { 'devDependencies': true }],
      'import/no-useless-path-segments'   : ['off'],

      // Recommended by https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
      'import/named'                      : ['off'],
      'import/namespace'                  : ['off'],
      'import/default'                    : ['off'],
      'import/no-named-as-default-member' : ['error'],  // was "off"
      'import/no-unresolved'              : ['off'],
      'import/extensions'                 : ['off'],
      'import/export'                     : ['error'],  // recommended warn
      'import/no-named-as-default'        : ['error'],  // recommended warn
      'import/no-deprecated'              : ['warn'],
      'import/no-duplicates'              : ['error'],
      'import/prefer-default-export'      : ['off'],

      'import/no-cycle'                             : ['error'],
      '@typescript-eslint/consistent-type-imports'  : ['error'],

      'import/order': ['error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type', 'unknown'],
          'alphabetize': {
            caseInsensitive: true,
          },
          'warnOnUnassignedImports': false,
        },
      ],

      'indent': ['error', 2, {
        'SwitchCase': 1,
        'VariableDeclarator': 1,
        'outerIIFEBody': 1,
        'FunctionDeclaration': { 'parameters': 1, 'body': 1 },
        'FunctionExpression': { 'parameters': 1, 'body': 1 },
        'CallExpression': { 'arguments': 1 },
        'ArrayExpression': 1,
        'ObjectExpression': 1,
        'ImportDeclaration': 1,
        'flatTernaryExpressions': false,
        'ignoreComments': true,             // updated
        'offsetTernaryExpressions': false,
      }],

      'no-restricted-syntax': ['error',
        {
          'selector': 'ForInStatement',
          'message': 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          'selector': 'LabeledStatement',
          'message': 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          'selector': 'WithStatement',
          'message': '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
        {
          // eslint-disable-next-line no-restricted-syntax
          'selector': 'Literal[value=/[“”‘’]/], TemplateElement[value.raw=/[“”‘’]/]',
          'message': 'Use dumb quotes instead of smart quotes in strings.',
        },
      ],

      // 'prefer-destructuring': ['error',
      //   {
      //     'AssignmentExpression'  : { 'array': false, 'object': false },
      //     'VariableDeclarator'    : { 'array': false, 'object': true  },
      //   },
      //   {
      //     'enforceForRenamedProperties': false,
      //   },
      // ],

    },
  },

  {
    name    : '--- disableTypeChecked for config files',
    files   : ['.eslint*.*js', 'eslint*.*js', 'esbuild.mjs', 'Gruntfile.js'],
    extends : [tseslint.configs.disableTypeChecked],
    rules   : {
      'unicorn/prefer-module'             : ['off'],
    },
  },
  {
    name    : '--- no-undef for TS files',
    files   : ['**/*.ts', '**/*.tsx'],
    rules   : {
      'no-undef': ['off'],
    },
  },

);
