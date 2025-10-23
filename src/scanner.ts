import { getCommits, getCommitDiff } from "./services/githubService";
import { scan } from "./detector";
import { LeakFinding } from "./interfaces/common";
import {privateDecrypt} from "node:crypto";

const PER_PAGE = 50;
export async function scanRepo(org: string, repoId: string) {
    const findings: LeakFinding[] = [];

    let page = 1;
    while(true) {
        const commits = await getCommits(org, repoId, page, PER_PAGE);
        if (commits.length === 0) break;

        for (const commit of commits) {
            const { sha } = commit
            const author = commit.commit?.author?.name;

            // Get commit files:
            const files = await getCommitDiff(org, repoId, sha);

            for (const file of files) {
                console.debug(`Looking for leaks at file ${file.filename}`)
                if (!file.patch) continue; // No diffs
                const leaks = scan(file.patch, file.filename, sha);
                if (leaks.length > 0) {
                    console.log(`Found ${leaks.length} leak(s) in ${file.filename}`);
                    findings.push(...leaks);
                }
            }
        }
        page++;
    }
    console.debug(`✅ Scan complete for ${org}/${repoId}`);
    console.debug(`Total leaks found: ${findings.length}`);
    return findings;
}


