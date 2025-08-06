# AI API Manager Pro

一个专业的AI API管理中心，使用现代化技术栈构建，通过远端API获取和管理API列表，提供完整的API管理、测试和数据同步功能。

## 🚀 主要特性

### 🎨 现代化界面设计
- **Vue 3 + Element Plus**：使用最新的Vue 3 Composition API和Element Plus组件库
- **响应式设计**：完美支持桌面端和移动端
- **深色主题**：支持浅色/深色主题切换
- **流畅动画**：丰富的交互动画和过渡效果

### 🔐 安全认证系统
- **JWT认证**：基于JWT的用户认证系统
- **权限管理**：细粒度的权限控制
- **Token自动刷新**：自动刷新认证Token
- **安全存储**：敏感数据加密存储

### 📊 远端API架构
- **RESTful API**：标准的RESTful API设计
- **分页支持**：支持大数据量的分页加载
- **搜索筛选**：强大的搜索和筛选功能
- **批量操作**：支持批量删除等操作

### 🔄 数据同步
- **实时同步**：与远端API实时数据同步
- **离线缓存**：支持离线数据缓存
- **冲突解决**：智能的数据冲突解决机制
- **状态管理**：完善的加载状态管理

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

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置远端API地址
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **构建生产版本**
```bash
npm run build
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
│   ├── services/           # API服务
│   │   ├── api.js         # API服务
│   │   └── auth.js        # 认证服务
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
├── .env.example            # 环境变量示例
└── README.md               # 项目文档
```

## 🔧 核心功能

### 1. 远端API服务 (`src/services/api.js`)

#### API服务配置
```javascript
// 远端API配置
const API_CONFIG = {
  BASE_URL: 'https://api.example.com',
  TIMEOUT: 30000,
  RETRY_COUNT: 3
}

// API服务方法
const apiService = {
  // 获取API列表
  async getApiList(params) { ... },
  
  // 创建API
  async createApi(apiData) { ... },
  
  // 更新API
  async updateApi(apiId, apiData) { ... },
  
  // 删除API
  async deleteApi(apiId) { ... },
  
  // 测试API
  async testApi(apiId, testData) { ... },
  
  // 批量操作
  async batchOperation(operation, apiIds) { ... }
}
```

#### 特性
- **RESTful设计**：标准的RESTful API接口
- **错误处理**：完善的HTTP错误处理
- **请求拦截**：自动添加认证Token
- **响应拦截**：统一的响应数据处理

### 2. 认证服务 (`src/services/auth.js`)

#### 认证功能
```javascript
const authService = {
  // 用户登录
  async login(credentials) { ... },
  
  // 用户登出
  async logout() { ... },
  
  // Token刷新
  async refreshToken() { ... },
  
  // 权限检查
  async checkPermission(permission) { ... }
}
```

#### 特性
- **JWT认证**：基于JWT的认证机制
- **自动刷新**：Token自动刷新机制
- **权限控制**：细粒度的权限管理
- **安全存储**：认证信息安全存储

### 3. API状态管理 (`src/stores/api.js`)

#### 状态管理
```javascript
const useApiStore = defineStore('api', () => {
  // 状态
  const apis = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  
  // 方法
  const fetchApiList = async () => { ... }
  const createApi = async (apiData) => { ... }
  const updateApi = async (apiId, apiData) => { ... }
  const deleteApi = async (apiId) => { ... }
})
```

#### 特性
- **远端数据**：从远端API获取数据
- **分页支持**：支持大数据量分页
- **搜索筛选**：强大的搜索和筛选
- **批量操作**：支持批量删除等操作

## 🎯 使用指南

### 1. 配置远端API
1. 复制环境变量文件：`cp .env.example .env`
2. 编辑 `.env` 文件，配置远端API地址：
```bash
VITE_API_BASE_URL=https://your-api-server.com
VITE_AUTH_ENABLED=true
```

### 2. 用户认证
1. 启动应用后，系统会自动检查认证状态
2. 如果未登录，会跳转到登录页面
3. 输入用户名和密码进行登录
4. 登录成功后，Token会自动管理

### 3. API管理
1. 进入"API管理"页面
2. 点击"添加API"按钮创建新API
3. 使用搜索和筛选功能查找API
4. 支持批量选择和批量删除操作

### 4. API测试
1. 进入"API测试"页面
2. 选择要测试的API
3. 配置测试参数
4. 发送测试请求并查看结果

## 🔒 安全考虑

### 认证安全
- **JWT Token**：使用JWT进行用户认证
- **自动刷新**：Token自动刷新机制
- **权限验证**：每个操作都进行权限验证
- **安全存储**：敏感信息加密存储

### 数据安全
- **HTTPS传输**：所有API请求使用HTTPS
- **数据加密**：敏感数据加密存储
- **输入验证**：严格的输入数据验证
- **XSS防护**：防止XSS攻击

### 使用建议
- 定期更新依赖包
- 使用强密码
- 定期更换API密钥
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
4. 配置环境变量
5. 启动开发服务器：`npm run dev`
6. 提交更改
7. 创建Pull Request

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循Vue 3 Composition API规范
- 添加适当的注释和文档

## 📄 许可证

MIT License - 详见LICENSE文件

## 🆘 支持

### 常见问题
1. **API连接失败**：检查远端API地址配置
2. **认证失败**：检查用户名密码或Token
3. **权限不足**：联系管理员分配权限
4. **数据加载失败**：检查网络连接

### 获取帮助
- 查看[Issues](../../issues)
- 提交新的Issue
- 联系项目维护者

## 🔄 更新日志

### v2.0.0 (2024-01-01)
- 🎉 全新远端API架构
- 🔐 JWT认证系统
- 📊 分页和搜索功能
- 🔄 实时数据同步
- 🎨 深色主题支持

### v1.0.0 (2023-12-01)
- 🚀 初始版本发布
- 📝 基础API管理功能
- 🎯 简单测试界面

---

**享受专业的AI API管理体验！** 🎉
