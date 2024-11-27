/*
  Warnings:

  - You are about to drop the column `followerUserId` on the `Follows` table. All the data in the column will be lost.
  - You are about to drop the column `followingUserId` on the `Follows` table. All the data in the column will be lost.
  - Added the required column `followerId` to the `Follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingId` to the `Follows` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Follows" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follows" ("id") SELECT "id" FROM "Follows";
DROP TABLE "Follows";
ALTER TABLE "new_Follows" RENAME TO "Follows";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
