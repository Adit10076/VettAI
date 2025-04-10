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
ALTER TABLE [Analysis] DROP CONSTRAINT [Analysis_startupIdeaId_fkey];

-- AlterTable
ALTER TABLE [StartupIdea] ADD 
    [businessModelIdeas] NVARCHAR(MAX) NOT NULL,
    [marketPotentialScore] INT NOT NULL,
    [mvpSuggestions] NVARCHAR(MAX) NOT NULL,
    [overallScore] INT NOT NULL,
    [swotAnalysis] NVARCHAR(MAX) NOT NULL,
    [technicalFeasibilityScore] INT NOT NULL;

-- DropTable
DROP TABLE [Analysis];
