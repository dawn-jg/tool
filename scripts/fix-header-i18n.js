// scripts/fix-header-i18n.js
// Header.tsx 导航分类改为 i18n：name → nameKey，渲染处 t(cat.nameKey)
const fs = require('fs');
const path = require('path');

const f = path.resolve(__dirname, '../components/Header.tsx');
let c = fs.readFileSync(f, 'utf8');
const orig = c;

// 1. import 加 useI18n
if (!c.includes('useI18n')) {
  c = c.replace(
    `import { LanguageSwitcher } from "./LanguageSwitcher";`,
    `import { LanguageSwitcher } from "./LanguageSwitcher";\nimport { useI18n } from "@/lib/i18n";`
  );
}

// 2. categories 数组 name → nameKey（10 项）
const slugToKey = [
  ['/developer-tools', 'cat.developer'],
  ['/text-tools', 'cat.text'],
  ['/image-tools', 'cat.image'],
  ['/data-tools', 'cat.data'],
  ['/generators', 'cat.generators'],
  ['/validators', 'cat.validators'],
  ['/utilities', 'cat.utilities'],
  ['/pdf-tools', 'cat.pdf'],
  ['/network-tools', 'cat.network'],
  ['/fun-tools', 'cat.fun'],
];
slugToKey.forEach(([href, key]) => {
  const re = new RegExp(`(\\{ name: "[^"]+", href: "${href}", icon: )`, 'g');
  c = c.replace(re, `{ nameKey: "${key}", href: "${href}", icon: `);
});

// 3. 组件内获取 t
c = c.replace(
  `export function Header() {
  const pathname = usePathname();`,
  `export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();`
);

// 4. 两处渲染 {cat.name} → {t(cat.nameKey)}
c = c.replace(/\{cat\.name\}/g, '{t(cat.nameKey)}');

if (c === orig) {
  console.log('未产生任何修改，检查模式匹配');
} else {
  // 统一 CRLF
  c = c.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  fs.writeFileSync(f, c);
  console.log('Header i18n 改造完成');
}
