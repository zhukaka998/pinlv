import { GoogleGenAI, Type } from '@google/genai';
import { DimensionResult, FrequencyLevel } from '../types';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AIAnalysisResponse {
  analysis: string;
  advice: string;
  strongestDimensionAnalysis: string;
  weakestDimensionAnalysis: string;
  dimensionInsights: Record<string, string>;
}

export const generateSoulAnalysis = async (
  level: FrequencyLevel,
  dimensions: DimensionResult[]
): Promise<AIAnalysisResponse | null> => {
  try {
    const strongest = dimensions[0];
    const weakest = dimensions[dimensions.length - 1];

    const prompt = `
      作为一个深谙心理学与灵性成长的导师，请根据以下用户的“内在频率测试”结果，提供一份深度、有启发性且充满同理心的解读。

      用户的整体频率层级为：${level.name} (得分: ${level.level}) - ${level.description}
      
      各维度得分（满分500）：
      ${dimensions.map(d => `- ${d.label}: ${Math.round(d.value)}`).join('\n')}

      最强维度：${strongest.label}
      最弱维度：${weakest.label}

      请以JSON格式返回以下内容：
      1. analysis: 整体灵魂解读（约150字，深入剖析其当前状态的本质，语气温暖、洞察）。
      2. advice: 进化指引（约150字，提供3条具体、可落地的建议，帮助其提升或平衡能量）。
      3. strongestDimensionAnalysis: 对其最强维度的肯定与深度解析（约100字）。
      4. weakestDimensionAnalysis: 对其最弱维度的温和点拨与转化建议（约100字）。
      5. dimensionInsights: 一个对象，包含对每个维度的简短一句话洞察（键为维度的key，如'adversity', 'social'等，值为洞察文本）。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            advice: { type: Type.STRING },
            strongestDimensionAnalysis: { type: Type.STRING },
            weakestDimensionAnalysis: { type: Type.STRING },
            dimensionInsights: {
              type: Type.OBJECT,
              properties: {
                adversity: { type: Type.STRING },
                social: { type: Type.STRING },
                wealth: { type: Type.STRING },
                self: { type: Type.STRING },
                world: { type: Type.STRING },
                bodyMind: { type: Type.STRING },
                spiritual: { type: Type.STRING },
              }
            }
          },
          required: ["analysis", "advice", "strongestDimensionAnalysis", "weakestDimensionAnalysis", "dimensionInsights"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResponse;
    }
    return null;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return null;
  }
};
