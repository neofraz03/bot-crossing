import http from 'node:http';

function fetchDocker(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { socketPath: '/tmp/host2-docker.sock', path }, // Point to second host's tunneled socket
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
        id: `docker-host2:${container.Id}`, // Unique ID prefix to avoid collision
        title: `${containerName} (Host 2)`,  // Easily tell them apart on the map
        preview: `Image: ${container.Image} | Status: ${container.Status}`,
        project: 'docker-fleet-2',
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
    console.error('Failed to scan Docker containers on Host 2:', err);
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
  id: 'docker-host2', // Unique harness ID
  name: 'Docker Containers (Host 2)',
  detect,
  scanThreads,
  openThread,
  newSession,
  paths: {},
};