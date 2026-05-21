import esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { readPackageJsonPeerAndExports, rootPeerDependencies } from './build.utils.mjs';

const {
	peerDependencies: workspacePeerDependencies,
	exports: workspaceExports
	// eslint-disable-next-line no-undef
} = readPackageJsonPeerAndExports(join(process.cwd(), 'package.json'));

const externalPeerDependencies = [
	...Object.keys(rootPeerDependencies()),
	...Object.keys(workspacePeerDependencies)
];

// eslint-disable-next-line no-undef
const dist = join(process.cwd(), 'dist');

const createDistFolder = () => {
	if (!existsSync(dist)) {
		mkdirSync(dist);
	}
};

/**
 * Entry points are derived from package exports so every advertised JavaScript
 * export has a corresponding built file.
 *
 * @returns {string[]} Relative TypeScript source files to bundle.
 */
const libEntryPoints = () => {
	const paths = Object.values(workspaceExports)
		.map(({ import: i }) => i)
		.filter((i) => typeof i === 'string')
		.map((i) => i.replace(/^\.\/dist\//, 'src/').replace(/\.js$/, '.ts'));

	if (paths.length === 0) {
		// eslint-disable-next-line no-undef
		console.error('No source files to bundle.');
		// eslint-disable-next-line no-undef
		process.exit(1);
	}

	const uniquePaths = [...new Set(paths)];
	const unknownPaths = uniquePaths.filter((path) => !existsSync(path));

	if (unknownPaths.length > 0) {
		// eslint-disable-next-line no-undef
		console.error(`Some source files are missing: ${unknownPaths.join(',')}`);
		// eslint-disable-next-line no-undef
		process.exit(1);
	}

	return uniquePaths;
};

/**
 * For a CLI, the entry point is always `main.ts` since the output file name
 * does not need to match the entry file name.
 *
 * @type {string} The source file for the CLI entry point
 */
const cliEntryPoint = 'src/main.ts';

const buildBrowser = () => {
	esbuild
		.build({
			entryPoints: libEntryPoints(),
			outbase: 'src',
			outdir: dist,
			bundle: true,
			sourcemap: true,
			minify: true,
			splitting: true,
			format: 'esm',
			define: { global: 'window' },
			target: ['esnext'],
			platform: 'browser',
			conditions: ['worker', 'browser'],
			// TODO: remove the extra external dependencies once we have a better way
			// to handle the conditional imports in the assets submodule
			external: [...externalPeerDependencies, 'fs', 'path']
		})
		// eslint-disable-next-line no-undef
		.catch(() => process.exit(1));
};

const buildNode = ({ format }) => {
	esbuild
		.build({
			entryPoints: libEntryPoints(),
			outbase: 'src',
			outdir: dist,
			outExtension: { '.js': '.mjs' },
			bundle: true,
			sourcemap: true,
			minify: true,
			...(format === 'esm' && {
				format,
				banner: {
					js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);"
				}
			}),
			platform: 'node',
			target: ['node20', 'esnext'],
			external: externalPeerDependencies
		})
		// eslint-disable-next-line no-undef
		.catch(() => process.exit(1));
};

const buildNodeCli = ({ format }) => {
	esbuild
		.build({
			entryPoints: [cliEntryPoint],
			outfile: join(dist, 'main.js'),
			bundle: true,
			sourcemap: true,
			minify: true,
			...(format === 'esm' && {
				format,
				banner: {
					js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);"
				}
			}),
			platform: 'node',
			target: ['node20', 'esnext'],
			external: externalPeerDependencies
		})
		// eslint-disable-next-line no-undef
		.catch(() => process.exit(1));
};

/**
 * Build the libraries for the browser and Node.
 * @param nodeFormat Output format for Node.js bundle: esm (default)
 */
export const build = ({ nodeFormat } = { nodeFormat: 'esm' }) => {
	if (nodeFormat === undefined) {
		// eslint-disable-next-line no-undef
		console.error("Missing parameter 'nodeFormat'");
		// eslint-disable-next-line no-undef
		process.exit(1);
	}

	createDistFolder();

	buildBrowser();
	buildNode({ format: nodeFormat });
	buildNodeCli({ format: nodeFormat });
};

build();
