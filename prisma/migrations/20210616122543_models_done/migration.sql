-- AlterTable
ALTER TABLE
  "user"
ADD
  COLUMN "id" SERIAL NOT NULL,
ADD
  PRIMARY KEY ("id");
-- CreateTable
  CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "lat" INTEGER NOT NULL,
    "lng" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );
-- CreateTable
  CREATE TABLE "sensor" (
    "id" SERIAL NOT NULL,
    "sensorNumber" INTEGER NOT NULL,
    "spotName" VARCHAR(255) NOT NULL,
    "lat" INTEGER NOT NULL,
    "lng" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );
-- CreateTable
  CREATE TABLE "experiment" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    "log" TEXT NOT NULL,
    "rainMap" VARCHAR(255) NOT NULL,
    "costGraph" VARCHAR(255) NOT NULL,
    "parameter" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );
-- CreateIndex
  CREATE UNIQUE INDEX "sensor.sensorNumber_unique" ON "sensor"("sensorNumber");
-- AddForeignKey
ALTER TABLE
  "sensor"
ADD
  FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE
  "experiment"
ADD
  FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;