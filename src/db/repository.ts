import { Progress, Finding } from "./index";
import { LeakFinding } from "../interfaces/common";

export async function getLastProgress(repo: string): Promise<{ sha: string | null; page: number }> {
    const doc = await Progress.findOne({ repo });
    return doc ? { sha: doc.lastCommit, page: doc.lastPage } : { sha: null, page: 1 };
}

export async function updateProgress(repo: string, sha: string, page: number): Promise<void> {
    await Progress.findOneAndUpdate(
        { repo },
        { lastCommit: sha, lastPage: page },
        { upsert: true }
    );
}

export async function saveFindings(repo: string, leaks: LeakFinding[]): Promise<void> {
    if (!leaks.length) return;
    const docs = leaks.map((l) => ({ ...l, repo }));
    await Finding.insertMany(docs);
}
