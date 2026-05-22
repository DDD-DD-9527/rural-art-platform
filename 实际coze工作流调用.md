<br />

***

## API地址

```
https://n86p8sr4b4.coze.site/run
```

***

## 四个工作流调用示例

### 1️⃣ 手绘优化（enhance）

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "sketch_image": {
      "url": "https://example.com/sketch.png",
      "file_type": "image"
    }
  }'
```

***

### 2️⃣ 风格转换（style）

#### 水墨风格

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tool_id": "style",
    "input": {
      "image_url": "https://example.com/artwork.png",
      "options": {
        "style": "ink",
        "strength": 0.7,
        "num_results": 3
      }
    }
  }'
```

#### 卡通风格

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tool_id": "style",
    "input": {
      "image_url": "https://example.com/artwork.png",
      "options": {
        "style": "cartoon",
        "strength": 0.8
      }
    }
  }'
```

***

### 3️⃣ 图案生成（generate）

#### 祥云纹样

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tool_id": "generate",
    "input": {
      "text": "传统祥云纹样，适合用于中式包装设计",
      "options": {
        "elements": ["祥云", "如意纹"],
        "style": "traditional",
        "color_scheme": "red_gold",
        "num_results": 4
      }
    }
  }'
```

#### 青花瓷纹样

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tool_id": "generate",
    "input": {
      "text": "青花瓷风格的缠枝花卉纹样",
      "options": {
        "elements": ["青花", "缠枝花卉"],
        "color_scheme": "blue_white"
      }
    }
  }'
```

***

### 4️⃣ 智能修复（repair）

#### 完整修复

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tool_id": "repair",
    "input": {
      "image_url": "https://example.com/damaged.png",
      "options": {
        "repair_modes": ["damage_fix", "denoise_upscale", "color_restore"],
        "strength": "medium"
      }
    }
  }'
```

#### 仅色彩还原

```bash
curl --location --request POST 'https://n86p8sr4b4.coze.site/run' \
  --header 'Authorization: Bearer <YOUR_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "tool_id": "repair",
    "input": {
      "image_url": "https://example.com/faded.png",
      "options": {
        "repair_modes": ["color_restore"]
      }
    }
  }'
```

***

## 完整Python SDK

```python
from artwork_client import ArtworkClient

client = ArtworkClient(token='pat_xxxxxxxxx')

# 手绘优化
result = client.enhance('https://example.com/sketch.png')

# 风格转换
result = client.style_transform('https://example.com/artwork.png', style='ink')

# 图案生成
result = client.generate_pattern('祥云纹样', elements=['祥云'])

# 智能修复
result = client.repair('https://example.com/old_photo.png')
```

详细文档请查看：`docs/API_INTEGRATION.md`

示例 Token（请勿提交真实密钥）：`<YOUR_TOKEN>`
