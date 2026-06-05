#!/bin/bash
# reset-ha-cluster.sh
# Run this on EACH node to reset or completely remove the HA cluster.
#
# Usage:
#   sudo ./reset-ha-cluster.sh              # Full reset (wipe data, keep packages)
#   sudo ./reset-ha-cluster.sh --light      # Keep etcd, reset only patroni/postgres
#   sudo ./reset-ha-cluster.sh --purge      # Completely remove everything + packages
#   sudo ./reset-ha-cluster.sh --purge-all  # Remove everything including PostgreSQL
#
# ┌───────────────┬──────────────────────────────────────────────────────┐
# │ Command       │ What it does                                         │
# ├───────────────┼──────────────────────────────────────────────────────┤
# │ (no flag)     │ Wipe data, reset configs, keep packages installed    │
# │ --light       │ Same but keep ETCD running                           │
# │ --purge       │ apt purge haproxy, etcd, patroni + delete all folders│
# │ --purge-all   │ Same + also purge PostgreSQL 18 entirely             │
# └───────────────┴──────────────────────────────────────────────────────┘
#
# WARNING: This destroys ALL data! Use with care.

set -e

MODE="${1:-full}"

echo "=== Unmasking and stopping services ==="
sudo systemctl unmask patroni patroni-cluster-b haproxy 2>/dev/null || true
sudo systemctl stop patroni patroni-cluster-b haproxy 2>/dev/null || true
sudo systemctl disable patroni patroni-cluster-b 2>/dev/null || true

if [ "$MODE" = "--purge" ] || [ "$MODE" = "--purge-all" ]; then
  echo "=== Purging packages ==="
  sudo apt purge -y haproxy etcd patroni python3-pip 2>/dev/null || true
  sudo pip3 uninstall -y patroni[etcd3] psycopg2-binary 2>/dev/null || true

  echo "=== Removing all config and data directories ==="
  sudo rm -rf /etc/patroni /etc/haproxy /var/lib/etcd /etc/default/etcd
  sudo rm -rf /data /var/lib/postgresql /var/log/postgresql /var/log/patroni

  echo "=== Removing systemd and init.d artifacts ==="
  sudo rm -f /etc/systemd/system/etcd.service /etc/systemd/system/etcd.service.d
  sudo rm -f /etc/systemd/system/patroni.service /etc/systemd/system/patroni-cluster-b.service
  sudo rm -f /etc/init.d/etcd

  echo "=== Removing patroni user ==="
  sudo userdel -r patroni 2>/dev/null || true

  echo "=== Removing pip-installed binaries ==="
  sudo rm -f /usr/local/bin/patroni

  if [ "$MODE" = "--purge-all" ]; then
    echo "=== Purging PostgreSQL ==="
    sudo apt purge -y postgresql-18 postgresql-client-18 postgresql-common 2>/dev/null || true
    sudo rm -rf /usr/lib/postgresql /etc/postgresql
  fi

  sudo apt autoremove -y
  sudo apt autoclean

  echo ""
  echo "=== Purge complete ==="
  echo "All packages and data removed. VM is clean like a fresh install."
  exit 0
fi

LIGHT=false
if [ "$MODE" = "--light" ]; then
  LIGHT=true
fi

echo "=== Removing Patroni and HAProxy artifacts ==="
sudo rm -rf /etc/patroni/*.yml
sudo rm -f /etc/systemd/system/patroni*.service
sudo rm -f /etc/haproxy/haproxy.cfg.bak 2>/dev/null || true

echo "=== Wiping data directories ==="
sudo rm -rf /data/patroni
sudo rm -rf /data/pg

if [ "$LIGHT" = false ]; then
  echo "=== Stopping ETCD ==="
  sudo systemctl unmask etcd 2>/dev/null || true
  sudo systemctl stop etcd 2>/dev/null || true
  echo "=== Wiping ETCD data ==="
  sudo rm -rf /var/lib/etcd/*
  echo "=== Restarting ETCD ==="
  sudo systemctl start etcd
  sudo systemctl enable etcd 2>/dev/null || true
  sleep 2
  etcdctl endpoint health --cluster -w table 2>/dev/null || echo "  ETCD started (ignore member errors until all nodes are up)"
fi

echo "=== Resetting PostgreSQL default cluster ==="
sudo pg_dropcluster 18 main --stop 2>/dev/null || true
sudo pg_createcluster 18 main --start 2>/dev/null || true

if [ "$LIGHT" = true ]; then
  echo ""
  echo "=== Light reset complete ==="
  echo "ETCD is still running. Follow the article from Part 2 onward."
  echo "Create /etc/patroni/patroni.yml and the service file, then start patroni."
else
  echo ""
  echo "=== Full reset complete ==="
  echo "VMs are now fresh. Run 'etcdctl endpoint health --cluster -w table'"
  echo "on each node to confirm ETCD cluster (needs all 3 nodes up)."
  echo "Then follow the article from Part 1 (ETCD) or Part 2 (PostgreSQL)."
fi
