#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// The suffix we use to publish to npm wip version of the libs
const SUFFIX = 'next';

const nextVersion = async ({
	project,
	currentVersion
}: {
	project: string;
	currentVersion: string;
}) => {
	const version = `${currentVersion}-${SUFFIX}-${new Date().toISOString().slice(0, 10)}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,no-undef
	const { versions } = await (await fetch(`https://registry.npmjs.org/@dfinity/${project}`)).json();

	// The wip version has never been published
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	if (versions[version] === undefined) {
		return version;
	}

	// There was some wip version already published, so we increment the version number
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const count = Object.keys(versions).filter((v) => v.includes(version)).length;
	return `${version}.${count}`;
};

const updateVersion = async () => {
	const packagePath = join(process.cwd(), 'package.json');

	if (!existsSync(packagePath)) {
		console.log(`Target ${packagePath} does not exist.`);
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const { version: currentVersion, ...rest } = JSON.parse(readFileSync(packagePath, 'utf-8'));

	// Build wip version number
	const version = await nextVersion({
		project: 'ic-pub-key',
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		currentVersion
	});

	writeFileSync(
		packagePath,
		JSON.stringify(
			{
				...rest,
				version
			},
			null,
			2
		),
		'utf-8'
	);
};

await updateVersion();
