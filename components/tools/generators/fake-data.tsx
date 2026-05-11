'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export function FakeData() {
  const [count, setCount] = useState(10);
  const [type, setType] = useState('names');
  const [output, setOutput] = useState('');

  const surnames = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮下齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊于惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍卻璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊';
  const givenNames = '伟强磊洋勇军杰涛明超华林鹏飞鑫浩波斌旭刚健宇晨辰敏娜静丽娟艳芳萍玲霞洁莹婷雪丹梅莉慧燕红兰凤英琴';

  const generate = useCallback(() => {
    const results: string[] = [];
    if (type === 'names') {
      for (let i = 0; i < count; i++) {
        const s = surnames[Math.floor(Math.random() * surnames.length)];
        const g1 = givenNames[Math.floor(Math.random() * givenNames.length)];
        const g2 = Math.random() > 0.5 ? givenNames[Math.floor(Math.random() * givenNames.length)] : '';
        results.push(s + g1 + g2);
      }
    } else if (type === 'emails') {
      const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', '126.com', 'foxmail.com', 'sina.com'];
      for (let i = 0; i < count; i++) {
        const prefix = `user${Math.floor(Math.random() * 99999)}_${Date.now().toString(36)}`;
        results.push(`${prefix}@${domains[Math.floor(Math.random() * domains.length)]}`);
      }
    } else if (type === 'phones') {
      const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
      for (let i = 0; i < count; i++) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
        results.push(prefix + suffix);
      }
    } else if (type === 'addresses') {
      const provinces = '北京市上海市广州市深圳市杭州市南京市成都市武汉市西安市重庆市';
      const streets = '中山路人民路解放路建设路和平路文化路阳光路长安路';
      for (let i = 0; i < count; i++) {
        const prov = provinces[Math.floor(Math.random() * provinces.length / 3)] + provinces[Math.floor(Math.random() * provinces.length / 3) + 1] + provinces[Math.floor(Math.random() * provinces.length / 3) + 2];
        const street = streets[Math.floor(Math.random() * streets.length / 3)] + streets[Math.floor(Math.random() * streets.length / 3) + 1] + streets[Math.floor(Math.random() * streets.length / 3) + 2];
        results.push(`${prov}${street}${Math.floor(Math.random() * 999) + 1}号`);
      }
    } else if (type === 'idcards') {
      for (let i = 0; i < count; i++) {
        // Generate valid format 18-digit ID
        const area = `${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        const birth = `19${Math.floor(Math.random() * 100).toString().padStart(2, '0')}${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`;
        const seq = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        const pre = area + birth + seq;
        // Simple check digit
        const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        let sum = 0;
        for (let j = 0; j < 17; j++) sum += parseInt(pre[j]) * weights[j];
        const check = '10X98765432'[sum % 11];
        results.push(pre + check);
      }
    } else if (type === 'uuid') {
      for (let i = 0; i < count; i++) {
        results.push(crypto.randomUUID());
      }
    }
    setOutput(results.join('\n'));
  }, [count, type]);

  const types = [
    { key: 'names', label: '中文姓名' },
    { key: 'emails', label: '邮箱' },
    { key: 'phones', label: '手机号' },
    { key: 'addresses', label: '地址' },
    { key: 'idcards', label: '身份证号' },
    { key: 'uuid', label: 'UUID' },
  ];

  return (
    <ToolLayout
      title="假数据生成器"
      description="随机生成姓名、邮箱、手机号等测试数据"
      instructions="选择数据类型和生成数量，点击生成获得随机测试数据。支持中文姓名、邮箱、手机号、地址、身份证号（格式合规）和UUID。适合开发和测试场景使用。"
      output={output}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => { setType(t.key); setOutput(''); }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${type === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
        <input
          type="number" min={1} max={100} value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
          className="w-20 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center"
        />
        <button onClick={generate} className="btn-primary">生成</button>
        {output && <CopyButton text={output} />}
      </div>
    </ToolLayout>
  );
}
