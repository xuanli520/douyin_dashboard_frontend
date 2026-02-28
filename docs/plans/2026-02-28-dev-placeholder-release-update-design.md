# 开发中占位发布时间更新设计

## 背景
- 数据分析、定期报表、风险预警页面当前通过接口状态占位提示“预计 2026-03-01 发布”。产品要求将日期改为 2026-03-10，并在任务调度页采用相同占位逻辑。
- 项目已有统一的端点状态机制（endpoint-meta、EndpointStatusWrapper、DevPlaceholder、DevModeBadge、HTTP 拦截器）。

## 目标
- 四个页面（数据分析、定期报表、风险预警、任务调度）在开发态显示“该功能正在开发中，当前返回演示数据（演示数据），预计 2026-03-10 发布”。
- 任务调度页改为实际请求 `/api/v1/schedules`，并将响应透传给 EndpointStatusWrapper。
- 保持全局元数据与示例文档日期一致。

## 方案
1) **数据来源一致**：将 `src/config/endpoint-meta.ts` 中所有开发中端点的 `expectedRelease` 统一改为 `2026-03-10`，确保 DevPlaceholder/Badge 与拦截器提示一致；同步更新 README 示例。
2) **任务调度页接入状态包装**：新增 `schedulesApi.getList`（GET `/api/v1/schedules`）；TaskSchedulePage 使用 `useQuery` 调用并传递 `responseData` 给 `EndpointStatusWrapper`，占位 icon 选用 `ClipboardList`（或类似）保持风格。
3) **页面内容保持现状**：当接口为开发态时显示占位，否则继续展示现有静态列表。

## 影响范围
- 配置：`src/config/endpoint-meta.ts`，`README.md`
- 任务调度：`src/features/schedules/services/schedulesApi.ts`（新）、`src/app/components/TaskSchedulePage.tsx`
- 其余页面代码无需改动，自动读取更新后的元数据。

## 验证要点
- 运行 `npm run dev`，打开四个页面，接口返回开发态时占位文案显示 2026-03-10。
- DevModeBadge、全局 toast 里的预计日期一致。
