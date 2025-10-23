import { getCommits, getCommitDiff } from "./services/githubService";
import { scan } from "./detector";
import { LeakFinding } from "./interfaces/common";
import { connectDB } from "./db";
import { getLastProgress, saveFindings, updateProgress } from "./db/repository";

const PER_PAGE = 1;

export async function scanRepo(org: string, repoId: string) {
    const findings: LeakFinding[] = [];
    await connectDB();

    const repoKey = `${org}/${repoId}`;
    const { sha: lastCommit, page: lastPage } = await getLastProgress(repoKey);

    let page = lastPage;
    let shouldSkipCommit = !!lastCommit;
    let foundLastCommit = false;

    console.log(`Starting scan for ${repoKey}${lastCommit ? ` (resuming from ${lastCommit} on page ${lastPage})` : ""}`);

    while (true) {
        const commits = (await getCommits(org, repoId, page, PER_PAGE)).reverse();
        if (commits.length === 0) break;

        for (const commit of commits) {
            const { sha } = commit;

            // Skip until reaching the last scanned commit, then continue
            if (shouldSkipCommit) {
                if (sha === lastCommit) {
                    shouldSkipCommit = false;
                    foundLastCommit = true;
                    console.log(`⏩ Skipping previously scanned commit ${sha}, continuing with older commits...`);
                    continue; // skip this one itself
                }
                continue; // still skipping newer ones
            }

            console.debug(`Fetching diffs for commit ${sha}`);
            const files = await getCommitDiff(org, repoId, sha);
            let commitFindings: LeakFinding[] = [];

            for (const file of files) {
                if (!file.patch) continue;
                const leaks = scan(file.patch, file.filename, sha);
                if (leaks.length) commitFindings.push(...leaks);
            }

            if (commitFindings.length) {
                console.log(`💥 Found ${commitFindings.length} leaks in ${sha}`);
                await saveFindings(repoKey, commitFindings);
                findings.push(...commitFindings);
            }

            // Save last commit and sha to db
            await updateProgress(repoKey, sha, page);
        }

        page++;
    }

    // If the last scanned commit wasn’t found (e.g., branch changed), reset progress
    if (lastCommit && !foundLastCommit) {
        console.warn(`Last commit ${lastCommit} not found — resetting progress.`);
        await updateProgress(repoKey, "", 1);
    }

    console.debug(`Scan complete for ${org}/${repoId}`);
    console.debug(`Total leaks found: ${findings.length}`);

    return findings;
}
