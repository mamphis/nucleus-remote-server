import { Logger } from "./logger";
export const githubOperational = () => {
    return !!process.env.GITHUB_PAT;
}
export const createIssue = async (user: { username: string }, body: string): Promise<false | { id: number; number: number }> => {
    const pat = process.env.GITHUB_PAT;
    if (!pat) {
        return false;
    }

    const response = await fetch('https://api.github.com/repos/mamphis/nucleus-remote-server/issues', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + pat,
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
            title: 'User-Issue from ' + user.username,
            body,
            labels: [
                'user-issue'
            ],
        }),
    });

    if (response.status === 201) {
        const { id, number } = await response.json();
        return { id, number };
    }
    Logger.warn(await response.json());

    return false;
}