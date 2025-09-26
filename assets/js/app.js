// 简易实现：自动检测 + 手动选择 + 主题切换 + 导出 PNG/JPEG/SVG + 复制
$(function(){
  const $input = $('#code-input');
  const $preview = $('#preview');
  const $lang = $('#language-select');
  const $theme = $('#theme-select');

  // 核心行号CSS，用于内联到导出文件
  const lineNumCss = `
    .code-lines { list-style-type: decimal; margin: 0; padding-left: 2.5em; background: none; }
    .code-lines li { position: relative; font-family: inherit; font-size: inherit; padding-left: 0; padding-right: 8px; white-space: pre; background: none; }
    .code-lines li::marker { color: #9aa7b2; font-family: inherit; font-size: 1em; text-align: right; width: 2em; }
    .code-lines li::before { content: ""; display: inline-block; vertical-align: middle; height: 1.2em; width: 2px; background: linear-gradient(180deg,#2ecc40,#27ae60); margin: 0 10px 0 6px; border-radius: 1px; }
    .no-linenums .code-lines li::marker { content: ""; }
    .no-linenums .code-lines li::before { display: none; }
  `;

  const previewBaseCss = `
  .preview-wrap { background: #0f1720; border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 6px; overflow: auto; }
  pre { margin: 0; white-space: pre; }
  .monospace { font-family: SFMono-Regular, Consolas, Menlo, Monaco, monospace; }
  `;

  // 获取当前时间戳用作文件名
  function getTimestamp() {
    const now = new Date();
    const Y = now.getFullYear();
    const M = (now.getMonth() + 1).toString().padStart(2, '0');
    const D = now.getDate().toString().padStart(2, '0');
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return `${Y}${M}${D}${h}${m}${s}`;
  }

  // 预置主题（使用 highlight.js CDN 名称）
  const themes = [
    {id:'default', name:'默认 (浅色)'},
    {id:'github', name:'GitHub'},
    {id:'monokai-sublime', name:'Monokai'},
    {id:'vs2015', name:'VS 风格'},
    {id:'atom-one-dark', name:'深色'}
  ];

  themes.forEach(t=>$theme.append(`<option value="${t.id}">${t.name}</option>`));
  $theme.val('atom-one-dark');

  // 简单语言列表（可扩展）
  const languages = ['auto','javascript','typescript','python','java','c','cpp','csharp','go','ruby','php','html','css','json','yaml','bash','ini']
  languages.forEach(l=>$lang.append(`<option value="${l}">${l}</option>`));
  $lang.val('auto');

  function applyHighlight(){
    let code = $input.val();
    const chosen = $lang.val();
    let detectedLang = chosen;
    let highlighted = '';
    if (chosen === 'auto') {
      const detected = hljs.highlightAuto(code);
      detectedLang = detected.language || '';
      highlighted = detected.value || '';
    } else {
      try {
        highlighted = hljs.highlight(code, { language: chosen }).value || '';
      } catch (e) {
        highlighted = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      }
    }
    // 按原始代码分行，每行高亮并包裹 span.line，再用 <br> 拼接
      // 按原始代码分行，每行高亮并用 <li> 包裹，再用 <ol> 包裹
      const codeLines = code.split(/\r?\n/);
      let htmlLines = codeLines.map(line => {
        try {
          return `<li>${hljs.highlight(line, { language: detectedLang }).value || ''}</li>`;
        } catch (e) {
          return `<li>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</li>`;
        }
      });
      $preview.removeClass().addClass('hljs ' + detectedLang);
      $preview.html(`<ol class="code-lines">${htmlLines.join('')}</ol>`);
    // 同步行号显示/隐藏状态
    var linenumChecked = $('#toggle-linenums').prop('checked');
    if(linenumChecked) $('#preview-wrap').removeClass('no-linenums');
    else $('#preview-wrap').addClass('no-linenums');
  }

  $input.on('input', applyHighlight);
  $lang.on('change', applyHighlight);

  $('#detect-btn').on('click',function(){
    const code = $input.val();
    const detected = hljs.highlightAuto(code);
    if(detected.language) $lang.val(detected.language);
    applyHighlight();
    alert('检测到: ' + (detected.language||'未知'));
  });

  $theme.on('change',function(){
    const id = $(this).val();
    const localPath = `assets/vendor/styles/${id}.min.css`;
    $('#hl-theme').attr('href', localPath);
  }).trigger('change');


  $('#copy-plain').on('click',function(){
    navigator.clipboard.writeText($input.val()).then(()=>alert('已复制纯文本')).catch(()=>alert('复制失败'));
  });

  // Toggle line numbers
  $('#toggle-linenums').on('change',function(){
    if(this.checked) $('#preview-wrap').removeClass('no-linenums');
    else $('#preview-wrap').addClass('no-linenums');
  });

  // Beautify: try to use js-beautify if available, else do a lightweight indent fix
  $('#beautify-btn').on('click',function(){
    const code = $input.val();
    if(window.js_beautify){
      const res = js_beautify(code);
      $input.val(res);
    }else{
      // simple heuristic: trim trailing spaces and ensure consistent indentation for braces
      const lines = code.split('\n');
      const out = lines.map(l=>l.replace(/\s+$/,'')).join('\n');
      $input.val(out);
    }
    applyHighlight();
  });

  // Export via html2canvas
  function exportImage(type){
    const node = document.querySelector('#preview-wrap');
    // 临时扩展预览区，确保所有内容可见
      // 创建临时隐藏div
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-99999px';
      temp.style.top = '0';
      temp.style.zIndex = '-1';
      temp.style.background = node.style.background;
      temp.style.padding = node.style.padding;
      temp.style.border = node.style.border;
      temp.style.borderRadius = node.style.borderRadius;
      temp.innerHTML = node.innerHTML;
      document.body.appendChild(temp);
      // 获取内容宽高
      const pre = temp.querySelector('pre');
      const code = temp.querySelector('code');
      pre.style.whiteSpace = 'pre';
      code.style.whiteSpace = 'pre';
      pre.style.overflow = 'visible';
      code.style.overflow = 'visible';
      pre.style.width = 'max-content';
      code.style.width = 'max-content';
      temp.style.width = pre.scrollWidth + 'px';
      temp.style.height = pre.scrollHeight + 'px';
      temp.style.overflow = 'visible';
      temp.offsetHeight;
      const width = temp.scrollWidth;
      const height = temp.scrollHeight;
      html2canvas(temp,{
        backgroundColor:null,
        scale:2,
        width:width,
        height:height,
        windowWidth:width,
        windowHeight:height,
        scrollY: -window.scrollY
      }).then(canvas=>{
        document.body.removeChild(temp);
        const filename = `code-${getTimestamp()}`;
        if(type==='png' || type==='jpeg'){
          const mime = type==='png'?'image/png':'image/jpeg';
          const data = canvas.toDataURL(mime);
          const a = document.createElement('a'); a.href = data; a.download = `${filename}.${type}`; a.click();
        }else if(type==='svg'){
          const data = canvas.toDataURL('image/png');
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${canvas.width}' height='${canvas.height}'><image href='${data}' width='${canvas.width}' height='${canvas.height}'/></svg>`;
          const blob = new Blob([svg],{type:'image/svg+xml'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `${filename}.svg`; a.click();
          URL.revokeObjectURL(url);
        }
      }).catch(err=>{
        document.body.removeChild(temp);
        alert('导出失败: ' + err);
      });
  }

  $('#export-png').on('click',()=>exportImage('png'));
  $('#export-jpeg').on('click',()=>exportImage('jpeg'));
  $('#export-svg').on('click',()=>exportImage('svg'));

  // 下载高亮HTML（带样式）
$('#export-html').on('click', function() {
  const themeId = $theme.val();
  const themeCdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${themeId}.min.css`;

  // 获取预览区<code>的计算样式
  const previewCodeEl = document.querySelector('#preview');
  const computedStyle = window.getComputedStyle(previewCodeEl);
  const bgColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  // 1. 创建一个与预览区结构相同的 DOM 片段
  const $previewWrapClone = $('<div>', { id: 'preview-wrap' });
  if ($('#preview-wrap').hasClass('no-linenums')) {
    $previewWrapClone.addClass('no-linenums');
  }
  
  const $preClone = $('<pre>');
  const $codeClone = $('<code>').addClass($('#preview').attr('class'));
  const $olClone = $('#preview ol.code-lines').clone();
  
  $codeClone.append($olClone);
  $preClone.append($codeClone);
  $previewWrapClone.append($preClone);

  // 2. 组装HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Snippet</title>
  <link rel="stylesheet" href="${themeCdnUrl}">
  <style>
    ${previewBaseCss}
    ${lineNumCss}
    body { background: #222; }
    #preview-wrap { margin: 2em auto; max-width: 800px; background-color: ${bgColor}; color: ${color}; }
    /* 确保 pre 继承父级颜色 */
    #preview-wrap pre { background-color: inherit; color: inherit; }
  </style>
</head>
<body>
  ${$previewWrapClone.prop('outerHTML')}
</body>
</html>`;
  
  const blob = new Blob([html],{type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `code-${getTimestamp()}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// 优化SVG导出为矢量（foreignObject嵌入HTML）
function exportSVG(){
  const themeId = $theme.val();
  const themeCdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${themeId}.min.css`;

  // 获取预览区<code>的计算样式
  const previewCodeEl = document.querySelector('#preview');
  const computedStyle = window.getComputedStyle(previewCodeEl);
  const bgColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  // 1. 创建一个与预览区结构相同的 DOM 片段
  const $previewWrapClone = $('<div>', { id: 'preview-wrap' });
  if ($('#preview-wrap').hasClass('no-linenums')) {
    $previewWrapClone.addClass('no-linenums');
  }
  
  const $preClone = $('<pre>');
  const $codeClone = $('<code>').addClass($('#preview').attr('class'));
  const $olClone = $('#preview ol.code-lines').clone();
  
  $codeClone.append($olClone);
  $preClone.append($codeClone);
  $previewWrapClone.append($preClone);

  // 2. 获取尺寸并组装SVG
  const node = document.querySelector('#preview-wrap');
  const width = node.querySelector('pre').scrollWidth;
  const height = node.querySelector('pre').scrollHeight;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;">
        <style>
          @import url('${themeCdnUrl}');
          ${previewBaseCss}
          ${lineNumCss}
          #preview-wrap { background-color: ${bgColor}; color: ${color}; padding: 12px; }
          #preview-wrap pre { background-color: inherit; color: inherit; }
        </style>
        ${$previewWrapClone.prop('outerHTML')}
      </body>
    </foreignObject>
  </svg>`;
  
  const blob = new Blob([svg],{type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code-${getTimestamp()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
$('#export-svg').off('click').on('click',exportSVG);

  // initial sample
  $input.val('// 贴入代码，按需切换语言或点击自动检测\nfunction hello(name){\n  console.log("Hello " + name);\n}');
  applyHighlight();

  // 设置版权年份
  $('#copyright-year').text(new Date().getFullYear());
});
