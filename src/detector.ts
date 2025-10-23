import { LeakFinding } from "./interfaces/common";

const keyPatterns = {
    AWS_ACCESS_KEY_ID: /(AKIA|ASIA|AGPA|AIDA|AROA|ANPA)[A-Z0-9]{16}/g,
    AWS_SECRET_ACCESS_KEY: /[A-Za-z0-9\/+=]{40}/g,
    AWS_SESSION_TOKEN: /FQoGZXIvYXdzE[a-zA-Z0-9\/+=]{270,}/g
};


export function scan(diff: string, file: string, sha: string): LeakFinding[] {
    const keys = Object.entries(keyPatterns)
    return keys.flatMap(([type, regex]) => {
        const matches = diff.match(regex) || [];
        return matches.map((value) => ({
            type: type as LeakFinding["type"],
            value,
            file,
            sha
        }));
    });
}