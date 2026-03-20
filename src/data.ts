import { FrequencyLevel, Question } from './types';

export const FREQUENCY_LEVELS: FrequencyLevel[] = [
  { level: 700, name: "无限态", color: "text-fuchsia-200", description: "不可言喻的开悟与纯粹意识" },
  { level: 600, name: "觉醒态", color: "text-purple-200", description: "二元对立消失，完美的平和" },
  { level: 540, name: "心流态", color: "text-pink-200", description: "喜悦流淌，内在的宁静" },
  { level: 500, name: "慈悲态", color: "text-rose-200", description: "无条件的爱，对他人的深刻理解" },
  { level: 400, name: "洞察态", color: "text-violet-300", description: "理智主导，寻求真理与知识" },
  { level: 350, name: "和谐态", color: "text-purple-300", description: "接纳现状，灵活应对生活" },
  { level: 300, name: "进取态", color: "text-fuchsia-300", description: "充满动力，以解决方案为导向" },
  { level: 250, name: "平衡态", color: "text-pink-300", description: "不偏不倚，信任生命的过程" },
  { level: 200, name: "突破态", color: "text-amber-200", description: "勇气的起点，开始掌握力量" },
  { level: 175, name: "外求态", color: "text-orange-300", description: "依赖外部认可，内在价值不稳定" },
  { level: 150, name: "躁动态", color: "text-rose-400", description: "愤怒与冲动，能量外泄" },
  { level: 125, name: "匮乏态", color: "text-red-300", description: "欲望无底洞，永远觉得不够" },
  { level: 100, name: "焦虑态", color: "text-pink-400", description: "恐惧主导，在这个世界感到不安全" },
  { level: 75, name:  "阻滞态", color: "text-slate-400", description: "悲伤与懊悔，停滞不前" },
  { level: 50, name:  "沉睡态", color: "text-slate-500", description: "冷漠与绝望，放弃希望" },
  { level: 30, name:  "消耗态", color: "text-slate-600", description: "极度的内疚与自我毁灭" },
];

export const DIMENSION_LABELS: Record<string, string> = {
  adversity: "逆境商",
  social: "人际场",
  wealth: "财富流",
  self: "自我感",
  world: "世界观",
  bodyMind: "身心态",
  spiritual: "灵性度"
};

// New: Concrete Definitions for Fallback & Context
export const DIMENSION_DEFINITIONS: Record<string, string> = {
  adversity: "面对挫折时的心理弹性与复原能力",
  social: "在人际关系中的边界感、共情力与能量互动模式",
  wealth: "与金钱和资源的连接方式（是匮乏紧缩还是丰盛流动）",
  self: "内在自我价值的稳定性（是否依赖外界认可）",
  world: "对外部世界的根本看法（是充满机遇还是充满威胁）与格局大小",
  bodyMind: "对身体信号的敏锐度以及在压力下的身心调节能力",
  spiritual: "超越物质层面的感知力，以及对生命意义的深层理解"
};

// Helper to create simple dimension score object
const d = (key: string, val: number) => ({ [key]: val });

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "原定计划突然被打乱（如航班取消、项目变动），第一反应？",
    options: [
      { label: "冷静：深呼吸，迅速大脑运转，寻找补救方案。", score: 200, dimensionScores: d('adversity', 70) },
      { label: "无力：心里发闷，感叹好运总是不眷顾我。", score: 20, dimensionScores: d('adversity', 10) },
      { label: "坦然：深知一切发生皆有利于我，随顺生命之流。", score: 500, dimensionScores: d('adversity', 100) },
      { label: "烦躁：紧绷，想揪出责任人，心里愤愤不平。", score: 100, dimensionScores: d('adversity', 30) },
    ]
  },
  {
    id: 2,
    text: "面对一次不如人意的结果（如考试/晋升失败）？",
    options: [
      { label: "不甘：觉得环境不公，甚至想证明他们错了。", score: 125, dimensionScores: d('self', 30) },
      { label: "复盘：允许失落，但更看重从中学到了什么。", score: 250, dimensionScores: d('self', 70) },
      { label: "无我：成败不定义存在，内心依旧圆满无缺。", score: 600, dimensionScores: d('self', 100) },
      { label: "自责：觉得“我不够好”，想把自己藏起来。", score: 20, dimensionScores: d('self', 10) },
    ]
  },
  {
    id: 3,
    text: "接手一个从未做过的艰巨任务？",
    options: [
      { label: "游戏：带着孩童般的纯粹好奇，享受未知的扩展。", score: 500, dimensionScores: d('adversity', 100) },
      { label: "较劲：把它当战役，必须做给别人看，不能露怯。", score: 150, dimensionScores: d('adversity', 50) },
      { label: "抗拒：担心无法胜任，第一反应想逃避。", score: 30, dimensionScores: d('adversity', 20) },
      { label: "拆解：评估资源，缺什么补什么，按部就班。", score: 200, dimensionScores: d('adversity', 80) },
    ]
  },
  {
    id: 4,
    text: "因病不得不卧床休息几天？",
    options: [
      { label: "急躁：讨厌身体“掉链子”，想快点好起来去战斗。", score: 100, dimensionScores: d('bodyMind', 40) },
      { label: "觉察：深入体验身体的信号，与疼痛/不适和平共处。", score: 500, dimensionScores: d('bodyMind', 100) },
      { label: "愧疚：焦虑自己太脆弱，耽误了好多事。", score: 20, dimensionScores: d('bodyMind', 15) },
      { label: "休整：既然病了就安心躺平，当做强制维护。", score: 200, dimensionScores: d('bodyMind', 70) },
    ]
  },
  {
    id: 5,
    text: "谈到当下的经济与财务状况？",
    options: [
      { label: "理性：审视收支，做好配置，在不确定中找确定。", score: 250, dimensionScores: d('wealth', 75) },
      { label: "恐慌：缺乏安全感，总是担心钱不够花。", score: 30, dimensionScores: d('wealth', 20) },
      { label: "焦虑：渴望赚快钱消除不安，想博一把。", score: 100, dimensionScores: d('wealth', 40) },
      { label: "源头：我即是丰盛源头，金钱只是能量的一种显化。", score: 600, dimensionScores: d('wealth', 100) },
    ]
  },
  {
    id: 6,
    text: "听到关于自己的误解或流言？",
    options: [
      { label: "愤怒：想立刻反击，绝不能让人觉得我好欺负。", score: 125, dimensionScores: d('social', 40) },
      { label: "虚空：没有一个“我”会被伤害，视如风吹过虚空。", score: 600, dimensionScores: d('social', 100) },
      { label: "澄清：清者自清，必要时客观说明，不过多纠缠。", score: 250, dimensionScores: d('social', 80) },
      { label: "受伤：担心别人怎么看我，陷入内耗。", score: 30, dimensionScores: d('social', 20) },
    ]
  },
  {
    id: 7,
    text: "处于人生的暂时“低谷期”？",
    options: [
      { label: "沉淀：韬光养晦，利用这段时间修炼内功。", score: 200, dimensionScores: d('adversity', 80) },
      { label: "绝望：看不到希望，不知道还要熬多久。", score: 20, dimensionScores: d('adversity', 10) },
      { label: "炼金：拥抱黑暗，深知这是灵魂蜕变的最神圣时刻。", score: 600, dimensionScores: d('adversity', 100) },
      { label: "死磕：咬牙坚持，发誓一定要熬出头。", score: 150, dimensionScores: d('adversity', 50) },
    ]
  },
  {
    id: 8,
    text: "伴侣无意中说了一句伤人的话？",
    options: [
      { label: "悲情：瞬间沉默，觉得他不爱我了。", score: 30, dimensionScores: d('social', 20) },
      { label: "透视：瞬间看穿他小我背后的恐惧，只生慈悲不生嗔。", score: 500, dimensionScores: d('social', 100) },
      { label: "回怼：立刻反唇相讥，保护自尊心。", score: 100, dimensionScores: d('social', 40) },
      { label: "沟通：平复后，真诚表达“这句话让我受伤”。", score: 200, dimensionScores: d('social', 80) },
    ]
  },
  {
    id: 9,
    text: "身边人向你倾诉大量负能量？",
    options: [
      { label: "界限：耐心倾听，但守住能量边界不被消耗。", score: 200, dimensionScores: d('social', 80) },
      { label: "卷入：跟着一起难过，事后精疲力尽。", score: 30, dimensionScores: d('social', 30) },
      { label: "转化：如大地般承载，用高频临在自然化解对方的重担。", score: 500, dimensionScores: d('social', 100) },
      { label: "打断：不耐烦，急着讲道理或出主意。", score: 125, dimensionScores: d('social', 40) },
    ]
  },
  {
    id: 10,
    text: "回想起曾经伤害过你的人？",
    options: [
      { label: "愤恨：是对方的错，希望他也尝尝这滋味。", score: 100, dimensionScores: d('spiritual', 30) },
      { label: "感恩：看见那是共同出演的剧本，只为唤醒我的觉知。", score: 600, dimensionScores: d('spiritual', 100) },
      { label: "隐痛：依然难受，不愿触碰那段记忆。", score: 20, dimensionScores: d('spiritual', 20) },
      { label: "翻篇：过去了，那是经历，让我学会保护自己。", score: 200, dimensionScores: d('spiritual', 60) },
    ]
  },
  {
    id: 11,
    text: "面对他人的批评或建议？",
    options: [
      { label: "抵触：觉得对方针对我，想挑我的刺。", score: 100, dimensionScores: d('self', 35) },
      { label: "镜子：无条件敞开，借由他人看见自己未被看见的面向。", score: 500, dimensionScores: d('self', 100) },
      { label: "辩解：下意识想反驳，觉得自己很差劲。", score: 20, dimensionScores: d('self', 20) },
      { label: "虚心：只要有道理就接受，视为成长反馈。", score: 200, dimensionScores: d('self', 80) },
    ]
  },
  {
    id: 12,
    text: "看着镜子里的身材/外貌？",
    options: [
      { label: "接纳：通过健康饮食运动维持良好状态。", score: 200, dimensionScores: d('bodyMind', 80) },
      { label: "挑剔：总盯着不完美，内心有嫌弃的声音。", score: 30, dimensionScores: d('bodyMind', 25) },
      { label: "神圣：看见躯体是灵魂的圣殿，无论形态如何皆完美。", score: 500, dimensionScores: d('bodyMind', 100) },
      { label: "对抗：充满斗志，必须通过手段维持完美。", score: 150, dimensionScores: d('bodyMind', 50) },
    ]
  },
  {
    id: 13,
    text: "独处时的状态？",
    options: [
      { label: "空虚：需要刷手机、吃东西填补寂寞。", score: 20, dimensionScores: d('self', 20) },
      { label: "充电：享受时光，看书学习做喜欢的事。", score: 250, dimensionScores: d('self', 80) },
      { label: "盘算：身体停了，脑子还在想工作。", score: 150, dimensionScores: d('self', 50) },
      { label: "圆满：不增不减，体会到万物皆备于我的静谧。", score: 600, dimensionScores: d('self', 100) },
    ]
  },
  {
    id: 14,
    text: "重大选择（转型/结婚）的依据？",
    options: [
      { label: "指引：超越小我得失，顺应灵魂最高兴奋的指引。", score: 600, dimensionScores: d('world', 100) },
      { label: "欲望：选更有面子、利益更大的路。", score: 125, dimensionScores: d('world', 40) },
      { label: "恐惧：选看起来最安全、风险最小的路。", score: 30, dimensionScores: d('world', 20) },
      { label: "逻辑：权衡利弊，选综合收益最高的。", score: 250, dimensionScores: d('world', 70) },
    ]
  },
  {
    id: 15,
    text: "内心深处对“金钱”的感觉？",
    options: [
      { label: "掌控：金钱是工具，服务于生活目标。", score: 250, dimensionScores: d('wealth', 80) },
      { label: "匮乏：赚钱很难，总担心不够用。", score: 30, dimensionScores: d('wealth', 20) },
      { label: "能量：金钱是爱的流动，我与宇宙的丰盛源头连接。", score: 500, dimensionScores: d('wealth', 100) },
      { label: "追逐：有钱能解决一切，证明价值。", score: 125, dimensionScores: d('wealth', 40) },
    ]
  },
  {
    id: 16,
    text: "如何看待“竞争”？",
    options: [
      { label: "躲避：觉得自己没优势，只想待在舒适区。", score: 30, dimensionScores: d('world', 25) },
      { label: "共赢：寻找差异化，更看重合作。", score: 200, dimensionScores: d('world', 80) },
      { label: "厮杀：资源有限，拼个你死我活也要赢。", score: 125, dimensionScores: d('world', 45) },
      { label: "幻相：没有竞争对手，只有自我超越的游戏。", score: 500, dimensionScores: d('world', 100) },
    ]
  },
  {
    id: 17,
    text: "突然拥有一大笔财富？",
    options: [
      { label: "托管：深知我是财富的管道，依直觉将其流向最高善。", score: 500, dimensionScores: d('wealth', 100) },
      { label: "担忧：怕失去，或者怕别人借钱。", score: 30, dimensionScores: d('wealth', 30) },
      { label: "规划：为我和家人的未来提供保障。", score: 200, dimensionScores: d('wealth', 80) },
      { label: "享乐：终于能扬眉吐气，买买买。", score: 125, dimensionScores: d('wealth', 40) },
    ]
  },
  {
    id: 18,
    text: "展望未来三年？",
    options: [
      { label: "压力：如果不拼命就要被甩下车。", score: 125, dimensionScores: d('world', 45) },
      { label: "创造：未来不存在，我通过当下的振频显化未来。", score: 500, dimensionScores: d('world', 100) },
      { label: "迷茫：大环境不好，对自己没信心。", score: 20, dimensionScores: d('world', 20) },
      { label: "乐观：虽有挑战，但我有信心应对。", score: 200, dimensionScores: d('world', 80) },
    ]
  },
  {
    id: 19,
    text: "终极追求是什么？",
    options: [
      { label: "无求：消融于道，成为爱本身的通道。", score: 600, dimensionScores: d('spiritual', 100) },
      { label: "名望：证明我来过，被人记住。", score: 175, dimensionScores: d('spiritual', 30) },
      { label: "平安：无病无灾活着就好。", score: 75, dimensionScores: d('spiritual', 40) },
      { label: "自由：掌控自己的人生。", score: 200, dimensionScores: d('spiritual', 80) },
    ]
  },
  {
    id: 20,
    text: "关于“变老”这件事？",
    options: [
      { label: "接纳：自然规律，每个年龄段都有独特的风景。", score: 200, dimensionScores: d('bodyMind', 80) },
      { label: "恐慌：害怕衰老，担心失去魅力和能力。", score: 20, dimensionScores: d('bodyMind', 20) },
      { label: "永恒：肉体只是衣服，灵魂在时间之外，从未老去。", score: 500, dimensionScores: d('bodyMind', 100) },
      { label: "抗拒：想尽办法留住青春，不想面对。", score: 125, dimensionScores: d('bodyMind', 45) },
    ]
  }
];
