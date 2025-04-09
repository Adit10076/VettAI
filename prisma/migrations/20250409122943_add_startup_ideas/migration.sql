/*
  Warnings:

  - You are about to drop the `Analysis` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `businessModelIdeas` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketPotentialScore` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mvpSuggestions` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallScore` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swotAnalysis` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technicalFeasibilityScore` to the `StartupIdea` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_startupIdeaId_fkey";

-- AlterTable
ALTER TABLE "StartupIdea" ADD COLUMN     "businessModelIdeas" JSONB NOT NULL,
ADD COLUMN     "marketPotentialScore" INTEGER NOT NULL,
ADD COLUMN     "mvpSuggestions" JSONB NOT NULL,
ADD COLUMN     "overallScore" INTEGER NOT NULL,
ADD COLUMN     "swotAnalysis" JSONB NOT NULL,
ADD COLUMN     "technicalFeasibilityScore" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Analysis";
