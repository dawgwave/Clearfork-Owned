/**
 * Reads src/docs/*.md and outputs src/data/blog-bodies.ts with markdown strings
 * (headings, lists, blockquotes) for react-markdown.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const docs = path.join(root, "src", "docs");
const out = path.join(root, "src", "data", "blog-bodies.ts");

function compileProperty(raw) {
  const lines = raw.replace(/\r\n/g, "\n").trim().split("\n");
  const skip = 4; // title stack in source; body starts editor note
  const h2 = new Set([
    "How Rate Changes Work",
    "The Tiering Problem",
    "The Hidden Cost of Filing a Claim",
    "Why Tiering Should Play No Role in Claim Surcharges",
    "The Argument for Complete Transparency",
    "Conclusion",
  ]);
  return walk(lines.slice(skip), h2);
}

function compileInspection(raw) {
  const lines = raw.replace(/\r\n/g, "\n").trim().split("\n");
  const skip = 2; // title + subtitle only
  const h2 = new Set();
  return walk(lines.slice(skip), h2, (line) => {
    if (/^Part (One|Two|Three|Four|Five):/.test(line)) return `## ${line}`;
    if (/^Protecting Yourself:/.test(line)) return `## ${line}`;
    return null;
  });
}

function compileAuto(raw) {
  const lines = raw.replace(/\r\n/g, "\n").trim().split("\n");
  const skip = 4;
  const h2 = new Set([
    "The Rating Variables Most Drivers Have Never Heard Of",
    "Telematics: The Data Bargain Most Drivers Don't Fully Understand",
    "At-Fault vs. Not-At-Fault: The Surcharge Rules Drivers Misunderstand",
    "Household Rating: When Other People's Risk Becomes Your Premium",
    "The Shopping Illusion: Why Comparison Quotes Don't Tell the Full Story",
    "What Meaningful Transparency Looks Like for Auto Insurance",
    "Conclusion",
  ]);
  const h3 = new Set([
    "Credit-Based Insurance Score",
    "Occupation and Education",
    "Home Ownership Status",
    "Prior Insurance and Lapse History",
    "Vehicle Use and Annual Mileage",
    "What Is Actually Being Collected",
    "The Asymmetric Discount Structure",
    "Data Retention and Future Use",
    "What Texas Law Says",
    "The Inquiry Problem",
    "The Minor Accident Math Problem",
    "Household Composition as a Rating Variable",
    "The Named Driver Exclusion Trap",
    "The Quote Is Not the Policy",
    "The Renewal Ratchet",
    "The Line-Item Illusion: When Removing Coverage Changes More Than the Coverage",
  ]);
  return walkAuto(lines.slice(skip), h2, h3);
}

function walk(lines, h2Set, lineHook) {
  const outLines = [];
  let para = [];

  function flushPara() {
    if (!para.length) return;
    const text = para.join(" ").trim();
    para = [];
    if (!text) return;
    if (lineHook) {
      const h = lineHook(text);
      if (h) {
        outLines.push(h);
        return;
      }
    }
    if (h2Set.has(text)) {
      outLines.push(`## ${text}`);
      return;
    }
    if (/^\*[^*]+\*$/.test(text)) {
      outLines.push(`> *${text.slice(1, -1)}*`);
      return;
    }
    if (/^•\t?/.test(text)) {
      outLines.push(`- ${text.replace(/^•\t?/, "").trim()}`);
      return;
    }
    outLines.push(text);
  }

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushPara();
      continue;
    }
    if (t.startsWith("*Editor")) {
      flushPara();
      outLines.push(`> ${t.replace(/^\*\s*/, "").trim()}`);
      continue;
    }
    if (/^•\t?/.test(t)) {
      flushPara();
      outLines.push(`- ${t.replace(/^•\t?/, "").trim()}`);
      continue;
    }
    if (h2Set.has(t)) {
      flushPara();
      outLines.push(`## ${t}`);
      continue;
    }
    if (lineHook) {
      const h = lineHook(t);
      if (h) {
        flushPara();
        outLines.push(h);
        continue;
      }
    }
    if (/^\*[^*]+\*$/.test(t)) {
      flushPara();
      outLines.push(`> *${t.slice(1, -1)}*`);
      continue;
    }
    para.push(t);
  }
  flushPara();

  return stitchListBlocks(outLines);
}

function walkAuto(lines, h2Set, h3Set) {
  const outLines = [];
  let para = [];
  let inRatingSection = false;

  function flushPara() {
    if (!para.length) return;
    const text = para.join(" ").trim();
    para = [];
    if (!text) return;
    if (h2Set.has(text)) {
      inRatingSection = text === "The Rating Variables Most Drivers Have Never Heard Of";
      outLines.push(`## ${text}`);
      return;
    }
    if (inRatingSection && h3Set.has(text)) {
      outLines.push(`### ${text}`);
      return;
    }
    if (h3Set.has(text)) {
      outLines.push(`### ${text}`);
      return;
    }
    if (/^•\t?/.test(text)) {
      outLines.push(`- ${text.replace(/^•\t?/, "").trim()}`);
      return;
    }
    outLines.push(text);
  }

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushPara();
      continue;
    }
    if (/^•\t?/.test(t)) {
      flushPara();
      outLines.push(`- ${t.replace(/^•\t?/, "").trim()}`);
      continue;
    }
    if (h2Set.has(t)) {
      flushPara();
      inRatingSection = t === "The Rating Variables Most Drivers Have Never Heard Of";
      outLines.push(`## ${t}`);
      continue;
    }
    if (inRatingSection && h3Set.has(t)) {
      flushPara();
      outLines.push(`### ${t}`);
      continue;
    }
    if (!inRatingSection && h3Set.has(t)) {
      flushPara();
      outLines.push(`### ${t}`);
      continue;
    }
    para.push(t);
  }
  flushPara();

  return stitchListBlocks(outLines);
}

function stitchListBlocks(parts) {
  /** Merge consecutive `- ` lines into one list block for markdown */
  const merged = [];
  let listBuf = [];
  for (const p of parts) {
    if (p.startsWith("- ")) {
      listBuf.push(p);
      continue;
    }
    if (listBuf.length) {
      merged.push(listBuf.join("\n"));
      listBuf = [];
    }
    merged.push(p);
  }
  if (listBuf.length) merged.push(listBuf.join("\n"));
  return merged.join("\n\n");
}

const propertyMd = compileProperty(
  fs.readFileSync(path.join(docs, "insurance black box.md"), "utf8"),
);
const inspectionMd = compileInspection(fs.readFileSync(path.join(docs, "inspection-blog.md"), "utf8"));
const autoMd = compileAuto(fs.readFileSync(path.join(docs, "auto_insurance_blackbox_v2.md"), "utf8"));

const header = `// Generated by scripts/compile-blog-markdown.mjs — do not edit by hand; run npm run compile:blog-md\n\n`;

const body = `${header}export const BLACK_BOX_TEXAS_PROPERTY_MARKDOWN = ${JSON.stringify(propertyMd)};\n\nexport const HOMEOWNERS_INSPECTION_GUIDE_MARKDOWN = ${JSON.stringify(inspectionMd)};\n\nexport const BLACK_BOX_AUTO_INSURANCE_MARKDOWN = ${JSON.stringify(autoMd)};\n`;

fs.writeFileSync(out, body, "utf8");
console.log("Wrote", out, "chars:", propertyMd.length, inspectionMd.length, autoMd.length);
