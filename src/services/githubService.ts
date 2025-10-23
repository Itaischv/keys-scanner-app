import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";
import { Commit, CommitFile } from '../interfaces/github';

dotenv.config();

const GITHUB_URL: string = "https://api.github.com";

export async function getCommits(org: string, repoId: string, page: number, perPage: number): Promise<Commit[]> {
    console.debug(`Get commits - org: ${org} repo: ${repoId} page: ${page}`)
    return await getRequest(`/repos/${org}/${repoId}/commits`, { per_page: perPage, page })
}

export async function getCommitDiff(org: string, repoId: string, sha: string): Promise<CommitFile[]> {
    console.debug(`getCommitDiff - org ${org} repo ${repoId} sha ${sha}`)
    const data = await getRequest<{ files: CommitFile[] }>(
        `/repos/${org}/${repoId}/commits/${sha}`
    );
    return data.files || [];
}

async function handleRateLimit(headers: any): Promise<void> {
    const remaining = parseInt(headers["x-ratelimit-remaining"] || "0");
    const reset = parseInt(headers["x-ratelimit-reset"] || "0");

    if (remaining === 0 && reset) {
        const waitMs = Math.max(reset * 1000 - Date.now(), 0);
        console.log(`⏳ Rate limit reached. Waiting ${(waitMs / 1000).toFixed(1)}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
}

async function getRequest(path: string, params: Record<string, any> = {}): Promise<any> {
    const token = process.env.GH_TOKEN;
    const headers = { Authorization: `Bearer ${token}`,
                      Accept: "application/vnd.github.v3+json",
                      "User-Agent": "aws-leak-scanner" };
    const url = `${GITHUB_URL}${path}`;

    try {
        const res: AxiosResponse = await axios.get(url, { headers, params });
        await handleRateLimit(res.headers);
        return res.data;
    } catch (error: any) {
        if (error.response) {
            console.error(
                `❌ GitHub API error [${error.response.status}] ${error.response.statusText} at ${path}`
            );
            console.error(error.response.data?.message || "Unknown error");
        } else {
            console.error("❌ Network or Axios error:", error.message);
        }
        throw error;
    }
}

