# Svelte to Sciter.js
## Strartup Instructions

This document walks you through nearly all the steps needed to bring the default svelte template to work with Sciter.js. Others seeking to learn about svelte or rollup are likely to be better off with the official documents and some other content available online.

#### Sciter.js SDK:
* Get the SDK from https://github.com/c-smile/sciter-js-sdk
* Unpack it into a target (e.g: $HOME/devTools/sciter-js-sdk)

#### Create a new project based on the default template for svelte:
```shell
npx degit sveltejs/template sciterjs-svelte-template
cd ./sciterjs-svelte-template
npm install
```

#### We need to be able to patch our source code and npm modules:
```shell
npm install -D @rollup/plugin-replace
```

#### Add some npm scripts (scapp, and scapp-main) to package.json:
```json
scripts: {
 
    "scapp": "REPLACE_WITH_PATH_TO_SCITERJS_SDK/bin/linux/x64/scapp",
    "scapp-main": "npm run scapp ./public/index.html"
}
```
###### Usage examples:
```shell
npm run scapp
npm run scapp-main
npm run scapp ./tests/another-file.html
npm run scapp ./tests/recreate-some-bug.html
```

#### Prevent minification for production builds:
When you execute **npm run build** from your terminal, you generate a build containing a minified script `public/build/bundle.js`. At the moment, we need to completely disable **rollup-plugin-terser** that's responsible for minification for these reasons:
* To make the generated code more readable.
* To help with the discovery of the features needed for production builds.
* To help with tracking the errors logged by scapp (line numbers are logged).

Comment-out every line related to 'rollup-plugin-terser'.
```json
// package.json

// import { terser } from 'rollup-plugin-terser';
// production && terser()
```

Note: Before you ship your code, make sure to re-enable terser.

#### Disable livereload:
Livereload won't work out of the box with Sciter.js, and it's quite hacky to bring it back. This time we need to completely disable it, and it should be covered in details within a separate topic.

```js
// package.json

// import livereload from 'rollup-plugin-livereload';
// !production && livereload('public'),
```
 
#### Keep static imports to native modules:
Change the output format from 'iife' to 'es' to keep the static imports to native modules intact (e.g: import * as sys from '@sys').
```js
// rollup.config.js
  output: {
    
    // format: 'iife',
    format: 'es',
  }
```
#### Fix "public/index.html"
* Remove the leading slashes (/) for paths
* We need to run our main script as a module to enable static imports. It's also a requirement for `output.format = "es"`
```html
    <!-- <link rel='icon' type='/image/png' href='favicon.png'> -->
    <link rel='icon' type='image/png' href='favicon.png'>

    <!-- <link rel='stylesheet' href='/global.css'> -->
    <link rel='stylesheet' href='global.css'>
  
    <!-- <link rel='stylesheet' href='/build/bundle.css'> -->
    <link rel='stylesheet' href='build/bundle.css'>

    <!-- <script defer src='build/bundle.js'></script> -->
    <script defer src='build/bundle.js' type="module"></script>
```
#### Patch "node_modules/svelte/internal/index.js:
When you inspect `node_modules/svelte/internal/index.js`, you'll notice 2 occurrences for `text.data = data;`. Svelte depends on `textNode.data` to update the visible text on screen, but it's not supported by Sciter.js yet and we need to replace it with `textNode.nodeValue`.
Replacing content for a **node module** is a bad practice and you're lose your changes after npm update or install. Instead, we'll be using @rollup/plugin-replace to patch content before it lands into `public/build/bundle.js`

```js
 // rollup.config.js
 import replace from '@rollup/plugin-replace'
```

```js
// rollup.config.js
  plugins: [
   
    commonjs(),

     // put the replacement after commonjs(),
    replace({
      delimiters: ['', ''],
      include: ['node_modules/svelte/internal/*'], // we need to match both index.js and index.mjs
      "text.data = data;": "text.nodeValue = data;"
    }),
   
  ]
```

#### Build for production and run the the app:
```shell
npm run build
npm run scapp-main
```

Inspect `./public/build/bundle.js` and you'll notice that `text.data;` is replaced with `text.nodeValue`. Thanks to @rollup/plugin-replace.

###### Inspect your terminal and you'll see this waring:
> warning:css: error parsing media section at (file:///home/path-to-parent-directory/sciterjs-svelte-template/public/build/bundle.css(2))

The problem is that Sciter.js is dealing with unsupported CSS. Open `src/App.svelte` to suppress the warning:
```css
/*
@media (min-width: 640px) {
  main {
    max-width: none;
  }
}
*/
```

build again and run the app. The warning is gone.

#### Polyfills:
We need to always detect features prior to any attempt to apply a polyfill. We also need some structure when adding the polyfills:
- Create a new folder `src/polyfills`.
- Create some files:
  - `scr/polyfills/polyfills_svelte.js`: polyfills needed by svelte.
  - `src/polyfills/polyfills_livereload.js`: additional polyfills needed by livereload.
  - `src/polyfills/polyfills_some_other_module`: example about keeping structure.
  - `src/polyfills/polyfills_app.js`: more polyfills needed by your app.
  - `src/polyfills/index.js`: this is needed to import all other polyfills.

```js
// polyfills/index.js
import './polyfills_svelte'
import './polyfills_livereload'
import './polyfills_some_other_module'
import './polyfills_app'
```

at the top of `src/main.js`, import `src/polyfills/index.js`
```js
// src/main.js
import './polyfills'
```


#### Polyfills for svelte:
At the moment, our app is working without errors. Let's switch to development mode to track some errors.

From your terminal, start the development server.
> npm run dev

Open a second terminal and start the app.
> npm run scapp-main

Unfortuanately, we're receiving some errors. Let's track them one by one and keep adding polyfills untill we fix all the errors, or just apply these fixes.

```js
// src/polyfills/polyfills_svelte.js

// polyfill the deprecated Element.prototype.createEvent
if (!document.createEvent) {
    Element.prototype.createEvent = function (name) {
        return new Event(name)
    }
}

// polyfill the deprecated Event.prototype.initCustomEvent
//     note: Expect this code to change anytime
if (!Event.prototype.initCustomEvent) {
    Event.prototype.initCustomEvent = function (type, canBubble, cancelable, detail) {
        Object.defineProperty(this, 'type', { value: type })
        Object.defineProperty(this, 'bubbles', { value: canBubble } )
        Object.defineProperty(this, 'cancelable', { value: cancelable })
        Object.defineProperty(this, 'detail', { value: detail })
    }
}
```

#### More work is needed:

* A separate topic is needed to bring back **livereload**, and likely it's comming soon.

* Sciter.js is keeping a distance away from deprecated syntax, and better that you do the same thing to prevent them from getting into your source code. But the moment you depend on a library module that use unsupported syntax, you'll need to either polyfill the missing features or patch them in some way before the content lands into `public/build/bundle.js`.

#### Conclusion:
I hope that you enjoyed my explanation about bringing the default svelte template to Sciter.js. The work is nearly finished except for livereload, but expect it soon.

