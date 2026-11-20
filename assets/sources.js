/* Public research ledger viewer. No tracking; source of truth: research/source-register.csv. */
(function (root) {
  'use strict';
  function parseCsv(input) {
    const str = String(input || '').replace(/^\uFEFF/, '');
    const lines = [];
    let cell = '', row = [], quoted = false;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === '"') {
        if (quoted && str[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = !quoted; }
      } else if (c === ',' && !quoted) {
        row.push(cell); cell = '';
      } else if ((c === '\n' || c === '\r') && !quoted) {
        if (c === '\r' && str[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.some(v => v.trim())) lines.push(row);
        row = [];
      } else { cell += c; }
    }
    if (quoted) throw new Error('CSV 引号未闭合');
    if (cell !== '' || row.length) { row.push(cell); if (row.some(v => v.trim())) lines.push(row); }
    if (!lines.length || lines[0].join('|') !== 'id|name|url|kind|checked_on') throw new Error('台账表头不符合预期');
    return lines.slice(1).map((cells, i) => {
      if (cells.length !== 5) throw new Error('第 ' + (i + 2) + ' 行列数异常');
      const data = Object.fromEntries(lines[0].map((key, j) => [key, cells[j].trim()]));
      if (!data.id || !data.name || !safeUrl(data.url) || !/^\d{4}-\d{2}-\d{2}$/.test(data.checked_on) ||
          !['official', 'public case'].includes(data.kind)) throw new Error('第 ' + (i + 2) + ' 行来源无效');
      return data;
    });
  }
  function safeUrl(value) {
    try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; }
    catch (_) { return null; }
  }
  function daysSince(date, now = new Date()) {
    const parts = String(date).split('-').map(Number);
    if (parts.length !== 3 || parts.some(n => !Number.isInteger(n))) return NaN;
    const from = Date.UTC(parts[0], parts[1] - 1, parts[2]);
    const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.floor((utcToday - from) / 86400000);
  }
  function filterRows(items, term, kind, priority, now = new Date()) {
    const q = String(term || '').toLocaleLowerCase().trim();
    return items.filter(r => (!kind || r.kind === kind) &&
      (!q || [r.id, r.name, r.url, r.kind].join(' ').toLocaleLowerCase().includes(q)) &&
      (!priority || daysSince(r.checked_on, now) > 30));
  }
  function asText(rows) {
    const head = '跨境电商 · 来源人工复核清单\n原始台账：https://github.com/AIPMAndy/ai-cross-border-ecommerce-playbook/blob/main/research/source-register.csv\n历史核验日不代表今天有效；请逐条打开官方原文核查。此清单不含即时招聘、税务、平台批准或收益保证。\n微信 AIPMAndy｜个人 https://metaver.vip/｜公司 https://www.a6no1.cn/｜服务 https://metaver.vip/services\n\n';
    if (!rows.length) return head + '本次筛选无结果。\n';
    return head + rows.map((r, i) =>
      (i + 1) + '. ' + r.id + ' / ' + r.name + '\n类别：' + (r.kind === 'official' ? '官方规则' : '第三方公开案例') +
      '\n历史核验日：' + r.checked_on + '\n原始 URL：' + r.url +
      '\n人工复核日期：__________  新限制或变化：__________  操作结论：__________\n').join('\n');
  }
  function init() {
    const el = id => document.getElementById(id);
    let rows = [], filtered = [];
    const list = el('sourceList'), status = el('status');
    function render() {
      filtered = filterRows(rows, el('search').value, el('kind').value, el('priority').checked);
      list.replaceChildren();
      const span = document.createElement('strong'); span.textContent = String(filtered.length);
      const summary = el('summary'); summary.replaceChildren(span, document.createTextNode(' / ' + rows.length + ' 条历史记录，另有 ' +
        rows.filter(r => daysSince(r.checked_on) > 30).length + ' 条超过 30 天的复核优先级'));
      el('empty').hidden = filtered.length !== 0;
      el('export').disabled = !filtered.length;
      filtered.forEach(r => {
        const article = document.createElement('article'); article.className = 'source';
        const hd = document.createElement('div'); hd.className = 'sourcehead';
        const title = document.createElement('h2'); title.textContent = r.id + ' · ' + r.name;
        const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = r.kind === 'official' ? '官方规则' : '第三方公开案例';
        hd.append(title, tag);
        const date = document.createElement('p');
        date.textContent = '历史核验日期：' + r.checked_on + (daysSince(r.checked_on) > 30 ? ' · 超过 30 天，建议优先复核' : ' · 仍须点击官方原文确认');
        const link = document.createElement('a'); link.href = safeUrl(r.url);
        link.textContent = '打开原始来源 ↗ ' + r.url;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        article.append(hd, date, link); list.append(article);
      });
    }
    ['search', 'kind', 'priority'].forEach(id => el(id).addEventListener(id === 'search' ? 'input' : 'change', render));
    el('clear').addEventListener('click', () => {
      el('search').value = ''; el('kind').value = ''; el('priority').checked = false; render(); el('search').focus();
    });
    el('export').addEventListener('click', () => {
      const blob = new Blob(['\uFEFF' + asText(filtered)], {type:'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'cross-border-source-review.txt';
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
      status.textContent = '已在本机生成 ' + filtered.length + ' 条来源的复核清单；不含当日复核结论。';
    });
    fetch('research/source-register.csv', {cache:'no-store'}).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status); return r.text();
    }).then(csv => {
      rows = parseCsv(csv); status.textContent = '数据来自 research/source-register.csv；所有日期沿用原始台账。'; render();
    }).catch(e => {
      status.textContent = '无法读取来源台账（' + e.message + '）。可直接打开上方 CSV 原文件。';
      el('summary').textContent = '加载失败'; el('export').disabled = true;
    });
  }
  const api = {parseCsv, safeUrl, daysSince, filterRows, asText};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : {});
