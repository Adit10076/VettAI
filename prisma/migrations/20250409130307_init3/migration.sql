-- AlterTable
DECLARE @constraint_name NVARCHAR(200)
SELECT @constraint_name = name FROM SYS.DEFAULT_CONSTRAINTS
WHERE PARENT_OBJECT_ID = OBJECT_ID('[StartupIdea]')
AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns WHERE NAME = 'risks'
AND object_id = OBJECT_ID('[StartupIdea]'))

IF @constraint_name IS NOT NULL
    EXEC('ALTER TABLE [StartupIdea] DROP CONSTRAINT ' + @constraint_name)
