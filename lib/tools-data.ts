import { type LucideIcon, Code, FileText, ImageIcon, Database, Zap, CheckCircle, Calculator, Braces, Binary, Clock, Regex, FileCode, ArrowLeftRight, Key, Fingerprint, Hash, Quote, Diff, PenTool, CaseSensitive, ALargeSmall, Text, Link, Type, QrCode, Barcode, ImageUp, Palette, FileImage, Camera, Shield, Lock, Waves, Archive, UserPlus, PaintBucket, Globe, FileJson, Mail, Phone, CreditCard, UserCheck, Contrast, Ruler, Globe2, Timer, Shuffle, Scale, Heart, Crop, Gift, Sparkles, CircleDot, Grid, Box, Square, Circle, Play, Spline, Brain } from 'lucide-react';

export interface Tool {
  slug: string;
  category: string;
  nameKey: string;
  descriptionKey: string;
  keywords: string;
  icon: LucideIcon;
}

export interface Category {
  slug: string;
  nameKey: string;
  icon: LucideIcon;
  descriptionKey: string;
}

export const categories: Category[] = [
  { slug: 'developer-tools', nameKey: 'cat.developer', icon: Code, descriptionKey: 'cat.developerDesc' },
  { slug: 'text-tools', nameKey: 'cat.text', icon: FileText, descriptionKey: 'cat.textDesc' },
  { slug: 'image-tools', nameKey: 'cat.image', icon: ImageIcon, descriptionKey: 'cat.imageDesc' },
  { slug: 'data-tools', nameKey: 'cat.data', icon: Database, descriptionKey: 'cat.dataDesc' },
  { slug: 'generators', nameKey: 'cat.generators', icon: Zap, descriptionKey: 'cat.generatorsDesc' },
  { slug: 'validators', nameKey: 'cat.validators', icon: CheckCircle, descriptionKey: 'cat.validatorsDesc' },
  { slug: 'utilities', nameKey: 'cat.utilities', icon: Calculator, descriptionKey: 'cat.utilitiesDesc' },
  { slug: 'network-tools', nameKey: 'cat.network', icon: Globe, descriptionKey: 'cat.networkDesc' },
  { slug: 'fun-tools', nameKey: 'cat.fun', icon: Sparkles, descriptionKey: 'cat.funDesc' },
];

export const tools: Tool[] = [
  // developer-tools
  { slug: 'json-formatter', category: 'developer-tools', nameKey: 'tool.jsonFormatter', descriptionKey: 'tool.jsonFormatterDesc', keywords: 'JSON,格式化,压缩,校验,美化,Minify', icon: Braces },
  { slug: 'base64', category: 'developer-tools', nameKey: 'tool.base64', descriptionKey: 'tool.base64Desc', keywords: 'Base64,编码,解码,Encode,Decode', icon: Binary },
  { slug: 'timestamp', category: 'developer-tools', nameKey: 'tool.timestamp', descriptionKey: 'tool.timestampDesc', keywords: '时间戳,Unix,Timestamp,日期转换', icon: Clock },
  { slug: 'regex-tester', category: 'developer-tools', nameKey: 'tool.regexTester', descriptionKey: 'tool.regexTesterDesc', keywords: '正则,Regex,匹配,替换,测试', icon: Regex },
  { slug: 'sql-formatter', category: 'developer-tools', nameKey: 'tool.sqlFormatter', descriptionKey: 'tool.sqlFormatterDesc', keywords: 'SQL,格式化,美化,Formater', icon: FileCode },
  { slug: 'yaml-converter', category: 'developer-tools', nameKey: 'tool.yamlConverter', descriptionKey: 'tool.yamlConverterDesc', keywords: 'YAML,JSON,转换,互转', icon: ArrowLeftRight },
  { slug: 'jwt-decoder', category: 'developer-tools', nameKey: 'tool.jwtDecoder', descriptionKey: 'tool.jwtDecoderDesc', keywords: 'JWT,Token,解码,Decode', icon: Key },
  { slug: 'hash-generator', category: 'developer-tools', nameKey: 'tool.hashGenerator', descriptionKey: 'tool.hashGeneratorDesc', keywords: 'MD5,SHA,哈希,Hash,加密', icon: Fingerprint },
  { slug: 'uuid-generator', category: 'developer-tools', nameKey: 'tool.uuidGenerator', descriptionKey: 'tool.uuidGeneratorDesc', keywords: 'UUID,GUID,唯一标识,生成', icon: Hash },
  { slug: 'html-entities', category: 'developer-tools', nameKey: 'tool.htmlEntities', descriptionKey: 'tool.htmlEntitiesDesc', keywords: 'HTML,实体编码,Encode,Decode,转义', icon: Quote },
  { slug: 'flexbox-generator', category: 'developer-tools', nameKey: 'tool.flexboxGenerator', descriptionKey: 'tool.flexboxGeneratorDesc', keywords: 'Flexbox,CSS,布局,弹性盒子,布局生成', icon: Grid },
  { slug: 'box-shadow-generator', category: 'developer-tools', nameKey: 'tool.boxShadowGenerator', descriptionKey: 'tool.boxShadowGeneratorDesc', keywords: 'BoxShadow,CSS,阴影,阴影生成', icon: Box },
  { slug: 'border-radius-generator', category: 'developer-tools', nameKey: 'tool.borderRadiusGenerator', descriptionKey: 'tool.borderRadiusGeneratorDesc', keywords: 'BorderRadius,CSS,圆角,圆角生成', icon: Square },
  { slug: 'color-format', category: 'developer-tools', nameKey: 'tool.colorFormat', descriptionKey: 'tool.colorFormatDesc', keywords: 'Color,HEX,RGB,HSL,颜色格式,颜色转换', icon: Palette },
  { slug: 'css-animation-generator', category: 'developer-tools', nameKey: 'tool.cssAnimationGenerator', descriptionKey: 'tool.cssAnimationGeneratorDesc', keywords: 'CSS,Animation,动画,关键帧,@keyframes', icon: Play },
  { slug: 'url-encoder-decoder', category: 'developer-tools', nameKey: 'tool.urlEncoderDecoder', descriptionKey: 'tool.urlEncoderDecoderDesc', keywords: 'URL,编码,解码,Encode,Decode,百分号编码', icon: Link },
  { slug: 'json-path-query', category: 'developer-tools', nameKey: 'tool.jsonPathQuery', descriptionKey: 'tool.jsonPathQueryDesc', keywords: 'JSONPath,JSON,路径,查询,XPATH', icon: Braces },
  { slug: 'markdown-preview', category: 'developer-tools', nameKey: 'tool.markdownPreview', descriptionKey: 'tool.markdownPreviewDesc', keywords: 'Markdown,预览,编辑,实时预览', icon: FileText },

  // text-tools
  { slug: 'text-diff', category: 'text-tools', nameKey: 'tool.textDiff', descriptionKey: 'tool.textDiffDesc', keywords: 'Diff,文本对比,差异,比较', icon: Diff },
  { slug: 'markdown-editor', category: 'text-tools', nameKey: 'tool.markdownEditor', descriptionKey: 'tool.markdownEditorDesc', keywords: 'Markdown,编辑器,预览,MD', icon: PenTool },
  { slug: 'case-converter', category: 'text-tools', nameKey: 'tool.caseConverter', descriptionKey: 'tool.caseConverterDesc', keywords: '大小写,camelCase,snake_case,kebab-case', icon: CaseSensitive },
  { slug: 'word-counter', category: 'text-tools', nameKey: 'tool.wordCounter', descriptionKey: 'tool.wordCounterDesc', keywords: '字数统计,字符数,行数,统计', icon: ALargeSmall },
  { slug: 'lorem-ipsum', category: 'text-tools', nameKey: 'tool.loremIpsum', descriptionKey: 'tool.loremIpsumDesc', keywords: 'Lorem,Ipsum,占位文本,生成', icon: Text },
  { slug: 'slug-generator', category: 'text-tools', nameKey: 'tool.slugGenerator', descriptionKey: 'tool.slugGeneratorDesc', keywords: 'Slug,URL,拼音,生成', icon: Link },
  { slug: 'punctuation-converter', category: 'text-tools', nameKey: 'tool.punctuationConverter', descriptionKey: 'tool.punctuationConverterDesc', keywords: '全角,半角,标点,转换', icon: Type },

  // image-tools
  { slug: 'image-to-base64', category: 'image-tools', nameKey: 'tool.imageToBase64', descriptionKey: 'tool.imageToBase64Desc', keywords: '图片,Base64,编码,DataURI', icon: ImageUp },
  { slug: 'favicon-generator', category: 'image-tools', nameKey: 'tool.faviconGenerator', descriptionKey: 'tool.faviconGeneratorDesc', keywords: 'Favicon,图标,生成,ICO', icon: Crop },
  { slug: 'qrcode-generator', category: 'image-tools', nameKey: 'tool.qrcodeGenerator', descriptionKey: 'tool.qrcodeGeneratorDesc', keywords: '二维码,QRCode,生成,条码', icon: QrCode },
  { slug: 'barcode-generator', category: 'image-tools', nameKey: 'tool.barcodeGenerator', descriptionKey: 'tool.barcodeGeneratorDesc', keywords: '条形码,Barcode,Code128,生成', icon: Barcode },
  { slug: 'svg-to-jsx', category: 'image-tools', nameKey: 'tool.svgToJsx', descriptionKey: 'tool.svgToJsxDesc', keywords: 'SVG,JSX,React,转换', icon: FileCode },
  { slug: 'exif-viewer', category: 'image-tools', nameKey: 'tool.exifViewer', descriptionKey: 'tool.exifViewerDesc', keywords: 'Exif,元数据,图片信息,GPS', icon: Camera },
  { slug: 'image-compressor', category: 'image-tools', nameKey: 'tool.imageCompressor', descriptionKey: 'tool.imageCompressorDesc', keywords: 'Image,Compress,压缩,图片压缩,优化', icon: Archive },
  { slug: 'image-resizer', category: 'image-tools', nameKey: 'tool.imageResizer', descriptionKey: 'tool.imageResizerDesc', keywords: 'Image,Resize,调整大小,尺寸,图片缩放', icon: Scale },

  // data-tools
  { slug: 'random-password', category: 'data-tools', nameKey: 'tool.randomPassword', descriptionKey: 'tool.randomPasswordDesc', keywords: '密码,随机,安全,生成', icon: Lock },
  { slug: 'cron-generator', category: 'data-tools', nameKey: 'tool.cronGenerator', descriptionKey: 'tool.cronGeneratorDesc', keywords: 'Cron,定时任务,表达式,生成', icon: Waves },
  { slug: 'base-converter', category: 'data-tools', nameKey: 'tool.baseConverter', descriptionKey: 'tool.baseConverterDesc', keywords: '进制,二进制,十六进制,转换,Hex', icon: Archive },

  // generators
  { slug: 'placeholder-image', category: 'generators', nameKey: 'tool.placeholderImage', descriptionKey: 'tool.placeholderImageDesc', keywords: '占位图,Placeholder,图片生成', icon: ImageIcon },
  { slug: 'fake-data', category: 'generators', nameKey: 'tool.fakeData', descriptionKey: 'tool.fakeDataDesc', keywords: '假数据,Mock,测试数据,生成', icon: UserPlus },
  { slug: 'color-gradient', category: 'generators', nameKey: 'tool.colorGradient', descriptionKey: 'tool.colorGradientDesc', keywords: 'CSS,渐变,Gradient,颜色', icon: PaintBucket },
  { slug: 'meta-tags', category: 'generators', nameKey: 'tool.metaTags', descriptionKey: 'tool.metaTagsDesc', keywords: 'Meta,SEO,标签,生成', icon: Globe },
  { slug: 'data-uri', category: 'generators', nameKey: 'tool.dataUri', descriptionKey: 'tool.dataUriDesc', keywords: 'DataURI,Base64,内嵌,生成', icon: Link },
  { slug: 'color-palette-generator', category: 'generators', nameKey: 'tool.colorPaletteGenerator', descriptionKey: 'tool.colorPaletteGeneratorDesc', keywords: 'Color,Palette,调色板,色相,色彩,配色', icon: Palette },
  { slug: 'gradient-generator', category: 'generators', nameKey: 'tool.gradientGenerator', descriptionKey: 'tool.gradientGeneratorDesc', keywords: 'Gradient,渐变,CSS,背景,渐变生成', icon: Spline },
  { slug: 'random-number-generator', category: 'generators', nameKey: 'tool.randomNumberGenerator', descriptionKey: 'tool.randomNumberGeneratorDesc', keywords: 'Random,Number,随机数,正态分布,随机生成', icon: Hash },

  // validators
  { slug: 'json-validator', category: 'validators', nameKey: 'tool.jsonValidator', descriptionKey: 'tool.jsonValidatorDesc', keywords: 'JSON,校验,格式,错误', icon: FileJson },
  { slug: 'email-validator', category: 'validators', nameKey: 'tool.emailValidator', descriptionKey: 'tool.emailValidatorDesc', keywords: '邮箱,Email,验证,格式', icon: Mail },
  { slug: 'phone-validator', category: 'validators', nameKey: 'tool.phoneValidator', descriptionKey: 'tool.phoneValidatorDesc', keywords: '手机号,验证,格式,中国', icon: Phone },
  { slug: 'id-card-validator', category: 'validators', nameKey: 'tool.idCardValidator', descriptionKey: 'tool.idCardValidatorDesc', keywords: '身份证,验证,号码,中国', icon: UserCheck },
  { slug: 'credit-card-validator', category: 'validators', nameKey: 'tool.creditCardValidator', descriptionKey: 'tool.creditCardValidatorDesc', keywords: '信用卡,Luhn,校验,验证', icon: CreditCard },
  { slug: 'url-validator', category: 'validators', nameKey: 'tool.urlValidator', descriptionKey: 'tool.urlValidatorDesc', keywords: 'URL,验证,解析,格式', icon: Link },
  { slug: 'color-contrast', category: 'validators', nameKey: 'tool.colorContrast', descriptionKey: 'tool.colorContrastDesc', keywords: 'WCAG,对比度,颜色,无障碍', icon: Contrast },
  { slug: 'ip-validator', category: 'validators', nameKey: 'tool.ipValidator', descriptionKey: 'tool.ipValidatorDesc', keywords: 'IP,IPv4,IPv6,地址,验证,网络', icon: Globe },
  { slug: 'domain-validator', category: 'validators', nameKey: 'tool.domainValidator', descriptionKey: 'tool.domainValidatorDesc', keywords: 'Domain,域名,格式,验证,DNS', icon: Globe },

  // utilities
  { slug: 'unit-converter', category: 'utilities', nameKey: 'tool.unitConverter', descriptionKey: 'tool.unitConverterDesc', keywords: '单位,换算,长度,重量,温度,转换', icon: Ruler },
  { slug: 'timezone-converter', category: 'utilities', nameKey: 'tool.timezoneConverter', descriptionKey: 'tool.timezoneConverterDesc', keywords: '时区,时间,转换,UTC,GMT', icon: Globe2 },
  { slug: 'timer', category: 'utilities', nameKey: 'tool.timer', descriptionKey: 'tool.timerDesc', keywords: '计时器,秒表,倒计时,Timer', icon: Timer },
  { slug: 'random-picker', category: 'utilities', nameKey: 'tool.randomPicker', descriptionKey: 'tool.randomPickerDesc', keywords: '随机,抽签,选择,抽取', icon: Shuffle },
  { slug: 'calculator', category: 'utilities', nameKey: 'tool.calculator', descriptionKey: 'tool.calculatorDesc', keywords: '计算器,科学计算,Calculator', icon: Calculator },
  { slug: 'bmi-calculator', category: 'utilities', nameKey: 'tool.bmiCalculator', descriptionKey: 'tool.bmiCalculatorDesc', keywords: 'BMI,身体质量指数,健康,计算', icon: Heart },
  { slug: 'love-anniversary', category: 'utilities', nameKey: 'tool.loveAnniversary', descriptionKey: 'tool.loveAnniversaryDesc', keywords: '恋爱,纪念日,在一起,天数', icon: Heart },
  { slug: 'password-generator', category: 'utilities', nameKey: 'tool.passwordGenerator', descriptionKey: 'tool.passwordGeneratorDesc', keywords: '密码,随机,安全,生成', icon: Lock },
  { slug: 'golden-egg-lottery', category: 'utilities', nameKey: 'tool.goldenEggLottery', descriptionKey: 'tool.goldenEggLotteryDesc', keywords: '砸金蛋,抽奖,游戏,礼物', icon: Gift },
  { slug: 'countdown-days', category: 'utilities', nameKey: 'tool.countdownDays', descriptionKey: 'tool.countdownDaysDesc', keywords: '倒计时,日期,天数,计时', icon: Clock },
  { slug: 'pomodoro-timer', category: 'utilities', nameKey: 'tool.pomodoroTimer', descriptionKey: 'tool.pomodoroTimerDesc', keywords: '番茄钟,专注,工作,学习', icon: Timer },
  { slug: 'text-to-poster', category: 'utilities', nameKey: 'tool.textToPoster', descriptionKey: 'tool.textToPosterDesc', keywords: '文字,海报,生成,图片', icon: ImageIcon },
  { slug: 'daily-fortune', category: 'utilities', nameKey: 'tool.dailyFortune', descriptionKey: 'tool.dailyFortuneDesc', keywords: '运势,占卜,幸运,每日', icon: Sparkles },
  { slug: 'lucky-wheel', category: 'utilities', nameKey: 'tool.luckyWheel', descriptionKey: 'tool.luckyWheelDesc', keywords: '转盘,抽奖,游戏,随机', icon: CircleDot },
  { slug: 'mortgage-calculator', category: 'utilities', nameKey: 'tool.mortgageCalculator', descriptionKey: 'tool.mortgageCalculatorDesc', keywords: '房贷,贷款,理财,计算,月供', icon: Calculator },
  { slug: 'programmer-daily', category: 'utilities', nameKey: 'tool.programmerDaily', descriptionKey: 'tool.programmerDailyDesc', keywords: '程序员,ASCII,时间戳,HTTP,进制,颜色', icon: Code },

  // network-tools
  { slug: 'ip-info', category: 'network-tools', nameKey: 'tool.ipInfo', descriptionKey: 'tool.ipInfoDesc', keywords: 'IP,地址,查询,位置,公网', icon: Globe },
  { slug: 'dns-lookup', category: 'network-tools', nameKey: 'tool.dnsLookup', descriptionKey: 'tool.dnsLookupDesc', keywords: 'DNS,查询,域名解析,解析记录', icon: Globe2 },
  { slug: 'latency-test', category: 'network-tools', nameKey: 'tool.latencyTest', descriptionKey: 'tool.latencyTestDesc', keywords: '延迟,Ping,测试,响应时间', icon: Timer },
  { slug: 'http-headers', category: 'network-tools', nameKey: 'tool.httpHeaders', descriptionKey: 'tool.httpHeadersDesc', keywords: 'HTTP,Headers,响应头,请求头', icon: FileJson },
  { slug: 'domain-info', category: 'network-tools', nameKey: 'tool.domainInfo', descriptionKey: 'tool.domainInfoDesc', keywords: '域名,WHOIS,注册信息,过期时间', icon: Globe },

  // fun-tools
  { slug: 'mbti-test', category: 'fun-tools', nameKey: 'tool.mbtiTest', descriptionKey: 'tool.mbtiTestDesc', keywords: 'MBTI,人格,性格,测试,16型', icon: Brain },
  { slug: 'sbti-test', category: 'fun-tools', nameKey: 'tool.sbtiTest', descriptionKey: 'tool.sbtiTestDesc', keywords: 'SBTI,社交,行为,性格,测试', icon: Brain },
];

export function getTool(category: string, slug: string): Tool | undefined {
  return tools.find(t => t.category === category && t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter(t => t.category === category);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}