"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

type Language = "zh" | "en";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations = {
  zh: {
    // site
    "site.title": "tooltip.cc",
    "site.subtitle": "免费在线工具箱 · 55+ 实用工具 · 纯浏览器端运行 · 保护隐私安全",
    "nav.home": "首页",
    "nav.allTools": "全部工具",

    // categories
    "cat.developer": "开发者工具",
    "cat.developerDesc": "JSON格式化、正则测试、Base64编解码等程序员刚需工具",
    "cat.text": "文本处理",
    "cat.textDesc": "文本对比、Markdown编辑、字数统计等文字处理工具",
    "cat.image": "图片工具",
    "cat.imageDesc": "图片Base64、二维码生成、Favicon生成等图片工具",
    "cat.data": "数据工具",
    "cat.dataDesc": "密码生成、Cron表达式、进制转换等数据处理工具",
    "cat.generators": "生成器",
    "cat.generatorsDesc": "占位图、假数据、渐变色等实用生成工具",
    "cat.validators": "验证器",
    "cat.validatorsDesc": "邮箱、手机号、身份证等格式验证工具",
    "cat.utilities": "实用工具",
    "cat.utilitiesDesc": "单位换算、计时器、计算器等日常生活工具",
    "cat.network": "网络工具",
    "cat.networkDesc": "IP查询、DNS查询、延迟测试、HTTP头查看等网络相关工具",

    // home
    "home.featured": "热门工具",
    "home.categories": "工具分类",
    "home.viewAll": "查看全部",
    "home.toolsCount": " 个工具",
    "home.footer": "所有工具均在浏览器本地执行，数据不会上传到服务器",
    "home.footerBrand": "tooltip.cc - 让工具使用更简单",

    // common
    "common.back": "返回首页",
    "common.copy": "复制",
    "common.copied": "已复制",
    "common.generate": "生成",
    "common.convert": "转换",
    "common.validate": "验证",
    "common.download": "下载",
    "common.upload": "上传",
    "common.input": "输入",
    "common.output": "输出",
    "common.clear": "清空",
    "common.error": "错误",
    "common.success": "成功",
    "common.usage": "使用说明",

    // tools - developer
    "tool.jsonFormatter": "JSON格式化",
    "tool.jsonFormatterDesc": "格式化、压缩、校验JSON数据并树形展示",
    "tool.base64": "Base64编解码",
    "tool.base64Desc": "文本Base64编码与解码转换",
    "tool.timestamp": "Unix时间戳",
    "tool.timestampDesc": "Unix时间戳与日期互转，显示当前时间",
    "tool.regexTester": "正则表达式测试",
    "tool.regexTesterDesc": "在线正则表达式测试、匹配与替换",
    "tool.sqlFormatter": "SQL格式化",
    "tool.sqlFormatterDesc": "SQL语句格式化和美化工具",
    "tool.yamlConverter": "YAML转换",
    "tool.yamlConverterDesc": "YAML与JSON格式互相转换",
    "tool.jwtDecoder": "JWT解码",
    "tool.jwtDecoderDesc": "在线解码JWT Token的Header和Payload",
    "tool.hashGenerator": "哈希生成",
    "tool.hashGeneratorDesc": "MD5、SHA-1、SHA-256、SHA-512哈希值生成",
    "tool.uuidGenerator": "UUID生成器",
    "tool.uuidGeneratorDesc": "在线生成UUID v4唯一标识符",
    "tool.htmlEntities": "HTML实体编码",
    "tool.htmlEntitiesDesc": "HTML实体编码与解码工具",
    "tool.flexboxGenerator": "Flexbox布局生成器",
    "tool.flexboxGeneratorDesc": "CSS Flexbox布局属性在线生成工具",
    "tool.boxShadowGenerator": "盒阴影生成器",
    "tool.boxShadowGeneratorDesc": "CSS box-shadow属性在线生成工具",
    "tool.borderRadiusGenerator": "圆角生成器",
    "tool.borderRadiusGeneratorDesc": "CSS border-radius属性在线生成工具",
    "tool.colorFormat": "颜色格式转换",
    "tool.colorFormatDesc": "HEX、RGB、HSL颜色格式互相转换",
    "tool.cssAnimationGenerator": "CSS动画生成器",
    "tool.cssAnimationGeneratorDesc": "CSS @keyframes动画属性在线生成工具",
    "tool.urlEncoderDecoder": "URL编码解码",
    "tool.urlEncoderDecoderDesc": "URL编码与解码工具，百分号编码转换",
    "tool.jsonPathQuery": "JSONPath查询",
    "tool.jsonPathQueryDesc": "JSONPath路径查询工具，类似于XPath",
    "tool.markdownPreview": "Markdown预览",
    "tool.markdownPreviewDesc": "Markdown在线编辑与实时预览",

    // tools - text
    "tool.textDiff": "文本差异对比",
    "tool.textDiffDesc": "对比两段文本差异，高亮显示不同之处",
    "tool.markdownEditor": "Markdown编辑器",
    "tool.markdownEditorDesc": "Markdown在线编辑与实时预览",
    "tool.caseConverter": "大小写转换",
    "tool.caseConverterDesc": "camelCase、snake_case、kebab-case等命名风格转换",
    "tool.wordCounter": "字数统计",
    "tool.wordCounterDesc": "统计文本字数、字符数、行数、段落数",
    "tool.loremIpsum": "Lorem Ipsum",
    "tool.loremIpsumDesc": "随机Lorem Ipsum占位文本生成",
    "tool.slugGenerator": "Slug生成器",
    "tool.slugGeneratorDesc": "将中文或英文文本转换为URL友好的slug",
    "tool.punctuationConverter": "全角半角转换",
    "tool.punctuationConverterDesc": "全角字符与半角字符互相转换",

    // tools - image
    "tool.imageToBase64": "图片转Base64",
    "tool.imageToBase64Desc": "将图片文件转换为Base64编码字符串",
    "tool.faviconGenerator": "Favicon生成器",
    "tool.faviconGeneratorDesc": "生成网站Favicon图标（16x16、32x32）",
    "tool.qrcodeGenerator": "二维码生成",
    "tool.qrcodeGeneratorDesc": "在线生成二维码，支持自定义大小和颜色",
    "tool.barcodeGenerator": "条形码生成",
    "tool.barcodeGeneratorDesc": "在线生成Code128条形码",
    "tool.svgToJsx": "SVG转JSX",
    "tool.svgToJsxDesc": "将SVG代码转换为React JSX格式",
    "tool.exifViewer": "Exif查看器",
    "tool.exifViewerDesc": "查看图片Exif元数据信息",
    "tool.imageCompressor": "图片压缩",
    "tool.imageCompressorDesc": "在线图片压缩工具，支持PNG、JPG、WebP",
    "tool.imageResizer": "图片调整大小",
    "tool.imageResizerDesc": "在线调整图片尺寸大小工具",

    // tools - data
    "tool.randomPassword": "随机密码生成",
    "tool.randomPasswordDesc": "生成高强度的随机密码",
    "tool.cronGenerator": "Cron表达式",
    "tool.cronGeneratorDesc": "可视化生成和解析Cron表达式",
    "tool.baseConverter": "进制转换",
    "tool.baseConverterDesc": "二进制、八进制、十进制、十六进制互相转换",

    // tools - generators
    "tool.placeholderImage": "占位图生成",
    "tool.placeholderImageDesc": "生成占位图片URL和HTML代码",
    "tool.fakeData": "假数据生成",
    "tool.fakeDataDesc": "随机生成姓名、邮箱、手机号等测试数据",
    "tool.colorGradient": "CSS渐变生成",
    "tool.colorGradientDesc": "可视化生成CSS渐变代码",
    "tool.metaTags": "Meta标签生成",
    "tool.metaTagsDesc": "生成SEO优化的HTML Meta标签",
    "tool.dataUri": "Data URI生成",
    "tool.dataUriDesc": "将文本或文件转换为Data URI格式",
    "tool.colorPaletteGenerator": "调色板生成器",
    "tool.colorPaletteGeneratorDesc": "CSS颜色调色板生成工具，支持色彩和谐搭配",
    "tool.gradientGenerator": "渐变生成器",
    "tool.gradientGeneratorDesc": "CSS渐变背景在线生成工具",
    "tool.randomNumberGenerator": "随机数生成器",
    "tool.randomNumberGeneratorDesc": "生成随机数，支持正态分布等分布类型",

    // tools - validators
    "tool.jsonValidator": "JSON校验",
    "tool.jsonValidatorDesc": "校验JSON格式并定位错误位置",
    "tool.emailValidator": "邮箱验证",
    "tool.emailValidatorDesc": "验证邮箱地址格式是否正确",
    "tool.phoneValidator": "手机号验证",
    "tool.phoneValidatorDesc": "验证中国大陆手机号格式",
    "tool.idCardValidator": "身份证验证",
    "tool.idCardValidatorDesc": "验证中国大陆身份证号码并解析信息",
    "tool.creditCardValidator": "信用卡校验",
    "tool.creditCardValidatorDesc": "使用Luhn算法校验信用卡号有效性",
    "tool.urlValidator": "URL验证",
    "tool.urlValidatorDesc": "验证URL格式并解析各组成部分",
    "tool.colorContrast": "WCAG对比度",
    "tool.colorContrastDesc": "计算颜色对比度并检查WCAG合规性",
    "tool.ipValidator": "IP地址验证",
    "tool.ipValidatorDesc": "验证IPv4和IPv6地址格式是否正确",
    "tool.domainValidator": "域名验证",
    "tool.domainValidatorDesc": "验证域名格式是否正确",

    // tools - utilities
    "tool.unitConverter": "单位换算",
    "tool.unitConverterDesc": "长度、重量、温度、面积等常用单位换算",
    "tool.timezoneConverter": "时区转换",
    "tool.timezoneConverterDesc": "全球时区时间转换工具",
    "tool.timer": "计时器",
    "tool.timerDesc": "在线秒表计时器与倒计时",
    "tool.randomPicker": "随机抽签",
    "tool.randomPickerDesc": "从列表中随机抽取项目",
    "tool.calculator": "计算器",
    "tool.calculatorDesc": "在线科学计算器",
    "tool.bmiCalculator": "BMI计算器",
    "tool.bmiCalculatorDesc": "身体质量指数BMI计算与评估",
    "tool.loveAnniversary": "恋爱纪念日计算器",
    "tool.loveAnniversaryDesc": "计算相恋天数，纪念日倒计时提醒",
    "tool.passwordGenerator": "密码生成器",
    "tool.passwordGeneratorDesc": "生成随机安全密码，支持自定义长度和字符类型",
    "tool.goldenEggLottery": "砸金蛋",
    "tool.goldenEggLotteryDesc": "砸金蛋抽奖游戏，自定义奖品和概率",
    "tool.countdownDays": "倒计时日",
    "tool.countdownDaysDesc": "重要日期倒计时，支持多个倒计时目标",
    "tool.pomodoroTimer": "番茄钟",
    "tool.pomodoroTimerDesc": "专注工作学习，定时休息提高效率",
    "tool.textToPoster": "文字转海报",
    "tool.textToPosterDesc": "将文字生成精美海报图片",
    "tool.dailyFortune": "每日运势",
    "tool.dailyFortuneDesc": "根据姓名生日生成今日运势",
    "tool.luckyWheel": "幸运大转盘",
    "tool.luckyWheelDesc": "抽奖大转盘，自定义奖项和颜色",
    "tool.mortgageCalculator": "房贷/理财计算器",
    "tool.mortgageCalculatorDesc": "计算房贷月供和投资收益",
    "tool.programmerDaily": "程序员日常",
    "tool.programmerDailyDesc": "时间戳、ASCII表、颜色转换、HTTP状态码等程序员常用工具",

    // network-tools
    "tool.ipInfo": "IP 信息查询",
    "tool.ipInfoDesc": "查询本机公网 IP 地址和地理位置信息",
    "tool.dnsLookup": "DNS 查询",
    "tool.dnsLookupDesc": "查询域名的 DNS 解析记录，支持 A、MX、TXT 等记录类型",
    "tool.latencyTest": "延迟测试",
    "tool.latencyTestDesc": "测量到网站的响应延迟时间（模拟 Ping）",
    "tool.httpHeaders": "HTTP 头查看",
    "tool.httpHeadersDesc": "查看任意网站返回的 HTTP 响应头信息",
    "tool.domainInfo": "域名信息查询",
    "tool.domainInfoDesc": "查询域名的 WHOIS 注册信息和到期时间",
  },
  en: {
    // site
    "site.title": "tooltip.cc",
    "site.subtitle": "Free Online Tools · 55+ Tools · Browser-only · Privacy Focused",
    "nav.home": "Home",
    "nav.allTools": "All Tools",

    // categories
    "cat.developer": "Developer Tools",
    "cat.developerDesc": "JSON formatter, Regex tester, Base64 encoder/decoder and more",
    "cat.text": "Text Tools",
    "cat.textDesc": "Text diff, Markdown editor, Word counter and more",
    "cat.image": "Image Tools",
    "cat.imageDesc": "Image to Base64, QR code generator, Favicon generator and more",
    "cat.data": "Data Tools",
    "cat.dataDesc": "Password generator, Cron expression, Base converter and more",
    "cat.generators": "Generators",
    "cat.generatorsDesc": "Placeholder image, Fake data, Color gradient and more",
    "cat.validators": "Validators",
    "cat.validatorsDesc": "Email, Phone, ID card format validation and more",
    "cat.utilities": "Utilities",
    "cat.utilitiesDesc": "Unit converter, Countdown, World clock and more",
    "cat.network": "Network Tools",
    "cat.networkDesc": "IP lookup, DNS query, latency test, HTTP headers and more",

    // home
    "home.featured": "Featured Tools",
    "home.categories": "Categories",
    "home.viewAll": "View All",
    "home.toolsCount": " tools",
    "home.footer": "All tools run locally in your browser. Data never uploaded to server",
    "home.footerBrand": "tooltip.cc - Tools Made Simple",

    // common
    "common.back": "Back to Home",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.generate": "Generate",
    "common.convert": "Convert",
    "common.validate": "Validate",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.input": "Input",
    "common.output": "Output",
    "common.clear": "Clear",
    "common.error": "Error",
    "common.success": "Success",
    "common.usage": "Usage",

    // tools - developer
    "tool.jsonFormatter": "JSON Formatter",
    "tool.jsonFormatterDesc": "Beautify, minify, and validate JSON with tree view",
    "tool.base64": "Base64 Encoder/Decoder",
    "tool.base64Desc": "Encode and decode Base64 strings",
    "tool.timestamp": "Unix Timestamp",
    "tool.timestampDesc": "Convert between Unix timestamp and date, shows current time",
    "tool.regexTester": "Regex Tester",
    "tool.regexTesterDesc": "Online regex testing, matching and replacing",
    "tool.sqlFormatter": "SQL Formatter",
    "tool.sqlFormatterDesc": "Format and beautify SQL statements",
    "tool.yamlConverter": "YAML Converter",
    "tool.yamlConverterDesc": "Convert between YAML and JSON formats",
    "tool.jwtDecoder": "JWT Decoder",
    "tool.jwtDecoderDesc": "Decode JWT Token Header and Payload online",
    "tool.hashGenerator": "Hash Generator",
    "tool.hashGeneratorDesc": "Generate MD5, SHA-1, SHA-256, SHA-512 hashes",
    "tool.uuidGenerator": "UUID Generator",
    "tool.uuidGeneratorDesc": "Generate UUID v4 unique identifiers online",
    "tool.htmlEntities": "HTML Entities",
    "tool.htmlEntitiesDesc": "Encode and decode HTML entities",
    "tool.flexboxGenerator": "Flexbox Generator",
    "tool.flexboxGeneratorDesc": "CSS Flexbox layout properties generator",
    "tool.boxShadowGenerator": "Box Shadow Generator",
    "tool.boxShadowGeneratorDesc": "CSS box-shadow properties generator",
    "tool.borderRadiusGenerator": "Border Radius Generator",
    "tool.borderRadiusGeneratorDesc": "CSS border-radius properties generator",
    "tool.colorFormat": "Color Format Converter",
    "tool.colorFormatDesc": "Convert between HEX, RGB, and HSL color formats",
    "tool.cssAnimationGenerator": "CSS Animation Generator",
    "tool.cssAnimationGeneratorDesc": "CSS @keyframes animation properties generator",
    "tool.urlEncoderDecoder": "URL Encoder/Decoder",
    "tool.urlEncoderDecoderDesc": "URL encoding and decoding tool",
    "tool.jsonPathQuery": "JSONPath Query",
    "tool.jsonPathQueryDesc": "JSONPath path query tool, similar to XPath",
    "tool.markdownPreview": "Markdown Preview",
    "tool.markdownPreviewDesc": "Online Markdown editor with live preview",

    // tools - text
    "tool.textDiff": "Text Diff",
    "tool.textDiffDesc": "Compare two texts and highlight differences",
    "tool.markdownEditor": "Markdown Editor",
    "tool.markdownEditorDesc": "Online Markdown editor with live preview",
    "tool.caseConverter": "Case Converter",
    "tool.caseConverterDesc": "Convert camelCase, snake_case, kebab-case and more",
    "tool.wordCounter": "Word Counter",
    "tool.wordCounterDesc": "Count words, characters, lines, and paragraphs",
    "tool.loremIpsum": "Lorem Ipsum",
    "tool.loremIpsumDesc": "Generate random Lorem Ipsum placeholder text",
    "tool.slugGenerator": "Slug Generator",
    "tool.slugGeneratorDesc": "Convert text to URL-friendly slugs",
    "tool.punctuationConverter": "Full-width/Half-width",
    "tool.punctuationConverterDesc": "Convert between full-width and half-width characters",

    // tools - image
    "tool.imageToBase64": "Image to Base64",
    "tool.imageToBase64Desc": "Convert image files to Base64 encoded strings",
    "tool.faviconGenerator": "Favicon Generator",
    "tool.faviconGeneratorDesc": "Generate website favicon icons (16x16, 32x32)",
    "tool.qrcodeGenerator": "QR Code Generator",
    "tool.qrcodeGeneratorDesc": "Generate QR codes with custom size and color",
    "tool.barcodeGenerator": "Barcode Generator",
    "tool.barcodeGeneratorDesc": "Generate Code128 barcodes online",
    "tool.svgToJsx": "SVG to JSX",
    "tool.svgToJsxDesc": "Convert SVG code to React JSX format",
    "tool.exifViewer": "Exif Viewer",
    "tool.exifViewerDesc": "View image Exif metadata information",
    "tool.imageCompressor": "Image Compressor",
    "tool.imageCompressorDesc": "Online image compression tool supporting PNG, JPG, WebP",
    "tool.imageResizer": "Image Resizer",
    "tool.imageResizerDesc": "Online tool to resize image dimensions",

    // tools - data
    "tool.randomPassword": "Random Password",
    "tool.randomPasswordDesc": "Generate strong random passwords",
    "tool.cronGenerator": "Cron Expression",
    "tool.cronGeneratorDesc": "Visually generate and parse Cron expressions",
    "tool.baseConverter": "Base Converter",
    "tool.baseConverterDesc": "Convert between binary, octal, decimal, and hex",

    // tools - generators
    "tool.placeholderImage": "Placeholder Image",
    "tool.placeholderImageDesc": "Generate placeholder image URLs and HTML code",
    "tool.fakeData": "Fake Data",
    "tool.fakeDataDesc": "Randomly generate names, emails, phone numbers and more",
    "tool.colorGradient": "CSS Gradient",
    "tool.colorGradientDesc": "Visually generate CSS gradient code",
    "tool.metaTags": "Meta Tags",
    "tool.metaTagsDesc": "Generate SEO-optimized HTML meta tags",
    "tool.dataUri": "Data URI",
    "tool.dataUriDesc": "Convert text or files to Data URI format",
    "tool.colorPaletteGenerator": "Color Palette Generator",
    "tool.colorPaletteGeneratorDesc": "CSS color palette generator with color harmony support",
    "tool.gradientGenerator": "Gradient Generator",
    "tool.gradientGeneratorDesc": "CSS gradient background generator",
    "tool.randomNumberGenerator": "Random Number Generator",
    "tool.randomNumberGeneratorDesc": "Generate random numbers with normal distribution support",

    // tools - validators
    "tool.jsonValidator": "JSON Validator",
    "tool.jsonValidatorDesc": "Validate JSON and locate error positions",
    "tool.emailValidator": "Email Validator",
    "tool.emailValidatorDesc": "Validate email address format",
    "tool.phoneValidator": "Phone Validator",
    "tool.phoneValidatorDesc": "Validate Chinese mainland phone number format",
    "tool.idCardValidator": "ID Card Validator",
    "tool.idCardValidatorDesc": "Validate Chinese mainland ID card numbers",
    "tool.creditCardValidator": "Credit Card Validator",
    "tool.creditCardValidatorDesc": "Validate credit card numbers using Luhn algorithm",
    "tool.urlValidator": "URL Validator",
    "tool.urlValidatorDesc": "Validate URL format and parse components",
    "tool.colorContrast": "WCAG Contrast",
    "tool.colorContrastDesc": "Calculate color contrast and check WCAG compliance",
    "tool.ipValidator": "IP Address Validator",
    "tool.ipValidatorDesc": "Validate IPv4 and IPv6 address format",
    "tool.domainValidator": "Domain Validator",
    "tool.domainValidatorDesc": "Validate domain name format",

    // tools - utilities
    "tool.unitConverter": "Unit Converter",
    "tool.unitConverterDesc": "Length, weight, temperature, area and more",
    "tool.timezoneConverter": "Timezone Converter",
    "tool.timezoneConverterDesc": "Global timezone time conversion tool",
    "tool.timer": "Timer",
    "tool.timerDesc": "Online stopwatch and countdown",
    "tool.randomPicker": "Random Picker",
    "tool.randomPickerDesc": "Randomly pick items from a list",
    "tool.calculator": "Calculator",
    "tool.calculatorDesc": "Online scientific calculator",
    "tool.bmiCalculator": "BMI Calculator",
    "tool.bmiCalculatorDesc": "Body Mass Index calculation and evaluation",
    "tool.loveAnniversary": "Love Anniversary",
    "tool.loveAnniversaryDesc": "Calculate love days, anniversary countdown",
    "tool.passwordGenerator": "Password Generator",
    "tool.passwordGeneratorDesc": "Generate secure random passwords",
    "tool.goldenEggLottery": "Golden Egg Lottery",
    "tool.goldenEggLotteryDesc": "Golden egg lottery game",
    "tool.countdownDays": "Countdown Days",
    "tool.countdownDaysDesc": "Countdown to important dates",
    "tool.pomodoroTimer": "Pomodoro Timer",
    "tool.pomodoroTimerDesc": "Focus timer with work/break cycles",
    "tool.textToPoster": "Text to Poster",
    "tool.textToPosterDesc": "Create posters from text",
    "tool.dailyFortune": "Daily Fortune",
    "tool.dailyFortuneDesc": "Daily fortune based on name and birthday",
    "tool.luckyWheel": "Lucky Wheel",
    "tool.luckyWheelDesc": "Spinning wheel lottery game",
    "tool.mortgageCalculator": "Mortgage/Investment Calculator",
    "tool.mortgageCalculatorDesc": "Calculate mortgage monthly payment and investment returns",
    "tool.programmerDaily": "Programmer's Daily Tools",
    "tool.programmerDailyDesc": "Timestamp, ASCII table, color converter, HTTP status codes and more",

    // network-tools
    "tool.ipInfo": "IP Info Lookup",
    "tool.ipInfoDesc": "Query your public IP address and geolocation information",
    "tool.dnsLookup": "DNS Lookup",
    "tool.dnsLookupDesc": "Query DNS resolution records for domains, supports A, MX, TXT records",
    "tool.latencyTest": "Latency Test",
    "tool.latencyTestDesc": "Measure response latency to websites (simulated Ping)",
    "tool.httpHeaders": "HTTP Headers Viewer",
    "tool.httpHeadersDesc": "View HTTP response headers from any website",
    "tool.domainInfo": "Domain Info Lookup",
    "tool.domainInfoDesc": "Query domain WHOIS registration info and expiry date",
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("zh");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Language;
      if (stored === "zh" || stored === "en") setLangState(stored);
    } catch (e) {}
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("lang", newLang);
    } catch (e) {}
    document.cookie = `lang=${newLang};path=/;max-age=31536000`;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang][key as keyof (typeof translations)["zh"]] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}