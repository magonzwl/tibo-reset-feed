#!/usr/bin/env node
const url = 'https://api.github.com/repos/magonzwl/tibo-reset-feed/contents/latest.json';
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/vnd.github.raw+json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.schema_version !== '1.0' || !Array.isArray(data.signals)) throw new Error('Unsupported feed format');
  const checked = Date.parse(data.checked_at);
  data.stale = !Number.isFinite(checked) || Date.now() - checked > (data.stale_after_seconds || 7200) * 1000;
  if (process.argv.includes('--json')) console.log(JSON.stringify(data, null, 2));
  else {
    console.log(`Codex 重置消息 | ${data.status}\n${data.summary_zh}\n检查时间：${data.checked_at || '未检查'}\n来源状态：${data.source_health || 'unknown'}\n数据过期：${data.stale ? '是' : '否'}`);
    console.log(`预计重置：${data.expected_reset ? JSON.stringify(data.expected_reset) : '未给出可靠时间'}`);
    for (const signal of data.signals) console.log(`- ${signal.summary_zh}\n  ${signal.url}`);
  }
} catch (error) { console.error(`读取重置消息失败：${error.message}`); process.exitCode = 1; }

