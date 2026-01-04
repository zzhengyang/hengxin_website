(() => {
  const renderLayoutComponents = () => {
    const headerHost = document.querySelector('[data-component="header"]');
    const footerHost = document.querySelector('[data-component="footer"]');

    const path = (window.location && window.location.pathname) ? window.location.pathname.split("/").pop() : "";
    const current = path || "index.html";

    const navItems = [
      { href: "./index.html", label: "首页" },
      { href: "./dept-food.html", label: "分选事业部" },
      { href: "./dept-powder.html", label: "粉体输送事业部" },
      { href: "./dept-environment.html", label: "环保事业部" },
      { href: "./about.html", label: "关于双鑫" },
      { href: "./news.html", label: "新闻中心" },
      { href: "./contact.html", label: "联系我们" },
      { href: "https://lzsxzdh.1688.com/?spm=0.0.wp_pc_common_topnav_38229151.0", label: "阿里巴巴", external: true },
    ];

    if (headerHost) {
      headerHost.innerHTML = `
        <header class="topbar topbar--premium">
          <a class="brand brand--img" href="./index.html" aria-label="返回首页">
            <span class="brand__logo" aria-hidden="true">
              <img class="brand__fullLogo" src="./assets/img/logo.png" alt="双鑫自动化" />
            </span>
          </a>
          <nav class="nav">
            ${navItems
              .map((i) => {
                const isExternal = Boolean(i.external) || /^https?:\/\//.test(i.href);
                const hrefKey = i.href.replace("./", "");
                const isActive =
                  !isExternal &&
                  (hrefKey === current ||
                    (current === "news-detail.html" && hrefKey === "news.html"));
                const extra = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
                const aria = isActive ? ' aria-current="page"' : "";
                return `<a class="nav__link ${isActive ? "is-active" : ""}" href="${i.href}"${extra}${aria}>${i.label}</a>`;
              })
              .join("")}
          </nav>
        </header>
      `.trim();
    }

    if (footerHost) {
      footerHost.innerHTML = `
        <footer class="site-footer" aria-label="网站底栏">
          <div class="site-footer__inner">
            <div class="site-footer__row site-footer__row--top">
              <span class="site-footer__text">鲁公网安备 37068302000438号</span>
            </div>
            <div class="site-footer__row site-footer__row--bottom">
              <span class="site-footer__text">Copyright © 2021 莱州市双鑫自动化设备有限公司</span>
              <span class="site-footer__sep">　</span>
              <span class="site-footer__text">备案号：鲁ICP备2022031631号-1</span>
              <span class="site-footer__sep">　</span>
              <span class="site-footer__text">All rights reserved.</span>
              <span class="site-footer__sep">　</span>
              <span class="site-footer__text">技术支持：山东智通云</span>
            </div>
          </div>
        </footer>
      `.trim();
    }
  };

  renderLayoutComponents();

  const getCurrentPage = () => {
    const path = (window.location && window.location.pathname) ? window.location.pathname.split("/").pop() : "";
    return path || "index.html";
  };

  const getQuery = (key) => {
    try {
      return new URLSearchParams(window.location.search).get(key);
    } catch {
      return null;
    }
  };

  const escapeHtml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  const fetchJson = async (url) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.json();
  };

  const downloadText = (filename, text, mime = "application/json;charset=utf-8") => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const slugify = (s) =>
    String(s ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s\/\\]+/g, "-")
      .replace(/[^a-z0-9\u4e00-\u9fa5\-]+/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const today = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const initOps = async () => {
    const page = getCurrentPage();
    if (page !== "ops.html") return;

    const els = {
      app: document.getElementById("opsApp"),
      items: document.getElementById("opsItems"),
      count: document.getElementById("opsCount"),
      search: document.getElementById("opsSearch"),
      addBtn: document.getElementById("opsAddBtn"),
      exportBtn: document.getElementById("opsExportBtn"),
      saveFileBtn: document.getElementById("opsSaveFileBtn"),
      reloadBtn: document.getElementById("opsReloadBtn"),
      importBtn: document.getElementById("opsImportBtn"),
      fileInput: document.getElementById("opsFileInput"),
      form: document.getElementById("opsForm"),
      title: document.getElementById("opsTitle"),
      category: document.getElementById("opsCategory"),
      date: document.getElementById("opsDate"),
      rteToolbar: document.getElementById("opsRteToolbar"),
      rte: document.getElementById("opsRte"),
      toggleSourceBtn: document.getElementById("opsToggleSourceBtn"),
      source: document.getElementById("opsContentSource"),
      meta: document.getElementById("opsMeta"),
      editorTitle: document.getElementById("opsEditorTitle"),
      deleteBtn: document.getElementById("opsDeleteBtn"),
      dupBtn: document.getElementById("opsDuplicateBtn"),
      previewBtn: document.getElementById("opsPreviewBtn"),
      preview: document.getElementById("opsPreview"),
      previewBody: document.getElementById("opsPreviewBody"),
      closePreviewBtn: document.getElementById("opsClosePreviewBtn"),
      saveBtn: document.getElementById("opsSaveBtn"),
    };

    if (!els.items || !els.form || !els.title || !els.category || !els.rte || !els.source || !els.rteToolbar) return;

    const STORAGE_KEY = "hx_ops_news_draft_v1";
    const dataUrl = "./assets/data/news.json";

    let list = [];
    let selectedId = null;
    let searchText = "";

    const normalize = (items) => {
      const arr = Array.isArray(items) ? items : [];
      const out = arr
        .map((it) => ({
          id: String(it?.id ?? ""),
          title: String(it?.title ?? ""),
          date: String(it?.date ?? ""),
          category: String(it?.category ?? ""),
          content: String(it?.content ?? ""),
        }))
        .filter((it) => it.title);

      // 确保 id
      out.forEach((it) => {
        if (!it.id) it.id = slugify(it.title) || `post-${Math.random().toString(16).slice(2)}`;
      });

      // 按日期倒序
      out.sort((a, b) => {
        const ta = Date.parse(a.date || "");
        const tb = Date.parse(b.date || "");
        if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
        if (Number.isFinite(ta) && !Number.isFinite(tb)) return -1;
        if (!Number.isFinite(ta) && Number.isFinite(tb)) return 1;
        return a.title.localeCompare(b.title, "zh-Hans-CN");
      });
      return out;
    };

    const loadInitial = async () => {
      // 优先从 localStorage 草稿恢复（避免误刷新丢失）
      const draft = window.localStorage.getItem(STORAGE_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          list = normalize(parsed);
          return;
        } catch {
          // ignore
        }
      }

      const items = await fetchJson(dataUrl);
      list = normalize(items);
    };

    const persistDraft = () => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list, null, 2));
      } catch {
        // ignore
      }
    };

    const filtered = () => {
      const q = searchText.trim().toLowerCase();
      if (!q) return list;
      return list.filter((it) => `${it.title} ${it.category}`.toLowerCase().includes(q));
    };

    const renderList = () => {
      const items = filtered();
      if (els.count) els.count.textContent = `共 ${items.length} 篇`;
      if (!els.items) return;
      if (items.length === 0) {
        els.items.innerHTML = `<div class="news__empty">暂无文章。</div>`;
        return;
      }

      els.items.innerHTML = items
        .map((it) => {
          const isActive = it.id === selectedId;
          const excerpt = stripHtml(it.content).slice(0, 68);
          return `
            <button class="ops-item ${isActive ? "is-active" : ""}" type="button" data-id="${escapeHtml(it.id)}">
              <div class="ops-item__title">${escapeHtml(it.title)}</div>
              <div class="ops-item__meta">
                <span class="ops-item__tag">${escapeHtml(it.category || "未分类")}</span>
                <span class="ops-item__date">${escapeHtml(it.date || "")}</span>
              </div>
              <div class="ops-item__excerpt">${escapeHtml(excerpt)}${excerpt.length >= 68 ? "…" : ""}</div>
            </button>
          `.trim();
        })
        .join("");
    };

    const setEditorEnabled = (enabled) => {
      if (els.deleteBtn) els.deleteBtn.disabled = !enabled;
      if (els.dupBtn) els.dupBtn.disabled = !enabled;
      if (els.saveBtn) els.saveBtn.disabled = !enabled;
    };

    const renderEditor = () => {
      const item = list.find((x) => x.id === selectedId) || null;
      if (!item) {
        if (els.editorTitle) els.editorTitle.textContent = "选择一篇文章进行编辑";
        if (els.meta) els.meta.textContent = "";
        els.title.value = "";
        els.category.value = "";
        if (els.date) els.date.value = "";
        els.rte.innerHTML = "";
        els.source.value = "";
        setEditorEnabled(false);
        return;
      }
      if (els.editorTitle) els.editorTitle.textContent = "编辑文章";
      els.title.value = item.title;
      els.category.value = item.category;
      if (els.date) els.date.value = item.date;
      els.rte.innerHTML = item.content || "";
      els.source.value = item.content || "";
      if (els.meta) els.meta.textContent = `ID：${item.id}`;
      setEditorEnabled(true);
    };

    const select = (id) => {
      selectedId = id;
      renderList();
      renderEditor();
    };

    const upsert = (item) => {
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      list = normalize(list);
      persistDraft();
    };

    const removeById = (id) => {
      list = list.filter((x) => x.id !== id);
      persistDraft();
    };

    // init
    els.items.innerHTML = `<div class="news__empty">加载中…</div>`;
    try {
      await loadInitial();
    } catch (e) {
      if (els.app) {
        els.app.innerHTML = `<div class="news__empty">加载失败：${escapeHtml(e?.message || String(e))}</div>`;
      }
      return;
    }
    renderList();
    renderEditor();

    // list click
    els.items.addEventListener("click", (e) => {
      const btn = e.target?.closest?.(".ops-item");
      const id = btn?.getAttribute?.("data-id");
      if (!id) return;
      select(id);
    });

    // search
    els.search?.addEventListener("input", (e) => {
      searchText = e.target?.value ?? "";
      renderList();
    });

    // add
    els.addBtn?.addEventListener("click", () => {
      const baseTitle = "新文章";
      const newIdBase = slugify(baseTitle) || "new-post";
      let id = newIdBase;
      let i = 1;
      while (list.some((x) => x.id === id)) {
        id = `${newIdBase}-${i++}`;
      }
      const item = {
        id,
        title: baseTitle,
        date: today(),
        category: "行业资讯",
        content: "<p>请输入文章内容…</p>",
      };
      upsert(item);
      select(id);
    });

    // duplicate
    els.dupBtn?.addEventListener("click", () => {
      const cur = list.find((x) => x.id === selectedId);
      if (!cur) return;
      const newIdBase = slugify(cur.title) || "copy";
      let id = `${newIdBase}-copy`;
      let i = 1;
      while (list.some((x) => x.id === id)) {
        id = `${newIdBase}-copy-${i++}`;
      }
      const item = { ...cur, id, title: `${cur.title}（复制）` };
      upsert(item);
      select(id);
    });

    // delete
    els.deleteBtn?.addEventListener("click", () => {
      const cur = list.find((x) => x.id === selectedId);
      if (!cur) return;
      const ok = window.confirm(`确认删除：${cur.title} ？`);
      if (!ok) return;
      removeById(cur.id);
      selectedId = null;
      renderList();
      renderEditor();
    });

    // save (in-memory + local draft)
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = list.find((x) => x.id === selectedId);
      if (!cur) return;

      const title = els.title.value.trim();
      const category = els.category.value.trim();
      const content = (els.rte.innerHTML || "").trim();
      const date = (els.date?.value || "").trim() || today();
      if (!title || !category || !content) return;

      const next = { ...cur, title, category, date, content };
      upsert(next);
      select(next.id);
    });

    // 富文本：工具栏
    const focusRte = () => {
      try {
        els.rte.focus();
      } catch {
        // ignore
      }
    };

    const exec = (cmd, value = null) => {
      focusRte();
      try {
        document.execCommand(cmd, false, value);
      } catch {
        // ignore
      }
      els.source.value = els.rte.innerHTML || "";
    };

    els.rteToolbar.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button");
      if (!btn) return;
      const cmd = btn.getAttribute("data-cmd");
      const action = btn.getAttribute("data-action");
      const val = btn.getAttribute("data-value");
      if (cmd) {
        if (cmd === "formatBlock") exec("formatBlock", (val || "p").toUpperCase());
        else exec(cmd);
        return;
      }
      if (action === "link") {
        const url = window.prompt("请输入链接 URL（例如 https://...）");
        if (!url) return;
        exec("createLink", url);
        return;
      }
      if (action === "image") {
        const url = window.prompt("请输入图片 URL（例如 https://...）");
        if (!url) return;
        exec("insertImage", url);
      }
    });

    // 富文本：编辑时同步到源码（用于导出/保存）
    els.rte.addEventListener("input", () => {
      els.source.value = els.rte.innerHTML || "";
    });

    // 源码模式切换：允许直接编辑 HTML
    let isSource = false;
    const setSourceMode = (on) => {
      isSource = on;
      els.source.hidden = !on;
      els.rte.hidden = on;
      if (els.toggleSourceBtn) els.toggleSourceBtn.textContent = on ? "富文本" : "源码";
      if (on) {
        els.source.value = els.rte.innerHTML || "";
        els.source.focus();
      } else {
        els.rte.innerHTML = els.source.value || "";
        focusRte();
      }
    };
    els.toggleSourceBtn?.addEventListener("click", () => setSourceMode(!isSource));
    els.source.addEventListener("input", () => {
      if (!isSource) return;
      els.rte.innerHTML = els.source.value || "";
    });

    // preview
    const openPreview = () => {
      if (!els.preview || !els.previewBody) return;
      els.preview.hidden = false;
      els.previewBody.innerHTML = els.rte.innerHTML || "";
    };
    const closePreview = () => {
      if (!els.preview) return;
      els.preview.hidden = true;
    };
    els.previewBtn?.addEventListener("click", openPreview);
    els.closePreviewBtn?.addEventListener("click", closePreview);

    // export (download)
    const exportJson = () => JSON.stringify(list, null, 2);
    els.exportBtn?.addEventListener("click", () => {
      downloadText("new.json", exportJson());
    });

    // save to file (File System Access API, chromium)
    els.saveFileBtn?.addEventListener("click", async () => {
      try {
        if (!window.showSaveFilePicker) {
          downloadText("new.json", exportJson());
          return;
        }
        const handle = await window.showSaveFilePicker({
          suggestedName: "new.json",
          types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(exportJson());
        await writable.close();
        window.alert("已保存 new.json");
      } catch (e) {
        // 用户取消也会抛异常：静默处理
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    // reload from assets/data/news.json (discard draft)
    els.reloadBtn?.addEventListener("click", async () => {
      const ok = window.confirm("重新加载会丢弃当前草稿（localStorage）。确认继续？");
      if (!ok) return;
      window.localStorage.removeItem(STORAGE_KEY);
      els.items.innerHTML = `<div class="news__empty">加载中…</div>`;
      list = [];
      selectedId = null;
      try {
        await loadInitial();
      } catch (e) {
        if (els.app) els.app.innerHTML = `<div class="news__empty">加载失败：${escapeHtml(e?.message || String(e))}</div>`;
        return;
      }
      renderList();
      renderEditor();
    });

    // import
    const openFile = () => {
      if (!els.fileInput) return;
      els.fileInput.value = "";
      els.fileInput.click();
    };
    els.importBtn?.addEventListener("click", openFile);
    els.fileInput?.addEventListener("change", async (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        list = normalize(parsed);
        persistDraft();
        selectedId = null;
        renderList();
        renderEditor();
      } catch (err) {
        window.alert(`导入失败：${err?.message || String(err)}`);
      }
    });
  };

  const initNews = async () => {
    const page = getCurrentPage();
    const isList = page === "news.html";
    const isDetail = page === "news-detail.html";
    if (!isList && !isDetail) return;

    const dataUrl = "./assets/data/news.json";
    const host = document.getElementById(isList ? "newsApp" : "newsDetailApp");

    // 立即给一个占位，避免“空白页”观感
    if (isList) {
      const listEl = document.getElementById("newsList");
      if (listEl) listEl.innerHTML = `<div class="news__empty">加载中…</div>`;
    }

    const items = await fetchJson(dataUrl);

    const normalized = Array.isArray(items)
      ? items
          .map((it) => ({
            id: String(it?.id ?? ""),
            title: String(it?.title ?? ""),
            date: String(it?.date ?? ""),
            category: String(it?.category ?? ""),
            content: String(it?.content ?? ""),
          }))
          .filter((it) => it.id && it.title)
      : [];

    // 统一排序：按日期倒序（新到旧），保证列表与“上一篇/下一篇”一致
    normalized.sort((a, b) => {
      const ta = Date.parse(a.date || "");
      const tb = Date.parse(b.date || "");
      if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
      if (Number.isFinite(ta) && !Number.isFinite(tb)) return -1;
      if (!Number.isFinite(ta) && Number.isFinite(tb)) return 1;
      return a.title.localeCompare(b.title, "zh-Hans-CN");
    });

    if (normalized.length === 0 && host) {
      host.innerHTML = `<div class="news__empty">新闻数据为空或格式不正确：请检查 <code>${escapeHtml(dataUrl)}</code> 是否为数组且每条包含 <code>id</code>、<code>title</code>。</div>`;
      return;
    }

    if (isList) {
      const listEl = document.getElementById("newsList");
      const pagerEl = document.getElementById("newsPager");
      if (!listEl || !pagerEl) return;

      const pageSize = 6;
      const total = normalized.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const currentPage = Math.min(totalPages, Math.max(1, Number(getQuery("page") || 1)));
      const start = (currentPage - 1) * pageSize;
      const pageItems = normalized.slice(start, start + pageSize);

      if (pageItems.length === 0) {
        listEl.innerHTML = `<div class="news__empty">暂无新闻。</div>`;
      } else {
        listEl.innerHTML = pageItems
          .map((it) => {
            const excerpt = stripHtml(it.content).slice(0, 120);
            const href = `./news-detail.html?id=${encodeURIComponent(it.id)}`;
            return `
              <a class="news-item" href="${href}" aria-label="${escapeHtml(it.title)}">
                <div class="news-item__head">
                  <div class="news-item__title">${escapeHtml(it.title)}</div>
                  <time class="news-item__date" datetime="${escapeHtml(it.date)}">${escapeHtml(it.date)}</time>
                </div>
                <p class="news-item__excerpt">${escapeHtml(excerpt)}${excerpt.length >= 120 ? "…" : ""}</p>
                <div class="news-item__foot">
                  <span class="news-item__tag">${escapeHtml(it.category || "新闻资讯")}</span>
                </div>
              </a>
            `.trim();
          })
          .join("");
      }

      const mkLink = (p, label, disabled = false, aria = "") => {
        const href = `./news.html?page=${p}`;
        return `<a class="news-pager__btn ${disabled ? "is-disabled" : ""}" href="${disabled ? "javascript:void(0)" : href}" ${disabled ? 'aria-disabled="true"' : ""} ${aria}>${label}</a>`;
      };

      const nums = [];
      const windowSize = 5;
      const half = Math.floor(windowSize / 2);
      let from = Math.max(1, currentPage - half);
      let to = Math.min(totalPages, from + windowSize - 1);
      from = Math.max(1, to - windowSize + 1);
      for (let i = from; i <= to; i++) nums.push(i);

      pagerEl.innerHTML = `
        <div class="news-pager">
          ${mkLink(currentPage - 1, "‹", currentPage <= 1, 'aria-label="上一页"')}
          ${nums
            .map((n) => mkLink(n, n, false, n === currentPage ? 'aria-current="page"' : ""))
            .join("")}
          ${mkLink(currentPage + 1, "›", currentPage >= totalPages, 'aria-label="下一页"')}
          <span class="news-pager__meta">共${totalPages}页</span>
          <label class="news-pager__jump">
            <span>到第</span>
            <input class="news-pager__input" id="newsJumpInput" inputmode="numeric" pattern="[0-9]*" />
            <span>页</span>
          </label>
          <button class="news-pager__go" id="newsJumpGo" type="button">确定</button>
        </div>
      `.trim();

      const input = document.getElementById("newsJumpInput");
      const btn = document.getElementById("newsJumpGo");
      const go = () => {
        const val = Number(input?.value || "");
        if (!Number.isFinite(val) || val <= 0) return;
        const p = Math.min(totalPages, Math.max(1, Math.floor(val)));
        window.location.href = `./news.html?page=${p}`;
      };
      btn?.addEventListener("click", go);
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") go();
      });
    }

    if (isDetail) {
      const id = getQuery("id");
      const idx = normalized.findIndex((it) => it.id === id);
      const item = idx >= 0 ? normalized[idx] : null;
      const titleEl = document.getElementById("newsDetailTitle");
      const dateEl = document.getElementById("newsDetailDate");
      const catEl = document.getElementById("newsDetailCategory");
      const bodyEl = document.getElementById("newsDetailBody");
      const crumbEl = document.getElementById("newsDetailCrumb");
      const prevLink = document.getElementById("newsPrevLink");
      const nextLink = document.getElementById("newsNextLink");
      const prevTitle = document.getElementById("newsPrevTitle");
      const nextTitle = document.getElementById("newsNextTitle");
      if (!titleEl || !dateEl || !catEl || !bodyEl) return;

      if (!item) {
        titleEl.textContent = "未找到该新闻";
        dateEl.textContent = "";
        catEl.textContent = "";
        bodyEl.innerHTML = `<div class="news__empty">该新闻不存在或参数缺失（请从列表页进入）。</div>`;
        return;
      }

      titleEl.textContent = item.title;
      dateEl.textContent = item.date;
      catEl.textContent = item.category || "新闻资讯";
      bodyEl.innerHTML = item.content || `<p>${escapeHtml(stripHtml(item.content))}</p>`;
      document.title = `${item.title} - 新闻详情`;
      if (crumbEl) crumbEl.textContent = item.title;

      // 上一篇/下一篇（按列表排序）
      const prev = idx > 0 ? normalized[idx - 1] : null;
      const next = idx >= 0 && idx < normalized.length - 1 ? normalized[idx + 1] : null;

      if (prevLink && prevTitle) {
        if (prev) {
          prevLink.href = `./news-detail.html?id=${encodeURIComponent(prev.id)}`;
          prevTitle.textContent = prev.title;
          prevLink.classList.remove("is-disabled");
          prevLink.setAttribute("aria-disabled", "false");
        } else {
          prevLink.href = "javascript:void(0)";
          prevTitle.textContent = "无";
          prevLink.classList.add("is-disabled");
          prevLink.setAttribute("aria-disabled", "true");
        }
      }

      if (nextLink && nextTitle) {
        if (next) {
          nextLink.href = `./news-detail.html?id=${encodeURIComponent(next.id)}`;
          nextTitle.textContent = next.title;
          nextLink.classList.remove("is-disabled");
          nextLink.setAttribute("aria-disabled", "false");
        } else {
          nextLink.href = "javascript:void(0)";
          nextTitle.textContent = "无";
          nextLink.classList.add("is-disabled");
          nextLink.setAttribute("aria-disabled", "true");
        }
      }
    }
  };

  const initProducts = async () => {
    const page = getCurrentPage();
    const isDetail = page === "product-detail.html";
    const hosts = Array.from(document.querySelectorAll('[data-component="product-center"]'));
    if (hosts.length === 0 && !isDetail) return;

    const dataUrl = "./assets/data/products.json";
    const data = await fetchJson(dataUrl);
    const catsAll = Array.isArray(data?.categories) ? data.categories : [];
    const productsAll = Array.isArray(data?.products) ? data.products : [];
    const defaults = data?.defaults || {};

    const normCats = catsAll
      .map((c) => ({
        id: String(c?.id ?? ""),
        label: String(c?.label ?? ""),
        scope: String(c?.scope ?? ""),
      }))
      .filter((c) => c.id && c.label);

    const normProducts = productsAll
      .map((p) => ({
        id: String(p?.id ?? ""),
        title: String(p?.title ?? ""),
        categoryId: String(p?.categoryId ?? ""),
        cover: String(p?.cover ?? ""),
        images: Array.isArray(p?.images) ? p.images.map(String) : [],
        summary: String(p?.summary ?? ""),
        brand: String(p?.brand ?? defaults.brand ?? ""),
        contact: String(p?.contact ?? defaults.contact ?? ""),
        phone: String(p?.phone ?? defaults.phone ?? ""),
        address: String(p?.address ?? defaults.address ?? ""),
      }))
      .filter((p) => p.id && p.title && p.categoryId);

    const getCatLabel = (id) => normCats.find((c) => c.id === id)?.label || "";

    const renderCenter = (host) => {
      const scope = String(host.getAttribute("data-scope") || "");
      const cats = scope ? normCats.filter((c) => c.scope === scope) : normCats;
      const products = scope ? normProducts.filter((p) => cats.some((c) => c.id === p.categoryId)) : normProducts;

      if (cats.length === 0) {
        host.innerHTML = `<div class="news__empty">暂无分类。</div>`;
        return;
      }

      const queryCat = getQuery("cat");
      let activeCat = queryCat && cats.some((c) => c.id === queryCat) ? queryCat : cats[0].id;

      const render = () => {
        const list = products.filter((p) => p.categoryId === activeCat);
        host.innerHTML = `
          <div class="product-center">
            <div class="product-tabs" role="tablist" aria-label="产品分类">
              ${cats
                .map((c) => {
                  const isActive = c.id === activeCat;
                  return `<button class="product-tab ${isActive ? "is-active" : ""}" type="button" role="tab" aria-selected="${isActive ? "true" : "false"}" data-cat="${escapeHtml(c.id)}">${escapeHtml(c.label)}</button>`;
                })
                .join("")}
            </div>
            <div class="product-grid" aria-label="产品列表">
              ${list
                .map((p) => {
                  const cover = p.cover || p.images[0] || "./assets/bg/home-1.jpg.webp";
                  const href = `./product-detail.html?id=${encodeURIComponent(p.id)}&cat=${encodeURIComponent(activeCat)}`;
                  return `
                    <a class="product-card" href="${href}" aria-label="${escapeHtml(p.title)}">
                      <div class="product-card__imgWrap">
                        <img class="product-card__img" src="${escapeHtml(cover)}" alt="" loading="lazy" />
                      </div>
                      <div class="product-card__title">${escapeHtml(p.title)}</div>
                    </a>
                  `.trim();
                })
                .join("")}
            </div>
          </div>
        `.trim();

        const tabBar = host.querySelector(".product-tabs");
        tabBar?.addEventListener("click", (e) => {
          const btn = e.target?.closest?.(".product-tab");
          const cat = btn?.getAttribute?.("data-cat");
          if (!cat || cat === activeCat) return;
          activeCat = cat;
          try {
            const url = new URL(window.location.href);
            url.searchParams.set("cat", activeCat);
            window.history.replaceState({}, "", url.toString());
          } catch {
            // ignore
          }
          render();
        });
      };

      render();
    };

    hosts.forEach(renderCenter);

    if (!isDetail) return;

    const id = getQuery("id");
    const item = normProducts.find((p) => p.id === id) || null;
    const app = document.getElementById("productDetailApp");
    const titleEl = document.getElementById("productTitle");
    const crumbEl = document.getElementById("productCrumb");
    const imgEl = document.getElementById("productMainImg");
    const dotsEl = document.getElementById("productDots");
    const brandEl = document.getElementById("productBrand");
    const contactEl = document.getElementById("productContact");
    const phoneEl = document.getElementById("productPhone");
    const addrEl = document.getElementById("productAddress");
    const callBtn = document.getElementById("productCallBtn");
    const bookBtn = document.getElementById("productBookBtn");
    const descEl = document.getElementById("productDesc");
    const shareEl = document.getElementById("productShare");

    if (!app || !titleEl || !imgEl || !dotsEl) return;
    if (!item) {
      app.innerHTML = `<div class="news__empty">未找到该产品，请从产品中心进入。</div>`;
      return;
    }

    titleEl.textContent = item.title;
    document.title = `${item.title} - 产品详情`;
    if (crumbEl) crumbEl.textContent = item.title;
    if (brandEl) brandEl.textContent = item.brand;
    if (contactEl) contactEl.textContent = item.contact;
    if (phoneEl) phoneEl.textContent = item.phone;
    if (addrEl) addrEl.textContent = item.address;
    if (descEl) descEl.textContent = item.summary || getCatLabel(item.categoryId);
    if (callBtn) callBtn.href = `tel:${item.phone || defaults.phone || ""}`;
    if (bookBtn) bookBtn.href = "./contact.html";
    if (shareEl) {
      shareEl.href = window.location.href;
      shareEl.addEventListener("click", async (e) => {
        e.preventDefault();
        const url = window.location.href;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            window.alert("链接已复制");
          } else {
            window.prompt("复制链接：", url);
          }
        } catch {
          window.prompt("复制链接：", url);
        }
      });
    }

    const images = (item.images && item.images.length ? item.images : [item.cover]).filter(Boolean);
    let active = 0;
    const setActive = (i) => {
      active = Math.max(0, Math.min(images.length - 1, i));
      imgEl.src = images[active];
      const dots = Array.from(dotsEl.querySelectorAll(".product-dot"));
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === active));
    };

    dotsEl.innerHTML = images
      .map((_, i) => `<button class="product-dot ${i === 0 ? "is-active" : ""}" type="button" aria-label="切换图片 ${i + 1}"></button>`)
      .join("");
    dotsEl.addEventListener("click", (e) => {
      const btn = e.target?.closest?.(".product-dot");
      if (!btn) return;
      const idx = Array.from(dotsEl.querySelectorAll(".product-dot")).indexOf(btn);
      if (idx >= 0) setActive(idx);
    });

    setActive(0);
  };

  // 初始化新闻模块（列表/详情）
  initNews().catch((e) => {
    // 兜底：任何异常都给出可见提示，避免页面一直停留在“加载中…”
    try {
      const page = getCurrentPage();
      const isList = page === "news.html";
      const isDetail = page === "news-detail.html";
      const host = document.getElementById(isList ? "newsApp" : isDetail ? "newsDetailApp" : "");
      if (host) {
        host.innerHTML = `
          <div class="news__empty">
            新闻渲染失败：${escapeHtml(e?.message || String(e))}<br/>
            当前页面：<code>${escapeHtml(window.location.href)}</code><br/>
            建议：确保通过本地服务器访问（非 file://），并确认 <code>assets/data/news.json</code> 可被访问。
          </div>
        `.trim();
      }
    } catch {
      // ignore
    }
    // 仍然输出到控制台便于排查
    // eslint-disable-next-line no-console
    console.error(e);
  });

  // 初始化运维页面（文章管理）
  initOps().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
  });

  // 初始化产品中心/产品详情
  initProducts().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
  });

  const hero = document.getElementById("hero");
  const track = document.getElementById("carouselTrack");
  // 非首页也需要其它模块，因此这里不再 return；仅在存在时初始化轮播
  if (!hero || !track) return;

  const slideCount = track.querySelectorAll(".carousel__item").length;
  let active = 0;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 只更新 background-image，避免覆盖 CSS 中的 background-size/position（保证背景图铺满）
  const setHeroBg = (idx) => {
    hero.style.backgroundImage = `var(--bg-${idx})`;
  };

  const setActive = (idx, opts = { scrollIntoView: true }) => {
    const next = Math.max(0, Math.min(slideCount - 1, idx));
    active = next;
    setHeroBg(active);
    // 需求：第2-4张（index 1-3）不展示主视觉文案，避免与背景图自带文字重叠
    hero.classList.toggle("hero--hide-copy", active !== 0);

    const items = Array.from(track.querySelectorAll(".carousel__item"));
    items.forEach((el, i) => {
      const isActive = i === active;
      el.classList.toggle("is-active", isActive);
      el.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    const target = items[active];
    if (opts.scrollIntoView && target) {
      try {
        target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } catch {
        // Safari older fallback
        const left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
        track.scrollLeft = left;
      }
    }
  };

  // 初始背景
  setActive(0, { scrollIntoView: false });

  // 点击切换
  track.addEventListener("click", (e) => {
    const btn = e.target?.closest?.(".carousel__item");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-slide"));
    if (Number.isFinite(idx)) setActive(idx);
  });

  // 键盘切换（无障碍）
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(active - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive(active + 1);
    }
  });

  // 触控/鼠标拖拽：当横向滑动距离超过阈值时切换背景
  const state = {
    isDown: false,
    startX: 0,
    lastX: 0,
    dragged: false,
  };

  const THRESHOLD = 42; // px

  const onDown = (clientX) => {
    state.isDown = true;
    state.startX = clientX;
    state.lastX = clientX;
    state.dragged = false;
  };

  const onMove = (clientX) => {
    if (!state.isDown) return;
    const dx = clientX - state.lastX;
    state.lastX = clientX;
    if (Math.abs(clientX - state.startX) > 6) state.dragged = true;
    // 让走马灯本身跟随滚动（更直观）
    track.scrollLeft -= dx;
  };

  const onUp = () => {
    if (!state.isDown) return;
    state.isDown = false;
    const total = state.lastX - state.startX;
    if (Math.abs(total) >= THRESHOLD) {
      // 向左滑（total<0）=> 下一张；向右滑（total>0）=> 上一张
      setActive(active + (total < 0 ? 1 : -1));
    } else {
      // 轻微拖动：吸附到最近的缩略图，并同步背景
      syncToNearest();
    }
  };

  const syncToNearest = () => {
    const items = Array.from(track.querySelectorAll(".carousel__item"));
    if (items.length === 0) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    items.forEach((el, i) => {
      const elCenter = el.offsetLeft + el.clientWidth / 2;
      const d = Math.abs(elCenter - center);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    setActive(bestIdx);
  };

  // 鼠标
  track.addEventListener("mousedown", (e) => {
    onDown(e.clientX);
  });
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);

  // 触摸
  track.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || e.touches.length === 0) return;
      onDown(e.touches[0].clientX);
    },
    { passive: true }
  );
  track.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches || e.touches.length === 0) return;
      onMove(e.touches[0].clientX);
    },
    { passive: true }
  );
  track.addEventListener("touchend", onUp);
  track.addEventListener("touchcancel", onUp);

  // 用户手动滚动后，停止一段时间再同步到最近项（更稳）
  let scrollTimer = null;
  track.addEventListener("scroll", () => {
    if (scrollTimer) window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      syncToNearest();
    }, 160);
  });

  // 自动轮播（不新增任何 JS 文件）：用户交互时暂停，停止交互后延迟恢复
  const AUTO_MS = 5200;
  const RESUME_DELAY_MS = 5200;
  let autoTimer = null;
  let resumeTimer = null;
  let isPaused = false;

  const clearTimers = () => {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = null;
  };

  const startAuto = () => {
    if (prefersReducedMotion) return;
    if (autoTimer) return;
    autoTimer = window.setInterval(() => {
      if (isPaused) return;
      setActive(active + 1);
    }, AUTO_MS);
  };

  const pauseAuto = () => {
    isPaused = true;
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = null;
  };

  const resumeAutoLater = () => {
    if (prefersReducedMotion) return;
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      isPaused = false;
    }, RESUME_DELAY_MS);
  };

  // 交互事件：悬停/聚焦/拖拽/触摸时暂停
  track.addEventListener("mouseenter", pauseAuto);
  track.addEventListener("mouseleave", resumeAutoLater);
  track.addEventListener("focusin", pauseAuto);
  track.addEventListener("focusout", resumeAutoLater);
  track.addEventListener("mousedown", pauseAuto);
  track.addEventListener("touchstart", pauseAuto, { passive: true });
  window.addEventListener("mouseup", resumeAutoLater);
  track.addEventListener("touchend", resumeAutoLater);
  track.addEventListener("touchcancel", resumeAutoLater);

  // 点击/键盘切换后也延迟恢复，避免“刚点完立刻跳走”
  track.addEventListener("click", resumeAutoLater);
  track.addEventListener("keydown", resumeAutoLater);

  // 启动自动轮播
  startAuto();

  // 如果用户系统偏好减少动画，确保不跑定时器
  if (prefersReducedMotion) clearTimers();
})();


