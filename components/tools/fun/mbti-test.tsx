'use client';

import { useState, useCallback, useMemo } from 'react';
import { Brain, Sparkles, ArrowRight, RotateCcw, ChevronDown } from 'lucide-react';

// ============================
// 数据定义
// ============================

interface Statement {
  id: number;
  text: string;
  /** 维度索引 0=E/I, 1=S/N, 2=T/F, 3=J/P */
  dim: number;
  /** true=同意加正分(偏向E/S/T/J), false=同意加负分(偏向I/N/F/P) */
  forward: boolean;
  /** 所属题库分类 */
  module: string;
}

/** 7 级量表标签 */
const scaleLabels = ['非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意'];

/** 4 种题库类型 */
const modules = [
  { key: 'social', label: '社交风格', sub: 'E ↔ I 能量来源', icon: '🔋' },
  { key: 'cognitive', label: '认知方式', sub: 'S ↔ N 信息获取', icon: '🔍' },
  { key: 'decision', label: '决策倾向', sub: 'T ↔ F 决策依据', icon: '⚖️' },
  { key: 'lifestyle', label: '生活方式', sub: 'J ↔ P 应对外部世界', icon: '🧭' },
];

const statements: Statement[] = [
  // ===== 社交风格 (E ↔ I) =====
  { id: 1, dim: 0, forward: true, module: 'social', text: '在聚会或社交场合中，你会主动结识新朋友' },
  { id: 2, dim: 0, forward: true, module: 'social', text: '和一大群人在一起让你感到精力充沛' },
  { id: 3, dim: 0, forward: true, module: 'social', text: '你更愿意通过与他人交谈来理清自己的想法' },
  { id: 4, dim: 0, forward: true, module: 'social', text: '你喜欢成为众人关注的焦点' },
  { id: 5, dim: 0, forward: false, module: 'social', text: '长时间独处不会让你感到无聊或烦躁' },
  { id: 6, dim: 0, forward: false, module: 'social', text: '比起说，你更擅长倾听' },
  { id: 7, dim: 0, forward: false, module: 'social', text: '你需要独处的时间来恢复精力' },
  { id: 8, dim: 0, forward: false, module: 'social', text: '在一对一的深度对话中，你比在群体讨论中更自在' },
  { id: 9, dim: 0, forward: true, module: 'social', text: '你喜欢结识许多不同的人，而不是只和几个密友来往' },

  // ===== 认知方式 (S ↔ N) =====
  { id: 10, dim: 1, forward: true, module: 'cognitive', text: '你更看重事实和细节，而非抽象概念' },
  { id: 11, dim: 1, forward: true, module: 'cognitive', text: '你对那些不切实际的理论讨论缺乏耐心' },
  { id: 12, dim: 1, forward: true, module: 'cognitive', text: '你更相信亲身经验，而不是直觉判断' },
  { id: 13, dim: 1, forward: false, module: 'cognitive', text: '你经常沉浸在对未来的设想和可能性之中' },
  { id: 14, dim: 1, forward: false, module: 'cognitive', text: '比起具体的操作方法，你对抽象的理论更感兴趣' },
  { id: 15, dim: 1, forward: false, module: 'cognitive', text: '你在看到事物之间的隐藏联系时会感到兴奋' },
  { id: 16, dim: 1, forward: true, module: 'cognitive', text: '你喜欢有清晰步骤和实际案例的学习材料' },
  { id: 17, dim: 1, forward: false, module: 'cognitive', text: '你经常会冒出新的创意和点子，哪怕它们还不成熟' },
  { id: 18, dim: 1, forward: true, module: 'cognitive', text: '你更习惯按照既定的流程做事，不太喜欢频繁改变计划' },

  // ===== 决策倾向 (T ↔ F) =====
  { id: 19, dim: 2, forward: true, module: 'decision', text: '在做重要决定时，你更依赖逻辑分析而非情感直觉' },
  { id: 20, dim: 2, forward: true, module: 'decision', text: '你认为公平比同情更重要' },
  { id: 21, dim: 2, forward: true, module: 'decision', text: '你能接受别人对你工作的直接批评，只要批评是客观的' },
  { id: 22, dim: 2, forward: false, module: 'decision', text: '当朋友向你倾诉烦恼时，你更倾向于提供情感支持而非解决方案' },
  { id: 23, dim: 2, forward: false, module: 'decision', text: '你很容易感受到他人的情绪变化' },
  { id: 24, dim: 2, forward: false, module: 'decision', text: '在做决定时，你很难忽视对他人的影响' },
  { id: 25, dim: 2, forward: true, module: 'decision', text: '你习惯于通过数据和事实来说服别人' },
  { id: 26, dim: 2, forward: false, module: 'decision', text: '维护团队和谐往往比坚持正确的观点更重要' },
  { id: 27, dim: 2, forward: true, module: 'decision', text: '你认为效率比人际关系更重要' },

  // ===== 生活方式 (J ↔ P) =====
  { id: 28, dim: 3, forward: true, module: 'lifestyle', text: '你喜欢有计划、有条理的生活方式' },
  { id: 29, dim: 3, forward: true, module: 'lifestyle', text: '你倾向于提前完成任务，而不是拖到最后一刻' },
  { id: 30, dim: 3, forward: true, module: 'lifestyle', text: '你更喜欢列清单、定日程，按部就班地工作' },
  { id: 31, dim: 3, forward: false, module: 'lifestyle', text: '你喜欢保持选择的开放性，不喜欢过早做出决定' },
  { id: 32, dim: 3, forward: false, module: 'lifestyle', text: '计划赶不上变化，所以你更喜欢随性而为' },
  { id: 33, dim: 3, forward: false, module: 'lifestyle', text: '你在截止日期临近时的压力下工作效果最好' },
  { id: 34, dim: 3, forward: true, module: 'lifestyle', text: '你倾向于先完成任务再放松，而不是先享受后补救' },
  { id: 35, dim: 3, forward: false, module: 'lifestyle', text: '你觉得严格的时间表限制了你的自由和创造力' },
  { id: 36, dim: 3, forward: true, module: 'lifestyle', text: '杂乱无序的环境会让你感到焦虑' },
];

interface DimensionMeta {
  key: number;
  label: string;
  left: string;
  right: string;
  icon: string;
}

const dimensionMeta: DimensionMeta[] = [
  { key: 0, label: '外向 (E) ↔ 内向 (I)', left: '外向', right: '内向', icon: '🔋' },
  { key: 1, label: '感觉 (S) ↔ 直觉 (N)', left: '感觉', right: '直觉', icon: '🔍' },
  { key: 2, label: '思维 (T) ↔ 情感 (F)', left: '思维', right: '情感', icon: '⚖️' },
  { key: 3, label: '判断 (J) ↔ 感知 (P)', left: '判断', right: '感知', icon: '🧭' },
];

const results: Record<string, { title: string; emoji: string; desc: string; traits: string[] }> = {
  'INTJ': { title: '建筑师', emoji: '🏛️', desc: '富有想象力的战略思考者，一切皆有计划。你独立、果断，善于制定长远策略并坚定执行。', traits: ['远见卓识', '独立自主', '逻辑严密', '高标准'] },
  'INTP': { title: '逻辑学家', emoji: '🔬', desc: '具有创新精神的分析型思考者。你对世界的运行规律充满好奇，享受深度思考和发现真理。', traits: ['理性分析', '创新思维', '独立思考', '求知欲强'] },
  'ENTJ': { title: '指挥官', emoji: '👑', desc: '大胆、富有想象力且意志强大的领导者。你善于运筹帷幄，总能看到全局并带领团队前进。', traits: ['领导力', '自信果断', '战略思维', '高效执行'] },
  'ENTP': { title: '辩论家', emoji: '⚡', desc: '聪明好奇的思想者，无法抗拒智力挑战。你思维敏捷，善于从不同角度看问题。', traits: ['思维敏捷', '好奇心强', '善于辩论', '创新多变'] },
  'INFJ': { title: '提倡者', emoji: '🌿', desc: '安静而神秘，但鼓舞人心且虽千万人吾往矣。你心怀理想，致力于让世界变得更美好。', traits: ['理想主义', '洞察力强', '同理心', '坚定执着'] },
  'INFP': { title: '调停者', emoji: '🌺', desc: '诗意，善良的利他主义者，总是热心于帮助他人。你珍视内心的价值观，追求意义和真诚。', traits: ['善良温柔', '理想主义', '创造力', '忠诚重情'] },
  'ENFJ': { title: '主人公', emoji: '🌟', desc: '富有魅力且鼓舞人心的领导者，能让听众为之动容。你关心他人，善于激励和引导。', traits: ['热心助人', '感染力强', '领导力', '善于沟通'] },
  'ENFP': { title: '竞选者', emoji: '🦋', desc: '热情、富有创造力、爱社交的自由灵魂。你总是能找到微笑的理由，乐观感染身边人。', traits: ['热情洋溢', '创造力', '善于交际', '自由灵动'] },
  'ISTJ': { title: '物流师', emoji: '📋', desc: '务实且注重事实的个人，可靠性不容置疑。你做事踏实，重承诺，是团队中最可靠的人。', traits: ['踏实可靠', '责任心强', '条理清晰', '务实稳重'] },
  'ISFJ': { title: '守卫者', emoji: '🛡️', desc: '专注而温暖的守护者，时刻准备着保护所爱之人。你默默付出，用行动表达关怀。', traits: ['忠诚守护', '细致体贴', '责任心', '谦逊温暖'] },
  'ESTJ': { title: '总经理', emoji: '🏢', desc: '出色的管理者，对事物管理和人员管理都游刃有余。你务实高效，注重秩序和成果。', traits: ['管理能力', '务实高效', '条理分明', '意志坚定'] },
  'ESFJ': { title: '执政官', emoji: '🎉', desc: '极有同情心、爱社交、受欢迎的贴心人。你乐于助人，善于营造温暖和谐的氛围。', traits: ['热心助人', '善于社交', '责任感', '注重和谐'] },
  'ISTP': { title: '鉴赏家', emoji: '🛠️', desc: '大胆而实际，擅长使用任何形式的工具。你动手能力强，喜欢通过实际操作解决问题。', traits: ['动手能力', '冷静理性', '实用主义', '冒险精神'] },
  'ISFP': { title: '探险家', emoji: '🎨', desc: '灵活而有魅力的艺术家，随时准备体验和探索新事物。你热爱美，享受当下每一刻。', traits: ['艺术气质', '随性自由', '温柔善良', '懂得享受'] },
  'ESTP': { title: '企业家', emoji: '🔥', desc: '聪明、精力充沛且敏锐，真正享受冒险。你行动力强，善于抓住机会快速决策。', traits: ['行动力', '应变能力', '社交达人', '冒险精神'] },
  'ESFP': { title: '表演者', emoji: '🎭', desc: '自发而动感的表演者，生活永远围绕着你。你热爱生活，乐于把快乐传递给每个人。', traits: ['活力四射', '善于表达', '乐观开朗', '感染力强'] },
};

/** 根据累积分数计算 MBTI 类型 */
function getTypeFromScores(scores: number[]): string {
  const type = [
    scores[0] > 0 ? 'E' : 'I',
    scores[1] > 0 ? 'S' : 'N',
    scores[2] > 0 ? 'T' : 'F',
    scores[3] > 0 ? 'J' : 'P',
  ];
  return type.join('');
}

// ============================
// 16 型图鉴
// ============================
type TypePersona = { code: string; title: string; role: string; tagline: string; emoji: string; color: string };
const typeGallery: TypePersona[] = [
  { code: 'INTJ', title: '建筑师', role: '分析家', tagline: '一切皆有计划', emoji: '🏛️', color: 'from-purple-500 to-violet-600' },
  { code: 'INTP', title: '逻辑学家', role: '分析家', tagline: '知识就是力量', emoji: '🔬', color: 'from-purple-500 to-violet-600' },
  { code: 'ENTJ', title: '指挥官', role: '分析家', tagline: '天生的领导者', emoji: '👑', color: 'from-purple-500 to-violet-600' },
  { code: 'ENTP', title: '辩论家', role: '分析家', tagline: '挑战一切假设', emoji: '⚡', color: 'from-purple-500 to-violet-600' },
  { code: 'INFJ', title: '提倡者', role: '外交家', tagline: '让世界更美好', emoji: '🌿', color: 'from-emerald-500 to-green-600' },
  { code: 'INFP', title: '调停者', role: '外交家', tagline: '诗意理想主义者', emoji: '🌺', color: 'from-emerald-500 to-green-600' },
  { code: 'ENFJ', title: '主人公', role: '外交家', tagline: '用魅力激励他人', emoji: '🌟', color: 'from-emerald-500 to-green-600' },
  { code: 'ENFP', title: '竞选者', role: '外交家', tagline: '永远自由灵动', emoji: '🦋', color: 'from-emerald-500 to-green-600' },
  { code: 'ISTJ', title: '物流师', role: '守护者', tagline: '可靠性不容置疑', emoji: '📋', color: 'from-sky-400 to-blue-500' },
  { code: 'ISFJ', title: '守卫者', role: '守护者', tagline: '默默守护所爱', emoji: '🛡️', color: 'from-sky-400 to-blue-500' },
  { code: 'ESTJ', title: '总经理', role: '守护者', tagline: '务实高效的管理者', emoji: '🏢', color: 'from-sky-400 to-blue-500' },
  { code: 'ESFJ', title: '执政官', role: '守护者', tagline: '温暖和谐的贴心人', emoji: '🎉', color: 'from-sky-400 to-blue-500' },
  { code: 'ISTP', title: '鉴赏家', role: '探险家', tagline: '工具在手天下我有', emoji: '🛠️', color: 'from-amber-400 to-orange-500' },
  { code: 'ISFP', title: '探险家', role: '探险家', tagline: '活在当下享受美好', emoji: '🎨', color: 'from-amber-400 to-orange-500' },
  { code: 'ESTP', title: '企业家', role: '探险家', tagline: '敢于冒险抓住机会', emoji: '🔥', color: 'from-amber-400 to-orange-500' },
  { code: 'ESFP', title: '表演者', role: '探险家', tagline: '生活就是舞台', emoji: '🎭', color: 'from-amber-400 to-orange-500' },
];

const roleMeta: Record<string, { label: string; color: string; border: string; bg: string }> = {
  '分析家': { label: '分析家', color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  '外交家': { label: '外交家', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  '守护者': { label: '守护者', color: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  '探险家': { label: '探险家', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/20' },
};

function TypeGalleryGrid({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6">16 种人格类型</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        {typeGallery.map(t => (
          <button
            key={t.code}
            onClick={onStart}
            className={`rounded-2xl border ${roleMeta[t.role].border} ${roleMeta[t.role].bg} p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 text-left`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xl`}>
                {t.emoji}
              </div>
              <div>
                <div className={`text-xs font-semibold ${roleMeta[t.role].color}`}>{t.role}</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.code} · {t.title}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">"{t.tagline}"</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================
// FAQ
// ============================
const faqItems = [
  { q: 'MBTI 是什么？', a: 'MBTI（Myers-Briggs Type Indicator）是世界上最广泛使用的人格测评工具之一。它基于瑞士心理学家卡尔·荣格的心理类型理论，由迈尔斯母女开发，通过四个维度（E/I、S/N、T/F、J/P）的组合，将人分为 16 种人格类型。' },
  { q: '这个测试准确吗？', a: '本测试为简化版自评工具，共 36 道题，约 5 分钟完成。结果仅供娱乐和自我反思参考，不能替代专业心理测评。16personalities 官网报告其测试准确率约 90%，但请注意自评类测试都存在主观偏差。' },
  { q: '我的数据会被上传吗？', a: '不会。全部计算在你的浏览器本地完成，我们不收集、不存储、不上传任何答题数据。' },
  { q: '四个字母分别代表什么？', a: '第一个字母 E/I = 外向/内向（你如何获取能量），第二个 S/N = 感觉/直觉（你如何获取信息），第三个 T/F = 思维/情感（你如何做决定），第四个 J/P = 判断/感知（你如何应对外部世界）。' },
  { q: '16 种人格有优劣之分吗？', a: '没有。每种人格都有独特的优势和盲区，没有哪一种比另一种更好。MBTI 的核心价值是帮助你理解自己的行为倾向，而非给你贴标签。' },
  { q: '为什么我每次测试结果可能不一样？', a: '一方面，你的答题状态和心境会影响选择；另一方面，部分人的维度得分接近中性（如 51% E 和 49% I），微小的变化就可能导致类型改变。这很正常，说明你在那个维度上是灵活的。' },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto mt-12 mb-8">
      <h3 className="text-center text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">常见问题</h3>
      <div className="space-y-3">
        {faqItems.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.q}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === idx && (
              <div className="px-4 pb-4 pt-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================
// 主组件
// ============================
type Stage = 'intro' | 'testing' | 'result';

export default function MbtiTest() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);

  /** 每个题库模块内随机打乱 */
  const shuffled = useMemo(() => {
    const groups: Record<string, Statement[]> = {};
    for (const s of statements) {
      if (!groups[s.module]) groups[s.module] = [];
      groups[s.module].push(s);
    }
    const order: Statement[] = [];
    for (const m of modules) {
      const items = (groups[m.key] || []).slice().sort(() => Math.random() - 0.5);
      order.push(...items);
    }
    return order;
  }, []);

  const startTest = useCallback(() => {
    setStage('testing');
    setCurrentIdx(0);
    setScores([0, 0, 0, 0]);
  }, []);

  /** 处理 7 级量表选择 */
  const handleAnswer = useCallback((scaleValue: number) => {
    const stmt = shuffled[currentIdx];
    // scaleValue 0~6 → 映射为 -3 ~ +3
    const weight = scaleValue - 3;
    const newScores = [...scores];
    // forward: 同意加分，反向则取反
    const impact = stmt.forward ? weight : -weight;
    newScores[stmt.dim] += impact;
    setScores(newScores);

    if (currentIdx + 1 < shuffled.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStage('result');
    }
  }, [currentIdx, scores, shuffled]);

  const type = getTypeFromScores(scores);
  const result = results[type];

  // ================ INTRO ================
  if (stage === 'intro') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full mb-6">
            <Sparkles className="w-3 h-3" /> 免费人格测试
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            "终于被理解的感觉真好。"
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-2 max-w-lg mx-auto">
            仅需 5 分钟，获得一份对你为何如此行事的深刻解读。
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            Myers-Briggs Type Indicator · 基于荣格心理类型理论
          </p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8 flex-wrap">
            {[
              { n: '1,845', l: '今天测试' },
              { n: '2.69 亿+', l: '全球完成数' },
              { n: '91.2%', l: '认可度' },
              { n: '5 分钟', l: '平均用时' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{s.n}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={startTest}
            className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5" />
            开始免费测试
          </button>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            36 道题 · 约 5 分钟 · 7 级量表 · 免费 · 不上传数据
          </p>
        </div>

        {/* 四种角色组（图库入口） */}
        <div className="max-w-5xl mx-auto mb-10">
          <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-5">选择你想了解的方向（题库相同，描述不同）</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 分析家 NT */}
            <button
              onClick={startTest}
              className="group rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-b from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 p-6 text-left hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
              <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">分析家</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">理性主义者，追求知识与能力</div>
              <div className="flex flex-wrap gap-1.5">
                {['INTJ','INTP','ENTJ','ENTP'].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-purple-200/50 dark:bg-purple-800/50 text-[10px] font-semibold text-purple-700 dark:text-purple-300">{c}</span>
                ))}
              </div>
            </button>

            {/* 外交家 NF */}
            <button
              onClick={startTest}
              className="group rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-b from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-6 text-left hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🌿</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">外交家</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">理想主义者，追求意义与和谐</div>
              <div className="flex flex-wrap gap-1.5">
                {['INFJ','INFP','ENFJ','ENFP'].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-emerald-200/50 dark:bg-emerald-800/50 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">{c}</span>
                ))}
              </div>
            </button>

            {/* 守护者 SJ */}
            <button
              onClick={startTest}
              className="group rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-b from-sky-50 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-900/10 p-6 text-left hover:shadow-xl hover:border-sky-400 dark:hover:border-sky-600 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
              <div className="text-sm font-bold text-sky-700 dark:text-sky-300 mb-1">守护者</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">务实主义者，追求秩序与安全</div>
              <div className="flex flex-wrap gap-1.5">
                {['ISTJ','ISFJ','ESTJ','ESFJ'].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-sky-200/50 dark:bg-sky-800/50 text-[10px] font-semibold text-sky-700 dark:text-sky-300">{c}</span>
                ))}
              </div>
            </button>

            {/* 探险家 SP */}
            <button
              onClick={startTest}
              className="group rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 p-6 text-left hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
              <div className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">探险家</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">体验主义者，追求自由与刺激</div>
              <div className="flex flex-wrap gap-1.5">
                {['ISTP','ISFP','ESTP','ESFP'].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-amber-200/50 dark:bg-amber-800/50 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{c}</span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* 16 型图鉴 */}
        <TypeGalleryGrid onStart={startTest} />

        {/* FAQ */}
        <FAQ />

        {/* 底部 CTA */}
        <div className="text-center mt-8 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">好奇我们对你有多准确的判断吗？</p>
          <button
            onClick={startTest}
            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
          >
            开始测试 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
          MBTI 测试仅供娱乐和自省参考，不是专业心理测评工具
        </p>
      </div>
    );
  }

  // ================ TESTING ================
  if (stage === 'testing') {
    const stmt = shuffled[currentIdx];
    const progress = ((currentIdx + 1) / shuffled.length) * 100;
    const currentModule = modules.find(m => m.key === stmt.module)!;
    // 计算当前是第几道属于该模块的题
    const moduleIdx = shuffled.slice(0, currentIdx + 1).filter(s => s.module === stmt.module).length;
    const moduleTotal = shuffled.filter(s => s.module === stmt.module).length;

    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span>{currentModule.icon}</span>
            <span className="font-medium">{currentModule.label}</span>
          </span>
          <span>{currentIdx + 1} / {shuffled.length}</span>
        </div>

        {/* 进度条 */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
          <div className="h-1.5 bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* 陈述句卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-6 text-center">
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {currentModule.label} · 第 {moduleIdx}/{moduleTotal} 道
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed mb-1">
            {stmt.text}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            请根据你的实际情况选择同意程度
          </p>
        </div>

        {/* 7 级量表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-7 gap-1.5">
            {scaleLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                <div className={`w-5 h-5 rounded-full border-2 group-hover:border-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-all ${
                  i <= 2 ? 'border-red-300' : i === 3 ? 'border-gray-300' : 'border-green-300'
                }`} />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight text-center">
                  {label}
                </span>
              </button>
            ))}
          </div>
          {/* 两端标签 */}
          <div className="flex justify-between mt-3 text-xs text-gray-400 dark:text-gray-500">
            <span>非常不同意</span>
            <span>非常同意</span>
          </div>
        </div>

        {/* 键盘提示 */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          点击圆圈选择 · 共 36 道题
        </p>
      </div>
    );
  }

  // ================ RESULT ================
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">MBTI 人格测试 — {type}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">你的类型：{result.title} · 以下为你的测试结果</p>

      <div className="text-center">
        <div className="text-6xl mb-4">{result.emoji}</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">你的 MBTI 类型是</h1>
        <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">{type}</div>
        <p className="text-xl text-purple-700 dark:text-purple-300 font-semibold mb-6">{result.title}</p>

        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">{result.desc}</p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {result.traits.map(trait => (
            <span key={trait} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
              {trait}
            </span>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">维度得分</h3>
          <div className="space-y-4">
            {dimensionMeta.map((dim, i) => {
              const val = scores[i];
              const maxAbs = 27;
              const pct = Math.max(5, Math.min(95, ((val + maxAbs) / (2 * maxAbs)) * 100));
              const isLeft = val > 0;
              return (
                <div key={dim.label}>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className={isLeft ? 'font-semibold text-purple-600' : ''}>{dim.left}</span>
                    <span className="text-xs">{dim.label}</span>
                    <span className={!isLeft ? 'font-semibold text-purple-600' : ''}>{dim.right}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setStage('intro')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重新测试
        </button>
      </div>
    </div>
  );
}
