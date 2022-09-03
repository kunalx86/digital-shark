/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auction" ALTER COLUMN "sold" DROP NOT NULL,
ALTER COLUMN "sold" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";
