# 发布到 GitHub（首次开源，5 分钟操作）

这份压缩包**尚未自动创建远程 GitHub 仓库**。需要由仓库所有者使用已授权的 GitHub 登录执行以下步骤。

## 方案 A：GitHub CLI（推荐）

```bash
cd ai-cross-border-ecommerce-playbook
gh auth login  # 若此前未授权，在浏览器中完成登录
# 从本文件夹创建并推送全新的公开仓库
gh repo create AIPMAndy/ai-cross-border-ecommerce-playbook --public --source=. --remote=origin --push
```

`gh repo create` 的 `--push` 在当前目录不是Git仓库时可能要求先初始化；如出现提示，先执行：

```bash
git init -b main
git add .
git commit -m 'feat: release AI commerce guide v2'
gh repo create AIPMAndy/ai-cross-border-ecommerce-playbook --public --source=. --remote=origin --push
```

## 方案 B：网页+Git

1. 登录 GitHub 新建 Public 仓库，名称 `ai-cross-border-ecommerce-playbook`。不要预先生成 README 或 LICENSE（本项目已有）。
2. 解压项目，进入文件夹：

```bash
git init -b main
git add .
git commit -m 'feat: release AI commerce guide v2'
git remote add origin https://github.com/AIPMAndy/ai-cross-border-ecommerce-playbook.git
git push -u origin main
```

3. 打开 Settings → Pages → Build and deployment → Source → GitHub Actions。
4. 查看 Actions 中 `Deploy GitHub Pages` 是否成功，再访问 `https://aipmandy.github.io/ai-cross-border-ecommerce-playbook/`。
5. 检查手机版、24章/96卡/25例、筛选/打卡/利润和现金计算器/路线诊断/导入导出、外部案例链接。
6. Settings → General → Social preview 可以上传从 `assets/cover.svg` 导出 PNG 格式的封面图，不能用模拟订单后台截图。

## 更新内容及发布验收

改动内容来源在 `scripts/build_content.py` 的策展数据，执行：

```bash
python3 scripts/build_content.py
python3 scripts/build_offline.py
python3 scripts/check.py
python3 -m unittest discover -s tests -v
```

不要使用 AI 编造案例、销量、平台政策或业绩；更新后检查 `research/sources.md` 的核验日期、平台资格和原始链接。GitHub Pages 发布后才可将 README 中的“在线教程（发布后）”改成已上线说明。