document.addEventListener("DOMContentLoaded", () => {
  const includeExtensionRegex = /\.[a-zA-Z0-9]+$/;

  const resolveIncludePaths = (includeName) => {
    const hasExtension = includeExtensionRegex.test(includeName);
    const path = hasExtension ? includeName : `${includeName}.html`;
    const pathname = window.location.pathname;
    const parts = pathname.split("/");

    parts.pop();
    const candidates = [];

    for (let i = parts.length; i > 0; i -= 1) {
      const dir = `${parts.slice(0, i).join("/")}/`.replace(/\/+/g, "/");
      candidates.push(`${dir}${path}`);
    }

    candidates.push(`/src/${path}`);
    return Array.from(new Set(candidates));
  };

  const fetchFirstAvailable = async (candidates) => {
    for (const file of candidates) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          return {
            baseUrl: file.substring(0, file.lastIndexOf("/")),
            html: await response.text(),
          };
        }
      } catch (error) {
        console.error(error);
      }
    }

    throw new Error(`Failed to load include from: ${candidates.join(", ")}`);
  };

  const loadIncludes = async (root = document) => {
    const includes = Array.from(root.querySelectorAll("[data-include]"));
    if (includes.length === 0) {
      return;
    }

    await Promise.all(
      includes.map(async (el) => {
        const includeName = el.getAttribute("data-include");
        const candidates = resolveIncludePaths(includeName);

        try {
          let { html, baseUrl } = await fetchFirstAvailable(candidates);

          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          const links = tempDiv.querySelectorAll('link[rel="stylesheet"]');
          links.forEach((link) => {
            const href = link.getAttribute("href");
            const newLink = document.createElement("link");
            newLink.rel = "stylesheet";

            newLink.href =
              href.startsWith(".") || !href.startsWith("/")
                ? `${baseUrl}/${href}`
                : href;

            if (!document.querySelector(`link[href="${newLink.href}"]`)) {
              document.head.appendChild(newLink);
            }
            link.remove();
          });

          const scripts = Array.from(tempDiv.querySelectorAll("script"));
          scripts.forEach((script) => script.remove());

          const dataAttrs = el.dataset;
          if (Object.keys(dataAttrs).length > 1) {
            html = tempDiv.innerHTML;
            html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
              return dataAttrs[key] !== undefined ? dataAttrs[key] : "";
            });
            tempDiv.innerHTML = html;
          }

          el.innerHTML = tempDiv.innerHTML;
          el.removeAttribute("data-include");

          await loadIncludes(el);

          for (const oldScript of scripts) {
            const newScript = document.createElement("script");
            if (oldScript.src) {
              const src = oldScript.getAttribute("src");
              newScript.src =
                src.startsWith(".") || !src.startsWith("/")
                  ? `${baseUrl}/${src}`
                  : src;
            } else {
              newScript.textContent = oldScript.textContent;
            }
            await new Promise((resolve, reject) => {
              newScript.onload = resolve;
              newScript.onerror = reject;
              if (!oldScript.src) {
                document.body.appendChild(newScript);
                resolve();
              } else {
                document.body.appendChild(newScript);
              }
            });
          }

          await loadIncludes(el);
        } catch (error) {
          console.error(error);
        }
      }),
    );
  };

  // Expose loadIncludes globally so dynamically-added
  // data-include elements can be processed on demand.
  window.loadIncludes = loadIncludes;

  void loadIncludes().then(() => {
    // After initial includes are resolved, watch for any new
    // data-include elements added to the DOM asynchronously
    // (e.g. event cards rendered after an async fetch).
    let pending = null;
    const observer = new MutationObserver((mutations) => {
      let hasNewIncludes = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (
            node.matches?.("[data-include]") ||
            node.querySelector?.("[data-include]")
          ) {
            hasNewIncludes = true;
            break;
          }
        }
        if (hasNewIncludes) break;
      }
      if (hasNewIncludes && !pending) {
        // Small delay to batch multiple rapid insertions into one pass.
        pending = setTimeout(() => {
          pending = null;
          loadIncludes();
        }, 10);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Catch-up: process any data-include elements that were added
    // to the DOM while the initial loadIncludes() was still running
    // (e.g. by async rendering functions).
    loadIncludes();
  });
});
