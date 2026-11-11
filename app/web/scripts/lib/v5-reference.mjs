// Native reference renderer for QA only; never imported by the product.
export async function captureReference(page, item, width, height, theme, reference) {
  if (!(await page.evaluate(() => !!window.MAKAN_LAYOUT).catch(() => false)))
    await page.goto(reference);
  await page.waitForFunction(() => window.MAKAN_LAYOUT && window.MAKAN_SCENES);
  const scenario = item.scenarios[0] || item.proposal;
  await page.evaluate(
    ({ scenario, width, height, theme, large, focus }) => {
      const scene = structuredClone(window.MAKAN_SCENES.find((s) => s.id === scenario));
      if (!scene) throw Error('Missing reference scene ' + scenario);
      if (scenario === 'MK-129') scene.title = 'اصلاح حضور نازنین موسوی';
      // Match the declared public display name; this is sample data, not a layout edit.
      if (scenario === 'MK-306') scene.title = 'نقش مریم رضایی در کلاس';
      if (scenario === 'MK-309') scene.title = 'اختیار آموزش مریم رضایی';
      if (scenario === 'MK-307') scene.title = 'پایان عضویت مریم رضایی؟';
      if (['MK-348', 'MK-349'].includes(scenario)) {
        // The DTO exposes a platform, not the sample's phone form factor.
        scene.blocks = scene.blocks.map((block) =>
          block.replaceAll('گوشی اندروید', 'دستگاه اندروید'),
        );
        scene.overlayBlocks = scene.overlayBlocks.map((block) =>
          block.replaceAll('گوشی اندروید', 'دستگاه اندروید'),
        );
        scene.contextRows = scene.contextRows.map((row) => ({
          ...row,
          title: row.title.replaceAll('گوشی اندروید', 'دستگاه اندروید'),
        }));
      }
      scene.dark = theme === 'dark';
      if (large) scene.largeText = true;
      const type = width < 768 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop';
      document.body.innerHTML = window.MAKAN_LAYOUT.device(scene, type, width, height);
      document.body.style.margin = '0';
      const style = document.createElement('style');
      // Remove document/device presentation only. Never scale application geometry.
      style.textContent =
        '.rx-viewport{border-radius:0!important;box-shadow:none!important;transform:none!important}.rx-safe{display:none!important}.rx-scroll-cue{display:none!important}';
      document.head.append(style);
      document.querySelectorAll('.focused,.focus-example,.focus').forEach((e) => {
        e.classList.remove('focused', 'focus-example', 'focus');
        if (e.textContent === '|') e.textContent = '';
      });
      if (scenario === 'MK-02') {
        const input = document.querySelector('input');
        input.value = '09120000101';
        input.dir = 'ltr';
      }
      if (scenario === 'MK-339') {
        document.querySelectorAll('[role="radio"]').forEach((radio, index) => {
          const selected = index === (theme === 'dark' ? 2 : 1);
          radio.setAttribute('aria-checked', String(selected));
          radio.querySelector('.radio')?.classList.toggle('selected', selected);
        });
      }
      if (scenario === 'MK-130') {
        // Match the declared three returned sessions; the atlas's8/1/1 is sample data.
        document.querySelectorAll('.stat b').forEach((node, index) => {
          node.textContent = ['۲', '۱', '۰'][index];
        });
        document.querySelectorAll('.rx-main .v4-list .row p').forEach((node) => {
          node.textContent = node.textContent
            .replace('ثبت مدرس', 'ثبت‌شده')
            .replace('گزارش منتشرشده', 'ثبت‌شده');
        });
      }
      if (focus === 'class-title') document.querySelector('input')?.focus();
    },
    { scenario, width, height, theme, large: !!item.large, focus: item.focus },
  );
}
