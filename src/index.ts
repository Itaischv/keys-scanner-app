import dotenv from 'dotenv';
import { scanRepo } from "./scanner";

dotenv.config();

console.log("GitHub Token prefix:", process.env.GH_TOKEN?.slice(0, 5) || "missing");

(async () => {
    const repoArg = process.argv[2];
    if (!repoArg) {
        console.error("Usage: npm run scan owner/repo");
        process.exit(1);
    }

    const [owner, repo] = repoArg.split("/");
    await scanRepo(owner, repo);
})();