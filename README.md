
# 🧠 DeepSeek Chat UI - Cloudflare Workers AI 聊天助手

一个轻量、强大、前端即服务的 AI 聊天助手，基于 [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) 构建，默认集成 **DeepSeek-R1-Distill-Qwen-32B** 模型，支持多模型切换、图像生成、多会话记录、代码高亮、Markdown 渲染等。

---

## 🚀 在线演示（多模型版本）

| 模型 | 地址 | 说明 |
|------|------|------|
| `Qwen 1.5-14B` | [演示地址](https://calm-lake-75ac.ndjswww2023.workers.dev/) | 高质量中文、指令模型 |
| `DeepSeek-R1-Distill-Qwen-32B` | _自行部署_ | 默认主模型，中文能力优秀 |
| `DeepSeek Coder` | _自行部署_ | 适合代码生成、大批量编程场景 |
| `DeepSeek Math` | _自行部署_ | 数学题、公式推理优化版本 |

---

## ✨ 特性亮点

| 功能 | 描述 |
|------|------|
| 💬 多窗口会话 | 左侧支持多个聊天会话，自动命名、切换、重命名、删除 |
| 📝 Markdown 支持 | 支持加粗、代码块、标题、列表等富文本格式 |
| 🔍 代码高亮 | 内置 `highlight.js` 自动高亮代码块（Python, JS, 等） |
| ✍️ 编辑提问 | 点击用户问题可直接修改并重新生成回答 |
| 📋 一键复制 | 所有回复支持点击快速复制 |
| 🎨 图像生成 | 文本提示生成图像，支持 SDXL 模型 |
| 💾 本地持久化 | 所有聊天记录存储在浏览器本地 `localStorage` |
| 🔁 备用模型容错 | 主模型失败时自动切换到 `LLaMA 3` 继续回应 |

---

## 🌐 在线部署教程（无需本地安装）

> 只需一个 Cloudflare 账号，即可几分钟上线！

### 🪄 第一步：打开编辑器

👉 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)  
点击左侧菜单 **“Workers & Pages” → “Create Application”**  
选择：**“Create Worker”**

### ✏️ 第二步：复制粘贴代码

- 删除编辑器中默认代码
- 将 上面代码中的其中一个全部内容复制支`index.js` 文件里进去

### 🔧 第三步：绑定 AI 模型

点击右上角 Settings → 添加绑定项：

```
Binding name: AI
```

### 🚀 第四步：部署

点击右上角 **"Save and Deploy"**  
部署完成后获得访问链接，例如：

```
https://your-app-name.your-subdomain.workers.dev
```

---

## 🛠 本地部署指南（推荐开发者使用）

### 1️⃣ 克隆仓库

```bash
git clone https://github.com/yourname/Cloudflare-Workers-AI.git
cd Cloudflare-Workers-AI
```

### 2️⃣ 安装 & 初始化 Wrangler

```bash
npm install -g wrangler
wrangler init
```

### 3️⃣ 设置 `wrangler.toml`

```toml
name = "deepseek-chat"
type = "javascript"

[ai]
binding = "AI"

[[routes]]
pattern = "your-subdomain.example.workers.dev"
custom_domain = true
```

### 4️⃣ 启动本地预览

```bash
wrangler dev
```

---

## 🤖 模型说明（Cloudflare AI）

| 模型 | 说明 |
|------|------|
| `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | 默认主模型，支持中文、对话、代码、推理 |
| `@cf/deepseek-ai/deepseek-coder-6.7b-instruct-awq` | 编程能力强，适合代码生成 |
| `@cf/deepseek-ai/deepseek-math-7b-instruct` | 数学领域优化，适合题解、公式分析 |
| `@cf/qwen/qwen1.5-14b-chat-awq` | 支持中英对话、自然语言任务 |
| `@cf/meta/llama-3-8b-instruct` | LLaMA 备用容错模型 |

---

## 📦 项目结构

```bash
📁 Cloudflare-Workers-AI/
├── deepseek-qwen.js           # 使用 DeepSeek-R1-Distill-Qwen-32B 的版本
├── qwen-14b.js                # 使用 Qwen1.5-14B 的版本
├── mistral-7b-instruct-v0.1.js          # 使用 mistral-7b-instruct-v0.1 模型
├── README.md                  # 项目说明文档
```

---

## 📚 TODO（开发中）

- [ ] 💾 聊天记录导出 / 导入（JSON 结构）
- [ ] 🔁 多模型实时切换（下拉菜单）
- [ ] 📱 移动端适配优化（响应式 UI）
- [ ] 🎤 支持语音输入（Web Speech API）
- [ ] 🧠 Prompt 模板预设（“写代码”、“生成图像”等）
- [ ] 🛠 模块拆分（HTML / JS / CSS 单独分离）

---

## 📝 License

[MIT License](LICENSE)

---

## 🙋‍♂️ 联系我 / 贡献

欢迎提交 Issue、PR 或点 ⭐ 支持！  
如需定制、协作，欢迎联系我。
