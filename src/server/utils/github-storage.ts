/**
 * GitHub CDN & jsDelivr Storage Fallback Utility
 * Provides unlimited backup storage for assets via GitHub Repository & jsDelivr CDN
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = 'dresar/lptk-admin';
const GITHUB_BRANCH = 'main';

export async function uploadToGitHubStorage(
  filePath: string,
  buffer: Buffer,
  commitMessage = 'cdn: upload asset'
): Promise<{ success: boolean; url?: string; jsdelivrUrl?: string; error?: string }> {
  try {
    const cleanPath = filePath.replace(/^\/+/, '');
    const targetRepoPath = `public/cdn/${cleanPath}`;
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${targetRepoPath}`;

    // Check if file already exists to get SHA for update
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'LPTK-Mahato-CDN',
        },
      });
      if (getRes.ok) {
        const existingData = await getRes.json();
        sha = existingData.sha;
      }
    } catch {
      // Ignore error if file doesn't exist
    }

    const body: Record<string, any> = {
      message: commitMessage,
      content: buffer.toString('base64'),
      branch: GITHUB_BRANCH,
    };
    if (sha) {
      body.sha = sha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'LPTK-Mahato-CDN',
      },
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return { success: false, error: `GitHub API error: ${putRes.status} ${errText}` };
    }

    const jsdelivrUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/public/cdn/${cleanPath}`;
    return {
      success: true,
      url: `/api/cdn/${cleanPath}`,
      jsdelivrUrl,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to upload to GitHub CDN' };
  }
}

export async function fetchFromGitHubCdn(filePath: string): Promise<Response | null> {
  const cleanPath = filePath.replace(/^\/+/, '').replace(/^cdn\//, '');
  const sources = [
    `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/public/cdn/${cleanPath}`,
    `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/public/cdn/${cleanPath}`,
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      });
      if (res.ok) {
        return res;
      }
    } catch {}
  }

  return null;
}
