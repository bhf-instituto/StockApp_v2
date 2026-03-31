import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const branchName = "gh-pages";
const sourceBranch = "main";
const worktreeDir = ".gh-pages-worktree";
const deployGitignore = ["node_modules/", ".env", ".vite/", "dist/"].join("\n") + "\n";

function runGit(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function runGitIn(directory, args, options = {}) {
  return execFileSync("git", args, {
    cwd: directory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const currentBranch = runGit(["branch", "--show-current"]).trim();
const distDir = join(repoRoot, "dist");
const tempWorktreeDir = join(repoRoot, worktreeDir);
const sourceSha = runGit(["rev-parse", "--short", "HEAD"]).trim();

function branchExists(name) {
  try {
    runGit(["show-ref", "--verify", "--quiet", `refs/heads/${name}`], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function removeWorktreeDirectory() {
  try {
    runGit(["worktree", "remove", tempWorktreeDir, "--force"], { stdio: "ignore" });
  } catch {
    // Ignore cleanup failures and fall back to fs removal.
  }

  if (existsSync(tempWorktreeDir)) {
    rmSync(tempWorktreeDir, { recursive: true, force: true });
  }
}

function emptyDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") {
      continue;
    }

    rmSync(join(directory, entry.name), { recursive: true, force: true });
  }
}

function copyDirectoryContents(sourceDir, destinationDir) {
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = join(sourceDir, entry.name);
    const destinationPath = join(destinationDir, entry.name);

    cpSync(sourcePath, destinationPath, { recursive: entry.isDirectory() });
  }
}

if (currentBranch !== sourceBranch) {
  console.error(`Este comando debe ejecutarse desde la rama '${sourceBranch}'.`);
  process.exit(1);
}

if (!existsSync(distDir)) {
  console.error("No se encontro la carpeta dist. La build de Vite no se genero correctamente.");
  process.exit(1);
}

removeWorktreeDirectory();

try {
  if (branchExists(branchName)) {
    runGit(["worktree", "add", "--force", tempWorktreeDir, branchName]);
  } else {
    runGit(["worktree", "add", "--detach", tempWorktreeDir, "HEAD"]);
    runGitIn(tempWorktreeDir, ["checkout", "--orphan", branchName]);
  }

  emptyDirectory(tempWorktreeDir);
  copyDirectoryContents(distDir, tempWorktreeDir);

  writeFileSync(join(tempWorktreeDir, ".nojekyll"), "");
  writeFileSync(join(tempWorktreeDir, ".gitignore"), deployGitignore);

  runGitIn(tempWorktreeDir, ["add", "-A"]);

  const pendingChanges = runGitIn(tempWorktreeDir, ["status", "--short"]).trim();

  if (!pendingChanges) {
    console.log(`La rama '${branchName}' ya estaba sincronizada con la build actual.`);
    process.exit(0);
  }

  runGitIn(tempWorktreeDir, [
    "commit",
    "-m",
    `Deploy build from ${sourceBranch} (${sourceSha})`,
  ]);

  console.log(`La rama '${branchName}' quedo actualizada con la build de ${sourceBranch}.`);
} finally {
  removeWorktreeDirectory();
}
