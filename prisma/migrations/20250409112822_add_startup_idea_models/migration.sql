-- CreateTable
CREATE TABLE [StartupIdea] (
    [id] NVARCHAR(255) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [problem] NVARCHAR(MAX) NOT NULL,
    [solution] NVARCHAR(MAX) NOT NULL,
    [audience] NVARCHAR(255) NOT NULL,
    [businessModel] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] NVARCHAR(255) NOT NULL,

    CONSTRAINT [StartupIdea_pkey] PRIMARY KEY ([id])
);

-- CreateTable
CREATE TABLE [Analysis] (
    [id] NVARCHAR(255) NOT NULL,
    [overallScore] INT NOT NULL,
    [marketPotential] INT NOT NULL,
    [technicalFeasibility] INT NOT NULL,
    [strengths] NVARCHAR(MAX),
    [weaknesses] NVARCHAR(MAX),
    [opportunities] NVARCHAR(MAX), 
    [threats] NVARCHAR(MAX),
    [mvpSuggestions] NVARCHAR(MAX),
    [businessModelIdeas] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [startupIdeaId] NVARCHAR(255) NOT NULL,

    CONSTRAINT [Analysis_pkey] PRIMARY KEY ([id])
);

-- CreateIndex
CREATE UNIQUE INDEX [Analysis_startupIdeaId_key] ON [Analysis]([startupIdeaId]);

-- AddForeignKey
ALTER TABLE [StartupIdea] ADD CONSTRAINT [StartupIdea_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [Analysis] ADD CONSTRAINT [Analysis_startupIdeaId_fkey] FOREIGN KEY ([startupIdeaId]) REFERENCES [StartupIdea]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
