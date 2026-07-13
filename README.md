<div align="center">

<img src="assets/banner.svg" alt="Fizz. Commission management for Discord." width="100%" />

<br />

**Commission management for Discord.**
Take orders, run your queue and keep every project documented, all in one place.

<br />

[![Add to Server](https://img.shields.io/badge/Add%20to%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1525731670886580365&permissions=268561424&scope=bot+applications.commands)
[![Website](https://img.shields.io/badge/fizz.gfxs0da.com-ff3b3b?style=for-the-badge&logoColor=white)](https://fizz.gfxs0da.com)

![Node.js](https://img.shields.io/badge/Node.js-22-000000?style=flat-square&logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-000000?style=flat-square&logo=discord&logoColor=5865F2)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-000000?style=flat-square&logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-000000?style=flat-square)

</div>

<br />

## What is Fizz

Fizz turns a Discord server into a commission pipeline for **artists, designers and freelancers** who take orders through Discord.

Instead of orders buried in DMs, a messy line of who is next, and project history that vanishes when a channel is deleted, Fizz keeps the whole process in order: from the moment a client opens a ticket to the moment the finished project is archived as a readable transcript.

> **No lost DMs · No messy order lists · No missing ticket history**

<br />

## Why it exists

Working with commissions on Discord usually means juggling three problems at once:

- Orders scattered across private messages
- A queue that only lives in your head
- Chat history that disappears the second a channel is closed

Fizz fixes all three. Ticket orders and DM clients share **one clear queue**, statuses move as you work, and every conversation is saved as a transcript that survives the channel being deleted.

<br />

## Core features

| | Feature | What it does |
|---|---|---|
| 🎫 | **Accept orders** | Clients open a private ticket in one click. Each order lives in its own channel, away from public chat. |
| 📊 | **Manage your workload** | Ticket orders and DM clients sit in one queue, with positions, statuses, manual entries and optional Rush Priority. |
| 🔄 | **Track project status** | Move orders from waiting, to in progress, to completed. Your workload stays clear at every stage. |
| 🗂️ | **Keep every record** | Messages, images and details are saved in readable transcripts that remain available after a ticket is closed. |

**Also included:** private notes · blacklist · add and remove users · automatic statuses · slash commands.

<br />

## From order to delivery

```
1 · Open      A client opens a private order ticket
2 · Queue     The project joins your queue automatically
3 · Priority  Optional Rush Priority can move urgent orders ahead
4 · Progress  Update status and keep private notes as you work
5 · Deliver   Final files land inside the ticket
6 · Archive   Close the ticket and the full transcript is kept
```

<br />

## Commands

| Command | Description |
|---|---|
| `/panel` | Post the order panel in a channel |
| `/queue` | View and manage your workload |
| `/add-queue` | Add an order received through DMs |
| `/status` | Update an order's status and priority |
| `/done` | Mark an order as completed |
| `/note` · `/notes` | Add and view private notes |
| `/add-user` · `/remove-user` | Manage who can see a ticket |
| `/blacklist` · `/unblacklist` | Block or unblock a user |
| `/close` | Close the ticket and save its transcript |
| `/cmds` | Show every command inside Discord |

<br />

## How it works

Fizz is a self-hosted **discord.js** bot backed by **Prisma + SQLite**. Every message in a ticket is written to the database the moment it is sent, so the transcript is never tied to the Discord channel staying alive. Attachments are re-hosted so links keep working after Discord's CDN links expire.

A companion **web dashboard** (Next.js) is in the works, giving you every ticket, transcript, queue control and stat in your browser.

```
Discord  ─┐
          ├─►  Fizz bot (discord.js)  ─►  SQLite (Prisma)  ─►  Dashboard (Next.js)
Clients  ─┘                                    │
                                               └─►  Transcripts + re-hosted images
```

<br />

## This repository

This repo hosts the **Fizz landing page**, a static site (plain HTML, CSS and JavaScript, no build step) deployed on Cloudflare Pages.

```
index.html      styles.css      assets/
js/  smooth-scroll · intro · canvas · story · app
```

Run it locally with any static server:

```bash
npx http-server -p 4173
```

<br />

## Add Fizz

<div align="center">

[![Add to Server](https://img.shields.io/badge/Add%20Fizz%20to%20your%20server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1525731670886580365&permissions=268561424&scope=bot+applications.commands)

</div>

<br />

## Links

- **Website** · [fizz.gfxs0da.com](https://fizz.gfxs0da.com)
- **Portfolio** · [gfxs0da.com](https://gfxs0da.com)
- **Discord** · [discord.gg/s0da](https://discord.gg/s0da)

<br />

<div align="center">

A project by **[@gfxs0da](https://gfxs0da.com)**

</div>
