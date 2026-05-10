import { generateEmbedding } from './embedding.service';
import { vectorSearch, SearchResult } from './vector.service';
import { sanitizeInput, filterResponse } from '../utils/sanitize.utils';
import { buildSystemPrompt, detectLanguage, buildLanguageInstruction } from '../utils/prompt.utils';
import { buildUserContext } from './user-context.service';
import { getGymData, formatGymDataForContext, isQueryAboutGymData } from './gym-data.service';
import { UserContext } from '../types/chat.types';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

export interface RAGOptions {
  userId?: string;
  userContext?: UserContext;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  language?: 'en' | 'ur' | 'roman-ur';
}

export interface RAGResponse {
  content: string;
  retrievedDocs: SearchResult[];
  tokensUsed?: number;
  responseTime: number;
}

/**
 * Main RAG pipeline: Retrieval + Generation
 */
export async function generateRAGResponse(
  userMessage: string,
  options: RAGOptions = {}
): Promise<RAGResponse> {
  const startTime = Date.now();

  try {
    // Step 1: Sanitize input
    const { sanitized, isSuspicious } = sanitizeInput(userMessage);

    if (isSuspicious) {
      console.warn('⚠️  Suspicious input detected, proceeding with caution');
    }

    // Step 2: Detect language
    const language = options.language || detectLanguage(sanitized);

    // Step 3: Fetch user context if userId provided and userContext not already set
    let userContext = options.userContext;
    if (options.userId && !userContext) {
      userContext = await buildUserContext(options.userId);
      if (userContext) {
        console.log(`👤 User context loaded for: ${userContext.name}`);
      }
    }

    // Step 4: Generate query embedding
    const queryEmbedding = await generateEmbedding(sanitized, {
      inputType: 'search_query',
    });

    // Step 5: Retrieve relevant documents
    const retrievedDocs = await vectorSearch(queryEmbedding, {
      limit: 5,
      threshold: 0.3,
      language,
    });

    console.log(`📚 Retrieved ${retrievedDocs.length} relevant documents`);

    // Step 6: Fetch real-time gym data if query is about trainers/plans/testimonials
    let realTimeGymData = '';
    if (isQueryAboutGymData(sanitized)) {
      console.log('🔍 Query is about gym data - fetching real-time data from database');
      const gymData = await getGymData();
      realTimeGymData = formatGymDataForContext(gymData);
    }

    // Step 7: Build system prompt with context
    let systemPrompt = buildSystemPrompt(retrievedDocs, userContext, realTimeGymData);
    systemPrompt += buildLanguageInstruction(language);

    // Step 8: Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 5 messages for context)
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const recentHistory = options.conversationHistory.slice(-5);
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: sanitized });

    // Step 9: Generate response with Groq
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
      stream: false,
    });

    const rawResponse = completion.choices[0]?.message?.content || '';

    // Step 8: Filter response to remove any leaked system prompts
    const filteredResponse = filterResponse(rawResponse);

    const responseTime = Date.now() - startTime;

    return {
      content: filteredResponse,
      retrievedDocs,
      tokensUsed: completion.usage?.total_tokens,
      responseTime,
    };
  } catch (error) {
    console.error('Error in RAG pipeline:', error);
    throw new Error(`RAG generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate streaming RAG response
 */
export async function* generateRAGResponseStream(
  userMessage: string,
  options: RAGOptions = {}
): AsyncGenerator<string, void, unknown> {
  try {
    // Step 1: Sanitize input
    const { sanitized, isSuspicious } = sanitizeInput(userMessage);

    if (isSuspicious) {
      console.warn('⚠️  Suspicious input detected, proceeding with caution');
    }

    // Step 2: Detect language
    const language = options.language || detectLanguage(sanitized);

    // Step 3: Fetch user context if userId provided and userContext not already set
    let userContext = options.userContext;
    if (options.userId && !userContext) {
      try {
        userContext = await buildUserContext(options.userId);
        if (userContext) {
          console.log(`👤 User context loaded for: ${userContext.name}`);
        }
      } catch (contextError) {
        console.warn('⚠️  Failed to load user context, continuing without it:', contextError);
      }
    }

    // Step 4: Generate query embedding
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(sanitized, {
        inputType: 'search_query',
      });
    } catch (embeddingError) {
      console.error('❌ Embedding generation failed:', embeddingError);
      throw new Error('Failed to process your message. Please try again.');
    }

    // Step 5: Retrieve relevant documents
    let retrievedDocs = [];
    try {
      retrievedDocs = await vectorSearch(queryEmbedding, {
        limit: 5,
        threshold: 0.3,
        language,
      });
      console.log(`📚 Retrieved ${retrievedDocs.length} relevant documents`);
    } catch (searchError) {
      console.warn('⚠️  Vector search failed, continuing without context:', searchError);
    }

    // Step 6: Fetch real-time gym data if query is about trainers/plans/testimonials
    let realTimeGymData = '';
    if (isQueryAboutGymData(sanitized)) {
      try {
        console.log('🔍 Query is about gym data - fetching real-time data from database');
        const gymData = await getGymData();
        realTimeGymData = formatGymDataForContext(gymData);
      } catch (gymDataError) {
        console.warn('⚠️  Failed to fetch gym data, continuing without it:', gymDataError);
      }
    }

    // Step 7: Build system prompt with context
    let systemPrompt = buildSystemPrompt(retrievedDocs, userContext, realTimeGymData);
    systemPrompt += buildLanguageInstruction(language);

    // Step 8: Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 5 messages for context)
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const recentHistory = options.conversationHistory.slice(-5);
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: sanitized });

    // Step 9: Generate streaming response with Groq
    let tokenCount = 0;
    try {
      const stream = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
        stream: true,
      });

      // Step 10: Stream tokens
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          tokenCount++;
          yield token;
        }
      }

      // If no tokens were received, yield a fallback message
      if (tokenCount === 0) {
        console.warn('⚠️  No tokens received from Groq, sending fallback message');
        yield "I apologize, but I'm having trouble generating a response right now. Please try asking your question again in a moment.";
      }
    } catch (groqError: any) {
      console.error('❌ Groq API error:', groqError);

      // Check for specific error types
      if (groqError.message?.includes('rate_limit') || groqError.status === 429) {
        yield "I'm currently experiencing high demand. Please wait a moment and try again.";
      } else if (groqError.message?.includes('timeout')) {
        yield "The request took too long to process. Please try with a shorter question.";
      } else {
        yield "I apologize, but I'm having technical difficulties. Please try again in a moment.";
      }
    }
  } catch (error) {
    console.error('Error in RAG streaming pipeline:', error);
    throw new Error(`RAG streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if Groq is configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0;
}
