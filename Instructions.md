## 初中生点名程序开发计划

### 一、项目概述
开发一款面向教师使用的点名软件，主要服务于初中生班级管理，支持多班级管理、学生名单导入导出、全员点名、随机点名等功能，界面设计可爱活泼，包含动画特效。

### 二、技术框架选型

#### 1. 前端框架
- **Vue 3** + **TypeScript**：主体框架，组件化开发，类型安全
- **Vite**：构建工具，开发体验好，打包速度快
- **Element Plus**：UI组件库，提供基础组件
- **Pinia**：状态管理，管理班级和学生数据
- **Vue Router**：路由管理

#### 2. 样式和动画
- **Tailwind CSS**：原子化CSS框架，快速开发
- **Animate.css**：预设动画效果
- **Lottie**：复杂动画效果（如炸弹、小红花等）
- **GSAP**：高性能动画库，实现卡片翻转等效果

#### 3. 数据处理
- **SheetJS (xlsx)**：Excel文件读写
- **LocalForage**：本地数据持久化（基于IndexedDB）
- **Day.js**：日期时间处理

#### 4. 桌面应用打包
- **Tauri**：Rust基础的跨平台框架，生成原生macOS应用
- 体积小，性能好，安全性高
- 支持本地文件系统访问

### 三、项目目录结构

```
student-roll-call/
├── src/
│   ├── assets/
│   │   ├── images/          # 静态图片资源
│   │   ├── animations/      # Lottie动画文件
│   │   └── sounds/          # 音效文件
│   ├── components/
│   │   ├── common/          # 通用组件
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   └── Modal.vue
│   │   ├── class/           # 班级相关组件
│   │   │   ├── ClassList.vue
│   │   │   ├── ClassCard.vue
│   │   │   └── ClassForm.vue
│   │   ├── student/         # 学生相关组件
│   │   │   ├── StudentCard.vue
│   │   │   ├── StudentList.vue
│   │   │   └── ImportModal.vue
│   │   └── rollcall/        # 点名相关组件
│   │       ├── RollCallCard.vue
│   │       ├── AttendanceStatus.vue
│   │       └── RandomPicker.vue
│   ├── views/
│   │   ├── Home.vue         # 首页
│   │   ├── ClassManage.vue  # 班级管理
│   │   ├── StudentManage.vue # 学生管理
│   │   ├── RollCall.vue     # 全员点名
│   │   ├── RandomCall.vue   # 随机点名
│   │   └── Reports.vue      # 点名报告
│   ├── stores/
│   │   ├── class.ts         # 班级数据状态
│   │   ├── student.ts       # 学生数据状态
│   │   └── attendance.ts    # 考勤数据状态
│   ├── utils/
│   │   ├── excel.ts         # Excel处理工具
│   │   ├── storage.ts       # 本地存储工具
│   │   ├── random.ts        # 随机算法工具
│   │   └── animation.ts     # 动画效果工具
│   ├── types/
│   │   ├── class.ts         # 班级类型定义
│   │   ├── student.ts       # 学生类型定义
│   │   └── attendance.ts    # 考勤类型定义
│   ├── router/
│   │   └── index.ts         # 路由配置
│   ├── styles/
│   │   ├── global.css       # 全局样式
│   │   └── animations.css   # 动画样式
│   ├── App.vue
│   └── main.ts
├── src-tauri/               # Tauri配置
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 四、功能模块详细描述

#### 1. 班级管理模块
**功能描述**：
- 班级列表展示（卡片式布局，每个班级显示名称、人数、创建时间）
- 新增班级（输入班级名称、年级、备注信息）
- 编辑班级信息
- 删除班级（需二次确认，关联数据一并删除）
- 班级切换（顶部下拉选择当前操作班级）

**界面特点**：
- 班级卡片使用渐变色背景
- 鼠标悬停时卡片轻微放大并显示阴影
- 新增班级时播放欢快的动画

#### 2. 学生管理模块
**功能描述**：
- 学生名单展示（表格形式，显示学号、姓名、性别等）
- Excel批量导入（支持.xlsx/.xls格式，提供模板下载）
- 单个添加学生
- 编辑学生信息
- 删除学生（软删除，可恢复）
- 搜索过滤功能

**界面特点**：
- 学生头像使用卡通形象
- 导入时显示进度条动画
- 删除时播放"消失"动画效果

#### 3. 全员点名模块
**功能描述**：
- 开始点名（全屏卡片式展示）
- 学生信息卡片（显示姓名、学号、头像）
- 点名操作（"已到"、"未到"两个按钮）
- 点名进度显示（已点/总数）
- 点名完成后自动保存报告
- 支持中途退出并保存进度

**界面特点**：
- 卡片3D翻转效果展示下一个学生
- "已到"按钮点击后显示小红花动画，播放欢快音效
- "未到"按钮点击后显示炸弹爆炸动画，播放音效
- 背景使用动态渐变效果

#### 4. 随机点名模块
**功能描述**：
- 设置抽取人数（默认1人，最多不超过班级总人数）
- 开始随机抽取（转盘/老虎机效果）
- 显示被抽中学生
- 可重复抽取或排除已抽中学生
- 抽取历史记录

**界面特点**：
- 使用转盘或老虎机动画效果
- 被选中学生卡片发光并放大
- 背景使用星空或彩虹效果
- 配合紧张刺激的背景音乐

#### 5. 考勤报告模块
**功能描述**：
- 历史考勤记录列表（按日期排序）
- 查看详细考勤情况（到课率、缺勤学生名单）
- 导出Excel报告（包含日期、班级、详细名单）
- 考勤统计图表（月度、学期统计）
- 删除历史记录

**界面特点**：
- 使用可视化图表展示出勤率
- 缺勤学生标红显示
- 导出时显示进度动画

### 五、数据结构设计

#### 1. 班级数据
```typescript
interface Class {
  id: string
  name: string
  grade: string
  createdAt: Date
  updatedAt: Date
  studentCount: number
  note?: string
}
```

#### 2. 学生数据
```typescript
interface Student {
  id: string
  classId: string
  studentNo: string
  name: string
  gender: '男' | '女'
  avatar?: string
  createdAt: Date
  isDeleted: boolean
}
```

#### 3. 考勤数据
```typescript
interface AttendanceRecord {
  id: string
  classId: string
  date: Date
  type: '全员点名' | '随机点名'
  details: AttendanceDetail[]
  summary: {
    total: number
    present: number
    absent: number
    rate: number
  }
}

interface AttendanceDetail {
  studentId: string
  status: '已到' | '未到'
  time: Date
}
```

### 六、核心功能实现策略

#### 1. 数据持久化
- 使用LocalForage管理IndexedDB
- 设计数据版本控制机制
- 实现数据导出备份功能
- 定期自动保存

#### 2. Excel处理
- 提供标准模板下载
- 校验导入数据格式
- 处理中文编码问题
- 支持大批量数据导入

#### 3. 动画效果
- 预加载动画资源
- 使用Web Worker处理复杂动画
- 控制动画性能，避免卡顿
- 提供动画开关设置

#### 4. 随机算法
- 使用Fisher-Yates洗牌算法
- 支持权重随机（可选）
- 避免短期内重复

### 七、UI/UX设计指导

#### 1. 色彩方案
- 主色调：天蓝色 (#3B82F6)
- 辅助色：粉色 (#EC4899)、黄色 (#F59E0B)
- 成功色：绿色 (#10B981)
- 警告色：红色 (#EF4444)

#### 2. 字体
- 标题：思源黑体 Bold
- 正文：思源黑体 Regular
- 数字：Roboto

#### 3. 图标
- 使用圆角卡通风格图标
- 适当使用emoji增加趣味性

#### 4. 交互反馈
- 所有按钮都有hover和active状态
- 操作成功/失败都有toast提示
- 加载状态使用骨架屏或加载动画

### 八、开发计划

#### 第一阶段（2周）
- 搭建项目框架
- 完成基础组件开发
- 实现班级管理功能
- 配置Tauri环境

#### 第二阶段（2周）
- 完成学生管理模块
- 实现Excel导入导出
- 开发全员点名功能
- 添加基础动画效果

#### 第三阶段（2周）
- 开发随机点名功能
- 完成考勤报告模块
- 优化动画效果
- 添加音效

#### 第四阶段（1周）
- 整体UI美化
- 性能优化
- 测试修复bug
- 打包发布

### 九、注意事项

1. **兼容性**：确保在macOS M1/M2芯片上流畅运行
2. **数据安全**：实现数据加密存储，定期备份
3. **用户体验**：操作简单直观，避免复杂流程
4. **性能优化**：控制动画资源大小，优化渲染性能
5. **扩展性**：预留功能扩展接口，方便后续升级