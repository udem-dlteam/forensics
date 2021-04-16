CREATE TABLE "Benchmark" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT UNIQUE NOT NULL,
  "shortname" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "setup" TEXT NOT NULL
);

CREATE TABLE "Machine" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT UNIQUE NOT NULL,
  "shortname" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "setup" TEXT NOT NULL,
  "specs" TEXT NOT NULL
);

CREATE TABLE "System" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT UNIQUE NOT NULL,
  "shortname" TEXT UNIQUE NOT NULL,
  "icon" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "setup" TEXT NOT NULL,
  "url" TEXT NOT NULL
);

CREATE TABLE "Commit" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "timestamp" DATETIME NOT NULL,
  "system" INTEGER NOT NULL REFERENCES "System" ("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "branch" TEXT NOT NULL
);

CREATE INDEX "idx_commit__system" ON "Commit" ("system");

CREATE TABLE "Config" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "shortname" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "setup" TEXT NOT NULL,
  "system" INTEGER NOT NULL REFERENCES "System" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_config__system" ON "Config" ("system");

CREATE TABLE "Build" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "timestamp" DATETIME,
  "result" TEXT NOT NULL,
  "system" INTEGER NOT NULL REFERENCES "System" ("id") ON DELETE CASCADE,
  "commit" INTEGER NOT NULL REFERENCES "Commit" ("id") ON DELETE CASCADE,
  "machine" INTEGER NOT NULL REFERENCES "Machine" ("id") ON DELETE CASCADE,
  "config" INTEGER NOT NULL REFERENCES "Config" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_build__commit" ON "Build" ("commit");

CREATE INDEX "idx_build__config" ON "Build" ("config");

CREATE INDEX "idx_build__machine" ON "Build" ("machine");

CREATE INDEX "idx_build__system" ON "Build" ("system");

CREATE TABLE "Usage" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "shortname" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "setup" TEXT NOT NULL,
  "system" INTEGER NOT NULL REFERENCES "System" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_usage__system" ON "Usage" ("system");

CREATE TABLE "Run" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "timestamp" DATETIME NOT NULL,
  "result" TEXT NOT NULL,
  "usage" INTEGER NOT NULL REFERENCES "Usage" ("id") ON DELETE CASCADE,
  "benchmark" INTEGER NOT NULL REFERENCES "Benchmark" ("id") ON DELETE CASCADE,
  "build" INTEGER NOT NULL REFERENCES "Build" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_run__benchmark" ON "Run" ("benchmark");

CREATE INDEX "idx_run__build" ON "Run" ("build");

CREATE INDEX "idx_run__usage" ON "Run" ("usage")
