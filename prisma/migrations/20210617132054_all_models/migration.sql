/*
  Warnings:

  - You are about to drop the column `log` on the `experiment` table. All the data in the column will be lost.
  - You are about to drop the column `parameter` on the `experiment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `sensor` table. All the data in the column will be lost.
  - Added the required column `assimilationLog` to the `experiment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neuralNetworkLog` to the `experiment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parameters` to the `experiment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedAt` to the `sensor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "experiment" DROP COLUMN "log",
DROP COLUMN "parameter",
ADD COLUMN     "assimilationLog" TEXT NOT NULL,
ADD COLUMN     "neuralNetworkLog" TEXT NOT NULL,
ADD COLUMN     "parameters" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sensor" DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "sensorId" INTEGER NOT NULL,
    "experimentId" INTEGER NOT NULL,

    PRIMARY KEY ("sensorId","experimentId")
);

-- AddForeignKey
ALTER TABLE "status" ADD FOREIGN KEY ("sensorId") REFERENCES "sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status" ADD FOREIGN KEY ("experimentId") REFERENCES "experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
