import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isStriped: boolean;
  isPocketed: boolean;
  radius: number;
}

interface Pocket {
  x: number;
  y: number;
  radius: number;
}

interface GameContext {
  balls: Ball[];
  pockets: Pocket[];
  currentPlayer: number;
  player1Type: 'solid' | 'striped' | null;
  player2Type: 'solid' | 'striped' | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, gameContext, userMessage } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPromptContent = '';

    if (action === 'chat') {
      // Chatbot for tips and strategies
      systemPrompt = `أنت مدرب بلياردو محترف ناطق بالعربية. ساعد اللاعبين بنصائح واستراتيجيات لعب البلياردو 8-ball.
      
قواعد مهمة:
- أجب باللغة العربية فقط
- كن موجزاً ومفيداً
- قدم نصائح عملية وقابلة للتطبيق
- استخدم مصطلحات البلياردو العربية
- شجع اللاعب وكن إيجابياً

نصائح يمكنك تقديمها:
1. كيفية التصويب الصحيح
2. التحكم بقوة الضربة
3. استراتيجيات وضع الكرة البيضاء
4. متى تلعب دفاعياً vs هجومياً
5. قراءة زوايا الارتداد
6. نصائح للكرة 8`;

      userPromptContent = userMessage || 'مرحباً، أريد نصائح للعب البلياردو';
    } else if (action === 'calculate_shot') {
      // AI opponent shot calculation
      systemPrompt = `أنت نظام ذكاء اصطناعي لحساب أفضل ضربة في لعبة البلياردو.
      
المطلوب: تحليل وضع الكرات وإرجاع أفضل ضربة بصيغة JSON فقط.

القواعد:
- الكرة البيضاء (id: 0) هي التي نضربها
- الجيوب موجودة في الزوايا الأربعة ومنتصف الجانبين الطويلين
- يجب حساب الزاوية بالراديان (من -π إلى π)
- القوة من 20 إلى 80

أرجع JSON فقط بهذا الشكل:
{"angle": number, "power": number, "targetBallId": number, "confidence": number, "reasoning": "سبب الاختيار بالعربية"}`;

      const ctx = gameContext as GameContext;
      userPromptContent = `وضع اللعبة الحالي:
الكرة البيضاء: x=${ctx.balls.find(b => b.id === 0)?.x}, y=${ctx.balls.find(b => b.id === 0)?.y}
الكرات المتاحة: ${JSON.stringify(ctx.balls.filter(b => !b.isPocketed && b.id !== 0).map(b => ({id: b.id, x: b.x, y: b.y, isStriped: b.isStriped})))}
الجيوب: ${JSON.stringify(ctx.pockets)}
نوع كرات اللاعب الحالي: ${ctx.player1Type || 'غير محدد'}

احسب أفضل ضربة ممكنة.`;
    } else {
      throw new Error('Invalid action');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptContent }
        ],
        max_tokens: 500,
        temperature: action === 'calculate_shot' ? 0.3 : 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    if (action === 'calculate_shot') {
      // Parse JSON response for shot calculation
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const shotData = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ success: true, shot: shotData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch {
        // Fallback to simple shot if parsing fails
        const cueBall = (gameContext as GameContext).balls.find(b => b.id === 0);
        const targetBalls = (gameContext as GameContext).balls.filter(b => !b.isPocketed && b.id !== 0 && b.id !== 8);
        
        if (cueBall && targetBalls.length > 0) {
          const target = targetBalls[0];
          const angle = Math.atan2(target.y - cueBall.y, target.x - cueBall.x);
          return new Response(JSON.stringify({ 
            success: true, 
            shot: { angle, power: 50, targetBallId: target.id, confidence: 0.5, reasoning: 'ضربة احتياطية' }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in billiard-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
