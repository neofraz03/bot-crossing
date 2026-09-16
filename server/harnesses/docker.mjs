import http from 'node:http';

function fetchDocker(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { socketPath: '/var/run/docker.sock', path },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse Docker API response: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
  });
}

async function detect() {
  try {
    const containers = await fetchDocker('/containers/json?all=1');
    return Array.isArray(containers);
  } catch {
    return false;
  }
}

async function scanThreads() {
  try {
    const containers = await fetchDocker('/containers/json?all=1');
    if (!Array.isArray(containers)) return [];

    return containers.map((container) => {
      const isRunning = container.State === 'running';
      const containerName = container.Names && container.Names[0] ? container.Names[0].replace(/^\//, '') : container.Id.slice(0, 12);

      return {
        id: `docker:${container.Id}`,
        title: containerName,
        preview: `Image: ${container.Image} | Status: ${container.Status}`,
        project: 'docker-fleet',
        projectPath: '/',
        worktree: '',
        cwd: '',
        gitBranch: '',
        model: 'docker',
        effort: '',
        createdAt: (container.Created || Date.now() / 1000) * 1000,
        lastActivityAt: Date.now(),
        lastFocusedAt: 0,
        unread: false,
        running: isRunning,
        hasError: !isRunning,
        starred: false,
        routine: '',
        prState: '',
        archived: !isRunning,
        sizeBytes: isRunning ? 50000 : 1000,
        source: 'container',
        canOpen: false,
        ref: { containerId: container.Id },
      };
    });
  } catch (err) {
    console.error('Failed to scan Docker containers:', err);
    return [];
  }
}

function openThread() {
  return { ok: false, error: 'Docker containers cannot be opened directly from the simulation overlay.' };
}

function newSession() {
  return { ok: false, error: 'New container creation is not supported via this map.' };
}

export default {
  id: 'docker',
  name: 'Docker Containers',
  detect,
  scanThreads,
  openThread,
  newSession,
  paths: {},
};