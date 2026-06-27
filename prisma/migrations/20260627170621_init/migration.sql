-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LocationTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "image" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "radius" REAL DEFAULT 50,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "LocationTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LocationTag" ("address", "id", "image", "latitude", "longitude", "name", "radius", "userId") SELECT "address", "id", "image", "latitude", "longitude", "name", "radius", "userId" FROM "LocationTag";
DROP TABLE "LocationTag";
ALTER TABLE "new_LocationTag" RENAME TO "LocationTag";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
