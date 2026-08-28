-- CreateTable
CREATE TABLE "TopUp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invoiceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopUp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TopUp" ADD CONSTRAINT "TopUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
