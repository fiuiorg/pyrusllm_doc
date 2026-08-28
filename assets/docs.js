/* =========================================================================
   PyrusLLM documentation — page shell.

   Every page ships only its own <article id="doc">. This script builds the
   topbar, the tab row, the sidebar, the right-hand table of contents and the
   prev/next footer from the NAV table below, so the navigation stays
   identical across pages without a build step. It runs fine over file://
   because nothing is fetched: the nav is data, not a request.
   ========================================================================= */
(function () {
  'use strict'

  var VERSION = 'v0.12.1'

  // ---------------------------------------------------------------- nav ---
  // hrefs are relative to the project root; data-root on <body> rebases them.
  var NAV = [
    {
      id: 'docs', label: 'Documentation', home: 'index.html',
      groups: [
        { title: 'Getting started', items: [
          { t: 'Welcome',              h: 'index.html',            k: 'home start intro pyrusllm' },
          { t: 'Overview',             h: 'docs/overview.html',    k: 'manifest marketplace p2p pear provenance cli api' },
          { t: 'Install & quickstart', h: 'docs/install.html',     k: 'npm pear bare install quickstart curl first request' }
        ]},
        { title: 'CLI reference', items: [
          { t: 'Global flags & core',  h: 'docs/cli.html',         k: 'prompt serve peers flags storage port gpu-layers swarm demo' },
          { t: 'Files over P2P',       h: 'docs/cli-files.html',   k: 'send fetch files hyperdrive qvac merkle link' },
          { t: 'Wallet',               h: 'docs/cli-wallet.html',  k: 'wallet create restore seed 24 words passphrase payout' }
        ]},
        { title: 'API basics', items: [
          { t: 'Authentication',       h: 'docs/authentication.html', k: 'bearer key token auth panel bootstrap' },
          { t: 'Errors',               h: 'docs/errors.html',      k: 'error 400 401 402 404 502 status codes' }
        ]},
        { title: 'API reference', items: [
          { t: 'Inference',            h: 'docs/api-inference.html', m: 'post', k: 'chat completions models stream openai local node provenance headers' },
          { t: 'Network',              h: 'docs/api-network.html',   m: 'get',  k: 'nodes agent launch swarm manifest routing log peers kind' },
          { t: 'API keys',             h: 'docs/api-keys.html',      m: 'post', k: 'keys create revoke delete label' },
          { t: 'Economics & x402',     h: 'docs/api-economics.html', m: 'get',  k: 'quota budget spend cap receipts x402 payment attestation' },
          { t: 'Wallet',               h: 'docs/api-wallet.html',    m: 'post', k: 'wallet balances history send quote network tokens mainnet' },
          { t: 'Files & upstream',     h: 'docs/api-files.html',     m: 'post', k: 'files upload fetch upstream opt-in external assistant' }
        ]},
        { title: 'Reference', items: [
          { t: 'Browser panels',       h: 'docs/panels.html',      k: 'chat node network wallet admin ui panels' },
          { t: 'Environment & models', h: 'docs/environment.html', k: 'env variables aliases smol llama1b qwen gemma passphrase rpc facilitator' }
        ]}
      ]
    },
    {
      id: 'playground', label: 'API Playground', home: 'docs/playground.html',
      groups: [
        { title: 'Playground', items: [
          { t: 'Console',              h: 'docs/playground.html',        k: 'try it live request k16 node base url send' },
          { t: 'What is restricted',   h: 'docs/playground-safety.html', k: 'safety restricted blocked destructive cors cap' }
        ]}
      ]
    },
    {
      id: 'research', label: 'Research', home: 'docs/research.html',
      groups: [
        { title: 'Overview', items: [
          { t: 'The four papers',      h: 'docs/research.html',            k: 'papers arxiv state of the art map summary' }
        ]},
        { title: 'Paper notes', items: [
          { t: 'PolyLink',             h: 'docs/research-polylink.html',   k: 'polylink tiqe validators vrf cross-encoder llm judge quality incentives 2510.02395' },
          { t: 'DeServe',              h: 'docs/research-deserve.html',    k: 'deserve berkeley dawn song pipeline kv offload batch throughput optimistic 2501.14784' },
          { t: 'AERIA',                h: 'docs/research-aeria.html',      k: 'aeria auction pricing uniform price reserve multi-exit cascade exeter 2503.04521' },
          { t: 'DCBM',                 h: 'docs/research-dcbm.html',       k: 'dcbm pid buyback burn treasury token inflation flock oxford 2601.09961' }
        ]},
        { title: 'Synthesis', items: [
          { t: 'What to build first',  h: 'docs/research-decisions.html',  k: 'decisions signed receipt roadmap d1 d2 d3 do not build' }
        ]}
      ]
    }
  ]

  // ------------------------------------------------------------- helpers ---
  var body = document.body
  var root = body.getAttribute('data-root') || '.'
  var here = body.getAttribute('data-page') || 'index.html'
  var THEME_KEY = 'pyrusdocs.theme'

  function url (h) { return root + '/' + h }
  function el (tag, cls, html) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (html != null) n.innerHTML = html
    return n
  }

  function activeTab () {
    for (var i = 0; i < NAV.length; i++) {
      var g = NAV[i].groups
      for (var j = 0; j < g.length; j++) {
        for (var k = 0; k < g[j].items.length; k++) {
          if (g[j].items[k].h === here) return NAV[i]
        }
      }
    }
    return NAV[0]
  }

  var tab = activeTab()

  function flatItems (t) {
    var out = []
    t.groups.forEach(function (g) { g.items.forEach(function (it) { out.push(it) }) })
    return out
  }

  // --------------------------------------------------------------- theme ---
  function currentTheme () {
    var set = document.documentElement.getAttribute('data-theme')
    if (set) return set
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  function flipTheme () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem(THEME_KEY, next) } catch (e) {}
  }

  // -------------------------------------------------------------- topbar ---
  var top = el('div', 'topbar')
  top.innerHTML =
    '<button class="ico" id="burger" aria-label="Toggle navigation">&#9776;</button>' +
    '<a class="home" href="' + url('index.html') + '">' +
      '<span class="logo" role="img" aria-label="PyrusLLM"></span><b>PyrusLLM</b>' +
    '</a>' +
    '<span class="ver">' + VERSION + '</span>' +
    '<span class="sp"></span>' +
    '<div class="search">' +
      '<span class="mag">&#9906;</span>' +
      '<input id="q" type="search" placeholder="Search docs" autocomplete="off" spellcheck="false" aria-label="Search documentation">' +
      '<span class="kbd">Ctrl K</span>' +
      '<div class="results" id="results" hidden></div>' +
    '</div>' +
    '<button class="ico" id="theme" aria-label="Toggle colour theme">&#9681;</button>'
  body.insertBefore(top, body.firstChild)

  // ---------------------------------------------------------------- tabs ---
  var tabs = el('nav', 'tabbar')
  NAV.forEach(function (t) {
    var a = el('a', t.id === tab.id ? 'on' : '', t.label)
    a.href = url(t.home)
    tabs.appendChild(a)
  })
  body.insertBefore(tabs, top.nextSibling)

  // --------------------------------------------------------------- shell ---
  var article = document.getElementById('doc')
  var shell = el('div', 'shell')
  var side = el('nav', 'side'); side.id = 'side'
  var main = el('main')
  var toc = el('aside', 'toc')
  var scrim = el('div', 'scrim'); scrim.id = 'scrim'

  tab.groups.forEach(function (g) {
    side.appendChild(el('div', 'grp', g.title))
    g.items.forEach(function (it) {
      var a = el('a', it.h === here ? 'on' : '')
      a.href = url(it.h)
      a.innerHTML = (it.m ? '<span class="m ' + it.m + '">' + it.m.toUpperCase() + '</span>' : '') +
                    '<span class="lbl">' + it.t + '</span>'
      side.appendChild(a)
    })
  })

  body.insertBefore(shell, article)
  shell.appendChild(side)
  shell.appendChild(main)
  shell.appendChild(toc)
  main.appendChild(article)
  body.appendChild(scrim)

  // ----------------------------------------------------- anchors + copy ---
  var heads = [].slice.call(article.querySelectorAll('h2[id], h3[id]'))
  heads.forEach(function (h) {
    var a = el('a', 'anch', '#')
    a.href = '#' + h.id
    a.setAttribute('aria-label', 'Link to this section')
    h.appendChild(a)
  })

  ;[].slice.call(article.querySelectorAll('pre')).forEach(function (pre) {
    var b = el('button', 'copy', 'Copy')
    b.type = 'button'
    b.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre
      var txt = code.innerText
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy' }, 1400) }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { b.textContent = 'Failed' })
      } else {
        var ta = document.createElement('textarea')
        ta.value = txt; document.body.appendChild(ta); ta.select()
        try { document.execCommand('copy'); done() } catch (e) { b.textContent = 'Failed' }
        document.body.removeChild(ta)
      }
    })
    pre.appendChild(b)
  })

  // ----------------------------------------------------------------- toc ---
  var tocHeads = heads.filter(function (h) { return h.tagName === 'H2' || h.dataset.toc === 'yes' })
  if (tocHeads.length > 1) {
    toc.appendChild(el('div', 'ttl', 'On this page'))
    tocHeads.forEach(function (h) {
      var a = el('a', h.tagName === 'H3' ? 'h3' : '')
      a.href = '#' + h.id
      a.textContent = (h.textContent || '').replace(/#$/, '').trim()
      a.dataset.for = h.id
      toc.appendChild(a)
    })
    if ('IntersectionObserver' in window) {
      var seen = {}
      var links = [].slice.call(toc.querySelectorAll('a'))
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting })
        var act = null
        for (var i = 0; i < tocHeads.length; i++) {
          if (seen[tocHeads[i].id]) { act = tocHeads[i].id; break }
        }
        if (!act) return
        links.forEach(function (a) { a.classList.toggle('on', a.dataset.for === act) })
      }, { rootMargin: '-12% 0px -76% 0px' })
      tocHeads.forEach(function (h) { obs.observe(h) })
    }
  }

  // ----------------------------------------------------------- prev/next ---
  var flat = flatItems(tab)
  var idx = -1
  flat.forEach(function (it, i) { if (it.h === here) idx = i })
  if (idx >= 0 && flat.length > 1) {
    var pn = el('div', 'pn')
    if (idx > 0) {
      var p = el('a', 'prev', '<small>Previous</small><b>' + flat[idx - 1].t + '</b>')
      p.href = url(flat[idx - 1].h); pn.appendChild(p)
    }
    if (idx < flat.length - 1) {
      var n = el('a', 'next', '<small>Next</small><b>' + flat[idx + 1].t + '</b>')
      n.href = url(flat[idx + 1].h); pn.appendChild(n)
    }
    if (pn.children.length) article.appendChild(pn)
  }

  article.appendChild(el('div', 'foot',
    'PyrusLLM ' + VERSION + ' &middot; Apache-2.0 &middot; ' +
    'Generated from the source of <code>bin.mjs</code> and <code>qvac/gateway.mjs</code>.'))

  // -------------------------------------------------------------- search ---
  // Indexes every page title and its keyword list, plus the headings of the
  // page currently open. Cross-page full text is deliberately not indexed:
  // over file:// there is no way to read the other pages.
  var INDEX = []
  NAV.forEach(function (t) {
    t.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        INDEX.push({ t: it.t, sub: t.label + ' · ' + g.title, h: url(it.h), k: (it.t + ' ' + (it.k || '')).toLowerCase() })
      })
    })
  })
  heads.forEach(function (h) {
    var txt = (h.textContent || '').replace(/#$/, '').trim()
    INDEX.push({ t: txt, sub: 'On this page', h: '#' + h.id, k: txt.toLowerCase() })
  })

  var q = document.getElementById('q')
  var box = document.getElementById('results')
  var sel = -1

  function render (list) {
    box.innerHTML = ''
    sel = -1
    if (!list.length) { box.appendChild(el('div', 'none', 'No matches.')); box.hidden = false; return }
    list.slice(0, 12).forEach(function (r) {
      var a = el('a', '', r.t + '<small>' + r.sub + '</small>')
      a.href = r.h
      box.appendChild(a)
    })
    box.hidden = false
  }
  function search () {
    var v = q.value.trim().toLowerCase()
    if (!v) { box.hidden = true; return }
    var terms = v.split(/\s+/)
    render(INDEX.filter(function (r) {
      return terms.every(function (t) { return r.k.indexOf(t) !== -1 })
    }))
  }
  q.addEventListener('input', search)
  q.addEventListener('focus', search)
  q.addEventListener('keydown', function (e) {
    var opts = [].slice.call(box.querySelectorAll('a'))
    if (e.key === 'Escape') { box.hidden = true; q.blur() }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!opts.length) return
      e.preventDefault()
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length
      opts.forEach(function (a, i) { a.classList.toggle('sel', i === sel) })
      opts[sel].scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter' && sel >= 0 && opts[sel]) {
      e.preventDefault(); opts[sel].click()
    }
  })
  document.addEventListener('click', function (e) {
    if (!box.contains(e.target) && e.target !== q) box.hidden = true
  })
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); q.select() }
    if (e.key === '/' && document.activeElement !== q && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); q.focus()
    }
  })

  // ------------------------------------------------------ theme + drawer ---
  document.getElementById('theme').addEventListener('click', flipTheme)
  var burger = document.getElementById('burger')
  function closeDrawer () { side.classList.remove('open'); scrim.classList.remove('on') }
  burger.addEventListener('click', function () {
    side.classList.toggle('open'); scrim.classList.toggle('on')
  })
  scrim.addEventListener('click', closeDrawer)
  ;[].slice.call(side.querySelectorAll('a')).forEach(function (a) { a.addEventListener('click', closeDrawer) })

  // Keep the active sidebar entry in view on a long nav.
  var on = side.querySelector('a.on')
  if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' })
})()
