export default {
    async fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);

        // DeepSeek-Qwen 聊天接口
// 这段代码需要替换原来的fetch处理部分

// DeepSeek-Qwen 聊天接口
if (request.method === 'POST' && pathname === '/api/chat') {
    try {
        const requestBody = await request.json();
        const { messages } = requestBody;

        console.log(`聊天请求: 消息数量 ${messages.length}`);

        try {
            // 使用 DeepSeek-Qwen 模型
            const response = await env.AI.run(
                '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
                {
                    messages: messages,
                    max_tokens: 1024, // 根据需要调整
                }
            );

            console.log('DeepSeek-Qwen 模型响应成功:', response);
            
            // 检查响应格式并确保它包含内容
            let formattedResponse;
            
            if (typeof response === 'string') {
                formattedResponse = { content: response };
            } else if (response && response.response) {
                formattedResponse = { content: response.response };
            } else if (response && response.content) {
                formattedResponse = { content: response.content };
            } else if (response && typeof response === 'object') {
                // 如果是对象但没有预期的字段，尝试将其转换为可用内容
                if (response.usage && !response.content && !response.response) {
                    // 只有usage字段，这是不完整的响应
                    formattedResponse = { 
                        content: "资源限制中，请稍等3秒再试。",
                        error: "获取到不完整的API响应"
                    };
                } else {
                    // 保持原样，但添加默认content以防
                    formattedResponse = {
                        ...response,
                        content: response.content || response.response || JSON.stringify(response)
                    };
                }
            } else {
                // 兜底，确保有内容返回
                formattedResponse = { 
                    content: "收到了未知格式的响应",
                    error: "响应格式异常" 
                };
            }
            
            return Response.json({ response: formattedResponse });
        } catch (error) {
            console.error('DeepSeek-Qwen 模型调用失败:', error);

            // 备用：使用 Llama 模型
            console.log('使用备用 Llama 模型');
            try {
                const backupResponse = await env.AI.run(
                    '@cf/meta/llama-3-8b-instruct',
                    {
                        messages: messages,
                    }
                );

                console.log('备用模型响应成功');
                
                // 同样确保备用模型响应的格式也是正确的
                let formattedBackupResponse;
                
                if (typeof backupResponse === 'string') {
                    formattedBackupResponse = { content: backupResponse };
                } else if (backupResponse && backupResponse.response) {
                    formattedBackupResponse = { content: backupResponse.response };
                } else if (backupResponse && backupResponse.content) {
                    formattedBackupResponse = { content: backupResponse.content };
                } else {
                    formattedBackupResponse = { 
                        content: "备用模型返回了未知格式的响应",
                        error: "备用响应格式异常"
                    };
                }
                
                return Response.json({
                    response: formattedBackupResponse,
                    usedBackupModel: true,
                });
            } catch (backupError) {
                console.error('备用模型也失败了:', backupError);
                return Response.json({
                    error: "主模型和备用模型都失败了",
                    response: { content: "抱歉，AI助手暂时无法为您提供服务，请稍后再试。" }
                });
            }
        }
    } catch (e) {
        console.error('聊天错误:', e);
        return new Response(JSON.stringify({ 
            error: e.message,
            response: { content: "处理请求时发生错误，请稍后再试。" }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
        // 图像生成接口
        if (request.method === 'POST' && pathname === '/api/genimg') {
            try {
                const { prompt } = await request.json();
                console.log(`图像生成请求: "${prompt}"`);

                const encodedPrompt = encodeURIComponent(prompt);
                return Response.json({
                    success: true,
                    imageUrl: `/get-image?prompt=${encodedPrompt}`
                });
            } catch (e) {
                console.error('图像请求处理错误:', e);
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // 图像获取接口
        if (request.method === 'GET' && pathname === '/get-image') {
            try {
                const url = new URL(request.url);
                const prompt = decodeURIComponent(url.searchParams.get('prompt') || '');

                if (!prompt) {
                    return new Response('缺少prompt参数', { status: 400 });
                }

                console.log(`图像生成: "${prompt}"`);

                try {
                    const result = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
                        prompt: prompt
                    });

                    const imageData = Array.isArray(result) && result.length > 0 ? result[0] : result;

                    if (imageData) {
                        console.log('成功生成图像');
                        return new Response(imageData, {
                            headers: { 'Content-Type': 'image/png' }
                        });
                    } else {
                        throw new Error('模型未返回图像数据');
                    }
                } catch (e) {
                    console.error('图像生成错误:', e);
                    return new Response('图像生成失败: ' + e.message, { status: 500 });
                }
            } catch (e) {
                console.error('图像请求处理错误:', e);
                return new Response('图像生成失败: ' + e.message, { status: 500 });
            }
        }

        // HTML 页面
        return new Response(getHtml(), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
};

function getHtml() {
    return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DeepSeek-Qwen 聊天助手</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <style>
        /* 基础样式 */
        body {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f6f8fa;
            color: #333;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        .header {
            padding: 15px 20px;
            background-color: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .header-title {
            display: flex;
            align-items: center;
        }

        .header h1 {
            margin: 0;
            color: #165dff;
            font-size: 24px;
        }

        .model-badge {
            display: inline-block;
            font-size: 12px;
            background-color: #165dff;
            color: white;
            padding: 3px 8px;
            border-radius: 20px;
            margin-left: 10px;
            vertical-align: middle;
        }

        .header-actions {
            display: flex;
            align-items: center;
        }

        .settings-btn {
            background: none;
            border: none;
            color: #165dff;
            font-size: 18px;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .settings-btn:hover {
            background-color: #e8f3ff;
        }

        /* 布局 */
        .main-content {
            display: flex;
            flex: 1;
            position: relative;
        }

        /* 侧边栏 */
        .sidebar {
            width: 250px;
            background-color: #ffffff;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
            padding: 15px;
            height: calc(100vh - 60px);
            overflow-y: auto;
            position: absolute;
            left: -270px;
            top: 0;
            bottom: 0;
            transition: left 0.3s ease;
            z-index: 90;
        }

        .sidebar.visible {
            left: 0;
        }

        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 80;
        }

        .sidebar-overlay.visible {
            display: block;
        }

        .new-window-btn {
            background-color: #165dff;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            width: 100%;
            cursor: pointer;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .new-window-btn i {
            margin-right: 8px;
        }

        .new-window-btn:hover {
            background-color: #1453e6;
        }

        .window-item {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 5px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #f2f3f5;
            transition: background-color 0.2s;
        }

        .window-item:hover {
            background-color: #e8f3ff;
        }

        .window-item.active {
            background-color: #e8f3ff;
            border-left: 3px solid #165dff;
        }

        .window-item-title {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .window-item-actions {
            display: flex;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .window-item:hover .window-item-actions {
            opacity: 1;
        }

        .window-action-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #606266;
            padding: 2px 5px;
            margin-left: 2px;
            border-radius: 4px;
        }

        .window-action-btn:hover {
            background-color: #e0e0e0;
        }

        /* 聊天容器 */
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            flex: 1;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        .chat-box {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            max-height: 70vh;
        }

        .message {
            display: flex;
            margin-bottom: 16px;
            position: relative;
        }

        .message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 12px;
            flex-shrink: 0;
            font-size: 18px;
        }

        .user-avatar {
            background-color: #165dff;
            color: white;
        }

        .ai-avatar {
            background-color: #00b578;
            color: white;
        }

        .message-content {
            background-color: #f2f3f5;
            padding: 12px 16px;
            border-radius: 6px;
            max-width: 85%;
            line-height: 1.5;
        }

        .user-message .message-content {
            background-color: #e8f3ff;
        }

        .ai-message .message-content {
            background-color: #f2f3f5;
        }

        .backup-model .message-content::after {
            content: "Llama";
            position: absolute;
            top: -5px;
            right: 0;
            font-size: 10px;
            background: #ff7d00;
            color: white;
            padding: 2px 5px;
            border-radius: 10px;
        }

        .message-actions {
            position: absolute;
            top: 0;
            right: 0;
            display: none;
        }

        .message:hover .message-actions {
            display: block;
        }

        .message-actions button {
            background: none;
            border: none;
            cursor: pointer;
            margin-left: 5px;
            color: #909399;
            transition: color 0.2s;
        }

        .message-actions button:hover {
            color: #165dff;
        }

        .message-content pre code {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }

        /* 输入区域 */
        .input-area {
            display: flex;
            flex-direction: column;
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .input-box {
            display: flex;
            position: relative;
        }

        .input-field {
            flex: 1;
            padding: 12px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            font-size: 14px;
            resize: none;
            min-height: 40px;
            max-height: 120px;
            overflow-y: auto;
            transition: border-color 0.2s;
        }

        .input-field:focus {
            outline: none;
            border-color: #165dff;
        }

        .btn-area {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }

        .action-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .send-btn {
            background-color: #165dff;
            color: white;
        }

        .send-btn:hover {
            background-color: #1453e6;
        }

        .clear-btn {
            background-color: #f2f3f5;
            color: #606266;
        }

        .clear-btn:hover {
            background-color: #e6e8eb;
        }

        /* 思考中动画 */
        .thinking {
            display: flex;
            padding: 10px;
            background-color: #f2f3f5;
            border-radius: 6px;
        }

        .thinking-dot {
            height: 8px;
            width: 8px;
            margin: 0 2px;
            background-color: #999;
            border-radius: 50%;
            animation: thinking 1.4s infinite;
        }

        .thinking-dot:nth-child(1) { animation-delay: 0s; }
        .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes thinking {
            0% { transform: scale(0.8); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.8); opacity: 0.6; }
        }

        /* 图像显示 */
        .image-container {
            text-align: center;
            margin-top: 10px;
        }

        .generated-image {
            max-width: 100%;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* 提示消息 */
        .notice {
            background-color: #e6f7ff;
            border-left: 4px solid #1890ff;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 0 4px 4px 0;
            animation: fadeOut 5s forwards;
            animation-delay: 3s;
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; height: 0; padding: 0; margin: 0; overflow: hidden; }
        }

        /* 编辑相关 */
        .edit-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
        }

        .edit-title-input {
            flex: 1;
            padding: 5px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            font-size: 14px;
            max-width: 160px;
        }

        /* 首次加载提示 */
        .welcome {
            text-align: center;
            padding: 20px;
            color: #606266;
        }

        .welcome h2 {
            color: #165dff;
            margin-bottom: 10px;
        }

        .welcome p {
            margin-bottom: 20px;
        }

        .examples {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 20px;
        }

        .example-item {
            background-color: #f2f3f5;
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .example-item:hover {
            background-color: #e8f3ff;
        }

        .footer {
            text-align: center;
            padding: 10px;
            color: #909399;
            font-size: 12px;
            margin-top: 20px;
        }

        /* 响应式调整 */
        @media (min-width: 992px) {
            .sidebar {
                position: relative;
                left: 0;
                height: calc(100vh - 60px);
                transition: width 0.3s ease;
            }

            .settings-btn {
                display: none;
            }

            .sidebar-overlay {
                display: none !important;
            }
        }

        /* 弹出框样式 */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            width: 80%;
            max-width: 500px;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .modal-title {
            font-size: 18px;
            font-weight: bold;
            color: #303133;
        }

        .modal-close {
            cursor: pointer;
            font-size: 20px;
            color: #909399;
        }

        .modal-body {
            margin-bottom: 20px;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
        }

        .modal-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        }

        .modal-btn-cancel {
            background-color: #f2f3f5;
            color: #606266;
        }

        .modal-btn-confirm {
            background-color: #165dff;
            color: white;
        }
        
        /* 错误消息样式 */
        .error-message {
            background-color: #fff2f0;
            border-left: 4px solid #ff4d4f;
            color: #ff4d4f;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 0 4px 4px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title">
            <h1>DeepSeek-Qwen 聊天助手 <span class="model-badge">32B 参数</span></h1>
        </div>
        <div class="header-actions">
            <button class="settings-btn" id="settingsBtn">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </div>

    <div class="main-content">
        <div class="sidebar" id="sidebar">
            <button class="new-window-btn" id="newWindowBtn">
                <i class="fas fa-plus"></i> 新建聊天
            </button>
            <div id="windowList"></div>
        </div>

        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <div class="chat-container">
            <div class="container">
                <div class="chat-box" id="chatBox">
                    <div class="welcome" id="welcome">
                        <h2>欢迎使用 DeepSeek-Qwen 聊天助手</h2>
                        <p>有什么可以帮助您的？</p>
                        <div class="examples">
                            <div class="example-item" data-prompt="介绍量子计算的基本原理">介绍量子计算的基本原理</div>
                            <div class="example-item" data-prompt="写一首描写春天的古诗">写一首描写春天的古诗</div>
                            <div class="example-item" data-prompt="解释人工智能中的注意力机制">解释人工智能中的注意力机制</div>
                            <div class="example-item" data-prompt="生成一张宇航员在太空中的图像">生成一张宇航员在太空中的图像</div>
                        </div>
                    </div>
                </div>

                <div class="input-area">
                    <div class="input-box">
                        <textarea class="input-field" id="promptInput" placeholder="输入消息..." rows="1"></textarea>
                    </div>
                    <div class="btn-area">
                        <button class="action-btn clear-btn" id="clearBtn">清空对话</button>
                        <button class="action-btn send-btn" id="sendBtn">发送</button>
                    </div>
                </div>
            </div>

            <div class="footer">
                Powered by Cloudflare Workers AI + DeepSeek-R1-Distill-Qwen-32B
            </div>
        </div>
    </div>

    <div class="modal" id="editTitleModal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">编辑聊天窗口标题</div>
                <span class="modal-close" id="closeTitleModal">&times;</span>
            </div>
            <div class="modal-body">
                <input type="text" id="titleInput" class="edit-input" placeholder="输入新标题">
                <input type="hidden" id="currentWindowIdForEdit">
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-cancel" id="cancelEditTitle">取消</button>
                <button class="modal-btn modal-btn-confirm" id="confirmEditTitle">确定</button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>
        // 全局变量
        let chatWindows = [];
        let currentWindowId = null;

        // DOM元素引用
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const settingsBtn = document.getElementById('settingsBtn');
        const windowList = document.getElementById('windowList');
        const newWindowBtn = document.getElementById('newWindowBtn');
        const chatBox = document.getElementById('chatBox');
        const welcome = document.getElementById('welcome');
        const promptInput = document.getElementById('promptInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clearBtn');

        // 标题编辑相关
        const editTitleModal = document.getElementById('editTitleModal');
        const titleInput = document.getElementById('titleInput');
        const currentWindowIdForEdit = document.getElementById('currentWindowIdForEdit');
        const confirmEditTitle = document.getElementById('confirmEditTitle');
        const cancelEditTitle = document.getElementById('cancelEditTitle');
        const closeTitleModal = document.getElementById('closeTitleModal');

        // 自动调整文本框高度
        function adjustTextareaHeight() {
            promptInput.style.height = 'auto';
            promptInput.style.height = (promptInput.scrollHeight) + 'px';
        }

        // 侧边栏切换
        function toggleSidebar() {
            sidebar.classList.toggle('visible');
            sidebarOverlay.classList.toggle('visible');
        }

        // 关闭侧边栏
        function closeSidebar() {
            sidebar.classList.remove('visible');
            sidebarOverlay.classList.remove('visible');
        }

        // 打开编辑标题模态框
        function openEditTitleModal(windowId, currentTitle) {
            titleInput.value = currentTitle || '';
            currentWindowIdForEdit.value = windowId;
            editTitleModal.style.display = 'block';
            titleInput.focus();
        }

        // 关闭编辑标题模态框
        function closeEditTitleModal() {
            editTitleModal.style.display = 'none';
        }

        // 初始化函数
        function init() {
            // 加载聊天窗口
            loadChatWindows();

            // 设置事件监听
            promptInput.addEventListener('input', adjustTextareaHeight);

            promptInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            sendBtn.addEventListener('click', sendMessage);
            clearBtn.addEventListener('click', clearChatHistory);
            newWindowBtn.addEventListener('click', function () { createNewWindow(); });

            // 侧边栏切换
            settingsBtn.addEventListener('click', toggleSidebar);
            sidebarOverlay.addEventListener('click', closeSidebar);

            // 标题编辑模态框
            confirmEditTitle.addEventListener('click', saveWindowTitle);
            cancelEditTitle.addEventListener('click', closeEditTitleModal);
            closeTitleModal.addEventListener('click', closeEditTitleModal);

            // 标题编辑模态框的Enter键监听
            titleInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    saveWindowTitle();
                }
            });

            // 示例提示点击
            document.querySelectorAll('.example-item').forEach(function (item) {
                item.addEventListener('click', function () {
                    promptInput.value = this.getAttribute('data-prompt');
                    adjustTextareaHeight();
                    sendMessage();
                });
            });

            // 检查是否有窗口，没有则创建一个
            if (chatWindows.length === 0) {
                createNewWindow('新聊天');
            } else if (currentWindowId) {
                switchWindow(currentWindowId);
            } else {
                switchWindow(chatWindows[0].id);
            }
        }

        // 创建新窗口
        function createNewWindow(title) {
            const windowId = Date.now().toString();
            const newWindow = {
                id: windowId,
                title: title || '新聊天',
                history: [
                    { role: 'system', content: '你是一个专业、有帮助的AI助手。请用中文回答问题，回答应该尽量简洁明了。' }
                ]
            };

            chatWindows.push(newWindow);
            saveChatWindows();
            renderWindowList();
            switchWindow(windowId);

            // 关闭侧边栏（仅在移动设备上）
            if (window.innerWidth < 992) {
                closeSidebar();
            }
        }

        // 删除窗口
        function deleteWindow(windowId, event) {
            if (event) {
                event.stopPropagation();
            }

            if (confirm('确定要删除此聊天窗口吗？')) {
                chatWindows = chatWindows.filter(w => w.id !== windowId);
                localStorage.removeItem("chat_window_" + windowId);
                saveChatWindows();
                renderWindowList();

                if (currentWindowId === windowId) {
                    if (chatWindows.length > 0) {
                        switchWindow(chatWindows[0].id);
                    } else {
                        currentWindowId = null;
                        chatBox.innerHTML = '';
                        welcome.style.display = '';
                        chatBox.appendChild(welcome);
                        createNewWindow('新聊天');
                    }
                }
            }
        }

        // 编辑窗口标题
        function editWindowTitle(windowId, event) {
            if (event) {
                event.stopPropagation();
            }

            const currentWindow = chatWindows.find(w => w.id === windowId);
            if (currentWindow) {
                openEditTitleModal(windowId, currentWindow.title);
            }
        }

// 保存窗口标题
        function saveWindowTitle() {
            const windowId = currentWindowIdForEdit.value;
            const newTitle = titleInput.value.trim();

            if (newTitle) {
                const currentWindow = chatWindows.find(w => w.id === windowId);
                if (currentWindow) {
                    currentWindow.title = newTitle;
                    saveChatWindows();
                    renderWindowList();
                    closeEditTitleModal();
                }
            }
        }

        // 切换窗口
        function switchWindow(windowId) {
            currentWindowId = windowId;
            renderWindowList();
            loadChatHistory();
        }

        // 加载聊天窗口
        function loadChatWindows() {
            try {
                const saved = localStorage.getItem('chat_windows');
                if (saved) {
                    chatWindows = JSON.parse(saved);
                }
            } catch (e) {
                console.error('加载聊天窗口失败:', e);
            }
        }

        // 保存聊天窗口
        function saveChatWindows() {
            try {
                localStorage.setItem('chat_windows', JSON.stringify(chatWindows));
            } catch (e) {
                console.error('保存聊天窗口失败:', e);
            }
        }

        // 渲染窗口列表
        function renderWindowList() {
            windowList.innerHTML = '';
            chatWindows.forEach(window => {
                const windowItem = document.createElement('div');
                windowItem.className = 'window-item';
                if (window.id === currentWindowId) {
                    windowItem.classList.add('active');
                }

                const titleSpan = document.createElement('span');
                titleSpan.className = 'window-item-title';
                titleSpan.textContent = window.title;

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'window-item-actions';

                const editBtn = document.createElement('button');
                editBtn.className = 'window-action-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.title = "编辑标题";
                editBtn.addEventListener('click', function (e) {
                    editWindowTitle(window.id, e);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'window-action-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.title = "删除窗口";
                deleteBtn.addEventListener('click', function (e) {
                    deleteWindow(window.id, e);
                });

                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(deleteBtn);

                windowItem.appendChild(titleSpan);
                windowItem.appendChild(actionsDiv);
                
                windowItem.addEventListener('click', function() {
                    switchWindow(window.id);
                    // 关闭侧边栏（仅在移动设备上）
                    if (window.innerWidth < 992) {
                        closeSidebar();
                    }
                });

                windowList.appendChild(windowItem);
            });
        }

        // 加载聊天历史
        function loadChatHistory() {
            if (!currentWindowId) return;
            
            try {
                const saved = localStorage.getItem("chat_window_" + currentWindowId);
                if (saved) {
                    const windowData = JSON.parse(saved);
                    const currentWindow = chatWindows.find(w => w.id === currentWindowId);
                    if (currentWindow) {
                        currentWindow.history = windowData.history || [];
                    }
                    
                    // 清空聊天框
                    chatBox.innerHTML = '';
                    
                    // 隐藏欢迎信息
                    if (currentWindow.history.length > 1) {
                        welcome.style.display = 'none';
                    } else {
                        welcome.style.display = '';
                        chatBox.appendChild(welcome);
                    }
                    
                    // 渲染已保存的消息
                    currentWindow.history.forEach((msg, index) => {
                        if (msg.role !== 'system') {
                            addMessage(msg.role, msg.content, msg.usedBackupModel, index);
                        }
                    });
                    
                    // 滚动到底部
                    chatBox.scrollTop = chatBox.scrollHeight;
                } else {
                    // 如果没有保存过，则显示欢迎信息
                    chatBox.innerHTML = '';
                    welcome.style.display = '';
                    chatBox.appendChild(welcome);
                }
            } catch (e) {
                console.error('加载聊天历史失败:', e);
                showNotice('加载聊天历史失败: ' + e.message);
            }
        }

        // 保存聊天历史
        function saveChatHistory() {
            if (!currentWindowId) return;
            
            try {
                const currentWindow = chatWindows.find(w => w.id === currentWindowId);
                if (currentWindow) {
                    localStorage.setItem("chat_window_" + currentWindowId, JSON.stringify({
                        history: currentWindow.history
                    }));
                }
            } catch (e) {
                console.error('保存聊天历史失败:', e);
                showNotice('保存聊天历史失败: ' + e.message);
            }
        }

        // 发送消息
        function sendMessage() {
            const message = promptInput.value.trim();
            if (!message) return;
            
            // 如果是第一次聊天，需要创建一个窗口
            if (!currentWindowId || chatWindows.length === 0) {
                createNewWindow('新聊天');
            }
            
            // 隐藏欢迎信息
            if (welcome.style.display !== 'none') {
                welcome.style.display = 'none';
            }
            
            // 清空输入框
            promptInput.value = '';
            adjustTextareaHeight();
            
            // 添加用户消息到UI
            addMessage('user', message);
            
            // 添加到聊天历史
            const currentWindow = chatWindows.find(w => w.id === currentWindowId);
            currentWindow.history.push({ role: 'user', content: message });
            
            // 检测是否是图像生成请求
            const isImageRequest = message.toLowerCase().includes('图像') || 
                                message.toLowerCase().includes('图片') || 
                                message.toLowerCase().includes('生成图');
            
            if (isImageRequest) {
                handleImageGeneration(message);
            } else {
                handleChatMessage();
            }
            
            // 保存聊天历史
            saveChatHistory();
            
            // 自动重命名窗口 - 使用第一个问题作为标题
            if (currentWindow.history.length === 2 && currentWindow.history[0].role === 'system' && currentWindow.history[1].role === 'user') {
                // 提取前10个字符作为标题，如果问题不足10个字符则全部使用
                let newTitle = message.length > 10 ? message.substring(0, 10) + "..." : message;
                currentWindow.title = newTitle;
                saveChatWindows();
                renderWindowList();
            }
        }

 // 这段代码需要替换原来的 handleChatMessage 函数

// 处理聊天消息
function handleChatMessage() {
    // 添加思考中动画
    const thinkingElement = addThinkingAnimation();
    
    // 准备发送的消息数组 - 只发送需要的消息历史
    const currentWindow = chatWindows.find(w => w.id === currentWindowId);
    const messagesToSend = currentWindow.history.slice(); // 复制一份历史记录
    
    // 调用API
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: messagesToSend })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        // 移除思考中动画
        if (thinkingElement && thinkingElement.parentNode) {
            thinkingElement.parentNode.removeChild(thinkingElement);
        }
        
        let reply = '';
        const usedBackupModel = data.usedBackupModel;
        
        console.log("API返回数据:", data); // 调试用
        
        // 从响应中提取文本回复
        if (data.response) {
            if (typeof data.response === 'string') {
                reply = data.response;
            } else if (data.response.response) {
                reply = data.response.response;
            } else if (data.response.content) {
                reply = data.response.content;
            } else if (typeof data.response === 'object') {
                // 检查是否包含usage字段 - 这表示可能是错误的响应格式
                if (data.response.usage) {
                    reply = "抱歉，AI助手暂时无法回答。请稍后再试。";
                    console.error("API返回了usage统计而非回复内容");
                } else {
                    // 尝试将整个对象转为字符串
                    try {
                        reply = JSON.stringify(data.response);
                    } catch (e) {
                        reply = "收到了无法解析的响应";
                    }
                }
            }
        } else if (data.content) {
            // 有些API直接返回content字段
            reply = data.content;
        } else if (data.error) {
            reply = '错误: ' + data.error;
        } else if (data.usage) {
            // 直接返回了usage统计
            reply = "抱歉，AI助手暂时无法回答。请稍后再试。";
            console.error("API直接返回了usage统计而非回复内容");
        } else {
            reply = '收到了未知格式的响应';
            console.error("未知响应格式:", data);
        }
        
        // 如果响应为空，显示错误
        if (!reply || reply.trim() === '') {
            reply = '抱歉，我暂时无法回答这个问题。';
        }
        
        // 添加AI回复到UI
        addMessage('ai', reply, usedBackupModel);
        
        // 添加到聊天历史
        currentWindow.history.push({ role: 'assistant', content: reply, usedBackupModel: usedBackupModel });
        
        // 保存聊天历史
        saveChatHistory();
    })
    .catch(function(error) {
        // 移除思考中动画
        if (thinkingElement && thinkingElement.parentNode) {
            thinkingElement.parentNode.removeChild(thinkingElement);
        }
        
        // 显示错误
        const errorMsg = '请求出错: ' + error.message;
        addMessage('ai', errorMsg);
        
        // 记录到控制台
        console.error('API调用错误:', error);
        
        // 可以选择是否添加错误消息到历史记录
        // const currentWindow = chatWindows.find(w => w.id === currentWindowId);
        // currentWindow.history.push({ role: 'assistant', content: errorMsg });
        // saveChatHistory();
    });
}
        // 处理图像生成
        function handleImageGeneration(prompt) {
            // 提取图像描述
            let imagePrompt = prompt;
            const prefixes = ['生成一张', '生成一个', '画一张', '画一个', '创建一张', '创建一个', '生成图像:', '生成图片:'];
            
            for (let i = 0; i < prefixes.length; i++) {
                if (prompt.includes(prefixes[i])) {
                    imagePrompt = prompt.split(prefixes[i])[1].trim();
                    break;
                }
            }
            
            // 添加思考中动画
            const thinkingElement = addThinkingAnimation();
            
            // 调用API
            fetch('/api/genimg', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: imagePrompt })
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // 移除思考中动画
                if (thinkingElement && thinkingElement.parentNode) {
                    thinkingElement.parentNode.removeChild(thinkingElement);
                }
                
                if (data.success && data.imageUrl) {
                    // 添加时间戳避免缓存
                    const timestamp = new Date().getTime();
                    const imageUrl = data.imageUrl + '&t=' + timestamp;
                    
                    // 添加图像到UI
                    addImageToUI(imageUrl, imagePrompt);
                    
                    // 添加到聊天历史
                    const currentWindow = chatWindows.find(w => w.id === currentWindowId);
                    currentWindow.history.push({ 
                        role: 'assistant', 
                        content: '我已根据您的提示 "' + prompt + '" 生成了一张图像。',
                        imageUrl: imageUrl
                    });
                    
                    // 保存聊天历史
                    saveChatHistory();
                } else {
                    addMessage('ai', '图像生成失败: ' + (data.error || '未知错误'));
                }
            })
            .catch(function(error) {
                // 移除思考中动画
                if (thinkingElement && thinkingElement.parentNode) {
                    thinkingElement.parentNode.removeChild(thinkingElement);
                }
                
                // 显示错误
                addMessage('ai', '图像生成请求失败: ' + error.message);
                
                console.error('图像生成错误:', error);
            });
        }

        // 添加消息到UI
        function addMessage(role, content, usedBackupModel, index) {
            try {
                // 创建消息容器
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + role + '-message';
                
                // 如果使用了备用模型，添加标记
                if (usedBackupModel) {
                    messageDiv.classList.add('backup-model');
                }
                
                // 创建头像容器
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'message-avatar ' + role + '-avatar';
                avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
                
                // 创建消息内容容器
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                
                // 将 Markdown 转换为 HTML (只对AI消息)
                if (role === 'ai') {
                    contentDiv.innerHTML = marked.parse(content);
                    // 代码高亮
                    contentDiv.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                } else {
                    contentDiv.textContent = content;
                }
                
                // 创建操作按钮容器
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-actions';
                
                // 添加复制按钮
                const copyBtn = document.createElement('button');
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                copyBtn.title = "复制";
                copyBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText(content).then(function() {
                        showNotice("已复制到剪贴板");
                    });
                });
                actionsDiv.appendChild(copyBtn);
                
                // 如果是用户消息，添加编辑按钮
                if (role === 'user') {
                    const editBtn = document.createElement('button');
                    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                    editBtn.title = "编辑";
                    editBtn.addEventListener('click', function() {
                        editMessage(messageDiv, content, index);
                    });
                    actionsDiv.appendChild(editBtn);
                }
                
                // 将元素添加到消息容器
                messageDiv.appendChild(avatarDiv);
                messageDiv.appendChild(contentDiv);
                messageDiv.appendChild(actionsDiv);
                
                // 将消息容器添加到聊天框
                chatBox.appendChild(messageDiv);
                
                // 滚动到底部
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch (error) {
                console.error('添加消息到 UI 时出错:', error);
                // 在 UI 中显示错误消息
                const errorDiv = document.createElement('div');
                errorDiv.className = 'message error-message';
                errorDiv.textContent = '添加消息时出错，请重试。';
                chatBox.appendChild(errorDiv);
            }
        }
        
        // 添加图像到UI
        function addImageToUI(imageUrl, prompt) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar ai-avatar';
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            const text = document.createElement('p');
            text.textContent = '根据您的提示 "' + prompt + '" 生成的图像:';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = prompt;
            image.className = 'generated-image';
            image.onload = function() {
                chatBox.scrollTop = chatBox.scrollHeight;
            };
            
            imageContainer.appendChild(image);
            messageContent.appendChild(text);
            messageContent.appendChild(imageContainer);
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
            
            chatBox.appendChild(messageDiv);
            
            // 滚动到底部
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        
        // 添加思考中动画
        function addThinkingAnimation() {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar ai-avatar';
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            
            const thinking = document.createElement('div');
            thinking.className = 'thinking';
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.className = 'thinking-dot';
                thinking.appendChild(dot);
            }
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(thinking);
            
            chatBox.appendChild(messageDiv);
            
            // 滚动到底部
            chatBox.scrollTop = chatBox.scrollHeight;
            
            return messageDiv;
        }
        
        // 显示通知
        function showNotice(message) {
            const noticeDiv = document.createElement('div');
            noticeDiv.className = 'notice';
            noticeDiv.textContent = message;
            
            chatBox.insertBefore(noticeDiv, chatBox.firstChild);
            
            // 5秒后自动移除
            setTimeout(function() {
                if (noticeDiv.parentNode) {
                    noticeDiv.parentNode.removeChild(noticeDiv);
                }
            }, 5000);
        }
        
        // 清空聊天历史
        function clearChatHistory() {
            if (confirm('确定要清空所有聊天记录吗？')) {
                const currentWindow = chatWindows.find(w => w.id === currentWindowId);
                if (currentWindow) {
                    currentWindow.history = [
                        { role: 'system', content: '你是一个专业、有帮助的AI助手。请用中文回答问题，回答应该尽量简洁明了。' }
                    ];
                    chatBox.innerHTML = '';
                    saveChatHistory();
                    
                    // 显示欢迎信息
                    welcome.style.display = '';
                    chatBox.appendChild(welcome);
                    
                    showNotice('聊天记录已清空');
                }
            }
        }
        
        // 编辑问题
        function editMessage(messageDiv, content, messageIndex) {
            const input = document.createElement('textarea');
            input.value = content;
            input.className = 'edit-input';
            
            const originalContent = messageDiv.querySelector('.message-content');
            messageDiv.replaceChild(input, originalContent);
            
            const actions = messageDiv.querySelector('.message-actions');
            const originalActions = actions.innerHTML;
            
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '<i class="fas fa-check"></i>';
            saveBtn.title = "保存";
            
            const cancelBtn = document.createElement('button');
            cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
            cancelBtn.title = "取消";
            
            actions.innerHTML = '';
            actions.appendChild(saveBtn);
            actions.appendChild(cancelBtn);
            
            input.focus();
            
            saveBtn.addEventListener('click', function() {
                const newMessage = input.value.trim();
                if (newMessage) {
                    const currentWindow = chatWindows.find(w => w.id === currentWindowId);
                    
                    // 计算实际的历史索引（跳过系统提示消息）
                    let historyIndex = messageIndex;
                    if (historyIndex === undefined) {
                        // 查找消息在历史记录中的位置
                        for (let i = 0; i < currentWindow.history.length; i++) {
                            if (currentWindow.history[i].role === 'user' && currentWindow.history[i].content === content) {
                                historyIndex = i;
                                break;
                            }
                        }
                    }
                    
                    if (historyIndex !== undefined) {
                        // 删除此消息之后的所有消息
                        currentWindow.history = currentWindow.history.slice(0, historyIndex + 1);
                        
                        // 更新编辑后的消息
                        currentWindow.history[historyIndex].content = newMessage;
                        
                        // 保存并重新加载
                        saveChatHistory();
                        loadChatHistory();
                        
                        // 重新发送消息获取回复
                        handleChatMessage();
                    }
                }
            });
            
            cancelBtn.addEventListener('click', function() {
                // 恢复原始内容和按钮
                const newContentDiv = document.createElement('div');
                newContentDiv.className = 'message-content';
                newContentDiv.textContent = content;
                
                messageDiv.replaceChild(newContentDiv, input);
                actions.innerHTML = originalActions;
            });
        }
        
        // 响应式处理
        function handleResponsive() {
            if (window.innerWidth >= 992) {
                sidebar.classList.remove('visible');
                sidebarOverlay.classList.remove('visible');
            }
        }
        
        // 添加窗口大小变化监听
        window.addEventListener('resize', handleResponsive);
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            init();
        });
    </script>
</body>
</html>`;
}
