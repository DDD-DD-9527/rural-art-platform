artwork-workflow-api

<br />

示例 token（请勿提交真实密钥）：`<YOUR_TOKEN>`

# 艺术作品处理工作流 - API接入文档

## 概述

本文档说明如何通过 HTTP API 接入艺术作品处理工作流，适用于：

- 外部网站/应用通过 API 调用
- 微服务架构集成
- 前后端分离项目

***

## 零、快速配置

### 0.1 API密钥选择

Coze平台提供两种API密钥类型：

| 类型         | 适用场景      | 推荐度            |
| :--------- | :-------- | :------------- |
| **服务身份凭证** | 生产环境、团队协作 | ⭐⭐⭐⭐⭐ **强烈推荐** |
| **个人访问令牌** | 个人开发、测试   | ⭐⭐⭐            |

**推荐使用服务身份凭证**，原因：

- 更安全：可设置最小权限
- 更稳定：不依赖个人账号
- 可追溯：审计日志更清晰
- 可管理：支持团队协作

详见：[docs/COZE\_DEPLOYMENT\_GUIDE.md#3-获取api密钥](COZE_DEPLOYMENT_GUIDE.md#3-获取api密钥)

### 0.2 文件存储配置

**三种方式可选**：

| 方式        | 适用场景       | 配置复杂度   |
| :-------- | :--------- | :------ |
| **本地存储**  | 有自己的服务器和域名 | ⭐ 最简单   |
| **自定义接口** | 已有文件存储服务   | ⭐⭐ 中等   |
| **对象存储**  | 需要独立的存储服务  | ⭐⭐⭐ 较复杂 |

**推荐使用本地存储**，只需配置：

```bash
export STORAGE_TYPE="local"
export LOCAL_OUTPUT_DIR="assets/output"
export BASE_URL="https://your-domain.com"
```

详见：[docs/COZE\_DEPLOYMENT\_GUIDE.md#4-配置文件存储](COZE_DEPLOYMENT_GUIDE.md#4-配置文件存储)

***

## 一、API 接口说明

### 1.1 基础信息

| 项目    | 说明                        |
| :---- | :------------------------ |
| 基础URL | `http://your-domain:9000` |
| 协议    | HTTP/HTTPS                |
| 数据格式  | JSON                      |
| 编码    | UTF-8                     |

### 1.2 同步执行接口

**接口路径**: `POST /run`

**请求头**:

```http
Content-Type: application/json
```

**请求体**:

```json
{
  "sketch_image": {
    "url": "https://example.com/sketch.png",
    "file_type": "image"
  }
}
```

**请求参数说明**:

| 参数                       | 类型     | 必填 | 说明                          |
| :----------------------- | :----- | :- | :-------------------------- |
| sketch\_image.url        | string | 是  | 手绘作品图片URL（支持 HTTP/HTTPS 链接） |
| sketch\_image.file\_type | string | 否  | 文件类型，固定为 "image"            |

**响应体**:

```json
{
  "final_result_url": "https://storage.example.com/optimized_result.jpeg?sign=xxx",
  "colorized_image_url": "https://storage.example.com/colorized.jpeg",
  "optimized_image_url": "https://storage.example.com/optimized.jpeg",
  "run_id": "18fc8015-6ca5-4f6f-8d5b-f997055d523e"
}
```

**响应字段说明**:

| 字段                    | 类型     | 说明                    |
| :-------------------- | :----- | :-------------------- |
| final\_result\_url    | string | 最终优化后作品的下载链接（有效期24小时） |
| colorized\_image\_url | string | 色彩补全后的图片链接（用于预览对比）    |
| optimized\_image\_url | string | 构图优化后的图片链接（用于预览对比）    |
| run\_id               | string | 本次执行的任务ID             |

### 1.3 流式执行接口

**接口路径**: `POST /stream`

**请求头**:

```http
Content-Type: application/json
Accept: text/event-stream
```

**请求体**: 同同步接口

**响应**: Server-Sent Events (SSE) 流式数据

**事件格式**:

```
event: message
data: {"node": "analyze_sketch", "status": "running", ...}

event: message
data: {"node": "analyze_sketch", "status": "completed", "output": {...}}

event: message
data: {"node": "colorize", "status": "running", ...}
...
```

***

## 二、接入示例

### 2.1 JavaScript/TypeScript (Fetch API)

```typescript
interface SketchOptimizeRequest {
  sketch_image: {
    url: string;
    file_type: string;
  };
}

interface SketchOptimizeResponse {
  final_result_url: string;
  colorized_image_url: string;
  optimized_image_url: string;
  run_id: string;
}

async function optimizeSketch(imageUrl: string): Promise<SketchOptimizeResponse> {
  const response = await fetch('http://your-domain:9000/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sketch_image: {
        url: imageUrl,
        file_type: 'image'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// 使用示例
const result = await optimizeSketch('https://example.com/my-sketch.png');
console.log('最终作品下载链接:', result.final_result_url);
console.log('色彩补全预览:', result.colorized_image_url);
```

### 2.2 Python (requests)

```python
import requests
from typing import Dict, Any

def optimize_sketch(image_url: str, api_base: str = "http://your-domain:9000") -> Dict[str, Any]:
    """
    调用手绘作品优化API
    
    Args:
        image_url: 手绘作品图片URL
        api_base: API基础地址
    
    Returns:
        包含优化结果的字典
    """
    payload = {
        "sketch_image": {
            "url": image_url,
            "file_type": "image"
        }
    }
    
    response = requests.post(
        f"{api_base}/run",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=300  # 建议设置较长超时时间
    )
    
    response.raise_for_status()
    return response.json()

# 使用示例
result = optimize_sketch("https://example.com/my-sketch.png")
print(f"最终作品下载链接: {result['final_result_url']}")
print(f"色彩补全预览: {result['colorized_image_url']}")
print(f"构图优化预览: {result['optimized_image_url']}")
```

### 2.3 cURL

```bash
curl -X POST 'http://your-domain:9000/run' \
  -H 'Content-Type: application/json' \
  -d '{
    "sketch_image": {
      "url": "https://example.com/sketch.png",
      "file_type": "image"
    }
  }'
```

### 2.4 Java (OkHttp)

```java
import okhttp3.*;
import org.json.JSONObject;

public class SketchOptimizer {
    private final OkHttpClient client = new OkHttpClient();
    private final String apiBase;
    
    public SketchOptimizer(String apiBase) {
        this.apiBase = apiBase;
    }
    
    public JSONObject optimizeSketch(String imageUrl) throws Exception {
        JSONObject requestBody = new JSONObject()
            .put("sketch_image", new JSONObject()
                .put("url", imageUrl)
                .put("file_type", "image"));
        
        Request request = new Request.Builder()
            .url(apiBase + "/run")
            .post(RequestBody.create(
                requestBody.toString(),
                MediaType.parse("application/json")
            ))
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("API error: " + response.code());
            }
            return new JSONObject(response.body().string());
        }
    }
}

// 使用示例
SketchOptimizer optimizer = new SketchOptimizer("http://your-domain:9000");
JSONObject result = optimizer.optimizeSketch("https://example.com/sketch.png");
System.out.println("最终作品: " + result.getString("final_result_url"));
```

***

## 三、前端集成示例

### 3.1 React 组件示例

```tsx
import React, { useState } from 'react';

interface OptimizeResult {
  final_result_url: string;
  colorized_image_url: string;
  optimized_image_url: string;
}

const SketchOptimizer: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://your-domain:9000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sketch_image: { url: imageUrl, file_type: 'image' }
        })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sketch-optimizer">
      <h2>手绘作品优化工具</h2>
      
      <div className="input-section">
        <input
          type="text"
          placeholder="输入手绘作品图片URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button onClick={handleOptimize} disabled={loading}>
          {loading ? '处理中...' : '开始优化'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>优化结果</h3>
          
          <div className="preview-grid">
            <div className="preview-item">
              <h4>色彩补全</h4>
              <img src={result.colorized_image_url} alt="色彩补全" />
            </div>
            
            <div className="preview-item">
              <h4>构图优化</h4>
              <img src={result.optimized_image_url} alt="构图优化" />
            </div>
          </div>
          
          <a 
            href={result.final_result_url} 
            download
            className="download-btn"
          >
            下载最终作品
          </a>
        </div>
      )}
    </div>
  );
};

export default SketchOptimizer;
```

### 3.2 Vue 3 组件示例

```vue
<template>
  <div class="sketch-optimizer">
    <h2>手绘作品优化工具</h2>
    
    <div class="input-section">
      <input
        v-model="imageUrl"
        type="text"
        placeholder="输入手绘作品图片URL"
      />
      <button @click="handleOptimize" :disabled="loading">
        {{ loading ? '处理中...' : '开始优化' }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="result" class="result-section">
      <h3>优化结果</h3>
      
      <div class="preview-grid">
        <div class="preview-item">
          <h4>色彩补全</h4>
          <img :src="result.colorized_image_url" alt="色彩补全" />
        </div>
        
        <div class="preview-item">
          <h4>构图优化</h4>
          <img :src="result.optimized_image_url" alt="构图优化" />
        </div>
      </div>
      
      <a 
        :href="result.final_result_url" 
        download
        class="download-btn"
      >
        下载最终作品
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const imageUrl = ref('');
const result = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const handleOptimize = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://your-domain:9000/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sketch_image: { url: imageUrl.value, file_type: 'image' }
      })
    });
    
    if (!response.ok) throw new Error('API request failed');
    
    result.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};
</script>
```

***

## 四、错误处理

### 4.1 错误响应格式

```json
{
  "detail": "错误描述信息",
  "error_code": "ERROR_CODE",
  "run_id": "xxx"
}
```

### 4.2 常见错误码

| HTTP状态码 | 说明     | 解决方案           |
| :------ | :----- | :------------- |
| 400     | 请求参数错误 | 检查请求体格式和必填字段   |
| 422     | 参数验证失败 | 确保图片URL有效且可访问  |
| 500     | 服务内部错误 | 联系管理员或查看日志     |
| 504     | 请求超时   | 图片过大或服务繁忙，建议重试 |

### 4.3 错误处理示例

```python
import requests
from requests.exceptions import RequestException

def optimize_sketch_safe(image_url: str) -> dict:
    try:
        response = requests.post(
            "http://your-domain:9000/run",
            json={"sketch_image": {"url": image_url, "file_type": "image"}},
            timeout=300
        )
        
        if response.status_code == 400:
            raise ValueError("请求参数错误，请检查图片URL")
        elif response.status_code == 422:
            raise ValueError("图片URL无效或无法访问")
        elif response.status_code >= 500:
            raise RuntimeError("服务内部错误，请稍后重试")
        
        return response.json()
        
    except requests.Timeout:
        raise RuntimeError("请求超时，请检查网络连接")
    except requests.ConnectionError:
        raise RuntimeError("无法连接到服务，请检查服务状态")
```

***

## 五、最佳实践

### 5.1 性能优化

1. **图片预处理**
   - 建议上传前将图片压缩至 2MB 以内
   - 推荐分辨率：1024x1024 至 2048x2048
   - 支持格式：PNG、JPG、JPEG
2. **超时设置**
   - 建议客户端超时设置：300-600秒
   - 工作流完整执行约需 30-120秒
3. **并发控制**
   - 建议单个客户端并发数不超过 3
   - 使用队列管理批量请求

### 5.2 安全建议

1. **HTTPS**: 生产环境务必使用 HTTPS
2. **认证**: 可添加 API Key 或 Token 认证
3. **限流**: 配置请求频率限制
4. **日志**: 记录所有 API 调用日志

### 5.3 监控指标

```python
# 建议监控的指标
metrics = {
    "request_count": "请求总数",
    "success_rate": "成功率",
    "avg_latency": "平均延迟",
    "p95_latency": "P95延迟",
    "error_count": "错误总数"
}
```

***

## 六、部署说明

### 6.1 环境变量

```bash
# 对象存储配置
COZE_BUCKET_ENDPOINT_URL=https://your-bucket.endpoint
COZE_BUCKET_NAME=your-bucket-name

# 工作目录
COZE_WORKSPACE_PATH=/path/to/workspace
```

### 6.2 启动服务

```bash
# 开发环境
python src/main.py

# 生产环境 (使用 uvicorn)
uvicorn src.main:app --host 0.0.0.0 --port 9000 --workers 4
```

***

## 七、常见问题 FAQ

**Q: 图片URL必须是公网可访问的吗？**

A: 是的，当前版本需要图片URL可被服务端访问。如需上传本地文件，请先上传至对象存储获取URL。

**Q: 处理一张图片需要多长时间？**

A: 通常需要 30-120 秒，具体取决于图片大小和网络状况。

**Q: 返回的图片链接有效期是多久？**

A: `final_result_url` 有效期为 24 小时，请及时下载保存。

**Q: 支持批量处理吗？**

A: 当前为单张处理，批量请通过循环调用实现，建议控制并发数。
