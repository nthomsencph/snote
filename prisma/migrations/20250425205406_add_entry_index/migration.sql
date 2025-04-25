-- AlterTable
ALTER TABLE "entries" ALTER COLUMN "index" DROP DEFAULT;
DROP SEQUENCE "entries_index_seq";
