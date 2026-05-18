'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { Brain, Sparkles, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: { text: string; scores: number[] }[];
}

const dimensionLabels = [
  { key: 0, label: 'S ↔ I (社交/独立)', left: '社交型 (S)', right: '独立型 (I)' },
  { key: 1, label: 'B ↔ C (冒险/谨慎)', left: '冒险型 (B)', right: '谨慎型 (C)' },
  { key: 2, label: 'T ↔ E (思考/体验)', left: '思考型 (T)', right: '体验型 (E)' },
  { key: 3, label: 'L ↔ G (领导/合作)', left: '领导型 (L)', right: '合作型 (G)' },
];

const questions: Question[] = [
  // S-I: Social vs Independent
  { id: 1, text: '工作中遇到难题，你会', options: [{ text: '召集同事一起讨论解决', scores: [3, 0, 0, 0] }, { text: '自己先研究，实在不行再问别人', scores: [-3, 0, 0, 0] }] },
  { id: 2, text: '周末你最想怎么过？', options: [{ text: '约朋友聚会、逛街或出游', scores: [3, 0, 0, 0] }, { text: '在家看书、追剧或做自己的事', scores: [-3, 0, 0, 0] }] },
  { id: 3, text: '在人群中的感觉是', options: [{ text: '兴奋，喜欢热闹的氛围', scores: [3, 0, 0, 0] }, { text: '消耗，需要经常独处充电', scores: [-3, 0, 0, 0] }] },
  { id: 4, text: '你的微信朋友圈状态是', options: [{ text: '经常发动态和朋友们互动', scores: [3, 0, 0, 0] }, { text: '很少发，更多是默默看', scores: [-3, 0, 0, 0] }] },
  { id: 5, text: '遇到烦心事，你通常会', options: [{ text: '立刻找最亲近的人说说', scores: [3, 0, 0, 0] }, { text: '自己写写日记或做点别的消化', scores: [-3, 0, 0, 0] }] },
  // B-C: Bold vs Cautious
  { id: 6, text: '面对新的机会（比如跳槽），你', options: [{ text: '觉得不错就果断试试', scores: [0, 3, 0, 0] }, { text: '必须把所有风险都盘点清楚', scores: [0, -3, 0, 0] }] },
  { id: 7, text: '你去一个陌生的城市，会', options: [{ text: '不做攻略，到了再探索', scores: [0, 3, 0, 0] }, { text: '提前计划好行程和路线', scores: [0, -3, 0, 0] }] },
  { id: 8, text: '对于投资理财，你的态度是', options: [{ text: '愿意为此承担一定风险', scores: [0, 3, 0, 0] }, { text: '稳健第一，保本是底线', scores: [0, -3, 0, 0] }] },
  { id: 9, text: '别人说"这个方案可能不行"，你', options: [{ text: '"先试试看，不试怎么知道"', scores: [0, 3, 0, 0] }, { text: '"那再仔细评估一下"', scores: [0, -3, 0, 0] }] },
  { id: 10, text: '面对极限运动（如跳伞、蹦极）', options: [{ text: '很感兴趣，有机会想试试', scores: [0, 3, 0, 0] }, { text: '算了，还是看别人玩吧', scores: [0, -3, 0, 0] }] },
  // T-E: Thinking vs Experiencing
  { id: 11, text: '看电影时，你更享受', options: [{ text: '逻辑严密的悬疑推理片', scores: [0, 0, 3, 0] }, { text: '情感丰富的文艺剧情片', scores: [0, 0, -3, 0] }] },
  { id: 12, text: '做重要决定时，你更偏向', options: [{ text: '列个清单理性分析利弊', scores: [0, 0, 3, 0] }, { text: '跟着心里的感觉走', scores: [0, 0, -3, 0] }] },
  { id: 13, text: '别人评价你时，你会在意', options: [{ text: '你的逻辑和判断够不够准确', scores: [0, 0, 3, 0] }, { text: '你有没有让人觉得温暖', scores: [0, 0, -3, 0] }] },
  { id: 14, text: '你更欣赏哪类人？', options: [{ text: '思维缜密，分析问题透彻', scores: [0, 0, 3, 0] }, { text: '善解人意，能理解他人感受', scores: [0, 0, -3, 0] }] },
  { id: 15, text: '周末去逛展，你会选', options: [{ text: '科技展、设计展', scores: [0, 0, 3, 0] }, { text: '画展、摄影展、艺术展', scores: [0, 0, -3, 0] }] },
  // L-G: Leadership vs Groupwork
  { id: 16, text: '在团队中，你的自然角色是', options: [{ text: '主导方向，带领大家推进', scores: [0, 0, 0, 3] }, { text: '配合协调，确保大家步调一致', scores: [0, 0, 0, -3] }] },
  { id: 17, text: '当讨论陷入僵局时，你会', options: [{ text: '拍个板，快速做决定', scores: [0, 0, 0, 3] }, { text: '继续沟通，寻求共识', scores: [0, 0, 0, -3] }] },
  { id: 18, text: '你对"成功"的理解更偏向', options: [{ text: '个人成就和影响力的提升', scores: [0, 0, 0, 3] }, { text: '团队成绩和人际关系的圆满', scores: [0, 0, 0, -3] }] },
  { id: 19, text: '项目出了问题，你第一反应是', options: [{ text: '立刻分析原因，拍方案', scores: [0, 0, 0, 3] }, { text: '先安抚团队情绪再处理', scores: [0, 0, 0, -3] }] },
  { id: 20, text: '在聚会上，小孩子在哭闹', options: [{ text: '想办法分散他注意力让他安静', scores: [0, 0, 0, 3] }, { text: '耐心安抚，哄他开心', scores: [0, 0, 0, -3] }] },
];

const results: Record<string, { title: string; emoji: string; desc: string; match: string; color: string }> = {
  'SBTL': { title: '开拓先锋', emoji: '🚀', desc: '你天生就是领头羊。社交达人、敢闯敢拼、理性思考、引领方向。你适合在创业、管理、投资领域大展身手。', match: '适合职业：创业者、高管、投资经理', color: 'bg-red-500' },
  'SBTG': { title: '暖心领队', emoji: '🏆', desc: '你有领导力，也懂得照顾团队的感受。敢想敢干的同时能凝聚人心，是大家信赖的主心骨。', match: '适合职业：产品经理、导演、活动策划', color: 'bg-orange-500' },
  'SBEL': { title: '创意先锋', emoji: '🎬', desc: '外向勇敢的体验派领导者。你喜欢尝试新事物并带动身边的人一起行动，魅力十足。', match: '适合职业：旅行博主、节目主持、品牌总监', color: 'bg-yellow-500' },
  'SBEG': { title: '团结大使', emoji: '🎪', desc: '热爱社交、勇于尝试又善于合作。你就是团队里的气氛担当和凝聚力核心。', match: '适合职业：HR、公关、社群运营', color: 'bg-green-500' },
  'SCTL': { title: '策略大师', emoji: '♟️', desc: '社交能力强但处事谨慎，理性且善于领导。你像下棋一样布局周密，深谋远虑。', match: '适合职业：企业战略、律师、政治顾问', color: 'bg-teal-500' },
  'SCTG': { title: '贴心智囊', emoji: '🧭', desc: '谨慎理性又能配合团队，你就像团队的导航仪，总能给出稳妥且兼顾大局的建议。', match: '适合职业：咨询顾问、编辑、教师', color: 'bg-blue-500' },
  'SCEL': { title: '共情领袖', emoji: '💫', desc: '善社交、温柔而理性，又具备领导气质。你懂得先共情后决策，是有温度的领导者。', match: '适合职业：心理咨询师、社工、用户体验设计师', color: 'bg-indigo-500' },
  'SCEG': { title: '暖心伙伴', emoji: '🌈', desc: '谨慎周到、以体验为重、善于合作。你给人安全感，是团队里最温暖的稳定器。', match: '适合职业：护士、客户成功、行政主管', color: 'bg-pink-500' },
  'IBTL': { title: '独行战士', emoji: '🗡️', desc: '独立、敢拼、理性、富有领导力。你不需要靠别人，凭自己的判断和行动就能闯出一片天。', match: '适合职业：独立开发者、自由职业者、数据分析师', color: 'bg-purple-500' },
  'IBTG': { title: '冷静军师', emoji: '🎯', desc: '你低调但不软弱，深谋远虑又乐于配合。是团队里最靠谱的后盾，不争不抢但不可或缺。', match: '适合职业：技术专家、财务分析师、研究学者', color: 'bg-gray-500' },
  'IBEL': { title: '独行侠客', emoji: '🏔️', desc: '独立又爱冒险，喜欢亲身体验世界，有自己的主张和态度。自由就是你的代名词。', match: '适合职业：摄影师、艺术家、极客创客', color: 'bg-rose-500' },
  'IBEG': { title: '自由精灵', emoji: '🕊️', desc: '独立、爱尝试、重体验、善于配合。你像一阵自由的风，既享受独处也能融入任何团队。', match: '适合职业：设计师、旅游撰稿人、手作人', color: 'bg-emerald-500' },
  'ICTL': { title: '深思之将', emoji: '🏯', desc: '独立、谨慎、理性、领导型。你是沉静的力量，三思而行、谋定后动，一出手就是王炸。', match: '适合职业：架构师、法官、高级主管', color: 'bg-cyan-500' },
  'ICTG': { title: '稳重基石', emoji: '🪨', desc: '你沉默寡言但稳如磐石。独立、谨慎、理性、善于配合，是任何团队都离不开的定海神针。', match: '适合职业：质量管理、审计、安全工程师', color: 'bg-amber-500' },
  'ICEL': { title: '文艺独行者', emoji: '🌙', desc: '你活在自己的世界里，对美和体验有独特的追求。跟着感觉走，不随波逐流。', match: '适合职业：作家、独立音乐人、策展人', color: 'bg-violet-500' },
  'ICEG': { title: '温柔隐士', emoji: '🌸', desc: '你低调内敛，善于倾听和配合，享受独处但不孤僻。你像一朵安静绽放的花，自有芬芳。', match: '适合职业：图书管理员、内容编辑、花艺师', color: 'bg-fuchsia-500' },
};

function getType(scores: number[]): string {
  const t = [];
  t.push(scores[0] > 0 ? 'S' : 'I');
  t.push(scores[1] > 0 ? 'B' : 'C');
  t.push(scores[2] > 0 ? 'T' : 'E');
  t.push(scores[3] > 0 ? 'L' : 'G');
  return t.join('');
}

type Stage = 'intro' | 'testing' | 'result';

export default function SbtiTest() {
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

  const type = getType(scores);
  const result = results[type];

  if (stage === 'intro') {
    return (
      <ToolLayout title="SBTI 社交行为类型测试" description="Social Behavior Type Indicator — 全新的社交行为类型测评" instructions="选择最符合你的选项，20题测出你的社交行为类型">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Brain className="w-16 h-16 text-pink-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">SBTI 社交行为类型测试</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Social Behavior Type Indicator</p>

          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6 mt-8 text-left space-y-3">
            <h3 className="font-semibold text-pink-700 dark:text-pink-300">关于 SBTI</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              SBTI 是一个全新的社交行为测评框架。与 MBTI 侧重于内在认知偏好不同，SBTI 更关注你在社交场合和工作环境中的行为模式。
            </p>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-xs font-bold text-pink-700 dark:text-pink-300">S</span>
                <span><b>社交型 vs 独立型</b> — 你的社交能量来源</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-xs font-bold text-pink-700 dark:text-pink-300">B</span>
                <span><b>冒险型 vs 谨慎型</b> — 你面对风险的态度</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-xs font-bold text-pink-700 dark:text-pink-300">T</span>
                <span><b>思考型 vs 体验型</b> — 你的决策偏好</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-6 h-6 rounded bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-xs font-bold text-pink-700 dark:text-pink-300">L</span>
                <span><b>领导型 vs 合作型</b> — 你在团队中的角色</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            共 20 题 &middot; 约 3 分钟 &middot; 纯前端计算
          </div>

          <button
            onClick={startTest}
            className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-pink-200 dark:shadow-pink-900/30"
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
      <ToolLayout title="SBTI 社交行为类型测试" description={`第 ${currentQ + 1}/${questions.length} 题`} instructions="选择最符合你的选项">
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span>第 {currentQ + 1} / {questions.length} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
            <div className="h-2 bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">{q.text}</h2>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => answer(idx)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all group"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-pink-700 dark:group-hover:text-pink-300">
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
    <ToolLayout title={`SBTI 社交行为类型测试 — ${type}`} description={`你的类型：${result.title}`} instructions="以下为你的测试结果">
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-6xl mb-4">{result.emoji}</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">你的 SBTI 类型是</h1>
        <div className="text-4xl font-black text-pink-600 dark:text-pink-400 mb-2">{type}</div>
        <p className="text-xl text-pink-700 dark:text-pink-300 font-semibold mb-6">{result.title}</p>

        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">{result.desc}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{result.match}</p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">维度得分</h3>
          <div className="space-y-4">
            {dimensionLabels.map(dim => {
              const val = scores[dim.key];
              const pct = ((val + 15) / 30) * 100;
              return (
                <div key={dim.label}>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{dim.left}</span>
                    <span>{dim.label}</span>
                    <span>{dim.right}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-3 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
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