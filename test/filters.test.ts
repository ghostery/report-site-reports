import {NetworkFilter, Request, parseFilter} from '@cliqz/adblocker';
import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';
import {parse} from '../src/modules/assert';

const cwd = process.cwd();

const doTest = (filePath: string) => {
	for (const {filter, assertions} of parse(readFileSync(path.join(cwd, filePath), 'utf8'))) {
		if (filter.startsWith('[') || filter.startsWith('!')) {
			continue;
		}

		test(filter, () => {
			const parsed = parseFilter(filter);

			if (
				parsed !== null
        && parsed.isNetworkFilter()
        && !(parsed instanceof NetworkFilter && parsed.isBadFilter())
			) {
				expect(assertions.length).toBeGreaterThan(0);
			}

			expect(parsed).not.toBe(null);

			for (const {url, type, match} of assertions) {
				expect((NetworkFilter.parse(filter)!).match(
					Request.fromRawDetails({url, type, sourceUrl: url}),
				)).toBe(match);
			}
		});
	}
};

doTest('filters/autoconsent-compatibility.txt');
doTest('filters/cookies.txt');
doTest('filters/fixes.txt');
doTest('filters/privacy.txt');
