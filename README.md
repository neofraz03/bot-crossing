Bot Crossing 🐾🤖🐳

Bot Crossing is a headless, multi-architecture dashboard that visualizes your AI coding agent sessions (Claude Code, Codex, Cursor) and Docker container fleets together as interactive 3D dioramas.
🌟 Core Features

    AI Agent Harnesses: Automatically scans, tracks, and manages developer chat sessions and threads across multiple AI coding assistants (claude-code, codex, cursor).

    Docker Fleet Visualization: Queries local and remote Docker Unix sockets to map out your running containers, service states, and infrastructure alongside your code sessions.

    Modular Adapter Architecture: Built with a decoupled harness system (server/harnesses/) so new agents or container sources can be plugged in seamlessly.

    Interactive 3D Diorama HUD: Renders your active workspaces, projects, and containers onto an interactive map where you can view status, track activity, archive items, and launch sessions.

    Multi-Architecture Support: Fully optimized via docker buildx to deploy natively across linux/amd64 and linux/arm64 (Apple Silicon, Intel/AMD servers, and edge nodes).

    Multi-Host Monitoring: Securely aggregate container fleets from secondary Linux hosts using SSH socket tunnels.

🚀 Quick Start (Docker Compose)

To run Bot Crossing on any Linux, macOS, or Windows host, create a directory containing a docker-compose.yml file:
YAML

version: '3.8'

services:
  bot-crossing:
    image: neofraz03/bot-crossing:latest
    container_name: bot-crossing-monitor
    ports:
      - "5274:5274"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/app/data
    restart: unless-stopped

Run the container in the background:
Bash

docker compose up -d

Access your interactive 3D dashboard in your browser at:
http://<your-host-ip>:5274
🌐 Multi-Architecture Builds (docker buildx)

Bot Crossing supports multi-architecture releases out of the box. To build and push an updated version for both AMD64 and ARM64 architectures to Docker Hub:
Bash

# Ensure you are logged into Docker Hub
docker login

# Build and push simultaneously
docker buildx build --platform linux/amd64,linux/arm64 -t neofraz03/bot-crossing:latest --push .

🛠️ Advanced: Monitoring Multiple Hosts via SSH Tunnels

If you want your central Bot Crossing instance to monitor containers running on a second remote Linux host, you can securely tunnel the remote Docker socket over SSH:
1. Establish the SSH Tunnel

On your primary host running Bot Crossing, create a persistent SSH tunnel to forward the second host's Docker socket:
Bash

ssh -i /path/to/ssh/key -L /tmp/host2-docker.sock:/var/run/docker.sock user@second-host-ip -N -f

2. Mount the Tunneled Socket in Docker Compose

Update your primary docker-compose.yml to mount the secondary socket into the container:
YAML

volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - /tmp/host2-docker.sock:/tmp/host2-docker.sock
  - ./data:/app/data

3. Add a Secondary Docker Harness Adapter

Duplicate your primary Docker harness (server/harnesses/docker.mjs) as server/harnesses/docker-host2.mjs, point its socketPath to /tmp/host2-docker.sock, assign it a unique id (e.g., 'docker-host2'), and register it in server/harnesses/index.mjs alongside your AI agent harnesses.
🔒 Security & Network Access

Bot Crossing includes a built-in security check (isLocalRequest) to prevent DNS rebinding and CSRF attacks by validating Host and Origin headers. Private IP ranges (such as 192.168.x.x, 10.x.x.x, and 172.16-31.x.x) and local loopback interfaces are automatically permitted so you can seamlessly access the dashboard across your home network or private lab.