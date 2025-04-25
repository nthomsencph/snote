-- DropIndex
DROP INDEX "entries_index_key";

-- AlterTable
CREATE SEQUENCE entries_index_seq;
ALTER TABLE "entries" ADD COLUMN     "icon" TEXT,
ALTER COLUMN "lastUpdated" DROP NOT NULL,
ALTER COLUMN "index" SET DEFAULT nextval('entries_index_seq');
ALTER SEQUENCE entries_index_seq OWNED BY "entries"."index";
