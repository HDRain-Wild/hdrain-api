/*
  Warnings:

  - Added the required column `rainMap` to the `experiment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "experiment" ADD COLUMN     "rainGraph" TEXT NOT NULL;
