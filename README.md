# .

# 🎓 学生点名系统

一款现代化的学生点名管理软件，基于 Tauri + Vue 3 + TypeScript 开发，为教师提供便捷的课堂管理工具。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.0+-FFC131.svg)

## ✨ 功能特性

### 📚 班级管理
- 创建和管理多个班级
- 导入/导出学生名单（支持 Excel 格式）
- 学生信息编辑和维护

### 🎯 智能点名
- **随机点名**：公平的随机算法，支持权重调整
- **花名册点名**：传统的按名单点名方式
- **动画效果**：炫酷的点名动画，提升课堂趣味性
- **音效支持**：可配置的点名音效

### 📊 考勤统计
- 实时考勤记录
- 出勤率统计分析
- 考勤报表导出
- 历史记录查询

### ⚙️ 个性化设置
- 主题切换（明亮/暗黑模式）
- 动画效果开关
- 音效设置
- 点名规则配置

## 🛠️ 技术栈

### 前端技术
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Element Plus** - Vue 3 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue 官方路由管理器

### 桌面应用
- **Tauri** - 使用 Rust 构建的桌面应用框架
- **Rust** - 系统级编程语言

### 开发工具
- **Vite** - 下一代前端构建工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

### 动画和交互
- **GSAP** - 高性能动画库
- **Lottie** - 轻量级动画渲染
- **Animate.css** - CSS 动画库

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **Rust** >= 1.70.0
- **npm** 或 **yarn** 或 **pnpm**

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/student-roll-call.git
cd student-roll-call

# 安装前端依赖
npm install

# 安装 Tauri CLI（如果未安装）
cargo install tauri-cli
```

### 开发模式

```bash
# 启动开发服务器
npm run tauri:dev
```

### 构建应用

```bash
# 构建生产版本
npm run tauri:build
```

## 📦 安装包下载

### 支持平台

| 平台 | 架构 | 下载链接 |
|------|------|----------|
| Windows | x64 | [下载 .msi](releases) |
| macOS | Apple Silicon (M1/M2/M3) | [下载 .dmg](releases) |
| macOS | Intel | [下载 .dmg](releases) |
| Linux | x64 | [下载 .deb](releases) / [下载 .rpm](releases) |

### 安装说明

#### Windows
```bash
# 下载并运行 .msi 安装包
学生点名系统_1.0.0_x64.msi
```

#### macOS
```bash
# 下载 .dmg 文件，拖拽到 Applications 文件夹
学生点名系统_1.0.0_aarch64.dmg
```

#### Linux (Ubuntu/Debian)
```bash
# 安装 .deb 包
sudo dpkg -i 学生点名系统_1.0.0_amd64.deb

# 或使用 apt
sudo apt install ./学生点名系统_1.0.0_amd64.deb
```

#### Linux (CentOS/RHEL/Fedora)
```bash
# 安装 .rpm 包
sudo rpm -i 学生点名系统-1.0.0-1.x86_64.rpm

# 或使用 dnf/yum
sudo dnf install 学生点名系统-1.0.0-1.x86_64.rpm
```

## 🎮 使用指南

### 1. 创建班级
1. 打开应用，点击「班级管理」
2. 点击「新建班级」按钮
3. 填写班级信息（班级名称、年级等）
4. 保存班级信息

### 2. 导入学生
1. 在班级管理页面，选择目标班级
2. 点击「导入学生」按钮
3. 选择 Excel 文件（支持 .xlsx, .xls 格式）
4. 确认导入的学生信息

### 3. 开始点名
1. 进入「随机点名」或「花名册点名」页面
2. 选择要点名的班级
3. 点击「开始点名」按钮
4. 记录学生出勤情况

### 4. 查看统计
1. 进入「考勤报表」页面
2. 选择时间范围和班级
3. 查看出勤率统计
4. 导出考勤报表

## 🔧 开发指南

### 项目结构

```
student-roll-call/
├── src/                    # Vue 前端源码
│   ├── components/         # 组件
│   ├── views/             # 页面
│   ├── stores/            # Pinia 状态管理
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   └── assets/            # 静态资源
├── src-tauri/             # Tauri 后端源码
│   ├── src/               # Rust 源码
│   ├── icons/             # 应用图标
│   └── tauri.conf.json    # Tauri 配置
├── .github/workflows/     # GitHub Actions
└── dist/                  # 构建输出
```

### 开发命令

```bash
# 前端开发
npm run dev              # 启动 Vite 开发服务器
npm run build            # 构建前端代码
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # ESLint 检查
npm run type-check       # TypeScript 类型检查

# Tauri 开发
npm run tauri:dev        # 启动 Tauri 开发模式
npm run tauri:build      # 构建 Tauri 应用
```

### 代码规范

- 使用 **TypeScript** 进行类型安全开发
- 遵循 **Vue 3 Composition API** 最佳实践
- 使用 **ESLint** 和 **Prettier** 保持代码风格一致
- 组件命名使用 **PascalCase**
- 文件命名使用 **kebab-case**

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 提交 Issue
- 使用清晰的标题描述问题
- 提供详细的重现步骤
- 包含系统环境信息

### 提交 Pull Request
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发流程
1. 确保代码通过所有测试
2. 更新相关文档
3. 遵循现有的代码风格
4. 添加必要的注释

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tauri](https://tauri.app/) - 构建桌面应用的框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Vite](https://vitejs.dev/) - 前端构建工具

## 📞 联系我们

- 📧 邮箱：your-email@example.com
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-username/student-roll-call/issues)
- 💬 讨论交流：[GitHub Discussions](https://github.com/your-username/student-roll-call/discussions)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！

全程使用Trae AI开发 包括这个readme也是