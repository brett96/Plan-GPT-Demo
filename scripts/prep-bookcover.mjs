/**
 * One-time / maintenance: splits BookCover_RetentionGPT_v7.html into
 * public/css/bookcover.css + public/bookcover.html for static hosting.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "BookCover_RetentionGPT_v7.html");
const outHtml = path.join(root, "public", "bookcover.html");
const outCss = path.join(root, "public", "css", "bookcover.css");

const raw = fs.readFileSync(srcPath, "utf8");
const m = raw.match(/<style>([\s\S]*?)<\/style>/);
if (!m) throw new Error("No <style> block found in BookCover source");

fs.mkdirSync(path.dirname(outCss), { recursive: true });
fs.writeFileSync(outCss, m[1].trim() + "\n", "utf8");

let html = raw
  .replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="/css/bookcover.css" />')
  .replace(/href="interest-form\.html"/g, 'href="/interest.html"')
  .replace(/href="\/cdn-cgi\/l\/email-protection#[^"]*"/g, 'href="/interest.html"')
  .replace(/href="\/cdn-cgi\/l\/email-protection[^"]*"/g, 'href="/interest.html"');

// Drop invalid markup after closing </html>
const end = html.indexOf("</html>");
if (end !== -1) {
  html = html.slice(0, end + "</html>".length) + "\n";
}

fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, html, "utf8");
console.log("Wrote", path.relative(root, outHtml), "and", path.relative(root, outCss));
