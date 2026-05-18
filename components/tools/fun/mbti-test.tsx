'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { Brain, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: { text: string; scores: number[] }[];
}

interface Dimension { key: number; label: string; left: string; right: string }

const dimensions: Dimension[] = [
  { key: 0, label: 'E ↔ I (外向/内向)', left: '外向 (E)', right: '内向 (I)' },
  { key: 1, label: 'S ↔ N (感觉/直觉)', left: '感觉 (S)', right: '直觉 (N)' },
  { key: 2, label: 'T ↔ F (思维/情感)', left: '思维 (T)', right: '情感 (F)' },
  { key: 3, label: 'J ↔ P (判断/感知)', left: '判断 (J)', right: '感知 (P)' },
];

const questions: Question[] = [
  // E-I
  { id: 1, text: '在聚会或社交场合中，你通常会', options: [{ text: '认识很多人，主动与人交谈', scores: [2, 0, 0, 0] }, { text: '和少数熟悉的朋友待在一起', scores: [-2, 0, 0, 0] }] },
  { id: 2, text: '独处一整天会让你', options: [{ text: '感到无聊、烦躁', scores: [2, 0, 0, 0] }, { text: '感到放松、精力充沛', scores: [-2, 0, 0, 0] }] },
  { id: 3, text: '在团队讨论中，你倾向于', options: [{ text: '很自然地表达你的观点', scores: [2, 0, 0, 0] }, { text: '先听别人说完再发言', scores: [-2, 0, 0, 0] }] },
  { id: 4, text: '当你遇到烦恼时，你通常', options: [{ text: '找朋友倾诉', scores: [2, 0, 0, 0] }, { text: '自己消化处理', scores: [-2, 0, 0, 0] }] },
  { id: 5, text: '对于电话沟通，你', options: [{ text: '很喜欢，随时可以拿起电话', scores: [2, 0, 0, 0] }, { text: '能避免就避免，更喜欢文字', scores: [-2, 0, 0, 0] }] },
  // S-N
  { id: 6, text: '在学习新东西时，你更注重', options: [{ text: '具体的细节和实际操作方法', scores: [0, 2, 0, 0] }, { text: '整体的概念和潜在可能性', scores: [0, -2, 0, 0] }] },
  { id: 7, text: '解决问题时，你更依赖', options: [{ text: '过去的经验和已验证的方法', scores: [0, 2, 0, 0] }, { text: '灵感和直觉', scores: [0, -2, 0, 0] }] },
  { id: 8, text: '你更欣赏哪种描述风格？', options: [{ text: '详实具体、言之有物', scores: [0, 2, 0, 0] }, { text: '富有想象力和隐喻', scores: [0, -2, 0, 0] }] },
  { id: 9, text: '做决定时，你更看重', options: [{ text: '眼前的现实和可行性', scores: [0, 2, 0, 0] }, { text: '长远的可能性和创新', scores: [0, -2, 0, 0] }] },
  { id: 10, text: '你更喜欢', options: [{ text: '按照清晰的步骤说明做事', scores: [0, 2, 0, 0] }, { text: '自由发挥，边做边探索', scores: [0, -2, 0, 0] }] },
  // T-F
  { id: 11, text: '朋友向你倾诉烦恼时，你通常会', options: [{ text: '分析问题，想办法帮他解决', scores: [0, 0, 2, 0] }, { text: '倾听共情，让他感受到支持', scores: [0, 0, -2, 0] }] },
  { id: 12, text: '做重要决策时，你更相信', options: [{ text: '逻辑分析和客观事实', scores: [0, 0, 2, 0] }, { text: '内心的感觉和价值观', scores: [0, 0, -2, 0] }] },
  { id: 13, text: '面对批评时，你更关注', options: [{ text: '批评的内容是否客观准确', scores: [0, 0, 2, 0] }, { text: '批评者的态度和语气', scores: [0, 0, -2, 0] }] },
  { id: 14, text: '在团队中，你更重视', options: [{ text: '高效和任务达成', scores: [0, 0, 2, 0] }, { text: '和谐与人际关系', scores: [0, 0, -2, 0] }] },
  { id: 15, text: '你认为以下哪个更重要？', options: [{ text: '诚实客观，即使可能伤害感情', scores: [0, 0, 2, 0] }, { text: '体谅他人，维护和谐氛围', scores: [0, 0, -2, 0] }] },
  // J-P
  { id: 16, text: '你更喜欢', options: [{ text: '有计划、有条理的生活', scores: [0, 0, 0, 2] }, { text: '灵活随性、不受拘束', scores: [0, 0, 0, -2] }] },
  { id: 17, text: '面对截止日期，你通常', options: [{ text: '提前规划，稳步推进', scores: [0, 0, 0, 2] }, { text: '最后一刻冲刺完成', scores: [0, 0, 0, -2] }] },
  { id: 18, text: '出行前，你倾向于', options: [{ text: '详细安排好行程', scores: [0, 0, 0, 2] }, { text: '走到哪儿算哪儿', scores: [0, 0, 0, -2] }] },
  { id: 19, text: '你更喜欢的工作方式是', options: [{ text: '按照既定的流程和规范', scores: [0, 0, 0, 2] }, { text: '根据当时情况灵活调整', scores: [0, 0, 0, -2] }] },
  { id: 20, text: '事情完成后，你更倾向于', options: [{ text: '确认完成，然后开始下一件', scores: [0, 0, 0, 2] }, { text: '边做边改，不断优化', scores: [0, 0, 0, -2] }] },
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

function getTypeFromScores(scores: number[]): string {
  const type = [];
  type.push(scores[0] > 0 ? 'E' : 'I');
  type.push(scores[1] > 0 ? 'S' : 'N');
  type.push(scores[2] > 0 ? 'T' : 'F');
  type.push(scores[3] > 0 ? 'J' : 'P');
  return type.join('');
}

type Stage = 'intro' | 'testing' | 'result';

export default function MbtiTest() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);

  const startTest = useCallback(() => {
    setStage('testing');
    setCurrentQ(0);
    setScores([0, 0, 0, 0]);
  }, []);

  const answer = useCallback((optionIndex: number) => {
    const q = questions[currentQ];
    const selected = q.options[optionIndex];
    const newScores = [...scores];
    for (let i = 0; i < 4; i++) {
      newScores[i] += selected.scores[i];
    }
    setScores(newScores);

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setStage('result');
    }
  }, [currentQ, scores]);

  const type = getTypeFromScores(scores);
  const result = results[type];

  if (stage === 'intro') {
    return (
      <ToolLayout title="MBTI 人格测试" description="Myers-Briggs Type Indicator — 基于荣格心理类型的16型人格测评" instructions="选择最符合你的选项，20题测出你的真实人格类型">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">MBTI 人格测试</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Myers-Briggs Type Indicator</p>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mt-8 text-left space-y-3">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300">关于 MBTI</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              MBTI（迈尔斯-布里格斯类型指标）是最广泛使用的人格分类工具之一。它基于荣格的心理类型理论，通过四个维度的偏好组合，形成 16 种独特的人格类型。
            </p>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">1</span>
                <span><b>外向 (E) vs 内向 (I)</b> — 你如何获取能量</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">2</span>
                <span><b>感觉 (S) vs 直觉 (N)</b> — 你如何获取信息</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">3</span>
                <span><b>思维 (T) vs 情感 (F)</b> — 你如何做决定</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">4</span>
                <span><b>判断 (J) vs 感知 (P)</b> — 你如何应对外部世界</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            共 20 题 &middot; 约 3 分钟 &middot; 纯前端计算
          </div>

          <button
            onClick={startTest}
            className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
          >
            <Sparkles className="w-5 h-5" />
            开始测试
          </button>
        </div>
      </ToolLayout>
    );
  }

  if (stage === 'testing') {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <ToolLayout title="MBTI 人格测试" description={`第 ${currentQ + 1}/${questions.length} 题`} instructions="选择最符合你的选项">
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span>第 {currentQ + 1} / {questions.length} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
              {q.text}
            </h2>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => answer(idx)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ToolLayout>
    );
  }

  // Result stage
  return (
    <ToolLayout title={`MBTI 人格测试 — ${type}`} description={`你的类型：${result.title}`} instructions="以下为你的测试结果">
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-6xl mb-4">{result.emoji}</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          你的 MBTI 类型是
        </h1>
        <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">
          {type}
        </div>
        <p className="text-xl text-purple-700 dark:text-purple-300 font-semibold mb-6">
          {result.title}
        </p>

        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
          {result.desc}
        </p>

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
            {dimensions.map(dim => {
              const val = scores[dim.key];
              const pct = ((val + 10) / 20) * 100;
              return (
                <div key={dim.label}>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{val > 0 ? dim.left : dim.right}</span>
                    <span>{dim.label}</span>
                    <span>{val > 0 ? dim.right : dim.left}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
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
    </ToolLayout>
  );
}