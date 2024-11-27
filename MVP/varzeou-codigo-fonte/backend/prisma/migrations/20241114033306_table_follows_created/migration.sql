-- CreateTable
CREATE TABLE "Follows" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "followerUserId" TEXT NOT NULL,
    "followingUserId" TEXT NOT NULL,
    CONSTRAINT "Follows_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follows_followingUserId_fkey" FOREIGN KEY ("followingUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
