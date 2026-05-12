import { JsonFormatter } from '@/components/tools/developer/json-formatter';
import { Base64Tool } from '@/components/tools/developer/base64';
import { Timestamp } from '@/components/tools/developer/timestamp';
import { RegexTester } from '@/components/tools/developer/regex-tester';
import { SqlFormatter } from '@/components/tools/developer/sql-formatter';
import { YamlConverter } from '@/components/tools/developer/yaml-converter';
import { JwtDecoder } from '@/components/tools/developer/jwt-decoder';
import { HashGenerator } from '@/components/tools/developer/hash-generator';
import { UuidGenerator } from '@/components/tools/developer/uuid-generator';
import { HtmlEntities } from '@/components/tools/developer/html-entities';
import { TextDiff } from '@/components/tools/text/text-diff';
import { MarkdownEditor } from '@/components/tools/text/markdown-editor';
import { CaseConverter } from '@/components/tools/text/case-converter';
import { WordCounter } from '@/components/tools/text/word-counter';
import { LoremIpsum } from '@/components/tools/text/lorem-ipsum';
import { SlugGenerator } from '@/components/tools/text/slug-generator';
import { PunctuationConverter } from '@/components/tools/text/punctuation-converter';
import { ImageToBase64 } from '@/components/tools/image/image-to-base64';
import { FaviconGenerator } from '@/components/tools/image/favicon-generator';
import { QrcodeGenerator } from '@/components/tools/image/qrcode-generator';
import { BarcodeGenerator } from '@/components/tools/image/barcode-generator';
import { SvgToJsx } from '@/components/tools/image/svg-to-jsx';
import { ExifViewer } from '@/components/tools/image/exif-viewer';
import { RandomPassword } from '@/components/tools/data/random-password';
import { CronGenerator } from '@/components/tools/data/cron-generator';
import { BaseConverter } from '@/components/tools/data/base-converter';
import { PlaceholderImage } from '@/components/tools/generators/placeholder-image';
import { FakeData } from '@/components/tools/generators/fake-data';
import { ColorGradient } from '@/components/tools/generators/color-gradient';
import { MetaTags } from '@/components/tools/generators/meta-tags';
import { DataUri } from '@/components/tools/generators/data-uri';
import { JsonValidator } from '@/components/tools/validators/json-validator';
import { EmailValidator } from '@/components/tools/validators/email-validator';
import { PhoneValidator } from '@/components/tools/validators/phone-validator';
import { IdCardValidator } from '@/components/tools/validators/id-card-validator';
import { CreditCardValidator } from '@/components/tools/validators/credit-card-validator';
import { UrlValidator } from '@/components/tools/validators/url-validator';
import { ColorContrast } from '@/components/tools/validators/color-contrast';
import { UnitConverter } from '@/components/tools/utilities/unit-converter';
import { TimezoneConverter } from '@/components/tools/utilities/timezone-converter';
import { TimerTool } from '@/components/tools/utilities/timer';
import { RandomPicker } from '@/components/tools/utilities/random-picker';
import { Calculator } from '@/components/tools/utilities/calculator';
import { BmiCalculator } from '@/components/tools/utilities/bmi-calculator';
import { LoveAnniversaryCalculator } from '@/components/tools/utilities/love-anniversary';
import { PasswordGenerator } from '@/components/tools/utilities/password-generator';
import { GoldenEggLottery } from '@/components/tools/utilities/golden-egg-lottery';
import { CountdownDays } from '@/components/tools/utilities/countdown-days';
import { PomodoroTimer } from '@/components/tools/utilities/pomodoro-timer';
import { TextToPoster } from '@/components/tools/utilities/text-to-poster';
import { DailyFortune } from '@/components/tools/utilities/daily-fortune';
import { LuckyWheel } from '@/components/tools/utilities/lucky-wheel';
import MortgageCalculator from '@/components/tools/utilities/mortgage-calculator';
import ProgrammerDaily from '@/components/tools/utilities/programmer-daily';

const componentMap: Record<string, React.ComponentType> = {
  'developer-tools/json-formatter': JsonFormatter,
  'developer-tools/base64': Base64Tool,
  'developer-tools/timestamp': Timestamp,
  'developer-tools/regex-tester': RegexTester,
  'developer-tools/sql-formatter': SqlFormatter,
  'developer-tools/yaml-converter': YamlConverter,
  'developer-tools/jwt-decoder': JwtDecoder,
  'developer-tools/hash-generator': HashGenerator,
  'developer-tools/uuid-generator': UuidGenerator,
  'developer-tools/html-entities': HtmlEntities,
  'text-tools/text-diff': TextDiff,
  'text-tools/markdown-editor': MarkdownEditor,
  'text-tools/case-converter': CaseConverter,
  'text-tools/word-counter': WordCounter,
  'text-tools/lorem-ipsum': LoremIpsum,
  'text-tools/slug-generator': SlugGenerator,
  'text-tools/punctuation-converter': PunctuationConverter,
  'image-tools/image-to-base64': ImageToBase64,
  'image-tools/favicon-generator': FaviconGenerator,
  'image-tools/qrcode-generator': QrcodeGenerator,
  'image-tools/barcode-generator': BarcodeGenerator,
  'image-tools/svg-to-jsx': SvgToJsx,
  'image-tools/exif-viewer': ExifViewer,
  'data-tools/random-password': RandomPassword,
  'data-tools/cron-generator': CronGenerator,
  'data-tools/base-converter': BaseConverter,
  'generators/placeholder-image': PlaceholderImage,
  'generators/fake-data': FakeData,
  'generators/color-gradient': ColorGradient,
  'generators/meta-tags': MetaTags,
  'generators/data-uri': DataUri,
  'validators/json-validator': JsonValidator,
  'validators/email-validator': EmailValidator,
  'validators/phone-validator': PhoneValidator,
  'validators/id-card-validator': IdCardValidator,
  'validators/credit-card-validator': CreditCardValidator,
  'validators/url-validator': UrlValidator,
  'validators/color-contrast': ColorContrast,
  'utilities/unit-converter': UnitConverter,
  'utilities/timezone-converter': TimezoneConverter,
  'utilities/timer': TimerTool,
  'utilities/random-picker': RandomPicker,
  'utilities/calculator': Calculator,
  'utilities/bmi-calculator': BmiCalculator,
  'utilities/love-anniversary': LoveAnniversaryCalculator,
  'utilities/password-generator': PasswordGenerator,
  'utilities/golden-egg-lottery': GoldenEggLottery,
  'utilities/countdown-days': CountdownDays,
  'utilities/pomodoro-timer': PomodoroTimer,
  'utilities/text-to-poster': TextToPoster,
  'utilities/daily-fortune': DailyFortune,
  'utilities/lucky-wheel': LuckyWheel,
  'utilities/mortgage-calculator': MortgageCalculator,
  'utilities/programmer-daily': ProgrammerDaily,
};

export function getToolComponent(category: string, tool: string): React.ComponentType | undefined {
  return componentMap[`${category}/${tool}`];
}
