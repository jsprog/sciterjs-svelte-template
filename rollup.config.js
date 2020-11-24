import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
// import livereload from 'rollup-plugin-livereload';
// import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

// Additional imports
import replace from '@rollup/plugin-replace'

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		// format: 'iife',
		format: 'es',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		// patch content received from 'node_modules/svelte/internal/index.js'
		//     or 'node_modules/svelte/internal/index.mjs'
		replace({
			delimiters: ['', ''],
			include: ['node_modules/svelte/internal/*'],
			"text.data = data;": "text.nodeValue = data;" // sciter.js has no support for 'textNode.data' at them moment and this needed to bring reactive updates to screen
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// livereload won't work as it is out of the box.
		//   We may need a different approach to bring it back
		//     This time, we'll only disable it
		// !production && livereload('public'), // 

		// Production apps should never disable minification, but we're doing this to help tracking errors and warnings with production builds.
		// production && terser()
	],
	watch: {
		clearScreen: false
	}
};
