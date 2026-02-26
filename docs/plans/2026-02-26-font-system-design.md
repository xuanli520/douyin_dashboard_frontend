# Font System Design

Date: 2026-02-26  
Owner: Codex  
Status: Implemented

## Goals
- 提供统一的字体系统，支持在系统设置中切换：中文无衬线正文、英文无衬线、等宽/代码字体。
- 作用范围覆盖：A) 全局正文/标题，B) 代码/等宽区域，C) 组件库 UI，D) 图表/SVG/Canvas 文字。
- 用户选择持久化到 localStorage，SSR/Hydration 下无闪烁回退安全。

## Non-Goals
- 不引入远程 CDN 字体；暂不处理自定义上传字体。
- 不调整现有主题色板/布局。

## Current State
- `globals.css` 与主题 CSS 写死 font-family 栈（微软雅黑/苹方等），缺乏统一令牌。
- Tailwind `fontFamily.sans/mono` 直接写死具体字体，无法运行时切换。
- 主题 store 仅管理 `appTheme`、`colorMode`，未存储字体。
- SystemSettings 页面无字体设置区域。
- 图表（Recharts/SVG）未显式绑定字体变量。

## Design Decisions
1) **CSS 变量作唯一入口**  
   - 定义 `--font-sans-cn`、`--font-sans-en`、`--font-mono`，派生 `--font-sans`（混排时优先中文栈，回退英文）。  
   - `body { font-family: var(--font-sans); }`；Tailwind `font-sans` / `font-mono` 均引用变量。

2) **Tailwind 与主题解耦字体**  
   - `tailwind.config.ts` 的 `fontFamily` 改为变量引用，避免编译期固化。  
   - 主题 CSS (`themes/*.css`) 移除直接 `font-family`，若需主题特殊字体，则仅覆写变量值。

3) **状态管理与持久化**  
   - `useThemeStore` 扩展：`fontCn`, `fontEn`, `fontMono`（或一个 `fontPreset` 枚举，内部映射三段栈）；默认值为当前现有栈。  
   - `applyThemeToDOM` 增加写入 CSS 变量逻辑；rehydrate 时同步，避免闪烁。  
   - persist key 追加字体字段，存储于 localStorage。

4) **System Settings UI**  
   - 在“外观设置”下新增“字体设置”分组，三个 Select：中文正文、英文正文、等宽/代码。  
   - 预置栈：  
     - 中文：`'Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'sans-serif'`  
     - 英文：`'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'`  
     - 等宽：`'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'`  
   - 右侧预览区，展示中英混排与代码片段，随选择即时生效。

5) **图表/Canvas 覆盖**  
   - 全局样式覆盖 Recharts/SVG：` .recharts-wrapper text, svg text { font-family: var(--font-sans); }`。  
   - 若存在 Canvas 图表，初始化时注入 `font`（例如 `ctx.font = "14px var(--font-sans)"`），此轮先加 TODO 提示。

6) **回退与无障碍**  
   - 未加载/缺失字体时回退到系统无衬线或等宽字体，保持可读性。  
   - 切换即时生效，无需刷新；保留现有深浅色模式逻辑。

## Risks & Mitigations
- **跨平台字体差异**：依赖系统预装字体，呈现不完全一致；可后续引入 `next/font` 本地字体包。  
- **主题残留 font-family**：需彻底清理 `globals.css`、`themes/*.css` 中硬编码；添加检查。  
- **Hydration 闪烁**：rehydrate 时立即写入变量；可用临时 class 防止首屏闪烁。

## Open Questions
- 是否需要“恢复默认”按钮（暂未实现，按需追加）。  
- Canvas 图表的具体使用场景与尺寸，后续在实现时确认。
