# Keys Scanner App

A GitHub repository scanner that detects accidentally committed AWS credentials in commit history.

## What It Does

This application scans GitHub repositories for exposed AWS credentials by analyzing commit diffs. It identifies:

- **AWS Access Key IDs** (AKIA, ASIA, AGPA, AIDA, AROA, ANPA prefixes)
- **AWS Secret Access Keys** (40-character base64 strings)
- **AWS Session Tokens** (encrypted tokens)

## Key Features

- **Resumable Scans**: Progress is saved to MongoDB, allowing scans to pause and resume
- **Rate Limit Aware**: Automatically handles GitHub API rate limits
- **Persistent Storage**: All findings are stored in MongoDB for auditing
- **Commit History Analysis**: Scans through entire repository history

## Prerequisites

- Node.js
- MongoDB instance
- GitHub Personal Access Token

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```
GH_TOKEN=your_github_token
MONGO_URI=mongodb://localhost:27017/keys-scanner
```

## Usage

Scan a repository by providing the owner and repo name:

```bash
npm run dev owner/repo
```

## How It Works

1. Connects to MongoDB and checks for previous scan progress
2. Fetches commits from GitHub API (paginated)
3. Analyzes each commit's file diffs for credential patterns
4. Saves any findings to the database
5. Updates progress marker to enable resumption

## Database

The app stores two types of data in MongoDB:

- **Findings**: Detected credentials with commit SHA, file path, and type
- **Progress**: Last scanned commit and page number for each repository

## Development

Run in development mode with auto-reload: