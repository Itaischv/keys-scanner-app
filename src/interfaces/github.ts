interface Commit {
    sha: string;
    commit: {
        author: { name: string; email: string; }
        message: string;
    }
}

interface CommitFile {
    filename: string;
    patch?: string;
}

export { Commit, CommitFile }
