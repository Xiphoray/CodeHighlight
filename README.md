# CodeHighlight

一个功能强大的在线代码高亮工具，旨在帮助开发者轻松地美化、分享和导出代码片段。支持多种编程语言和主题，并提供多种导出选项。

## 功能特点

- **多种语言支持**: 支持 JavaScript, Python, Java, C++, HTML, CSS 等多种常见编程语言的语法高亮。
- **主题切换**: 内置多种流行的代码高亮主题，如 Monokai, VS2015, Atom One Dark 等，一键切换。
- **实时预览**: 在文本框中输入或粘贴代码，右侧即时显示高亮效果。
- **行号显示**: 可选的行号显示功能，方便代码阅读和审查。
- **代码美化**: 一键格式化和美化代码，使其更易于阅读。
- **多种导出格式**:
  - **图片格式**: 导出为 PNG 或 JPEG 格式的图片，适合在社交媒体或文档中分享。
  - **矢量格式**: 导出为 SVG 格式，保证无限放大而不失真，适合在技术博客或演示文稿中使用。
  - **HTML 格式**: 导出一个包含所有样式的独立 HTML 文件，方便在任何网页浏览器中查看。

## 技术栈

- **前端框架**: [Bootstrap 4](https://getbootstrap.com/)
- **核心库**:
  - [jQuery](https://jquery.com/): 用于 DOM 操作和事件处理。
  - [highlight.js](https://highlightjs.org/): 强大的语法高亮引擎。
  - [html2canvas](https://html2canvas.hertzen.com/): 用于将 DOM 元素转换为 Canvas，实现图片导出。
  - [js-beautify](https://beautifier.io/): 用于代码美化功能。

## 使用方法

1.  **打开 `index.html`**: 在您喜欢的网页浏览器中直接打开 `index.html` 文件。
2.  **输入代码**: 在左侧的文本框中粘贴或输入您的代码。
3.  **选择语言和主题**: 从下拉菜单中选择适合的编程语言和高亮主题。您也可以点击“自动检测”按钮。
4.  **调整选项**: 根据需要，使用“美化代码”按钮格式化代码，或通过复选框切换行号的显示。
5.  **导出**: 点击相应的导出按钮（PNG, JPEG, SVG, HTML）来下载您需要的文件。

## 开发历程

在开发这个工具的过程中，我们遇到并解决了一系列有趣的技术挑战，尤其是在实现导出功能时。

1.  **行号系统的实现**:
    - **问题**: 最初的行号方案难以与 `highlight.js` 的输出同步，且在复制时会包含行号。
    - **解决方案**: 放弃了复杂的 JS 同步方案，改为使用纯 CSS 实现。通过将代码的每一行渲染为 `<ol>` 列表中的 `<li>` 元素，并利用 `::marker` 和 `::before` 伪元素来创建和美化行号。通过一个简单的 `no-linenums` 类来控制行号的显示和隐藏，代码简洁且高效。

2.  **导出功能的样式丢失问题**:
    - **问题**: 使用 `html2canvas` 导出图片或直接克隆 DOM 导出 HTML/SVG 时，所有外部的 CSS 样式（包括 `highlight.js` 的主题和自定义样式）都丢失了，导致导出的文件只有结构没有样式。
    - **解决方案**: 这是一个迭代解决的过程：
        1.  **尝试 `fetch` API**: 最初尝试使用 `fetch` 在 JavaScript 中读取本地 CSS 文件的内容，然后内联到导出的文件中。但这在 `file://` 协议下因浏览器安全策略（CORS）而失败。
        2.  **尝试 `document.styleSheets`**: 接着尝试读取 `document.styleSheets` 来访问已加载的样式规则。同样，`file://` 协议下的安全限制阻止了对 CSS 规则的访问。
        3.  **最终方案 (混合策略)**:
            - **对于自定义样式 (如行号)**: 将必要的 CSS 规则硬编码为 JavaScript 字符串常量，在导出时直接注入到 `<style>` 标签中。
            - **对于 `highlight.js` 主题**: 放弃读取本地文件，改为在导出时动态构建指向 `highlight.js` 公共 CDN 的 `<link>` 标签（用于 HTML）或 `@import` 规则（用于 SVG）。

3.  **确保导出样式的完全一致性**:
    - **问题**: 即便链接了 CDN，导出的代码块背景色和文字颜色有时仍与预览不一致，因为受到了页面其他全局样式的影响。
    - **解决方案**: 在导出前，使用 `window.getComputedStyle()` API 获取预览区 `<code>` 标签的实际“计算样式”（包括背景色和文字颜色），然后将这些精确的颜色值作为内联样式直接应用到导出文件的代码容器上，从而保证了视觉上的 100% 一致性。

通过解决这些问题，我们最终实现了一个强大、可靠且用户友好的代码高亮导出工具。

---

# CodeHighlight (English)

A powerful online code highlighting tool designed to help developers easily beautify, share, and export code snippets. It supports multiple programming languages, themes, and provides various export options.

## Features

- **Multi-Language Support**: Supports syntax highlighting for many common programming languages, including JavaScript, Python, Java, C++, HTML, CSS, and more.
- **Theme Switching**: Built-in support for popular code highlighting themes like Monokai, VS2015, and Atom One Dark, switchable with a single click.
- **Real-time Preview**: Instantly see the highlighted output on the right as you type or paste code into the text area.
- **Line Numbers**: Optional line number display for easier code reading and review.
- **Code Beautification**: One-click code formatting to make your code more readable.
- **Multiple Export Formats**:
  - **Image Formats**: Export as PNG or JPEG images, perfect for sharing on social media or in documents.
  - **Vector Format**: Export as an SVG file, ensuring infinite scalability without loss of quality, ideal for technical blogs or presentations.
  - **HTML Format**: Export a standalone HTML file with all styles included, ready to be viewed in any web browser.

## Tech Stack

- **Frontend Framework**: [Bootstrap 4](https://getbootstrap.com/)
- **Core Libraries**:
  - [jQuery](https://jquery.com/): For DOM manipulation and event handling.
  - [highlight.js](https://highlightjs.org/): The powerful syntax highlighting engine.
  - [html2canvas](https://html2canvas.hertzen.com/): Used to convert DOM elements to a Canvas for image exporting.
  - [js-beautify](https://beautifier.io/): Powers the code beautification feature.

## How to Use

1.  **Open `index.html`**: Open the `index.html` file directly in your favorite web browser.
2.  **Input Code**: Paste or type your code into the text area on the left.
3.  **Select Language and Theme**: Choose the appropriate programming language and highlighting theme from the dropdown menus. You can also click the "Auto-detect" button.
4.  **Adjust Options**: Use the "Beautify Code" button to format your code or toggle the line number display with the checkbox as needed.
5.  **Export**: Click the corresponding export button (PNG, JPEG, SVG, HTML) to download the file you need.

## Development Journey

During the development of this tool, we encountered and solved a series of interesting technical challenges, especially when implementing the export functionality.

1.  **Implementing the Line Numbering System**:
    - **Problem**: The initial line numbering solution was difficult to synchronize with the output of `highlight.js` and would include line numbers when copying text.
    - **Solution**: We abandoned complex JS synchronization and opted for a pure CSS implementation. By rendering each line of code as an `<li>` element within an `<ol>` list, we used the `::marker` and `::before` pseudo-elements to create and style the line numbers. A simple `no-linenums` class controls their visibility, resulting in clean and efficient code.

2.  **The Missing Styles Problem in Exports**:
    - **Problem**: When exporting images with `html2canvas` or cloning the DOM for HTML/SVG exports, all external CSS styles (including the `highlight.js` theme and custom styles) were lost, leaving the exported files with structure but no styling.
    - **Solution**: This was resolved through an iterative process:
        1.  **Attempting the `fetch` API**: The first attempt was to use `fetch` in JavaScript to read the content of local CSS files and inline them into the exported file. This failed under the `file://` protocol due to browser security policies (CORS).
        2.  **Attempting `document.styleSheets`**: The next approach was to access the loaded style rules via `document.styleSheets`. Again, security restrictions under the `file://` protocol prevented access to the CSS rules.
        3.  **Final Solution (A Hybrid Strategy)**:
            - **For Custom Styles (like line numbers)**: The necessary CSS rules were hardcoded into a JavaScript string constant and directly injected into a `<style>` tag during export.
            - **For `highlight.js` Themes**: Instead of reading local files, the export logic now dynamically constructs a `<link>` tag (for HTML) or an `@import` rule (for SVG) pointing to the public `highlight.js` CDN.

3.  **Ensuring Perfect Style Consistency in Exports**:
    - **Problem**: Even with the CDN link, the background and text colors of the exported code block sometimes differed from the preview because they were affected by other global styles on the page.
    - **Solution**: Before exporting, we use the `window.getComputedStyle()` API to get the actual "computed styles" of the `<code>` element in the preview area (including its `backgroundColor` and `color`). These precise color values are then applied as inline styles to the code container in the exported file, guaranteeing 100% visual consistency.

By solving these problems, we ultimately created a powerful, reliable, and user-friendly code highlighting and exporting tool.
