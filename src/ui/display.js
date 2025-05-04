import ora from "ora";
import { doDelete } from "../config/cli.js";
import chalk from "chalk";

/**
 * Affiche le résumé des opérations
 * @param {Object} stats - Statistiques des opérations
 */
export function displaySummary(stats) {
  const simulatedCount = stats.simulated ?? 0;

  const lines = [
    chalk.bold.blue(`     Summary   `),

    `     • Total found   : ${chalk.bold(stats.found)}`,
    `     • Deleted       : ${chalk.bold.green(stats.deleted)}`,
    `     • Failed        : ${chalk.bold.red(stats.failed)}`,
    `     • Simulated     : ${chalk.bold.cyan(simulatedCount)}`,
  ];

  const summary = lines.join("\n");

  const spinner = ora().start();
  spinner.stopAndPersist({
    symbol: "",
    prefixText: "",
    text: summary,
  });
}

export function displayCurrentMode() {
  console.log(
    doDelete
      ? "⚡ Running in DELETE mode – this will permanently delete your images."
      : "🦜 Running in DRY-RUN mode – no deletions will occur."
  );
}
