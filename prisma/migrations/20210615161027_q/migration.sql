-- CreateTable
CREATE TABLE "user" (
    "username" VARCHAR(15) NOT NULL,
    "hashedPassword" VARCHAR(255) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user.username_unique" ON "user"("username");
