#!/usr/bin/env python3
"""Add MoMA platform post to the database with bilingual content and deployment tutorial."""

import sqlite3
import os

db_path = os.path.join(os.getcwd(), 'data', 'ai-nav.db')

# Ensure data directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

content = """【中文】中国移动在2026移动云大会发布MoMA（移动模型服务平台），接入超300款AI模型，首创Token集约化运营模式，单位Token成本压降30%以上。

核心特性：
• 统一API网关：一次接入即可调用全部模型资源
• 智能路由引擎：自动匹配最适合的模型（成本优先/效果优先/均衡优先）
• Token成本优化：基于国产算力部署自研推理引擎，降低资源占用率50%以上
• 机密模型服务：硬件隔离技术保障数据安全，做到"可用不可见"
• 实时精准计量：流式实时计费，端到端时延不超过1分钟

【English】China Mobile launched MoMA (Mobile Model Service Platform) at the 2026 Mobile Cloud Conference, integrating over 300 AI models with a pioneering Token-intensive operation model, reducing unit Token costs by over 30%.

Key Features:
• Unified API Gateway: One-time access to call all model resources
• Intelligent Routing Engine: Automatically matches the most suitable model (cost-priority/effect-priority/balance-priority)
• Token Cost Optimization: Self-developed inference engine on domestic computing power, reducing resource occupancy by over 50%
• Confidential Model Service: Hardware isolation technology ensures data security, achieving "usable but invisible"
• Real-time Precise Metering: Streaming real-time billing with end-to-end latency under 1 minute

📖 部署教程 / Deployment Tutorial:

1️⃣ 注册 MoMA 平台账号
访问 https://moma.9tian.cn 注册企业账号，完成实名认证。
Visit https://moma.9tian.cn to register an enterprise account and complete real-name verification.

2️⃣ 获取 API Key
在控制台创建应用，生成 API Key 和 App ID。
Create an application in the console to generate your API Key and App ID.

3️⃣ 安装 SDK (Python)
pip install moma-sdk
或者使用 REST API 直接调用：
Or use REST API directly:

4️⃣ 快速开始代码示例
```python
from moma import Client

client = Client(api_key="your_api_key")

# 调用模型
response = client.chat(
    model="qwen-max",  # 或 deepseek-v3, kimi-k2 等
    messages=[{"role": "user", "content": "Hello World"}],
    strategy="cost-priority"  # 智能路由策略
)
print(response.content)
```

5️⃣ 环境变量配置
export MOMA_API_KEY=your_api_key
export MOMA_BASE_URL=https://api.moma.9tian.cn/v1

6️⃣ 测试连接
curl https://api.moma.9tian.cn/v1/models \\
  -H "Authorization: Bearer $MOMA_API_KEY"

7️⃣ 生产环境部署建议
• 使用智能路由策略：根据任务类型选择 cost-priority 或 effect-priority
• 启用机密模型服务：对敏感数据使用硬件隔离容器
• 监控 Token 消耗：利用平台提供的实时计量和风控机制
• 设置自动故障切换：配置秒级切换确保业务连续性

💡 适用场景 / Use Cases:
• 政务系统：高数据安全要求的场景
• 金融服务：需要机密计算的场景
• 工业应用：多模型协同的复杂任务
• 医疗健康：隐私保护要求高的场景
• 教育平台：低成本大规模部署需求"""

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Insert or replace the post
cursor.execute("""
    INSERT OR REPLACE INTO posts 
    (id, title, url, source, score, comments, content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (
    'moma-platform-2026',
    '中国移动发布 MoMA 平台：一站式调用超300款模型 | China Mobile Launches MoMA Platform',
    'https://techweb.sina.com.cn/c/2026-05-08/doc-inkaetxyz8419769.shtml',
    'hackernews',
    95,
    2,
    content
))

conn.commit()
print(f"✅ MoMA platform post inserted successfully!")
print(f"   ID: moma-platform-2026")
print(f"   Title: 中国移动发布 MoMA 平台：一站式调用超300款模型 | China Mobile Launches MoMA Platform")
print(f"   Content length: {len(content)} characters")

# Verify the insertion
cursor.execute("SELECT * FROM posts WHERE id = ?", ('moma-platform-2026',))
row = cursor.fetchone()
if row:
    print(f"\n✅ Verification successful!")
    print(f"   Retrieved post with ID: {row[0]}")

conn.close()
