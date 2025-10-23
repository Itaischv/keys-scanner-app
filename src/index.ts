import dotenv from 'dotenv';
import { getCommits } from "./services/githubService";

dotenv.config();

console.log("GitHub Token prefix:", process.env.GH_TOKEN?.slice(0, 5) || "missing");

const commits = await getCommits("octocat", "Hello-World", 1, 5);
console.debug("Commits:", commits)