# AI API Manager Pro

一个专业的AI API管理中心，使用现代化技术栈构建，提供完整的API管理、测试和数据同步功能。

## 🚀 主要特性

### 🎨 现代化界面设计
- **Vue 3 + Element Plus**：使用最新的Vue 3 Composition API和Element Plus组件库
- **响应式设计**：完美支持桌面端和移动端
- **深色主题**：支持浅色/深色主题切换
- **流畅动画**：丰富的交互动画和过渡效果

### 🔐 安全数据存储
- **数据加密**：使用AES加密算法保护敏感数据
- **本地存储**：基于localStorage的可靠数据存储
- **自动备份**：支持数据自动备份和恢复
- **导入导出**：完整的数据导入导出功能

### 📊 专业功能
- **仪表板**：实时统计和监控面板
- **API管理**：完整的CRUD操作和状态管理
- **测试控制台**：专业的API测试界面
- **数据同步**：多设备数据同步支持

## 🛠️ 技术栈

### 前端框架
- **Vue 3.3.4**：最新的Vue.js框架
- **Element Plus 2.3.8**：企业级UI组件库
- **Pinia 2.1.4**：状态管理
- **Vue Router 4.2.4**：路由管理

### 开发工具
- **Vite 4.4.5**：现代化构建工具
- **Sass**：CSS预处理器
- **ESLint + Prettier**：代码规范和格式化

### 核心库
- **axios**：HTTP客户端
- **crypto-js**：数据加密
- **dayjs**：日期处理
- **lodash-es**：工具函数

## 📦 安装和使用

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-api-manager-pro
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

5. **预览生产版本**
```bash
npm run preview
```

## 🏗️ 项目结构

```
ai-api-manager-pro/
├── src/
│   ├── components/          # 公共组件
│   ├── config/             # 配置文件
│   │   └── storage.js      # 存储管理配置
│   ├── layout/             # 布局组件
│   │   └── MainLayout.vue  # 主布局
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── stores/             # 状态管理
│   │   ├── api.js         # API状态
│   │   └── theme.js       # 主题状态
│   ├── styles/             # 样式文件
│   │   └── index.scss
│   ├── views/              # 页面组件
│   │   ├── Dashboard.vue   # 仪表板
│   │   ├── Apis.vue        # API管理
│   │   ├── Testing.vue     # API测试
│   │   └── Settings.vue    # 设置
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── public/                 # 静态资源
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
└── README.md               # 项目文档
```

## 🔧 核心功能

### 1. 数据存储管理

#### 存储配置 (`src/config/storage.js`)
```javascript
// 存储配置
export const STORAGE_CONFIG = {
  ENCRYPTION_KEY: 'your-secret-key',
  KEYS: {
    APIS: 'ai-apis-encrypted',
    SETTINGS: 'ai-settings',
    THEME: 'ai-theme'
  }
}

// 使用存储管理器
import { storageManager } from '@/config/storage'

// 加密保存
storageManager.saveEncrypted('key', data)

// 解密加载
const data = storageManager.loadEncrypted('key')
```

#### 特性
- **自动加密**：敏感数据自动加密存储
- **错误处理**：完善的错误处理和恢复机制
- **备份管理**：自动备份和清理旧备份
- **存储监控**：存储大小和使用情况监控

### 2. API管理

#### 状态管理 (`src/stores/api.js`)
```javascript
import { useApiStore } from '@/stores/api'

const apiStore = useApiStore()

// 添加API
apiStore.addApi({
  name: 'OpenAI API',
  url: 'https://api.openai.com/v1',
  key: 'your-api-key',
  type: 'openai'
})

// 测试API
const result = await apiStore.testApi(apiId, testData)
```

#### 功能特性
- **完整CRUD**：增删改查操作
- **状态监控**：API状态和测试统计
- **批量操作**：支持批量导入导出
- **错误处理**：完善的错误提示和处理

### 3. 主题管理

#### 主题切换 (`src/stores/theme.js`)
```javascript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 切换主题
themeStore.toggleTheme()

// 设置主题
themeStore.setTheme('dark')
```

## 🎯 使用指南

### 1. 添加API
1. 进入"API管理"页面
2. 点击"添加API"按钮
3. 填写API信息（名称、URL、Key等）
4. 选择API类型
5. 点击"添加"完成

### 2. 测试API
1. 进入"API测试"页面
2. 选择要测试的API
3. 配置测试参数（模型、温度等）
4. 输入测试消息
5. 点击"发送请求"查看结果

### 3. 数据管理
1. 进入"设置"页面
2. 配置数据同步选项
3. 使用导入/导出功能
4. 管理数据备份

## 🔒 安全考虑

### 数据安全
- **加密存储**：所有敏感数据使用AES加密
- **本地存储**：数据仅存储在本地，不上传服务器
- **访问控制**：基于浏览器的安全访问

### 使用建议
- 定期备份重要数据
- 使用强密码保护API密钥
- 定期更新依赖包
- 启用HTTPS协议

## 🚀 部署

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run preview
```

### Docker部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 贡献指南

### 开发环境设置
1. Fork项目
2. 创建功能分支
3. 安装依赖：`npm install`
4. 启动开发服务器：`npm run dev`
5. 提交更改
6. 创建Pull Request

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循Vue 3 Composition API规范
- 添加适当的注释和文档

## 📄 许可证

MIT License - 详见LICENSE文件

## 🆘 支持

### 常见问题
1. **数据丢失**：检查浏览器localStorage是否被清除
2. **加密错误**：确认加密密钥配置正确
3. **API测试失败**：检查网络连接和API配置

### 获取帮助
- 查看[Issues](../../issues)
- 提交新的Issue
- 联系项目维护者

## 🔄 更新日志

### v2.0.0 (2024-01-01)
- 🎉 全新Vue 3 + Element Plus架构
- 🔐 数据加密存储
- 📊 专业仪表板
- 🎨 深色主题支持
- 🔄 自动备份功能

### v1.0.0 (2023-12-01)
- 🚀 初始版本发布
- 📝 基础API管理功能
- 🎯 简单测试界面

---

**享受专业的AI API管理体验！** 🎉
