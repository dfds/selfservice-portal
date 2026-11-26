import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { runInNewContext } from "node:vm";

async function loadHelpers(path) {
  const code = ts.transpile(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  );
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}

const {
  parseRichContent,
  serializeRichContent,
  richContentText,
  richContentAssetIds,
  hasRichContent,
  isRichContent,
} = await loadHelpers("../src/lib/richContent.ts");
const { validateImageFile } = await loadHelpers(
  "../src/lib/privateAssetUtils.ts",
);

function loadEditorModule(path, mocks) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpile(source, {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.React,
  });
  const exports = {};
  runInNewContext(code, {
    exports,
    require: (name) => {
      if (name in mocks) return mocks[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

test("the release-note upload hook validates and uploads private images", async () => {
  const uploads = [];
  const limits = [];
  const ownerTypes = { ReleaseNote: "ReleaseNote" };
  const { useRichTextImages } = loadEditorModule(
    "../src/components/RichTextEditor/useRichTextImages.ts",
    {
      react: {
        useEffect: () => {},
        useRef: (current) => ({ current }),
        useState: (initial) => [initial, () => {}],
      },
      "@/state/remote/queries/privateAssets": {
        PrivateAssetOwnerType: ownerTypes,
        useOwnerAssets: () => ({
          data: [],
          isFetching: false,
          refetch: async () => ({ data: [] }),
        }),
        useUploadPrivateAsset: () => ({
          mutateAsync: async (input) => {
            uploads.push(input);
            return { assetId: "asset-1", url: "https://private.example/image" };
          },
        }),
      },
      "@/lib/privateAssetUtils": {
        generateUploadId: () => "upload-1",
        validateImageFile: (file, maxSize) => {
          limits.push(maxSize);
          return validateImageFile(file, maxSize);
        },
      },
    },
  );
  for (const ownerType of Object.values(ownerTypes)) {
    let node;
    let resolved;
    const transaction = {
      docChanged: true,
      setMeta: () => transaction,
      setNodeMarkup: (_position, _type, attrs) => {
        resolved = attrs;
      },
    };
    const chain = {
      focus: () => chain,
      insertContentAt: (_position, content) => {
        node = content;
        return chain;
      },
      run: () => true,
    };
    const editor = {
      chain: () => chain,
      isDestroyed: false,
      state: {
        selection: { to: 0 },
        tr: transaction,
        doc: {
          descendants: (visit) =>
            visit({ type: { name: "image" }, attrs: node.attrs }, 0),
        },
      },
      view: { dispatch: () => {} },
    };
    const hook = useRichTextImages({ editor, ownerId: "owner-1", ownerType });
    await hook.uploadImage({
      name: "image.png",
      type: "image/png",
      size: 20 * 1024 * 1024,
    });
    assert.equal(node, undefined);
    await hook.uploadImage({
      name: "image.png",
      type: "image/png",
      size: 1024,
    });
    assert.equal(resolved.assetId, "asset-1");
    assert.equal(resolved.uploadId, null);
    assert.equal(resolved.src, "https://private.example/image");
    assert.equal(uploads.at(-1).ownerType, ownerType);
    assert.equal(uploads.at(-1).ownerId, "owner-1");
    assert.equal(uploads.at(-1).isInline, true);
  }
  assert.deepEqual(limits, [Infinity, Infinity]);
  assert.equal(uploads.length, 1);
  await useRichTextImages({
    editor: null,
    ownerType: "ReleaseNote",
  }).uploadImage({ name: "image.png", type: "image/png", size: 1 });
  assert.equal(uploads.length, 1);
});
const doc = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "An update" }] },
    {
      type: "image",
      attrs: {
        assetId: "asset-1",
        src: "https://private.example/image?expires=123",
        alt: "Dashboard",
      },
    },
    {
      type: "image",
      attrs: {
        assetId: "asset-1",
        src: "https://private.example/image?expires=123",
      },
    },
  ],
};

test("legacy text and line breaks remain readable", () => {
  const text = "First line\nhttps://example.com\n\nLast line";
  assert.equal(richContentText(text), text);
  assert.equal(richContentText(parseRichContent(text)), text);
  assert.equal(isRichContent(text), false);
  assert.equal(isRichContent('{"unrelated":true}'), false);
  assert.equal(isRichContent(JSON.stringify(doc)), true);
});

test("persist stable IDs and alt text, never signed URLs", () => {
  const saved = serializeRichContent(doc);
  assert.equal(saved.includes("private.example"), false);
  assert.equal(JSON.parse(saved).content[1].attrs.src, "cid:asset-1");
  assert.equal(JSON.parse(saved).content[1].attrs.alt, "Dashboard");
  assert.deepEqual(richContentAssetIds(parseRichContent(saved)), ["asset-1"]);
});

test("list previews exclude images and asset references", () => {
  assert.equal(richContentText(JSON.stringify(doc)), "An update");
});

test("empty formatting is invalid, but image-only content is valid", () => {
  assert.equal(
    hasRichContent('{"type":"doc","content":[{"type":"paragraph"}]}'),
    false,
  );
  assert.equal(hasRichContent("   "), false);
  assert.equal(
    hasRichContent(JSON.stringify({ type: "doc", content: [doc.content[1]] })),
    true,
  );
});

test("removing images clears the referenced asset list", () => {
  assert.deepEqual(
    richContentAssetIds({ type: "doc", content: [doc.content[0]] }),
    [],
  );
});

test(
  "release notes upload and reopen private images",
  { skip: !process.env.EDITOR_TEST_URL },
  async () => {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
    });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const imageUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
      let uploaded = false;
      let saved;
      let created;
      let updateGate;
      let updateStatus = 200;
      await page.route("**/__release-note-check", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: '<!doctype html><html><body><div id="check-root"></div></body></html>',
        }),
      );
      await page.route("**/private-assets**", async (route) => {
        if (route.request().method() === "POST") {
          const multipart = route.request().postDataBuffer().toString();
          assert.match(multipart, /name="ownerType"\r\n\r\nReleaseNote/);
          assert.match(multipart, /name="ownerId"\r\n\r\nrelease-1/);
          assert.match(multipart, /name="isInline"\r\n\r\ntrue/);
          uploaded = true;
          return route.fulfill({ json: { assetId: "asset-1", url: imageUrl } });
        }
        return route.fulfill({
          json: uploaded ? [{ assetId: "asset-1", url: imageUrl }] : [],
        });
      });
      await page.route("**/release-notes/release-1", async (route) => {
        saved = route.request().postDataJSON();
        if (updateGate) await updateGate;
        await route.fulfill(
          updateStatus === 200
            ? { json: {} }
            : { status: updateStatus, body: "Save failed" },
        );
      });
      await page.route("**/release-notes", async (route) => {
        created = route.request().postDataJSON();
        await route.fulfill({ json: { id: "release-1" } });
      });
      await page.goto(`${process.env.EDITOR_TEST_URL}/__release-note-check`);
      await page.evaluate(async () => {
        const refresh = await import("/@react-refresh");
        refresh.default.injectIntoGlobalHook(window);
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
        window.__vite_plugin_react_preamble_installed__ = true;
        const source = await (
          await fetch("/src/pages/release-notes/editor/editor.tsx")
        ).text();
        const version = source.match(/react-router-dom\.js\?v=([\w]+)/)[1];
        const { default: React } = await import(
          `/node_modules/.vite/deps/react.js?v=${version}`
        );
        const {
          default: { createRoot },
        } = await import(
          `/node_modules/.vite/deps/react-dom_client.js?v=${version}`
        );
        const { BrowserRouter } = await import(
          `/node_modules/.vite/deps/react-router-dom.js?v=${version}`
        );
        const { QueryClient, QueryClientProvider } = await import(
          `/node_modules/.vite/deps/@tanstack_react-query.js?v=${version}`
        );
        const { default: PreAppContext } = await import(
          "/src/preAppContext.jsx"
        );
        const { default: TrackingContext } = await import(
          "/src/TrackingContext.jsx"
        );
        const { Editor, EditorMode } = await import(
          "/src/pages/release-notes/editor/editor.tsx"
        );
        const { msalInstance } = await import("/src/auth/context.ts");
        msalInstance.getActiveAccount = () => ({
          homeAccountId: "test",
          idTokenClaims: { roles: [] },
        });
        msalInstance.getAllAccounts = () => [];
        msalInstance.acquireTokenSilent = async () => ({
          accessToken: "mock-token",
        });
        window.apiBaseUrl = `${location.origin}/mock-api`;
        await import("/src/index.css");
        await import("/src/pages/release-notes/style.scss");
        const client = new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        });
        const root = createRoot(document.getElementById("check-root"));
        let mountCount = 0;
        window.mountReleaseNote = (mode, content) =>
          root.render(
            React.createElement(
              QueryClientProvider,
              { client },
              React.createElement(
                BrowserRouter,
                null,
                React.createElement(
                  PreAppContext.Provider,
                  { value: { isCloudEngineerEnabled: true } },
                  React.createElement(
                    TrackingContext.Provider,
                    { value: { trackingIsEnabled: false } },
                    React.createElement(Editor, {
                      key: ++mountCount,
                      mode: EditorMode[mode],
                      defaultContent: content || {
                        type: "doc",
                        content: [{ type: "paragraph" }],
                      },
                      doc:
                        mode === "Create"
                          ? undefined
                          : {
                              id: "release-1",
                              title: "Release",
                              releaseDate: "2026-01-01",
                            },
                    }),
                  ),
                ),
              ),
            ),
          );
        window.refreshReleaseNoteImage = (url) =>
          client.setQueryData(
            ["privateAssets", "ReleaseNote", "release-1"],
            [{ assetId: "asset-1", url }],
          );
      });
      await page.evaluate(() => window.mountReleaseNote("Create"));
      const save = page.getByRole("button", { name: "Save", exact: true });
      const setTitle = (value) =>
        page.evaluate((value) => {
          const input = document.querySelector(
            'input[placeholder="2025.06 - The big summer release"]',
          );
          Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
          ).set.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }, value);
      const setDate = (value) =>
        page.evaluate((value) => {
          const input = document.querySelector('input[type="date"]');
          Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
          ).set.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }, value);
      assert.equal(await save.isDisabled(), true);
      assert.equal(
        await page.getByRole("button", { name: "Return", exact: true }).count(),
        1,
      );
      const disabledSave = page.locator(
        'span[aria-label="Release notes must have a title and release date"]',
      );
      await disabledSave.hover();
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Release notes must have a title and release date" })
        .waitFor();
      await page.mouse.move(0, 0);
      await disabledSave.focus();
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Release notes must have a title and release date" })
        .waitFor();
      await page.getByRole("button", { name: "Return", exact: true }).focus();
      await disabledSave.dispatchEvent("pointerdown", {
        pointerType: "touch",
        bubbles: true,
      });
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Release notes must have a title and release date" })
        .waitFor();
      await page.getByRole("button", { name: "Return", exact: true }).focus();
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Release notes must have a title and release date" })
        .waitFor({ state: "hidden" });
      await setTitle("New release");
      assert.equal(await save.isDisabled(), true);
      assert.equal(
        await page
          .getByRole("button", { name: "Discard", exact: true })
          .count(),
        1,
      );
      const missingDate = page.locator(
        'span[aria-label="Release notes must have a release date"]',
      );
      await missingDate.focus();
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Release notes must have a release date" })
        .waitFor();
      await setDate("2026-12-15");
      assert.equal(await save.isDisabled(), false);
      await setTitle("   ");
      assert.equal(await save.isDisabled(), true);
      assert.equal(
        await page
          .locator('span[aria-label="Release notes must have a title"]')
          .count(),
        1,
      );
      await setTitle("New release");
      assert.equal(await save.isDisabled(), false);
      await setTitle("");
      assert.equal(await save.isDisabled(), true);
      assert.equal(
        await page.getByRole("button", { name: "Add image" }).isDisabled(),
        true,
      );
      await page.getByRole("button", { name: "Discard" }).focus();
      const disabledImage = page.locator(
        'span[aria-label="Save first, then edit to upload images"]',
      );
      await disabledImage.hover();
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Save first, then edit to upload images" })
        .waitFor();
      await page.mouse.move(0, 0);
      await page.getByRole("tooltip").waitFor({ state: "hidden" });
      await disabledImage.focus();
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Save first, then edit to upload images" })
        .waitFor();
      await page.getByRole("button", { name: "Discard" }).focus();
      await page.getByRole("tooltip").waitFor({ state: "hidden" });
      await disabledImage.dispatchEvent("pointerdown", {
        pointerType: "touch",
        bubbles: true,
      });
      await page
        .getByRole("tooltip")
        .filter({ hasText: "Save first, then edit to upload images" })
        .waitFor();
      await setTitle("New release");
      const createResponse = page.waitForResponse(
        (response) =>
          response.url().endsWith("/release-notes") &&
          response.request().method() === "POST",
      );
      await save.click();
      await createResponse;
      await page.getByRole("button", { name: "Return", exact: true }).waitFor();
      await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();
      assert.equal(created.releaseDate, "2026-12-15T00:00:00.000Z");
      assert.equal(await save.isDisabled(), true);
      assert.equal(new URL(page.url()).pathname, "/__release-note-check");
      assert.equal(
        await page.getByRole("button", { name: "Add image" }).isDisabled(),
        false,
      );
      await setTitle("Updated draft");
      const draftResponse = page.waitForResponse(
        (response) =>
          response.url().endsWith("/release-notes/release-1") &&
          response.request().method() === "PUT",
      );
      await save.click();
      await draftResponse;
      await page.getByRole("button", { name: "Return", exact: true }).waitFor();
      assert.equal(saved.title, "Updated draft");
      await page.evaluate(() => window.mountReleaseNote("Edit"));
      await page.waitForFunction(
        () =>
          document.querySelector(
            'input[placeholder="2025.06 - The big summer release"]',
          )?.value === "Release",
      );
      assert.equal(await save.isDisabled(), true);
      assert.equal(
        await page.getByRole("button", { name: "Return", exact: true }).count(),
        1,
      );
      await page.locator(".tiptap").evaluate((element) => {
        element.focus();
        document.execCommand("insertText", false, "Content change");
      });
      assert.equal(await save.isDisabled(), false);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await page.getByRole("button", { name: "Return", exact: true }).waitFor();
      assert.equal(await save.isDisabled(), true);
      await setDate("");
      assert.equal(await save.isDisabled(), true);
      assert.equal(
        await page
          .locator('span[aria-label="Release notes must have a release date"]')
          .count(),
        1,
      );
      await setDate("2026-01-01");
      assert.equal(await save.isDisabled(), true);
      await setTitle("");
      assert.equal(await save.isDisabled(), true);
      await setTitle("Updated release");
      assert.equal(await save.isDisabled(), false);
      updateStatus = 403;
      await save.click();
      await page
        .getByRole("alert")
        .filter({ hasText: "Check your permissions or sign in again" })
        .waitFor();
      assert.equal(await save.isDisabled(), false);
      assert.equal(
        await page
          .getByRole("button", { name: "Discard", exact: true })
          .count(),
        1,
      );
      updateStatus = 200;
      await page.getByRole("button", { name: "Discard", exact: true }).click();
      await page
        .getByRole("dialog")
        .getByText("All changes will be discarded and cannot be restored.")
        .waitFor();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
      let releaseUpdate;
      updateGate = new Promise((resolve) => {
        releaseUpdate = resolve;
      });
      const pendingRequest = page.waitForRequest(
        (request) =>
          request.url().endsWith("/release-notes/release-1") &&
          request.method() === "PUT",
      );
      await save.click();
      await pendingRequest;
      assert.equal(await save.isDisabled(), true);
      await setTitle("Edited while saving");
      releaseUpdate();
      updateGate = undefined;
      await page
        .getByRole("button", { name: "Discard", exact: true })
        .waitFor();
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll("button")].find(
            (button) => button.textContent.trim() === "Save",
          )?.disabled === false,
      );
      assert.equal(await save.isDisabled(), false);
      await page.locator('input[type="file"]').setInputFiles({
        name: "screenshot.png",
        mimeType: "image/png",
        buffer: Buffer.from("image"),
      });
      await page.locator('.tiptap img[alt="screenshot.png"]').waitFor();
      const updateResponse = page.waitForResponse(
        (response) =>
          response.url().endsWith("/release-notes/release-1") &&
          response.request().method() === "PUT",
      );
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await updateResponse;
      assert.ok(saved);
      assert.match(saved.content, /cid:asset-1/);
      assert.equal(saved.content.includes("data:image"), false);
      await page.getByRole("button", { name: "Return", exact: true }).waitFor();
      await page.evaluate(
        (url) => window.refreshReleaseNoteImage(`${url}#fresh`),
        imageUrl,
      );
      await page.waitForFunction(() =>
        document
          .querySelector(".tiptap img")
          ?.getAttribute("src")
          ?.endsWith("#fresh"),
      );
      assert.equal(await save.isDisabled(), true);
      await page.evaluate(
        (content) => window.mountReleaseNote("View", JSON.parse(content)),
        saved.content,
      );
      await page.locator('.tiptap img[alt="screenshot.png"]').waitFor();
      assert.equal(await page.locator('input[type="file"]').count(), 0);
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test("release-note images match campaign formats and size limit", () => {
  for (const [name, type] of [
    ["large.png", "image/png"],
    ["large.jpg", "image/jpeg"],
    ["large.gif", "image/gif"],
    ["large.webp", "image/webp"],
  ]) {
    assert.equal(validateImageFile({ name, type, size: 1024 }).ok, true);
    assert.equal(
      validateImageFile({ name, type, size: 20 * 1024 * 1024 }).ok,
      false,
    );
  }
  assert.equal(
    validateImageFile({ name: "bad.svg", type: "image/svg+xml", size: 10 }).ok,
    false,
  );
});
