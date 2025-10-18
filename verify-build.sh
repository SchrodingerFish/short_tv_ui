#!/bin/bash

echo "🔍 验证 Cloudflare Pages 构建输出..."
echo ""

# 检查构建目录
if [ ! -d "dist" ]; then
    echo "❌ dist 目录不存在，请先运行 npm run build"
    exit 1
fi

# 检查必需文件
files=("dist/index.html" "dist/_redirects" "dist/_headers" "dist/sw.js" "dist/manifest.json")
all_ok=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
        all_ok=false
    fi
done

# 检查 assets 目录
if [ -d "dist/assets" ]; then
    js_count=$(find dist/assets -name "*.js" | wc -l)
    css_count=$(find dist/assets -name "*.css" | wc -l)
    echo "✅ dist/assets 存在 ($js_count JS 文件, $css_count CSS 文件)"
else
    echo "❌ dist/assets 目录不存在"
    all_ok=false
fi

echo ""

# 验证 _redirects 内容
if grep -q "/\*.*index.html" dist/_redirects 2>/dev/null; then
    echo "✅ _redirects 包含 SPA 回退规则"
else
    echo "❌ _redirects 缺少 SPA 回退规则"
    all_ok=false
fi

# 验证 _headers 内容
if grep -q "Cache-Control" dist/_headers 2>/dev/null; then
    echo "✅ _headers 包含缓存策略"
else
    echo "❌ _headers 缺少缓存策略"
    all_ok=false
fi

echo ""

if [ "$all_ok" = true ]; then
    echo "🎉 所有检查通过！可以部署到 Cloudflare Pages"
    exit 0
else
    echo "⚠️  部分检查失败，请检查配置"
    exit 1
fi
