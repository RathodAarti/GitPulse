export const DEMO_REPO_DATA = {
  repoName: 'facebook/react',
  repoUrl: 'https://github.com/facebook/react',
  lastSyncedAt: new Date().toISOString(),
  metrics: {
    commits: 15420,
    commitsChange: 12,
    issues: 850,
    issuesChange: -5,
    prs: 420,
    prsChange: 8,
    contributors: 1500,
    contributorsChange: 2
  },
  velocityData: [
    { name: 'Mon', commits: 45, prs: 12 },
    { name: 'Tue', commits: 52, prs: 18 },
    { name: 'Wed', commits: 38, prs: 15 },
    { name: 'Thu', commits: 65, prs: 22 },
    { name: 'Fri', commits: 48, prs: 20 },
    { name: 'Sat', commits: 24, prs: 8 },
    { name: 'Sun', commits: 32, prs: 10 },
  ],
  contributors: [
    { name: 'Dan Abramov', commits: 1200, avatar: 'https://i.pravatar.cc/150?u=dan' },
    { name: 'Rachel Nabors', commits: 800, avatar: 'https://i.pravatar.cc/150?u=rachel' },
    { name: 'Andrew Clark', commits: 750, avatar: 'https://i.pravatar.cc/150?u=andrew' },
    { name: 'Sebastian Markbåge', commits: 600, avatar: 'https://i.pravatar.cc/150?u=sebastian' },
    { name: 'Lauren Tan', commits: 450, avatar: 'https://i.pravatar.cc/150?u=lauren' },
  ]
};

export const DEMO_VELOCITY = DEMO_REPO_DATA.velocityData;
export const DEMO_CONTRIBUTORS = DEMO_REPO_DATA.contributors;
