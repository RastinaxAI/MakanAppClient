# Makan product screens

These ten WebP images are crops of the phone frames in the supplied
`DocumentMakanApp.pdf`. They preserve the original UI, including the example
content. They are design illustrations, not live application captures.

Pages 6, 8, 17, 18 and 30 cover school, independent classes, messages, the
assistant and profile. `source.json` records each page, design ID, dimensions
and the source file's SHA-256 checksum.

Regenerate from the repository root with Poppler and the installed Sharp:

```sh
node scripts/extract-product-screens.mjs /absolute/path/DocumentMakanApp.pdf
```

The original PDF remains outside the public directory. The page loads only the
selected tab's two images; Next Image supplies responsive, lazy-loaded versions.
