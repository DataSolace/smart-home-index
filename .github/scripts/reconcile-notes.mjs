#!/usr/bin/env node
/**
 * Keep a notes.md template present for every device in the Smart Home Index.
 *
 * Reads the device manifest from the index, compares it against the notes files
 * in this repo, and creates a template for any device that does not have one.
 *
 * Deliberately never deletes or edits an existing file. A device disappearing
 * from the manifest is far more likely to mean a transient API problem than a
 * genuine removal, and these files hold contributed work. Anything unexpected
 * is reported for a human to act on instead.
 *
 * Devices are matched on the id embedded in each file, not on its path. A
 * rename changes the path, which on its own is indistinguishable from "new
 * device plus orphaned file" — matching on id means a rename is reported
 * rather than silently duplicated.
 *
 * Env:
 *   MANIFEST_URL     full URL of the manifest endpoint
 *   MANIFEST_SECRET  value for the x-manifest-secret header
 *   DRY_RUN          set to "true" to report without writing
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const MANIFEST_URL = process.env.MANIFEST_URL;
const MANIFEST_SECRET = process.env.MANIFEST_SECRET;
const DRY_RUN = process.env.DRY_RUN === "true";

const ROOT = "manufacturers";
const MARKER = /<!--\s*device-id:\s*([0-9a-fA-F-]{36})\s*-->/;

/** Abort rather than act on a manifest that looks wrong. */
const MIN_DEVICES = 50;
/** A manifest this much smaller than what we already have is treated as suspect. */
const SHRINK_RATIO = 0.8;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

/** Device names must be usable as paths; keep this in step with the seeding. */
const safe = (value) =>
  String(value).replace(/[/\\]/g, "-").replace(/\s+/g, " ").trim();

const template = (name, id) => `# ${name}

<!-- device-id: ${id} -->

<!--
Thanks for contributing! Replace the prompts below with what you know.
Everything here is optional - partial notes are far more useful than none.
Formatting and credit guidance: CONTRIBUTING.md in the repo root.
-->

## Local Control

<!-- Protocols available (MQTT, REST/HTTP, Zigbee, Matter...), ports, any network requirements -->

## Setup

<!-- Pairing or flashing steps, firmware versions you have tested, anything that caught you out -->

## Home Assistant

<!-- Working configuration, HACS integrations, entity quirks -->

## Known Issues and Tips

<!-- Bugs, workarounds, links to upstream issues -->

<!-- Sign off however you would like to be credited, for example:
[your-name](https://github.com/your-name) -->
`;

async function findNotesFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await findNotesFiles(full)));
    else if (entry.name === "notes.md") found.push(full);
  }
  return found;
}

async function fetchManifest() {
  if (!MANIFEST_URL) fail("MANIFEST_URL is not set");
  if (!MANIFEST_SECRET) fail("MANIFEST_SECRET is not set");

  let response;
  try {
    response = await fetch(MANIFEST_URL, {
      headers: { "x-manifest-secret": MANIFEST_SECRET },
    });
  } catch (error) {
    fail(`Could not reach the manifest endpoint: ${error.message}`);
  }

  if (!response.ok) {
    fail(
      `Manifest endpoint returned ${response.status}. ` +
        `503 means MANIFEST_API_SECRET is not configured on the site; ` +
        `401 means the secret here does not match.`,
    );
  }

  const payload = await response.json();
  const devices = payload?.devices;
  if (!Array.isArray(devices)) fail("Manifest response had no devices array");
  return devices;
}

async function main() {
  const devices = await fetchManifest();
  const files = await findNotesFiles(ROOT);

  // Index existing files by the device id they carry.
  const byId = new Map();
  const unmarked = [];
  for (const file of files) {
    const match = readFileSync(file, "utf8").match(MARKER);
    if (!match) unmarked.push(file);
    else byId.set(match[1].toLowerCase(), file);
  }

  // Without ids we cannot tell a rename from a new device, and would create
  // duplicates. Stop rather than guess.
  if (unmarked.length) {
    fail(
      `${unmarked.length} notes file(s) have no device-id marker, ` +
        `so devices cannot be matched reliably. First: ${unmarked[0]}`,
    );
  }

  if (devices.length < MIN_DEVICES) {
    fail(
      `Manifest returned only ${devices.length} devices, below the ${MIN_DEVICES} floor. ` +
        `Refusing to act on what looks like a truncated response.`,
    );
  }
  if (devices.length < byId.size * SHRINK_RATIO) {
    fail(
      `Manifest returned ${devices.length} devices but ${byId.size} notes files exist. ` +
        `That shrink looks wrong, so nothing has been changed.`,
    );
  }

  const created = [];
  const renamed = [];
  const blocked = [];

  for (const device of devices) {
    const id = String(device.id || "").toLowerCase();
    if (!id) continue;

    const expected = join(ROOT, safe(device.manufacturer), safe(device.name), "notes.md");
    const current = byId.get(id);

    if (current) {
      // Already covered. If it now belongs elsewhere the device was renamed:
      // report it so a human can move the file and keep its history.
      if (current !== expected) {
        renamed.push({ device: device.name, from: current, to: expected });
      }
      continue;
    }

    // No file carries this id. If something already sits at the path, leave it
    // alone rather than overwrite.
    if (existsSync(expected)) {
      blocked.push({ device: device.name, path: expected });
      continue;
    }

    if (!DRY_RUN) {
      mkdirSync(dirname(expected), { recursive: true });
      writeFileSync(expected, template(device.name, device.id));
    }
    created.push({ device: device.name, path: expected });
  }

  const lines = [
    `Devices in index: **${devices.length}**`,
    `Notes files present: **${byId.size}**`,
    "",
    `- Templates created: **${created.length}**`,
    `- Renamed devices needing a manual move: **${renamed.length}**`,
    `- Paths already occupied by an unmatched file: **${blocked.length}**`,
  ];
  if (created.length) {
    lines.push("", "### Created", ...created.map((c) => `- \`${c.path}\``));
  }
  if (renamed.length) {
    lines.push(
      "",
      "### Renamed — move these by hand to keep their history",
      ...renamed.map((r) => `- **${r.device}**\n  - from \`${r.from}\`\n  - to \`${r.to}\``),
    );
  }
  if (blocked.length) {
    lines.push(
      "",
      "### Skipped — a file already exists at the expected path",
      ...blocked.map((b) => `- **${b.device}** → \`${b.path}\``),
    );
  }

  const summary = lines.join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });
  }
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(
      process.env.GITHUB_OUTPUT,
      `created=${created.length}\nrenamed=${renamed.length}\nblocked=${blocked.length}\n`,
      { flag: "a" },
    );
  }
}

main().catch((error) => fail(error.stack || String(error)));
