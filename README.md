# sciterjs-svelte-template
Bring https://github.com/sveltejs/template to Sciter.js https://github.com/c-smile/sciter-js-sdk


#### Goals:
- [x] Retain compatibility with Web Browsers.
- [x] Detect missing features required by Sciter.js to run this template and polyfill them.
- [x] Provide structure for other polyfills needed by the developers
- [x] Limited Patching for content before it lands into `./public/build/bundle.js`. But keep this focused on some targets.
- [ ] Livereload


If you're only interested on creating your project and start coding, just keep reading. For others trying to understand the details behind this work, you may read [svelte_to_sciterjs_startup.md](svelte_to_sciterjs_startup.md)


## Startup Instructions:

######Get the full sciter-js-sdk or only the binaries
```shell
cd $HOME
mkdir devTools && cd devTools
git clone https://github.com/c-smile/sciter-js-sdk
```

###### Change permissions for "scapp" to allow execution (note: match with your platform)
```shell
chmod +x ./bin/linux/x64/scapp
```

######Get a copy of this template
```shell
cd your_prodjects_directory
git clone https://github.com/jsprog/sciterjs-svelte-template/
cd sciterjs-svelte-template
npm install
```
###### Open package.json and match the path of "scapp" script to "scapp" executable:
```json
// package.json
    scripts: {

        "scapp": "$HOME/devTools/sciter-js-sdk/bin/linux/x64/scapp",
    }
````

#### Start App in production mode:
```shell
npm run build
npm run scapp-main
```

#### Start App in development mode
###### Start the developement server
```shell
npm run dev
```
###### From a different terminal, start the app
```shell
npm run scapp-main
```

#### Starting app with a different HTML file:
Sometimes, you may need to test with standalone examples or even need to recreate a bug by extracting it into a standalone HTML file. If this is the case, you better keep your project clean and instead, write some other HTML files for testing.

###### example:
```shell
mkdir ./examples
touch ./examples/issue-livereload.html
```
Open the HTML file, put some content there, then
```shell
npm run scapp ./examples/issue-livereload.html
```

#### The problems with livereload:
Some of the requirements for livereload to work out of the box:
- [x] WebSocket
- [ ] Injection of scripts and styles into `<head>`
- [ ] The livereload script may need to check for the injected tags.
- [ ] Alternative to Location.reload() to trigger a full reload. Currently writing `Window.this.reload()` won't work.
- [ ] Extra Polyfills

There are many other approaches to bring back the livereload. But the best of all of them is to fullfill at least the above requirements.
