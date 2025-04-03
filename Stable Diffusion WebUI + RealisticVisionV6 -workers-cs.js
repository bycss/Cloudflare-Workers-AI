export default {
  async fetch(request) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>快速 AI 图像生成器</title>
</head>
<body style="font-family:sans-serif;padding:20px;max-width:700px;margin:auto;">
  <h2>🧠 快速 AI 图像生成器</h2>

  <label>📝 提示词：</label><br>
  <textarea id="prompt" rows="3" style="width:100%;">a beautiful woman sitting on a bed, cinematic soft lighting, ultra realistic, photo-realistic, soft skin, natural pose, candid shot, perfect face, realistic lighting, 4k, cinematic, smooth skin</textarea><br><br>

  <div style="display:flex;gap:10px;margin-bottom:15px;">
    <div>
      <label for="steps">采样步数:</label>
      <select id="steps">
        <option value="20">20 (最快)</option>
        <option value="25" selected>25 (推荐)</option>
        <option value="30">30 (高质量)</option>
        <option value="40">40 (最高质量)</option>
      </select>
    </div>
    
    <div>
      <label for="sampler">采样器:</label>
      <select id="sampler">
        <option value="Euler a">Euler a (快速)</option>
        <option value="DPM++ 2M" selected>DPM++ 2M (平衡)</option>
        <option value="DPM++ SDE Karras">DPM++ SDE Karras (高质量)</option>
      </select>
    </div>
    
    <div>
      <label for="size">尺寸:</label>
      <select id="size">
        <option value="1" selected>512×512 (方形)</option>
        <option value="2">512×768 (竖屏)</option>
        <option value="3">768×512 (横屏)</option>
      </select>
    </div>
  </div>

  <button id="go" style="padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">🎨 生成图片</button>

  <div id="result" style="margin-top:20px;"></div>

  <script>
    async function generate() {
      let prompt = document.getElementById('prompt').value.trim();
      const resultDiv = document.getElementById('result');
      const steps = document.getElementById('steps').value;
      const sampler = document.getElementById('sampler').value;
      const sizeOption = document.getElementById('size').value;
      
      // 自动添加高质量描述词
      const qualityPrompt = " 4k, cinematic, smooth skin";
      if (!prompt.includes(qualityPrompt)) {
        prompt = prompt + ", " + qualityPrompt;
      }
      
      let width = 512;
      let height = 512;
      
      if (sizeOption === "2") {
        width = 512;
        height = 768;
      } else if (sizeOption === "3") {
        width = 768;
        height = 512;
      }
      
      resultDiv.innerHTML = '<div style="text-align:center;padding:20px;">生成中，请稍等...</div>';

      const payload = {
        prompt: prompt,
        steps: parseInt(steps),
        sampler_name: sampler,
        width: width,
        height: height,
        cfg_scale: 7,
        restore_faces: false,
        enable_hr: false,
        negative_prompt: "ugly, blurry, low quality"
      };

      try {
        const res = await fetch("https://7gfqa7w8bh3mup-7860.proxy.runpod.net/sdapi/v1/txt2img", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error("API返回错误: " + res.status);
        }

        const data = await res.json();
        
        if (!data.images || data.images.length === 0) {
          throw new Error("没有生成图像");
        }
        
        const img = data.images[0];
        const url = "data:image/png;base64," + img;

        resultDiv.innerHTML = 
          '<div style="text-align:center;">' +
          '<img src="' + url + '" style="max-width:100%;border:1px solid #ccc;"><br><br>' +
          '<a href="' + url + '" download="ai-image.png" style="padding:8px 15px;background:#2196F3;color:white;text-decoration:none;border-radius:4px;">📥 下载图片</a>' +
          '</div>';
          
      } catch (err) {
        console.error("错误:", err);
        resultDiv.innerHTML = '<div style="color:red;text-align:center;">❌ 生成失败: ' + err.message + '</div>';
      }
    }

    document.getElementById('go').addEventListener('click', generate);
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
}
