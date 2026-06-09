import { HelpIcon, RepoIcon, BoltIcon, LockIcon } from '../components/Icons'

export default function Help() {

  return (
    <div className="help-page animate-slide-up" id="help-page">
      <div className="section-header">
        <h2>User Guide & Documentation</h2>
      </div>

      <div className="card reveal-on-scroll">
        <div className="card-header">
          <HelpIcon size={18} color="var(--accent)" />
          <h3>What is GitPulse?</h3>
        </div>
        <div className="card-body">
          <p>
            <strong>GitPulse</strong> is a lightweight developer analytics platform designed for engineering leaders, project managers, and builders. It provides cross-repository contributor dashboards, tracking commit frequency, pull requests, issue resolution times, and team contribution hierarchies.
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            The project maps out a central repository list and provides pre-compiled visualizations including a <strong>Velocity Timeline</strong> and <strong>Contributor Leaderboards</strong>.
          </p>
        </div>
      </div>

      <div className="card reveal-on-scroll">
        <div className="card-header">
          <RepoIcon size={18} color="var(--accent)" />
          <h3>How to Onboard a Repository</h3>
        </div>
        <div className="card-body">
          <ol>
            <li>
              Go to the <strong>Dashboard</strong> page.
            </li>
            <li>
              Copy a <strong>public</strong> GitHub URL from your browser (e.g., <code>https://github.com/facebook/react</code>).
            </li>
            <li>
              Paste it in the <strong>&quot;Add Repository&quot;</strong> input box and click <strong>&quot;Onboard Repo&quot;</strong>.
            </li>
            <li>
              The system will verify the repository existence on GitHub, fetch initial analytics data, and append it to your dashboard. Click the repository's card to view its metrics!
            </li>
          </ol>
        </div>
      </div>

      <div className="card reveal-on-scroll">
        <div className="card-header">
          <BoltIcon size={18} color="var(--accent)" />
          <h3>Bypass Rate Limits: Configure your GitHub PAT</h3>
        </div>
        <div className="card-body">
          <p>
            Without authentication, the GitHub API restricts requests to <strong>60 requests/hour</strong> per IP address. GitPulse will quickly exhaust this limit.
          </p>
          <p style={{ fontWeight: 600 }}>
            To increase your rate limit to <strong>5000 requests/hour</strong> and enable tracking of <strong>private repositories</strong>, follow these steps:
          </p>
          <ol>
            <li>
              Go to your GitHub Account &rarr; <strong>Settings</strong> &rarr; <strong>Developer Settings</strong> &rarr; <strong>Personal Access Tokens</strong> &rarr; <strong>Tokens (classic)</strong>.
            </li>
            <li>
              Click <strong>Generate new token (classic)</strong>. Give it a name (e.g. <em>GitPulse-Key</em>).
            </li>
            <li>
              Select the <code>repo</code> scope (required to view private repositories). If you only want to view public repositories, you can leave all scopes unchecked.
            </li>
            <li>
              Generate the token and copy it immediately.
            </li>
            <li>
              Open the <strong>Settings</strong> page in GitPulse, paste the key into the token input, and click <strong>&quot;Update Integration Token&quot;</strong>.
            </li>
            <li>
              Click <strong>&quot;Test Connection&quot;</strong> to verify that your credentials are correct and inspect your current hourly remaining quota.
            </li>
          </ol>
        </div>
      </div>

      <div className="card reveal-on-scroll">
        <div className="card-header">
          <LockIcon size={18} color="var(--accent)" />
          <h3>Understanding Cache Syncs (20-min guard)</h3>
        </div>
        <div className="card-body">
          <p>
            Because GitPulse retrieves hundreds of records (commits, pull requests, and issues) to construct charts and contributor stats, querying GitHub on every page load would quickly hit rate limits.
          </p>
          <p style={{ margin: '8px 0' }}>
            To prevent rate limit exhaustion, <strong>GitPulse caches all data in MongoDB</strong>.
          </p>
          <ul>
            <li>
              When you load a repository's analytics page, GitPulse checks if the stored cache is <strong>less than 20 minutes old</strong>. If so, it serves the data instantly from your database.
            </li>
            <li>
              After 20 minutes, the <strong>&quot;Sync Data&quot;</strong> button becomes unlocked, allowing you to fetch the latest commits and issues.
            </li>
          </ul>
        </div>
      </div>

      {/* Compact Contact Banner */}
      <div className="help-contact-banner reveal-on-scroll">
        <div className="help-contact-banner-left">
          <HelpIcon size={20} color="var(--primary)" />
          <div>
            <div className="help-contact-title">Need further assistance?</div>
            <div className="help-contact-sub">Our support team typically responds within 24 hours.</div>
          </div>
        </div>
        <div className="help-contact-banner-right">
          <a
            href="https://mail.google.com/mail/?view=cm&to=agrathod0701@gmail.com&su=GitPulse%20Support%20Query"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ✉ Email Support
          </a>
        </div>
      </div>
    </div>
  )
}
