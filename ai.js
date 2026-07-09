// netlify/functions/ai.js
// Função do Netlify: recebe o pedido de análise do app e repassa
// para a Anthropic usando a chave secreta guardada no servidor
// (variável de ambiente ANTHROPIC_API_KEY). A chave NUNCA fica
// exposta no HTML/JS do navegador.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' }),
    };
  }

  try {
    const parsed = JSON.parse(event.body || '{}');
    const { model, max_tokens, messages } = parsed;

    if (!messages) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campo "messages" é obrigatório.' }) };
    }

    // Limite de segurança para não explodir custo por chamada
    const safeMaxTokens = Math.min(Number(max_tokens) || 1000, 2500);

    console.log('Chamando Anthropic. Modelo:', model || 'claude-sonnet-5', 'max_tokens:', safeMaxTokens);

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-5',
        max_tokens: safeMaxTokens,
        messages,
      }),
    });

    const data = await anthropicRes.json();
    console.log('Resposta Anthropic. Status:', anthropicRes.status, 'Body:', JSON.stringify(data).slice(0, 500));
    return {
      statusCode: anthropicRes.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Erro na função ai:', err.message, err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao chamar a IA: ' + err.message }) };
  }
};
