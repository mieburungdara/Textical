-- CreateIndex
CREATE INDEX "Hero_userId_idx" ON "Hero"("userId");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_templateId_idx" ON "InventoryItem"("userId", "templateId");

-- CreateIndex
CREATE INDEX "MarketOrder_templateId_status_idx" ON "MarketOrder"("templateId", "status");

-- CreateIndex
CREATE INDEX "MarketOrder_expiresAt_idx" ON "MarketOrder"("expiresAt");

-- CreateIndex
CREATE INDEX "MarketOrder_creatorId_idx" ON "MarketOrder"("creatorId");

-- CreateIndex
CREATE INDEX "RegionMonster_regionId_idx" ON "RegionMonster"("regionId");

-- CreateIndex
CREATE INDEX "TaskQueue_userId_status_idx" ON "TaskQueue"("userId", "status");

-- CreateIndex
CREATE INDEX "TaskQueue_heroId_idx" ON "TaskQueue"("heroId");

-- CreateIndex
CREATE INDEX "TavernMercenary_regionId_expiresAt_idx" ON "TavernMercenary"("regionId", "expiresAt");

-- CreateIndex
CREATE INDEX "UserQuest_userId_status_idx" ON "UserQuest"("userId", "status");

-- CreateIndex
CREATE INDEX "UserQuest_questId_idx" ON "UserQuest"("questId");


