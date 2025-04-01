# Cloudflare-Workers-AI
Cloudflare-Workers-AI 三个文件是三个不同的模型。
# 🧠 DeepSeek Qwen 聊天助手（Cloudflare Workers）

这是一个基于 [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) 搭建的多窗口聊天助手，集成了 **DeepSeek-R1-Distill-Qwen-32B** 作为主要语言模型，同时具备：

- ✅ 多会话支持（类似 ChatGPT 左侧聊天窗口）
- ✅ 聊天历史保存在浏览器 `localStorage`
- ✅ 支持 Markdown / 代码高亮（`marked.js` + `highlight.js`）
- ✅ 编辑用户提问内容，自动重发请求
- ✅ 一键复制回复内容
- ✅ 图像生成（Stable Diffusion）
- ✅ 使用备用模型自动容错（LLaMA 3）

---

## 🌐 在线演示

> 部署到 Cloudflare Workers 后直接访问你绑定的域名即可体验。  演示是qwen1.5-14b-chat-awq模型
> 示例地址：[https://calm-lake-75ac.ndjswww2023.workers.dev/](https://calm-lake-75ac.ndjswww2023.workers.dev/)

---

## 🛠 使用方法

### 1. 克隆仓库

```bash
git clone https://github.com/yourname/deepseek-chat-ui.git
cd deepseek-chat-ui
2. 部署到 Cloudflare Workers
使用 wrangler
bash
复制
编辑
npm install -g wrangler
wrangler init
然后将 src/index.js 替换为你的主 Worker 文件内容。

在 wrangler.toml 中设置：

toml
复制
编辑
name = "deepseek-chat"
type = "javascript"

[ai]
binding = "AI"

[[routes]]
pattern = "your-subdomain.example.workers.dev"
custom_domain = true
3. 本地预览
bash
复制
编辑
wrangler dev
🤖 模型说明
默认主模型：

@cf/deepseek-ai/deepseek-r1-distill-qwen-32b
优质中文支持 + 指令对话能力

备用模型：

@cf/meta/llama-3-8b-instruct

你可以根据需要切换或加入其他模型，如：

deepseek-coder-6.7b-instruct-awq（适合批量代码场景）

deepseek-math-7b-instruct（数学场景）

✨ 功能特性
功能	描述
💬 多会话聊天	支持多个窗口切换、重命名、删除
📝 Markdown 支持	支持 **加粗**、代码块、列表等格式
🔍 代码高亮	自动识别代码块语言并高亮（Python、JavaScript 等）
✍️ 编辑提问	可修改已发送的问题并重新生成回答
📋 一键复制	点击按钮快速复制内容
🎨 图像生成	支持自然语言生成图像（调用 Stable Diffusion）
💾 本地持久化	所有对话保存在浏览器中（localStorage）
📦 文件结构
csharp
复制
编辑
📁 your-repo/
├── index.js             # Cloudflare Worker 主文件
├── README.md            # 项目说明文档
└── public/              # 你可以放置资源或分离 HTML/CSS
🚀 Todo（开发中）
 导出 / 导入聊天记录

 多模型切换（Qwen、Coder、Math）

 移动端适配优化

 支持语音输入（Web Speech API）

📝 License
MIT License

🙋‍♂️ 联系我 / 贡献
欢迎提 Issue、PR 或点个 ⭐！


