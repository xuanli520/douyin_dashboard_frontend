# 二级页面布局统一设计规范

**日期：** 2026-03-16
**状态：** 已确认
**涉及页面：** 定时任务配置页、数据源详情页、采集规则详情页

---

## 背景与目标

项目中三个功能性二级页面（定时任务配置、数据源详情、采集规则详情）在导航方式、容器间距、标题层级、操作按钮位置、加载/错误状态处理上存在不一致，导致用户体验割裂。

**目标：** 通过提取共享布局组件 `SecondaryPageLayout`，统一三个页面的外观结构，同时为未来新增二级页面提供可复用的基础模板。

---

## 技术栈约束

- UI 组件库：**shadcn/ui**（本地封装于 `src/app/components/ui/`）
- 样式：**Tailwind CSS**
- 图标：**lucide-react**
- 面包屑：使用 shadcn/ui 的 `Breadcrumb` 组件（已存在于组件库）

---

## 方案选型

采用**方案 A：轻量共享容器**。

提取一个职责单一的 `SecondaryPageLayout` 组件，只封装面包屑、页面标题、外层间距。内容区域由各页面自由组合 Card，不强制规范卡片内部细节。

放弃的方案：
- 方案 B（完整页面模板）：props 爆炸，灵活性差，改动量过大
- 方案 C（仅规范 CSS）：无代码约束，难以持续执行

---

## 第一节：`SecondaryPageLayout` 共享组件

### 文件位置

```
src/app/components/layout/SecondaryPageLayout.tsx
```

### Props 接口

```ts
interface BreadcrumbItem {
  label: string
  href?: string  // 末级项（当前页）不传 href
}

interface SecondaryPageLayoutProps {
  breadcrumbs: BreadcrumbItem[]   // 面包屑层级，最后一项为当前页
  title: string                   // 页面主标题（h1）
  children: React.ReactNode       // 页面主体内容（Card 等）
}
```

### 渲染结构

```tsx
<div className="container mx-auto py-6 space-y-6">
  <Breadcrumb>
    {breadcrumbs.map((item, index) => (
      <BreadcrumbItem key={index}>
        {item.href
          ? <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
          : <BreadcrumbPage>{item.label}</BreadcrumbPage>
        }
        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
      </BreadcrumbItem>
    ))}
  </Breadcrumb>

  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>

  {children}
</div>
```

### 职责边界

**包含：** 面包屑导航、页面标题（`h1`）、外层容器间距（`container mx-auto py-6 space-y-6`）
**不包含：** 加载/错误状态、操作按钮、业务逻辑

---

## 第二节：三个页面统一结构

### 统一规则

1. **面包屑**：每个页面使用 `SecondaryPageLayout` 的 `breadcrumbs` prop 配置，替换原有返回按钮
2. **操作按钮**：统一放在对应 `CardHeader` 内部右侧（`flex items-center justify-between`）
3. **页面容器**：删除各页面自己的外层 `div` 容器，由 `SecondaryPageLayout` 统一提供
4. **间距**：统一使用 `space-y-6`（现定时任务配置页的 `space-y-4` 升级为 `space-y-6`）

---

### 定时任务配置页 `/task-schedule/collection-jobs`

**面包屑：** `定时任务（href: /task-schedule）> 定时任务配置`

**结构变化：**
- 删除：顶部 `flex justify-between` 的标题行（含返回按钮、刷新按钮、创建按钮）
- 新增：`SecondaryPageLayout` 包裹
- 移入：刷新按钮 + "创建定时任务"按钮 → `CardHeader` 右侧

```tsx
<SecondaryPageLayout
  breadcrumbs={[
    { label: "定时任务", href: "/task-schedule" },
    { label: "定时任务配置" }
  ]}
  title="定时任务配置"
>
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle>任务列表</CardTitle>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" /> 刷新
        </Button>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          创建定时任务
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {/* 现有 DataTable 保持不变 */}
    </CardContent>
  </Card>

  {/* 创建表单 Dialog 保持不变 */}
</SecondaryPageLayout>
```

---

### 数据源详情页 `/data-source/[id]`

**面包屑：** `数据源管理（href: /data-source）> {dataSource.name}`

**结构变化：**
- 删除：`DataSourceDetailPage` 中的 `container mx-auto py-6`、`<h1>` 标题、返回按钮
- 新增：`SecondaryPageLayout` 包裹
- 保持：`InfoCard`、`LoginStateMetaCard`、`AssociatedRules` 卡片内部结构不变（操作按钮已在卡片内）

```tsx
// DataSourceDetailPage
<SecondaryPageLayout
  breadcrumbs={[
    { label: "数据源管理", href: "/data-source" },
    { label: dataSource?.name ?? "详情" }
  ]}
  title={dataSource?.name ?? "数据源详情"}
>
  <DataSourceDetail dataSource={dataSource} onRefresh={refetch} />
</SecondaryPageLayout>
```

---

### 采集规则详情页 `/scraping-rule/[id]`

**面包屑：** `采集规则（href: /scraping-rule）> {rule.name}`

**结构变化：**
- 删除：`ScrapingRuleDetail` 顶部独立的操作栏（`flex items-center justify-between` 的那一行）
- 新增：`SecondaryPageLayout` 包裹
- 移入：`配置定时任务`、`立即采集`、`编辑规则` 三个按钮 → `CardHeader` 右侧

```tsx
// ScrapingRuleDetailPage
<SecondaryPageLayout
  breadcrumbs={[
    { label: "采集规则", href: "/scraping-rule" },
    { label: rule?.name ?? "详情" }
  ]}
  title={rule?.name ?? "采集规则详情"}
>
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center gap-3">
        <RuleTypeTag type={rule.rule_type} />
        <div>
          <CardTitle>{rule.name}</CardTitle>
          {rule.description && (
            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleConfigSchedule}>
          <Clock3 className="mr-2 h-4 w-4" /> 配置定时任务
        </Button>
        <Button variant="outline" size="sm" onClick={handleCollectNow}>
          <Gauge className="mr-2 h-4 w-4" /> 立即采集
        </Button>
        <Button size="sm" onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" /> 编辑规则
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {/* 现有两列网格内容保持不变 */}
    </CardContent>
  </Card>
</SecondaryPageLayout>
```

---

## 第三节：加载与错误状态

### 统一原则

- **加载状态**：用 shadcn/ui `Skeleton` 组件替代加载文字，骨架屏结构模拟真实卡片布局
- **错误状态**：统一展示错误提示 + 重试按钮，使用 `RefreshCw` 图标
- **容器**：加载/错误状态仍使用 `SecondaryPageLayout` 包裹，保持页面结构完整

### 加载骨架屏模板

```tsx
<SecondaryPageLayout breadcrumbs={breadcrumbs} title="加载中...">
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
  </Card>
</SecondaryPageLayout>
```

骨架屏形状按页面定制：
- **定时任务配置页**：模拟表格行（多行 `h-4 w-full`）
- **数据源详情页**：模拟多个字段卡片（两列网格 Skeleton）
- **采集规则详情页**：模拟两列网格（左列字段 + 右列代码块）

### 错误状态模板

```tsx
<SecondaryPageLayout breadcrumbs={breadcrumbs} title="加载失败">
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
      <p className="text-sm text-muted-foreground">加载数据失败，请稍后重试</p>
      <Button variant="outline" onClick={refetch}>
        <RefreshCw className="mr-2 h-4 w-4" /> 重试
      </Button>
    </CardContent>
  </Card>
</SecondaryPageLayout>
```

### 各页面改动点

| 页面 | 现有加载状态 | 现有错误状态 |
|---|---|---|
| 定时任务配置 | `<div>加载中...</div>` → 骨架屏 | 无 → 错误卡片+重试 |
| 数据源详情 | `<div>加载中...</div>` → 骨架屏 | `<div>加载失败</div>` → 错误卡片+重试 |
| 采集规则详情 | `<div>加载中...</div>` → 骨架屏 | `<div>加载失败</div>` → 错误卡片+重试 |

---

## 文件改动清单

### 新增文件

| 文件 | 说明 |
|---|---|
| `src/app/components/layout/SecondaryPageLayout.tsx` | 共享二级页面布局组件 |

### 修改文件

| 文件 | 改动内容 |
|---|---|
| `src/app/components/CollectionJobConfigPage.tsx` | 替换顶部标题行为 `SecondaryPageLayout`，移动操作按钮至 CardHeader，升级加载/错误状态 |
| `src/app/(main)/data-source/[id]/page.tsx` | 包裹 `SecondaryPageLayout`，删除独立标题和返回按钮 |
| `src/features/data-source/components/DataSourceDetail/index.tsx` | 删除外层容器（由 SecondaryPageLayout 接管），升级加载/错误状态 |
| `src/app/(main)/scraping-rule/[id]/page.tsx` | 包裹 `SecondaryPageLayout` |
| `src/features/scraping-rule/components/ScrapingRuleDetail.tsx` | 删除顶部操作栏，移动按钮至 CardHeader，升级加载/错误状态 |

---

## 不在本次范围内

- 其他页面（列表页、编辑页）的布局调整
- 加载/错误状态之外的 UX 细节优化（如空状态页）
- 主题（enterprise/cyberpunk）相关的样式差异
