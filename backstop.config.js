module.exports = {
  id: "PKB-theme",
  viewports: [
    {
      label: "desktop",
      width: 1920,
      height: 1080
    },
    {
      label: "tablet",
      width: 1024,
      height: 768
    },
    {
      label: "mobile",
      width: 320,
      height: 480
    }
  ],
  scenarios: [
    {
      label: "Homepage",
      url: "http://localhost:1313",
      referenceUrl: "https://stradichenko.github.io/PKB-theme/",
      hideSelectors: [],
      removeSelectors: [],
      selectors: ["document"],
      readyEvent: null,
      delay: 500,
      misMatchThreshold: 0.1
    },
    {
      label: "About Page",
      url: "http://localhost:1313/about/",
      referenceUrl: "https://stradichenko.github.io/PKB-theme/about/",
      selectors: ["document"],
      delay: 500
    },
    {
      label: "Sample Post",
      url: "http://localhost:1313/posts/markdown-boilerplate/",
      referenceUrl: "https://stradichenko.github.io/PKB-theme/posts/markdown-boilerplate/",
      selectors: ["document"],
      delay: 500
    },
    {
      label: "Posts List",
      url: "http://localhost:1313/posts/",
      referenceUrl: "https://stradichenko.github.io/PKB-theme/posts/",
      selectors: ["document"],
      delay: 500
    }
  ],
  paths: {
    bitmaps_reference: "backstop_data/bitmaps_reference",
    bitmaps_test: "backstop_data/bitmaps_test",
    engine_scripts: "backstop_data/engine_scripts",
    html_report: "backstop_data/html_report",
    ci_report: "backstop_data/ci_report"
  },
  report: ["browser"],
  engineOptions: {
    args: ["--no-sandbox"]
  },
  engine: "puppeteer",
  browsers: ["firefox", "chrome", "brave"]
}