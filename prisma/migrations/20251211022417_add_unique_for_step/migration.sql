/*
  Warnings:

  - A unique constraint covering the columns `[recipeId,order]` on the table `Step` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Step_recipeId_order_key" ON "Step"("recipeId", "order");
