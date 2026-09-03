# Linux Namespaces — Hands-On Tutorial (All 8 Types)

A practical, copy-paste lab to learn every Linux namespace type from zero to a working
mini-container. Run the commands in order on any Linux machine with `root`/`sudo`
access (physical, VM, or cloud). Kernel 4.6+ for cgroup ns, 5.6+ for time ns.

> Companion to the blog post: **Linux Namespaces: The Complete A–Z Guide (All 8 Types)**

---

## Prerequisites

- A Linux machine with sudo/root
- `util-linux` (provides `unshare`, `nsenter`), `iproute2` (`ip`, `lsns`)
- No Docker needed — we work with raw namespaces

Verify tools:

```bash
which unshare nsenter lsns ip
uname -r   # 5.6+ to try the time namespace
```

---

## 0. Observe What You Already Have

```bash
# Every process exposes its namespaces as symlinks
ls -l /proc/$$/ns/

# 8 types = 10 symlinks (pid/time also have _for_children variants)
sudo lsns
```

**The inode rule:** two processes share a namespace type iff `readlink` on the matching
`/proc/PID/ns/*` file returns the same inode. Run a second shell and compare.

---

## Lab 1 — UTS: Private Hostname

```bash
sudo unshare --uts /bin/bash
hostname                     # shows the host's name
hostname container-01        # change it inside only
readlink /proc/self/ns/uts   # different inode than the host
exit
```

In another terminal confirm the host hostname is unchanged. That's UTS isolation.

---

## Lab 2 — IPC: Private Queues

```bash
# Host side
ipcmk -Q 1234 && ipcs -q

# Inside a new IPC namespace the host queue is invisible
sudo unshare --ipc /bin/bash
ipcs -q                      # empty
ipcmk -Q 1234                # same key, no conflict
exit
```

---

## Lab 3 — Mount: Private Filesystem Views

```bash
sudo unshare --mount /bin/bash
mountpoint /tmp              # was a real mount on most systems
umount /tmp 2>/dev/null      # only affects this namespace
mount -t tmpfs tmpfs /mnt    # private mount
exit
```

Host is unaffected. Add `--mount-proc` to also get a fresh `/proc` (see next lab).

---

## Lab 4 — PID: Your Own PID 1

```bash
sudo unshare --pid --fork --mount-proc /bin/bash
echo $$                      # prints 1 — you are init in here!
ps aux                       # only this namespace's processes
sleep 300 &
ps aux | grep sleep          # PID 3 in here...
exit
# ...on the host it is still running with a large host PID
ps aux | grep 'sleep 300'
```

Rule: `CLONE_NEWPID` only affects children, so `--fork` is mandatory.

---

## Lab 5 — Network: Private Stack

```bash
sudo ip netns add red
sudo ip netns add blue
sudo ip netns exec red ip addr show    # only lo, DOWN
sudo ip netns exec red ip link set lo up
sudo ip netns exec red ip addr show eth0   # Device "eth0" does not exist
sudo ip netns delete red
sudo ip netns delete blue
```

For the full veth/bridge/NAT lab, see `namespace-tutorial.md` in this folder.

---

## Lab 6 — User: Root Without Privilege

```bash
# As a NON-root user:
unshare --user --map-root-user /bin/bash
id                          # uid=0(root) — inside only
capsh --print | grep Current   # full caps in this namespace
cat /proc/self/uid_map      # 0 -> <your host uid>, 1 entry
exit
```

On the host you are still your normal uid. This is rootless-container magic.

---

## Lab 7 — cgroup: Virtualized /proc Path

```bash
cat /proc/self/cgroup       # host: long path under /user.slice/...
sudo unshare --cgroup /bin/bash
cat /proc/self/cgroup       # now just: 0::/
exit
```

Kernel 4.6+. Docker uses this (`--cgroupns=private`) so containers see a clean root.

---

## Lab 8 — Time: Private Monotonic Clocks (kernel 5.6+)

```bash
sudo unshare --time --fork /bin/bash
readlink /proc/self/ns/time     # new inode
cat /proc/self/timens_offsets   # monotonic + boottime offsets
exit
```

Offsets are 0 by default; a privileged process may write offsets once per namespace
via `/proc/PID/timens_offsets`. `CLOCK_REALTIME` (wall clock) is never affected.

---

## Grand Lab — Build a Mini-Container by Hand

```bash
# 1. Tiny rootfs (Ubuntu/Debian)
sudo apt-get install -y debootstrap
sudo debootstrap --variant=minbase jammy /var/lib/miniroot

# 2. Launch with fresh mount+UTS+IPC+PID namespaces and a private /proc
sudo unshare --mount --uts --ipc --pid --fork --mount-proc \
    chroot /var/lib/miniroot /bin/bash

echo I am PID $$            # PID 1 inside
ps aux                      # only our processes
hostname mini-container     # host's hostname untouched
exit

# 3. Cleanup
sudo rm -rf /var/lib/miniroot
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Observe own namespaces | `ls -l /proc/$$/ns/` |
| List all namespaces | `sudo lsns` (add `-t net` per type) |
| New UTS namespace | `sudo unshare --uts bash` |
| New IPC namespace | `sudo unshare --ipc bash` |
| New mount namespace | `sudo unshare --mount bash` |
| New PID ns + fresh /proc | `sudo unshare --pid --fork --mount-proc bash` |
| New user ns as root | `unshare --user --map-root-user bash` |
| New cgroup ns | `sudo unshare --cgroup bash` |
| New time ns | `sudo unshare --time --fork bash` |
| New named netns | `sudo ip netns add <name>` |
| Run cmd in netns | `sudo ip netns exec <name> <cmd>` |
| Join a running process | `sudo nsenter -t <HOSTPID> -a bash` |
| Compare two processes | `readlink /proc/A/ns/pid; readlink /proc/B/ns/pid` |
| Persist a namespace | `sudo mount --bind /proc/PID/ns/xxx /run/ns-name` |

---

## Troubleshooting Checklist

1. `unshare: Operation not permitted` → need `sudo`, or distro disabled unprivileged
   user namespaces (`kernel.unprivileged_userns_clone` / AppArmor restriction).
2. `ps` shows the whole host inside a PID ns → `/proc` was not remounted; use
   `--mount-proc` or `mount -t proc proc /proc` after entering.
3. `hostname: Operation not permitted` → need CAP_SYS_ADMIN in the owning user
   namespace; run `sudo unshare --uts bash` or add `--user --map-root-user`.
4. `nsenter` fails → target process died; keep it alive (`sleep 9999`).
5. Same inode but expected isolation → compare the same type; check
   `pid_for_children` vs `pid`, and verify no `host` sharing flags (`--net=host`, etc.).
