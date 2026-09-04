import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

export async function readCsv(filePath, onRow) {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;

  for await (const line of lines) {
    if (line === "") continue;

    if (headers === null) {
      headers = parseCsvLine(line.replace(/^\uFEFF/, ""));
      continue;
    }

    const fields = parseCsvLine(line);
    const row = {};
    for (let i = 0; i < headers.length; i += 1) {
      row[headers[i]] = fields[i] ?? "";
    }

    onRow(row);
  }
}
