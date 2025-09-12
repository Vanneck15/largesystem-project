import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SqlGenerationResult {
  sqlQuery: string;
  explanation: string;
  confidence: number;
  suggestedTitle: string;
}

export async function generateSqlFromNaturalLanguage(
  naturalLanguageQuery: string
): Promise<SqlGenerationResult> {
  try {
    const systemPrompt = `You are an expert SQL query generator for product analytics databases. 
    
Available tables and their schemas:
- user_analytics: id, user_id, session_id, event_type, event_data (jsonb), user_segment, created_at
- feature_usage: id, feature_id, feature_name, user_id, usage_date, usage_count, session_duration
- conversion_metrics: id, user_id, funnel_step, step_completed_at, conversion_value, source

Common event_types in user_analytics: signup, login, page_view, feature_usage, purchase, subscription
Common user_segments: free, premium, enterprise
Common funnel_steps: signup, onboarding, first_action, subscription, purchase
Common sources: organic, paid, referral, email, social

Generate a PostgreSQL query based on the natural language request. 
Respond with JSON in this exact format:
{
  "sqlQuery": "SELECT ... SQL query here",
  "explanation": "Brief explanation of what the query does",
  "confidence": 0.95,
  "suggestedTitle": "Short descriptive title for this query"
}

Guidelines:
- Use proper PostgreSQL syntax
- Include appropriate WHERE clauses for date ranges when relevant
- Use JOINs when connecting multiple tables
- Add ORDER BY and LIMIT clauses when appropriate
- Consider performance and use indexes when possible
- For time-based queries, use appropriate date functions
- Confidence should be between 0 and 1`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: naturalLanguageQuery }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    return {
      sqlQuery: result.sqlQuery,
      explanation: result.explanation,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      suggestedTitle: result.suggestedTitle
    };
  } catch (error) {
    throw new Error(`Failed to generate SQL: ${error.message}`);
  }
}

export async function generateInsights(
  queryData: any[],
  originalQuery: string
): Promise<string[]> {
  try {
    const systemPrompt = `You are a product analytics expert. Analyze the query results and provide 2-3 key insights.
    
Respond with JSON in this format:
{
  "insights": ["insight 1", "insight 2", "insight 3"]
}

Guidelines:
- Focus on business implications
- Identify trends, anomalies, or opportunities
- Be specific and actionable
- Keep insights concise (1-2 sentences each)`;

    const userPrompt = `Original query: ${originalQuery}
    
Query results (first 10 rows):
${JSON.stringify(queryData.slice(0, 10), null, 2)}

Provide insights based on this data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.insights || [];
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return [];
  }
}
