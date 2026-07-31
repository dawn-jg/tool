// IndexNow URL 提交脚本
// 用法: node scripts/indexnow-submit.js
// 前提: Bing Webmaster 已验证 tooltip.cc 并绑定 key (public/<key>.txt)
const key = "70e83ca4f6512db9";
const host = "tooltip.cc";

const urls = [
  "https://tooltip.cc/",
  "https://tooltip.cc/about",
  "https://tooltip.cc/privacy-policy",
];

const body = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls };

fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
})
  .then((res) => {
    console.log("Status:", res.status);
    if (res.status !== 200 && res.status !== 202) {
      return res.text().then((t) => console.log("Body:", t));
    }
    console.log("Submitted OK");
  })
  .catch((e) => console.error("Error:", e.message));
