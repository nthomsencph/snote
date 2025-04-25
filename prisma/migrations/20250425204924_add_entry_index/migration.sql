/*
  Warnings:

  - A unique constraint covering the columns `[index]` on the table `entries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "entries" ADD COLUMN     "index" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "entries_index_key" ON "entries"("index");
