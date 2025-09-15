#!/usr/bin/env node

const { execSync } = require("child_process")

console.log("🧪 Running Fritz Game Test Suite...\n")

try {
  // Run all tests
  console.log("📋 Running unit tests...")
  execSync("npm run test", { stdio: "inherit" })

  console.log("\n📊 Generating coverage report...")
  execSync("npm run test:coverage", { stdio: "inherit" })

  console.log("\n✅ All tests completed successfully!")
} catch (error) {
  console.error("\n❌ Tests failed!")
  process.exit(1)
}
