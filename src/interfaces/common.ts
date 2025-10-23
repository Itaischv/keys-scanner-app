export interface LeakFinding {
    type: "AWS_ACCESS_KEY_ID" | "AWS_SECRET_ACCESS_KEY" | "AWS_SESSION_TOKEN";
    value: string;
    file: string;
    sha: string;
}
