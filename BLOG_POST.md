# Complete Guide: Hosting a React Application with PostgreSQL on Local VMs and Accessing It Over the Internet

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Part 1: VM-to-VM Communication & Network Setup](#part-1-vm-to-vm-communication--network-setup)
4. [Part 2: Firewall Configuration (iptables & Firewalld)](#part-2-firewall-configuration-iptables--firewalld)
5. [Part 3: PostgreSQL Private Database Setup](#part-3-postgresql-private-database-setup)
6. [Part 4: SSH Tunneling & Key Management](#part-4-ssh-tunneling--key-management)
7. [Part 5: Internet Accessibility with TP-Link Deco Router](#part-5-internet-accessibility-with-tp-link-deco-router)
8. [Part 6: Nginx Reverse Proxy & SSL/TLS](#part-6-nginx-reverse-proxy--ssltls)
9. [Testing & Verification](#testing--verification)
10. [Security Best Practices](#security-best-practices)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Introduction

In this comprehensive guide, we'll walk through the process of setting up a complete web application infrastructure on your local Windows machine using VirtualBox VMs. We'll cover everything from basic VM networking to exposing your React application to the internet securely.

**What you'll learn:**
- Setting up two VMs for a distributed system (one public, one private)
- Configuring firewalls with iptables and Firewalld
- Establishing secure SSH tunnels between VMs
- Managing a private PostgreSQL database
- Port forwarding with TP-Link Deco router
- Setting up HTTPS with Let's Encrypt
- Deploying a production-ready React application

**Technologies covered:**
- React, Node.js, PostgreSQL
- Nginx, Docker networking
- iptables, Firewalld (UFW)
- Let's Encrypt SSL/TLS
- SSH key-based authentication
- DuckDNS for dynamic DNS

---

## Architecture Overview

Before diving into the technical details, let's understand the overall architecture of what we're building:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          YOUR SETUP                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Your ISP                                                               │
│  Public IP: 122.222.130.12                                             │
│         ↓                                                               │
│  TP-Link Deco Router (Main Router)                                     │
│  ├─ Internal IP: 192.168.1.1                                           │
│  └─ Port Forwarding: 80/443 → 192.168.1.100:80/443                    │
│         ↓                                                               │
│  ┌──────────────────────────────────────────────────────┐              │
│  │  Your Windows PC + VirtualBox                        │              │
│  │  ├─ VM1: PUBLIC VM (React App + Nginx)              │              │
│  │  │  ├─ IP: 192.168.1.100                            │              │
│  │  │  ├─ Port: 80/443 (Nginx)                         │              │
│  │  │  ├─ Port: 3000 (React dev)                       │              │
│  │  │  └─ SSH: 22                                      │              │
│  │  │                                                  │              │
│  │  └─ VM2: PRIVATE VM (PostgreSQL Database)          │              │
│  │     ├─ IP: 192.168.1.101                            │              │
│  │     ├─ Port: 5432 (PostgreSQL)                      │              │
│  │     ├─ SSH: 22 (only from Public VM)               │              │
│  │     └─ Firewall: Highly restricted                 │              │
│  │                                                     │              │
│  └──────────────────────────────────────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **Public VM (192.168.1.100):** Hosts your React application with Nginx reverse proxy
- **Private VM (192.168.1.101):** Hosts PostgreSQL database, isolated from internet
- **TP-Link Deco Router:** Manages port forwarding from public IP to internal VMs
- **Firewalls:** Protect each VM with specific, limited rules

---

## Part 1: VM-to-VM Communication & Network Setup

### Understanding Network Modes

When working with VirtualBox on Windows, you need to understand different network configurations:

| Mode | VM to Host | VM to VM | VM to Internet | Use Case |
|------|-----------|---------|----------------|----------|
| **NAT** | Limited | NO ✗ | YES (one-way) | Single VM, internet access |
| **Bridge** | YES ✓ | YES ✓ | YES ✓ | Multiple VMs, networking |
| **Host-only** | YES ✓ | YES ✓ | NO ✗ | Isolated lab environment |
| **Internal** | NO ✗ | YES ✓ | NO ✗ | Private network testing |

**For our setup, we'll use Bridge mode** as it allows both VMs to communicate directly and access the internet through your home network.

### VirtualBox Configuration Steps

**1. Create Public VM (React Application)**
- Name: PublicVM-React
- RAM: 2-4 GB (adjust based on your machine)
- Disk: 20-50 GB
- Network: Bridge Adapter
- OS: Ubuntu Server 22.04 LTS

**2. Create Private VM (PostgreSQL Database)**
- Name: PrivateVM-PostgreSQL
- RAM: 2-4 GB
- Disk: 20 GB
- Network: Bridge Adapter
- OS: Ubuntu Server 22.04 LTS

### Setting Static IP Addresses

Once both VMs are installed, configure static IPs for consistent connectivity.

**On Public VM (192.168.1.100):**

```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

**On Private VM (192.168.1.101):**

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.101/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply the configuration:

```bash
sudo netplan apply
```

### Testing VM-to-VM Communication

Verify both VMs can communicate with each other:

```bash
# From Public VM
ping 192.168.1.101

# Expected: PING 192.168.1.101 (192.168.1.101) 56(84) bytes of data.
# 64 bytes from 192.168.1.101: icmp_seq=1 ttl=64 time=0.123 ms
```

Test TCP connectivity:

```bash
# On Private VM - start listener
nc -l -p 5432

# On Public VM - test connection
nc -zv 192.168.1.101 5432

# Expected: Ncat: Connected to 192.168.1.101:5432
```

---

## Part 2: Firewall Configuration (iptables & Firewalld)

Understanding firewalls is crucial for securing your infrastructure. Let's break down the three main firewall chains and when to use them.

### Understanding Firewall Chains

**Three Main Chains in iptables:**

#### 1. INPUT Chain - Incoming Traffic

**Purpose:** Controls traffic coming INTO your system

```
External System → Internet → Your VM's Network Interface → INPUT Chain
```

**What it protects:**
- HTTP requests (port 80)
- HTTPS requests (port 443)
- SSH connections (port 22)
- Database queries from external sources

**Example rules:**

```bash
# Allow incoming HTTP
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow incoming SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Block incoming traffic on port 3000 from outside
sudo iptables -A INPUT -p tcp --dport 3000 -j DROP
```

#### 2. OUTPUT Chain - Outgoing Traffic

**Purpose:** Controls traffic going OUT from your system

```
Local Applications → OUTPUT Chain → Your VM's Network Interface → Internet
```

**What it protects:**
- Prevents malware from exfiltrating data
- Controls which external services your app can reach
- Manages API calls to external services

**Example rules:**

```bash
# Allow outgoing HTTP/HTTPS
sudo iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Allow DNS queries
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT

# Block outgoing to suspicious IP
sudo iptables -A OUTPUT -d 10.0.0.0/8 -j DROP
```

#### 3. FORWARD Chain - Transit Traffic

**Purpose:** Controls traffic passing THROUGH your system (Router/Gateway behavior)

```
External System A → Your VM (Acting as Router) → FORWARD Chain → Internal System B
```

**What it protects:**
- Docker container communication
- VPN traffic routing
- Traffic between different networks

**Example rules:**

```bash
# Allow Docker container traffic
sudo iptables -A FORWARD -o docker0 -j ACCEPT

# Allow communication between containers
sudo iptables -A FORWARD -i docker0 -o docker0 -j ACCEPT
```

### Complete iptables Ruleset

Here's a complete, production-ready firewall setup using iptables:

**For Public VM (Internet-facing):**

```bash
#!/bin/bash
# Public VM Firewall with Internet Access

# Flush existing rules
sudo iptables -F
sudo iptables -X

# Set default policies (whitelist approach - secure!)
sudo iptables -P INPUT DROP
sudo iptables -P OUTPUT ACCEPT
sudo iptables -P FORWARD DROP

# ========== INPUT CHAIN ==========
# Allow loopback
sudo iptables -A INPUT -i lo -j ACCEPT

# Allow SSH (port 22)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP (port 80)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow HTTPS (port 443)
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow established connections
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow ICMP (ping) - optional
sudo iptables -A INPUT -p icmp -j ACCEPT

# ========== OUTPUT CHAIN ==========
# Allow loopback
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Allow DNS
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Allow SSH to Private VM
sudo iptables -A OUTPUT -p tcp -d 192.168.1.101 --dport 22 -j ACCEPT

# Allow PostgreSQL (for tunneling)
sudo iptables -A OUTPUT -p tcp -d 192.168.1.101 --dport 5432 -j ACCEPT

# Allow outgoing HTTP/HTTPS
sudo iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Allow established connections
sudo iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

echo "Public VM Firewall configured!"
```

**For Private VM (Database-only, highly restricted):**

```bash
#!/bin/bash
# Private VM Firewall - Maximum Restriction

# Flush existing rules
sudo iptables -F
sudo iptables -X

# Set default policies (deny by default)
sudo iptables -P INPUT DROP
sudo iptables -P OUTPUT DROP
sudo iptables -P FORWARD DROP

# ========== INPUT CHAIN ==========
# Allow loopback
sudo iptables -A INPUT -i lo -j ACCEPT

# Allow SSH ONLY from Public VM (192.168.1.100)
sudo iptables -A INPUT -p tcp -s 192.168.1.100 --dport 22 -j ACCEPT

# Allow PostgreSQL ONLY from Public VM
sudo iptables -A INPUT -p tcp -s 192.168.1.100 --dport 5432 -j ACCEPT

# Allow established connections
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# ========== OUTPUT CHAIN ==========
# Allow loopback
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Allow outgoing to Public VM (for replies)
sudo iptables -A OUTPUT -p tcp -d 192.168.1.100 -j ACCEPT

# Allow DNS queries (for updates)
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Allow established connections
sudo iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

echo "Private VM Firewall configured!"
```

### Making iptables Rules Persistent

By default, iptables rules are lost on reboot. Here's how to make them permanent:

**Method 1: Using iptables-persistent (Recommended)**

```bash
# Install
sudo apt-get install iptables-persistent -y

# When prompted, save current rules: Yes
# Save IPv6 rules: Yes

# To update rules later:
sudo iptables-save | sudo tee /etc/iptables/rules.v4
sudo netfilter-persistent save
```

**Method 2: Using systemd startup script**

```bash
# Create script
sudo nano /usr/local/bin/firewall-setup.sh
# Paste your firewall commands
sudo chmod +x /usr/local/bin/firewall-setup.sh

# Add to crontab
sudo crontab -e
# Add: @reboot /usr/local/bin/firewall-setup.sh
```

### Firewalld Alternative

If you prefer Firewalld (simpler, more user-friendly), here's the equivalent setup:

**Install and enable:**

```bash
sudo apt-get install firewalld -y
sudo systemctl start firewalld
sudo systemctl enable firewalld
```

**Public VM configuration:**

```bash
# Set default zone
sudo firewall-cmd --set-default-zone=public

# Add services
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh

# Allow SSH to Private VM
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" destination address="192.168.1.101" port protocol="tcp" port="22" accept'

# Allow PostgreSQL (optional if not using SSH tunnel)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" destination address="192.168.1.101" port protocol="tcp" port="5432" accept'

# Apply
sudo firewall-cmd --reload
```

**Private VM configuration:**

```bash
# Set restrictive zone
sudo firewall-cmd --set-default-zone=dmz

# Allow SSH only from Public VM
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.100" service name="ssh" accept'

# Allow PostgreSQL only from Public VM
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.100" port protocol="tcp" port="5432" accept'

# Apply
sudo firewall-cmd --reload
```

### Firewall Decision Matrix

| Situation | Chain | Rule Type |
|-----------|-------|-----------|
| User accessing your web app | INPUT | Allow port 80/443 |
| Your app calling external API | OUTPUT | Allow outgoing 443 |
| Docker containers talking | FORWARD | Allow docker0 interface |
| SSH access to your VM | INPUT | Allow port 22 |
| Blocking DDoS attacks | INPUT | Rate limit port 80 |
| Preventing data theft | OUTPUT | Block outgoing to malicious IPs |

---

## Part 3: PostgreSQL Private Database Setup

### Installation

Install PostgreSQL on the Private VM:

```bash
# On Private VM (192.168.1.101)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib -y

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo systemctl status postgresql
```

### Configuration for Remote Access

**Step 1: Configure PostgreSQL to listen on network interface**

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Find and modify the listen_addresses line:

```
# BEFORE
#listen_addresses = 'localhost'

# AFTER
listen_addresses = '192.168.1.101'  # Only Private VM IP
```

**Step 2: Configure Authentication (pg_hba.conf)**

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add at the end:

```
# Allow connection from Public VM only
host    all             all             192.168.1.100/32        md5
```

**Step 3: Restart PostgreSQL**

```bash
sudo systemctl restart postgresql
```

### Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# In PostgreSQL console, create user and database:
CREATE USER react_app WITH PASSWORD 'StrongPassword123!';
CREATE DATABASE react_db OWNER react_app;
GRANT CONNECT ON DATABASE react_db TO react_app;

# Exit
\q
```

### Verify Configuration

Test the connection from the Public VM:

```bash
# On Public VM
psql -h 192.168.1.101 -U react_app -d react_db

# When prompted for password, enter: StrongPassword123!
# If connected, you'll see: react_db=>

# Test with a simple query:
SELECT version();
\q
```

---

## Part 4: SSH Tunneling & Key Management

### Why SSH Tunneling?

SSH tunneling provides an encrypted connection between your VMs, allowing secure access to services that would otherwise be exposed. It's much more secure than allowing direct TCP connections.

### SSH Key Generation

**On your Windows machine:**

```bash
# Using Git Bash or PowerShell
mkdir $env:USERPROFILE\.ssh
cd $env:USERPROFILE\.ssh

# Generate key pair (4096-bit RSA)
ssh-keygen -t rsa -b 4096 -f react_to_postgres -C "React VM to PostgreSQL"

# When prompted, press Enter twice (or set a passphrase for extra security)
```

This creates two files:
- `react_to_postgres` - Private key (KEEP SECRET!)
- `react_to_postgres.pub` - Public key (distribute freely)

### Setting Up Public Key on Private VM

**Step 1: Get the public key content**

From Windows:

```powershell
Get-Content $env:USERPROFILE\.ssh\react_to_postgres.pub
```

**Step 2: Add to Private VM**

On Private VM (192.168.1.101):

```bash
# Create SSH directory
mkdir -p ~/.ssh

# Create authorized_keys file
nano ~/.ssh/authorized_keys

# Paste the public key content here
# Save: Ctrl+X → Y → Enter

# Set permissions (CRITICAL!)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Setting Up Private Key on Public VM

Copy the private key to Public VM:

```bash
# On Public VM (192.168.1.100)
mkdir -p ~/.ssh

nano ~/.ssh/react_to_postgres
# Paste the entire private key content
# Save: Ctrl+X → Y → Enter

# Set permissions (CRITICAL!)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/react_to_postgres
```

### Creating SSH Tunnel

**Option 1: Manual SSH Tunnel**

```bash
# On Public VM, create tunnel to Private VM
ssh -i ~/.ssh/react_to_postgres \
    -L 5432:192.168.1.101:5432 \
    postgres@192.168.1.101 \
    -N -f

# Breakdown:
# -i ~/.ssh/react_to_postgres  = Use private key
# -L 5432:192.168.1.101:5432   = Forward local 5432 to remote 5432
# postgres@192.168.1.101       = Connect as postgres user
# -N                           = Don't execute command
# -f                           = Run in background

# Verify tunnel is open
netstat -tln | grep 5432

# Should show: tcp  0  0 127.0.0.1:5432  0.0.0.0:*  LISTEN
```

**Option 2: Persistent SSH Tunnel (Using systemd)**

Create a service file:

```bash
sudo nano /etc/systemd/system/postgres-tunnel.service
```

```ini
[Unit]
Description=SSH Tunnel to PostgreSQL
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/ssh -i /root/.ssh/react_to_postgres -N -L 5432:192.168.1.101:5432 postgres@192.168.1.101
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable postgres-tunnel.service
sudo systemctl start postgres-tunnel.service
sudo systemctl status postgres-tunnel.service
```

---

## Part 5: Internet Accessibility with TP-Link Deco Router

### Understanding Public vs Private IPs

**Critical Concept:** Your local VMs are NOT automatically accessible from the internet.

```
Your Windows PC (Local Network)
├─ VM1 IP: 192.168.1.100 (PRIVATE - not routable on internet)
└─ VM2 IP: 192.168.1.101 (PRIVATE - not routable on internet)

Your Router sees:
├─ Local devices: 192.168.1.x/24 (can see your VMs)
└─ Internet: Public IP 122.222.130.12 (what the world sees)

The Internet sees:
└─ Only your router's IP: 122.222.130.12 (cannot see your VMs directly)
```

### TP-Link Deco Router Configuration

#### Step 1: Access Router Admin Panel

```
1. Open browser: http://192.168.1.1
   (Alternative: http://192.168.0.1)

2. Login with credentials:
   Username: admin (default)
   Password: admin (default) or your custom password

3. Look for the Deco app/dashboard
```

#### Step 2: Navigate to Port Forwarding

**Path in TP-Link Deco:**

```
Settings → Advanced → NAT → Port Forwarding
OR
More Settings → Network → Port Forwarding
```

The exact path varies by firmware version. Look for "Port Forwarding" or "Virtual Server" section.

#### Step 3: Create Port Forwarding Rules

**Rule 1: HTTP Traffic**

```
┌─────────────────────────────────────────┐
│ Port Forwarding Rule #1 (HTTP)          │
├─────────────────────────────────────────┤
│ Protocol:       TCP                     │
│ External Port:  80 (start) - 80 (end)   │
│ Internal IP:    192.168.1.100           │
│ Internal Port:  80                      │
│ Enable:         ✓ (checkbox)            │
└─────────────────────────────────────────┘
```

**Rule 2: HTTPS Traffic**

```
┌─────────────────────────────────────────┐
│ Port Forwarding Rule #2 (HTTPS)         │
├─────────────────────────────────────────┤
│ Protocol:       TCP                     │
│ External Port:  443 (start) - 443 (end) │
│ Internal IP:    192.168.1.100           │
│ Internal Port:  443                     │
│ Enable:         ✓ (checkbox)            │
└─────────────────────────────────────────┘
```

**Rule 3: SSH (Optional - for remote management)**

```
┌─────────────────────────────────────────┐
│ Port Forwarding Rule #3 (SSH)           │
├─────────────────────────────────────────┤
│ Protocol:       TCP                     │
│ External Port:  2222                    │
│ Internal IP:    192.168.1.100           │
│ Internal Port:  22                      │
│ Enable:         ✓ (checkbox)            │
└─────────────────────────────────────────┘
```

#### Step 4: Verify Configuration

After creating rules, verify they're enabled and showing in the list:

```
✓ TCP 80 → 192.168.1.100:80
✓ TCP 443 → 192.168.1.100:443
✓ TCP 2222 → 192.168.1.100:22
```

### Check Your Public IP

Verify your ISP-provided public IP:

```powershell
# On Windows
(Invoke-WebRequest -Uri 'http://ifconfig.me').Content

# Output: 122.222.130.12
```

Or visit: https://whatismyipaddress.com

### Understanding Internet Access Flow

```
User on Internet
    ↓ (attempts https://122.222.130.12)
    ↓
ISP Network
    ↓
Your Router (122.222.130.12)
    ├─ Checks: "Is port 443 in my forwarding rules?"
    ├─ Yes! Rule says: 443 → 192.168.1.100:443
    ↓
Public VM (192.168.1.100:443)
    ├─ Nginx listens on port 443
    ├─ Serves React application
    ↓
Browser receives: Your React app!
```

---

## Part 6: Nginx Reverse Proxy & SSL/TLS

### Why Nginx Reverse Proxy?

Instead of exposing Node.js/React directly to the internet (which is risky), we use Nginx as a reverse proxy. This provides:

- **Security:** Nginx acts as a barrier between users and your app
- **Performance:** Built-in caching, compression, load balancing
- **SSL/TLS Management:** Centralized certificate handling
- **Professional:** Standard practice in production environments

### Installing Nginx

On Public VM:

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Nginx
sudo apt-get install nginx -y

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Setting Up React Application

**Option 1: Create React App from Scratch**

```bash
# Install Node.js first
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version

# Create React app
mkdir -p ~/myapp
cd ~/myapp
npx create-react-app .

# Build for production
npm run build

# Output: Compiled successfully!
# Creates optimized build in 'build' folder
```

**Option 2: Copy Existing React Project**

```bash
# From your Windows machine, copy your existing project
# (Using SCP or Git)

# Example with SCP:
scp -r "C:\path\to\myapp" ubuntu@192.168.1.100:~/myapp
```

### Getting SSL Certificate

**Option A: Let's Encrypt (FREE - RECOMMENDED)**

If you have a domain name (e.g., from DuckDNS):

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone \
    -d myreactapp.duckdns.org \
    -d www.myreactapp.duckdns.org

# Follow prompts:
# Email: your-email@example.com
# Agree to ToS: Y

# Certificate saved at:
# /etc/letsencrypt/live/myreactapp.duckdns.org/fullchain.pem
# /etc/letsencrypt/live/myreactapp.duckdns.org/privkey.pem
```

**Option B: Self-Signed Certificate (for IP-only access)**

```bash
# Create self-signed certificate valid for 1 year
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt

# When prompted, enter your details:
Country: PK (or your country)
State: Your State
City: Your City
Organization: My Company
Common Name: 122.222.130.12 (your public IP)
```

### Configuring Nginx

**Step 1: Backup original configuration**

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
```

**Step 2: Edit Nginx configuration**

```bash
sudo nano /etc/nginx/sites-available/default
```

**Step 3: Replace with complete configuration**

Delete everything and paste:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    return 301 https://$host$request_uri;
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    # Change to your domain or IP
    server_name 122.222.130.12 myreactapp.duckdns.org www.myreactapp.duckdns.org;
    
    # ========== SSL CERTIFICATES ==========
    # Choose ONE based on your setup:
    
    # Option 1: Self-signed certificate
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    # Option 2: Let's Encrypt certificate (uncomment if using)
    # ssl_certificate /etc/letsencrypt/live/myreactapp.duckdns.org/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/myreactapp.duckdns.org/privkey.pem;
    
    # ========== SSL SECURITY SETTINGS ==========
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # ========== SECURITY HEADERS ==========
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # ========== COMPRESSION ==========
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    # ========== REACT BUILD SERVING ==========
    root /home/ubuntu/myapp/build;
    index index.html;
    
    # ========== STATIC FILES CACHING ==========
    location ~* ^.+\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # ========== API PROXY (if you have backend) ==========
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # ========== REACT ROUTING ==========
    # All requests go to index.html for client-side routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # ========== DENY SENSITIVE FILES ==========
    location ~ /\. {
        deny all;
    }
}
```

### Nginx Validation and Restart

**Test configuration syntax:**

```bash
# Check for syntax errors
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Reload Nginx:**

```bash
# Reload without stopping service
sudo systemctl reload nginx

# Verify it's running
sudo systemctl status nginx

# Check listening ports
sudo netstat -tlnp | grep nginx

# Should show:
# tcp  0  0 0.0.0.0:80   0.0.0.0:*  LISTEN
# tcp  0  0 0.0.0.0:443  0.0.0.0:*  LISTEN
```

---

## Part 7: Dynamic DNS Setup

### Why Dynamic DNS?

Your ISP-assigned public IP (122.222.130.12) might change when your router restarts. A Dynamic DNS service keeps your domain pointing to your current IP automatically.

### DuckDNS Setup

**Step 1: Create DuckDNS Account**

```
1. Visit: https://www.duckdns.org
2. Sign up with email
3. Create subdomain: "myreactapp"
4. You get: myreactapp.duckdns.org
5. Save your token (looks like: abcd1234-efgh5678-ijkl9012)
```

**Step 2: Create Update Script**

On Public VM:

```bash
mkdir -p ~/scripts
nano ~/scripts/update-duckdns.sh
```

```bash
#!/bin/bash
# Update DuckDNS with current public IP

DOMAIN="myreactapp"
TOKEN="your-token-here"  # Get from duckdns.org

# Get current public IP
PUBLIC_IP=$(curl -s http://ifconfig.me)

# Update DuckDNS
curl "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${PUBLIC_IP}"

# Log the update
echo "[$(date)] DuckDNS updated: IP = $PUBLIC_IP" >> /var/log/duckdns.log
```

Make executable:

```bash
chmod +x ~/scripts/update-duckdns.sh

# Test it
~/scripts/update-duckdns.sh
```

**Step 3: Schedule with Cron**

```bash
# Edit crontab
crontab -e

# Add this line (runs every 5 minutes):
*/5 * * * * /home/ubuntu/scripts/update-duckdns.sh
```

**Step 4: Verify DNS Resolution**

```bash
# Check that DNS resolves to your IP
nslookup myreactapp.duckdns.org

# Should return your public IP: 122.222.130.12
```

---

## Testing & Verification

### Test 1: Local Network Access

From your Windows machine on the same network:

```powershell
# Test HTTP (should redirect to HTTPS)
curl -I http://192.168.1.100

# Test HTTPS
curl -k https://192.168.1.100

# Or open browser:
https://192.168.1.100
```

### Test 2: Port Forwarding Verification

From Windows, test if router is forwarding traffic:

```powershell
# Test port 80 (HTTP)
Test-NetConnection -ComputerName 122.222.130.12 -Port 80 -InformationLevel Detailed

# Test port 443 (HTTPS)
Test-NetConnection -ComputerName 122.222.130.12 -Port 443 -InformationLevel Detailed

# Expected output:
# TcpTestSucceeded : True
```

### Test 3: Internet Access (Most Important!)

**From a different network** (mobile hotspot, public WiFi, friend's network):

```
1. Using browser:
   https://122.222.130.12
   OR
   https://myreactapp.duckdns.org

2. Should see: Your React application loading!
```

### Test 4: Online Port Check Tools

```
1. Visit: https://www.canyouseeme.org
2. Enter your public IP: 122.222.130.12
3. Enter port: 80 or 443
4. Should say: "Success: I can see your service on port X"
```

### Test 5: Check Nginx Logs

Monitor real-time access:

```bash
# On Public VM, watch access logs
tail -f /var/log/nginx/access.log

# In another terminal, access your site from internet
# Logs should update showing the requests

# Example:
# 122.222.x.x - - [18/May/2024 10:30:45] "GET / HTTP/1.1" 200 5234
```

### Test 6: Database Connectivity

Verify React app can connect to PostgreSQL:

```bash
# On Public VM, test connection through tunnel
psql -h localhost -U react_app -d react_db -c "SELECT 1"

# If output shows '1', connection works!
```

### Complete Verification Script

```bash
#!/bin/bash
# verification.sh - Save on Public VM

echo "=== SYSTEM VERIFICATION ==="

echo "1. Nginx Status:"
sudo systemctl status nginx --no-pager | grep "Active"

echo "2. Firewall Status:"
sudo ufw status | grep -E "Status|80|443"

echo "3. Listening Ports:"
sudo netstat -tlnp | grep -E ":(80|443|5432)" | awk '{print $4, $7}'

echo "4. React Build:"
ls -la /home/ubuntu/myapp/build/index.html 2>/dev/null && echo "✓ Found" || echo "✗ Missing"

echo "5. SSL Certificate:"
sudo openssl x509 -in /etc/ssl/certs/nginx-selfsigned.crt -noout -dates 2>/dev/null | grep notAfter

echo "6. DNS Resolution:"
nslookup myreactapp.duckdns.org 2>/dev/null | grep "Address" | tail -1

echo "7. External Connectivity:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://122.222.130.12

echo "=== VERIFICATION COMPLETE ==="
```

---

## Security Best Practices

### 1. SSH Key Management

```bash
# Set correct permissions (CRITICAL!)
chmod 700 ~/.ssh           # Directory: only owner can read/write/execute
chmod 600 ~/.ssh/id_rsa    # Private key: only owner can read/write
chmod 644 ~/.ssh/id_rsa.pub # Public key: world-readable

# Disable password-based SSH
sudo nano /etc/ssh/sshd_config

# Find and change:
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart ssh
```

### 2. Regular Updates

```bash
# Keep system updated
sudo apt-get update
sudo apt-get upgrade -y

# Keep PostgreSQL updated
sudo apt-get install postgresql-upgrade-devel

# Keep Node.js and npm updated
sudo npm install -g npm@latest
sudo npm install -g n
sudo n latest
```

### 3. Install Fail2Ban (Prevent Brute Force)

```bash
# Install
sudo apt-get install fail2ban -y

# Create config
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[recidive]
enabled = true
filter = recidive
action = iptables-multiport[name=recidive, port="http,https,ssh"]
logpath = /var/log/fail2ban.log
bantime = 604800
findtime = 86400
maxretry = 5
```

Start Fail2Ban:

```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 4. Firewall Security Checklist

```
✓ Input chain defaults to DROP
✓ Only necessary ports open
✓ Private VM only accessible from Public VM
✓ Output rules restrict dangerous destinations
✓ Rate limiting on public ports
✓ SSH port uses key-based auth only
✓ Regular firewall rule audits
```

### 5. PostgreSQL Security

```bash
# Change default password
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'StrongPassword123!';
\q

# Restrict PostgreSQL access
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ensure only Public VM can connect:
host    all             all             192.168.1.100/32        md5
```

### 6. Nginx Security Headers

All already included in the Nginx config, but verify:

```bash
# Check headers are being sent
curl -I https://myreactapp.duckdns.org | grep -i "strict\|content-type\|x-"

# Should see:
# strict-transport-security
# x-content-type-options
# x-frame-options
```

### 7. SSL Certificate Auto-Renewal

If using Let's Encrypt:

```bash
# Test renewal
sudo certbot renew --dry-run

# Create systemd timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify
sudo systemctl status certbot.timer
```

### 8. Backup Strategy

```bash
# Backup React app
sudo tar -czf ~/react-app-backup-$(date +%Y%m%d).tar.gz \
    /home/ubuntu/myapp/

# Backup PostgreSQL database
sudo -u postgres pg_dump -Fc react_db > \
    ~/react-db-backup-$(date +%Y%m%d).dump

# Store backups securely
```

---

## Troubleshooting Guide

### Problem 1: Can't Access from Internet

**Symptoms:** `https://122.222.130.12` shows connection timeout

**Solutions:**

1. Check port forwarding is enabled:

```bash
# On Windows, verify rule exists
# Log into router: http://192.168.1.1
# Go to Port Forwarding section
# Verify rules for ports 80, 443 are listed and enabled
```

2. Verify Nginx is running:

```bash
sudo systemctl status nginx
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

3. Check firewall isn't blocking:

```bash
sudo ufw status
sudo iptables -L INPUT -n | grep 80
sudo iptables -L INPUT -n | grep 443
```

4. Test from local network first:

```bash
# Should work on same network
curl https://192.168.1.100 -k
```

### Problem 2: HTTPS Certificate Error

**Symptoms:** Browser shows "Your connection is not private" or certificate error

**For self-signed certificates:**

```
This is EXPECTED and normal
- Click "Advanced"
- Click "Proceed" or "Accept Risk"
- You'll see your app

To fix permanently:
- Use domain + Let's Encrypt (free)
```

**For Let's Encrypt:**

```bash
# Check certificate validity
sudo openssl x509 -in /etc/letsencrypt/live/myreactapp.duckdns.org/cert.pem -noout -text

# Renew manually if needed
sudo certbot renew --force-renewal
```

### Problem 3: 502 Bad Gateway Error

**Symptoms:** `502 Bad Gateway` when accessing site

**Solutions:**

1. Check React build exists:

```bash
ls -la /home/ubuntu/myapp/build/

# Should contain: index.html, static/, favicon.ico, etc.
```

2. Rebuild if necessary:

```bash
cd ~/myapp
npm run build

# Check output
ls -la build/
```

3. Check Nginx configuration:

```bash
sudo nginx -t

# If error, show details:
sudo nginx -t -c /etc/nginx/nginx.conf
```

4. Check error logs:

```bash
tail -f /var/log/nginx/error.log

# While accessing your site from browser
# Look for specific errors
```

### Problem 4: Public IP Changed by ISP

**Symptoms:** DuckDNS not updating, site unreachable

**Solution:**

```bash
# Manually check current public IP
curl http://ifconfig.me

# Manually update DuckDNS
curl "https://www.duckdns.org/update?domains=myreactapp&token=YOUR_TOKEN&ip=NEW_IP"

# Verify DNS updated
nslookup myreactapp.duckdns.org

# Should return new IP
```

### Problem 5: Slow Performance

**Symptoms:** Site loads very slowly

**Solutions:**

1. Check system resources:

```bash
# Check CPU and memory
top

# Check disk space
df -h
```

2. Check network:

```bash
# Monitor network traffic
nethogs

# Check bandwidth usage
iftop
```

3. Enable Nginx caching:

```bash
# Already in our config, verify:
grep "gzip on" /etc/nginx/sites-available/default
grep "Cache-Control" /etc/nginx/sites-available/default
```

4. Optimize React build:

```bash
# Analyze bundle size
npm install -g cra-bundle-analyzer

# Create production build with analysis
npm run build -- --stats
```

### Problem 6: Database Connection Fails

**Symptoms:** React app can't connect to PostgreSQL

**Solutions:**

1. Check SSH tunnel is active:

```bash
netstat -tln | grep 5432

# Should show: 127.0.0.1:5432 LISTEN
```

2. Restart tunnel if needed:

```bash
# Kill existing tunnel
pkill -f "ssh.*5432"

# Recreate tunnel
ssh -i ~/.ssh/react_to_postgres \
    -L 5432:192.168.1.101:5432 \
    postgres@192.168.1.101 \
    -N -f
```

3. Test PostgreSQL connectivity:

```bash
psql -h localhost -U react_app -d react_db -c "SELECT 1"

# Should return: 1
```

4. Check PostgreSQL is listening:

```bash
# On Private VM
netstat -tlnp | grep 5432

# Should show listening on 192.168.1.101:5432
```

### Problem 7: SSH Connection Issues

**Symptoms:** `ssh: connect to host ... port 22: Connection refused`

**Solutions:**

1. Verify SSH service is running:

```bash
sudo systemctl status ssh
sudo systemctl restart ssh
```

2. Check SSH key permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/react_to_postgres
chmod 600 ~/.ssh/authorized_keys
```

3. Test with verbose output:

```bash
ssh -vvv -i ~/.ssh/react_to_postgres postgres@192.168.1.101

# Look for specific error messages
```

4. Check firewall allows SSH:

```bash
sudo ufw status | grep 22
sudo iptables -L INPUT -n | grep 22
```

---

## Complete Quick Reference Guide

### URLs for Accessing Your App

| Access Method | URL | Network | HTTPS | Persistence |
|--------------|-----|---------|-------|-------------|
| Local network | http://192.168.1.100 | Same WiFi | NO | Always works |
| Local network | https://192.168.1.100 | Same WiFi | Self-signed | Always works |
| Internet (Direct IP) | https://122.222.130.12 | Any | Self-signed | Breaks if IP changes |
| Internet (Domain) | https://myreactapp.duckdns.org | Any | Let's Encrypt | Permanent |
| Via Windows SSH | http://localhost:3000 | Windows only | NO | SSH tunnel needed |

### Command Checklist

**Verify everything is working:**

```bash
# 1. Check services
sudo systemctl status nginx
sudo systemctl status postgresql  # On Private VM
sudo systemctl status ssh

# 2. Check ports
sudo netstat -tlnp | grep -E ":(22|80|443|5432)"

# 3. Check firewall
sudo ufw status
sudo iptables -L -n | head -20

# 4. Test local access
curl http://192.168.1.100
curl -k https://192.168.1.100

# 5. Test database
psql -h localhost -U react_app -d react_db -c "SELECT 1"

# 6. Test internet access (from different network)
curl https://myreactapp.duckdns.org
```

### Restart Sequence (if something breaks)

```bash
# 1. Restart Private VM first (database)
sudo systemctl restart postgresql

# 2. Restart SSH tunnel
pkill -f "ssh.*5432"
ssh -i ~/.ssh/react_to_postgres \
    -L 5432:192.168.1.101:5432 \
    postgres@192.168.1.101 \
    -N -f

# 3. Restart Nginx
sudo systemctl restart nginx

# 4. Verify everything
sudo systemctl status nginx
netstat -tln | grep 5432
```

---

## Conclusion

You now have a complete, production-ready setup for hosting a React application with PostgreSQL backend on local VMs, accessible from the internet.

### What You've Accomplished

✓ **Set up two isolated VMs** with proper networking
✓ **Configured firewalls** with iptables and Firewalld
✓ **Established secure SSH tunneling** between VMs
✓ **Created a private PostgreSQL database** accessible only from the public VM
✓ **Configured port forwarding** on your TP-Link Deco router
✓ **Set up Nginx reverse proxy** with HTTPS
✓ **Implemented automatic SSL certificates** with Let's Encrypt
✓ **Created dynamic DNS** for permanent internet access
✓ **Hardened security** throughout the entire stack

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│ Internet Users                                              │
│ Access: https://myreactapp.duckdns.org                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ TP-Link Deco Router (122.222.130.12)                       │
│ Port Forwarding: 80/443 → 192.168.1.100:80/443            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Public VM (192.168.1.100)                                  │
│ ├─ Nginx Reverse Proxy (Port 80, 443)                     │
│ ├─ SSL/TLS Certificates (HTTPS)                           │
│ ├─ React Application Build                                │
│ └─ SSH Tunnel to Private VM (Port 5432)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Private VM (192.168.1.101)                                 │
│ ├─ PostgreSQL Database (Port 5432)                        │
│ └─ Firewall (Only accessible from Public VM)              │
└─────────────────────────────────────────────────────────────┘
```

### Next Steps

1. **Monitor your application:**
   - Set up log rotation
   - Configure monitoring alerts
   - Regular backups

2. **Scale for production:**
   - Consider cloud deployment (AWS, DigitalOcean)
   - Use managed databases (AWS RDS, Supabase)
   - Implement CDN (Cloudflare)

3. **Enhance security:**
   - Regular security audits
   - Keep systems updated
   - Monitor access logs
   - Implement Web Application Firewall (WAF)

4. **Optimize performance:**
   - Enable caching
   - Use gzip compression (already enabled)
   - Optimize React build
   - Consider load balancing

### Useful Resources

- **TP-Link Deco Documentation:** https://www.tp-link.com/us/home-networking/
- **Let's Encrypt:** https://letsencrypt.org/
- **DuckDNS:** https://www.duckdns.org/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Ubuntu Security:** https://ubuntu.com/security

### Final Thoughts

This setup provides a solid foundation for understanding modern web infrastructure, from local development to internet-facing production. The security practices you've implemented here are industry-standard and will serve you well as you grow your application.

Remember:
- **Security over convenience** - Always choose the more secure option
- **Documentation is your friend** - Keep detailed notes of your configuration
- **Regular backups** - You'll thank yourself when disaster strikes
- **Stay updated** - Keep all software and certificates current

Happy deploying! 🚀

---

**Have questions?** Check the troubleshooting section or revisit the relevant section of this guide.

**Want to add more?** Consider adding authentication, monitoring, or load balancing as your application grows.
