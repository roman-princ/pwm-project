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
          // return { file, html: await response.text() };
          return { baseUrl: file.substring(0, file.lastIndexOf('/')), html: await response.text() };
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
          const { html, baseUrl } = await fetchFirstAvailable(candidates);

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;

          const links = tempDiv.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => {
            const href = link.getAttribute('href');
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';

            newLink.href = href.startsWith('.') || !href.startsWith('/') ? `${baseUrl}/${href}` : href;

            if (!document.querySelector(`link[href="${newLink.href}"]`)) {
              document.head.appendChild(newLink);
            }
            link.remove();
          });

          el.innerHTML = tempDiv.innerHTML;
          el.removeAttribute("data-include");

          await loadIncludes(el);
        } catch (error) {
          console.error(error);
        }
        // try {
        //   const { html, baseUrl } = await fetchFirstAvailable(candidates);
        //   el.innerHTML = html;
        //   el.removeAttribute("data-include");
        //   await loadIncludes(el);
        // } catch (error) {
        //   console.error(error);
        // }
      }),
    );
  };

  void loadIncludes();
});
