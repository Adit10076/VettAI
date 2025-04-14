-- CreateTable
CREATE TABLE "StartupIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StartupIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "marketPotential" INTEGER NOT NULL,
    "technicalFeasibility" INTEGER NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "opportunities" TEXT, 
    "threats" TEXT,
    "mvpSuggestions" TEXT,
    "businessModelIdeas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startupIdeaId" TEXT NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_startupIdeaId_key" ON "Analysis"("startupIdeaId");

-- AddForeignKey
ALTER TABLE "StartupIdea" ADD CONSTRAINT "StartupIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_startupIdeaId_fkey" FOREIGN KEY ("startupIdeaId") REFERENCES "StartupIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
