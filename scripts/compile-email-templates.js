/**
 * Pre-compiles MJML email templates to HTML at build time.
 * Run this script after installing dependencies or when templates change.
 *   node scripts/compile-email-templates.js
 */
const fs = require("fs");
const path = require("path");
const mjml2html = require("mjml");

const templatesDir = path.join(__dirname, "..", "src", "lib", "email", "templates");
const compiledDir = path.join(templatesDir, "compiled");

// Ensure compiled directory exists
if (!fs.existsSync(compiledDir)) {
  fs.mkdirSync(compiledDir, { recursive: true });
}

const templateFiles = [
  "welcome.js",
  "verify-email.js",
  "password-reset.js",
  "budget-warning.js",
  "budget-exceeded.js",
  "monthly-report.js",
  "failed-login.js",
];

async function compileAll() {
  let hasErrors = false;

  for (const file of templateFiles) {
    const filePath = path.join(templatesDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Template not found: ${file}`);
      continue;
    }

    // Clear require cache to pick up latest changes
    delete require.cache[require.resolve(filePath)];
    const mjmlTemplate = require(filePath);

    const result = await mjml2html(mjmlTemplate, {
      minify: true,
      validationLevel: "soft",
    });

    if (result.errors && result.errors.length > 0) {
      console.error(`❌ Errors in ${file}:`);
      result.errors.forEach((e) => console.error("  ", e.formattedMessage || e.message));
      hasErrors = true;
      continue;
    }

    const outputFile = path.join(compiledDir, file.replace(".js", ".html"));
    fs.writeFileSync(outputFile, result.html, "utf-8");
    console.log(`✅ Compiled ${file} → compiled/${path.basename(outputFile)}`);
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log("\n🎉 All email templates compiled successfully!");
  }
}

compileAll();
