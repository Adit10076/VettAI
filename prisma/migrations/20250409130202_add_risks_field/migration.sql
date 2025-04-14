/*
  Warnings:

  - Added the required column `risks` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StartupIdea" ADD COLUMN "risks" TEXT NOT NULL DEFAULT '[]';
