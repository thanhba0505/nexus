import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const APPS_JSON_PATH = path.join(ROOT_DIR, 'apps.json');

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function parseSemver(v) {
  const clean = v.replace(/^v/, '');
  const [major = 0, minor = 0, patch = 0] = clean.split('.').map(Number);
  return { major, minor, patch };
}

function bumpVersion(semverStr, type = 'patch') {
  let { major, minor, patch } = parseSemver(semverStr);
  if (type === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function determineBumpType(commitLogs) {
  if (
    commitLogs.includes('BREAKING CHANGE') ||
    /[a-z]+(\([^)]+\))?!:/.test(commitLogs)
  ) {
    return 'major';
  }
  if (
    /[a-z0-9]+\s+feat(\([^)]+\))?:/i.test(commitLogs) ||
    /feat(\([^)]+\))?:/i.test(commitLogs)
  ) {
    return 'minor';
  }
  return 'patch';
}

function updateAppPackageJson(appDir, newVersion) {
  const pkgPath = path.join(ROOT_DIR, 'apps', appDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  }
}

function updateAppTauriConfig(appDir, newVersion) {
  const tauriPath = path.join(
    ROOT_DIR,
    'apps',
    appDir,
    'src-tauri',
    'tauri.conf.json'
  );
  if (fs.existsSync(tauriPath)) {
    const conf = JSON.parse(fs.readFileSync(tauriPath, 'utf-8'));
    conf.version = newVersion;
    fs.writeFileSync(tauriPath, JSON.stringify(conf, null, 2) + '\n', 'utf-8');
  }
}

export function runVersionBump({ dryRun = false } = {}) {
  const appsData = JSON.parse(fs.readFileSync(APPS_JSON_PATH, 'utf-8'));

  let lastTag = runGit('git describe --tags --abbrev=0');
  if (!lastTag) {
    lastTag = runGit('git rev-list --max-parents=0 HEAD');
  }

  const changedFiles = runGit(`git diff --name-only ${lastTag}..HEAD`)
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const commitLogs = runGit(`git log ${lastTag}..HEAD --oneline`);

  const packagesChanged = changedFiles.some((f) => f.startsWith('packages/'));
  const nexusChanged =
    packagesChanged || changedFiles.some((f) => f.startsWith('apps/nexus/'));
  const slackbotChanged =
    packagesChanged || changedFiles.some((f) => f.startsWith('apps/slackbot/'));
  const githubReportChanged =
    packagesChanged ||
    changedFiles.some((f) => f.startsWith('apps/github-report/'));

  const anyAppChanged = nexusChanged || slackbotChanged || githubReportChanged;

  if (!anyAppChanged) {
    console.log(
      JSON.stringify({
        bumped: false,
        message: 'Không có thay đổi nào trong apps/ hoặc packages/.',
      })
    );
    return { bumped: false };
  }

  const bumpType = determineBumpType(commitLogs);
  const newEcosystemVersion = bumpVersion(appsData.version, bumpType);
  const newTag = `v${newEcosystemVersion}`;

  const changedApps = [];

  // 1. Cập nhật Nexus
  if (nexusChanged) {
    appsData.nexus.version = bumpVersion(appsData.nexus.version, bumpType);
    changedApps.push('nexus');
    if (!dryRun) {
      updateAppPackageJson('nexus', appsData.nexus.version);
      updateAppTauriConfig('nexus', appsData.nexus.version);
    }
  }
  appsData.nexus.downloadUrl = `https://github.com/thanhba0505/nexus/releases/download/${newTag}/Nexus_${appsData.nexus.version}_aarch64.dmg`;

  // 2. Cập nhật các mini app trong mảng apps
  for (const app of appsData.apps) {
    let hasChanged = false;
    const appDir = app.id;
    if (app.id === 'slackbot' && slackbotChanged) {
      hasChanged = true;
    } else if (app.id === 'github-report' && githubReportChanged) {
      hasChanged = true;
    }

    if (hasChanged) {
      app.version = bumpVersion(app.version, bumpType);
      changedApps.push(app.id);
      if (!dryRun) {
        updateAppPackageJson(appDir, app.version);
        updateAppTauriConfig(appDir, app.version);
      }
    }

    const dmgName = app.id === 'github-report' ? 'GitHub_Report' : app.name;
    app.downloadUrl = `https://github.com/thanhba0505/nexus/releases/download/${newTag}/${dmgName}_${app.version}_aarch64.dmg`;
  }

  appsData.version = newEcosystemVersion;
  appsData.updatedAt = new Date().toISOString();

  if (!dryRun) {
    fs.writeFileSync(
      APPS_JSON_PATH,
      JSON.stringify(appsData, null, 2) + '\n',
      'utf-8'
    );
  }

  const result = {
    bumped: true,
    ecosystemVersion: newEcosystemVersion,
    tag: newTag,
    bumpType,
    changedApps,
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (process.argv[1] && process.argv[1].endsWith('bump-versions.mjs')) {
  const isDryRun = process.argv.includes('--dry-run');
  runVersionBump({ dryRun: isDryRun });
}
