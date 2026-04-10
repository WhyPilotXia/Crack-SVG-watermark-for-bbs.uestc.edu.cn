// ==UserScript==
// @name         新版河畔修改svg水印内容
// @namespace    http://tampermonkey.net/
// @version      2026.02.04
// @description  新版河畔修改水印内容
// @match        https://bbs.uestc.edu.cn/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function () {
  const OLD_TEXT = '289798'
  const NEW_TEXT = '114514'

  function rewriteBackgroundImage(style) {
    if (!style || !style.backgroundImage) return

    const bg = style.backgroundImage
    if (!bg.includes('data:image/svg+xml;base64,')) return

    const base64 = bg.match(/base64,([^")]+)/)?.[1]
    if (!base64) return

    try {
      const svg = decodeURIComponent(escape(atob(base64)))

      console.log(svg);

      if (!svg.includes(OLD_TEXT)) return

      const modifiedSvg = svg.replaceAll(OLD_TEXT, NEW_TEXT)

      const newBase64 = btoa(
        unescape(encodeURIComponent(modifiedSvg))
      )

      style.backgroundImage =
        `url("data:image/svg+xml;base64,${newBase64}")`

      console.log('[WM] watermark rewritten:', OLD_TEXT, '→', NEW_TEXT)
    } catch (e) {
      console.warn('[WM] rewrite failed', e)
    }
  }

  const rawAppend = Element.prototype.appendChild
  const rawInsert = Element.prototype.insertBefore

  function handleNode(node) {
    if (!(node instanceof HTMLElement)) return
    rewriteBackgroundImage(node.style)
  }

  Element.prototype.appendChild = function (node) {
    handleNode(node)
    return rawAppend.call(this, node)
  }

  Element.prototype.insertBefore = function (node, ref) {
    handleNode(node)
    return rawInsert.call(this, node, ref)
  }
})()
