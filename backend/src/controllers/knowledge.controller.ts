import { Request, Response } from 'express';
import { getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, searchDocuments } from '../services/vector.service';
import { generateEmbedding } from '../services/embedding.service';
import { buildErrorMessage } from '../utils/prompt.utils';

/**
 * GET /api/v1/admin/knowledge
 * Get all knowledge base documents with pagination
 */
export async function getKnowledgeDocuments(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const category = req.query.category as string | undefined;

    const documents = await getAllDocuments(page, pageSize, category);

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error in getKnowledgeDocuments:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/admin/knowledge/:id
 * Get a specific document by ID
 */
export async function getKnowledgeDocument(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID',
        code: 'INVALID_ID',
      });
    }

    const document = await getDocumentById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Error in getKnowledgeDocument:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * POST /api/v1/admin/knowledge
 * Create a new knowledge base document
 */
export async function createKnowledgeDocument(req: Request, res: Response) {
  try {
    const { content, category, language, metadata } = req.body;

    // Validate required fields
    if (!content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Content and category are required',
        code: 'INVALID_INPUT',
      });
    }

    // Generate embedding for the content
    const embedding = await generateEmbedding(content, { inputType: 'search_document' });

    // Create document
    const document = await createDocument({
      content,
      metadata: {
        category,
        language: language || 'en',
        ...metadata,
      },
      embedding,
    });

    return res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
    });
  } catch (error) {
    console.error('Error in createKnowledgeDocument:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * PUT /api/v1/admin/knowledge/:id
 * Update an existing document
 */
export async function updateKnowledgeDocument(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID',
        code: 'INVALID_ID',
      });
    }

    const { content, category, language, metadata } = req.body;

    // Check if document exists
    const existingDoc = await getDocumentById(documentId);
    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        code: 'NOT_FOUND',
      });
    }

    // Generate new embedding if content changed
    let embedding = existingDoc.embedding;
    if (content && content !== existingDoc.content) {
      embedding = await generateEmbedding(content, { inputType: 'search_document' });
    }

    // Update document
    const updatedDoc = await updateDocument(documentId, {
      content: content || existingDoc.content,
      metadata: {
        category: category || existingDoc.metadata.category,
        language: language || existingDoc.metadata.language,
        ...metadata,
      },
      embedding,
    });

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDoc,
    });
  } catch (error) {
    console.error('Error in updateKnowledgeDocument:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * DELETE /api/v1/admin/knowledge/:id
 * Delete a document
 */
export async function deleteKnowledgeDocument(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID',
        code: 'INVALID_ID',
      });
    }

    const deleted = await deleteDocument(documentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteKnowledgeDocument:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * POST /api/v1/admin/knowledge/search
 * Search knowledge base documents
 */
export async function searchKnowledge(req: Request, res: Response) {
  try {
    const { query, category, limit } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
        code: 'INVALID_INPUT',
      });
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query, { inputType: 'search_query' });

    // Search documents
    const results = await searchDocuments(queryEmbedding, {
      limit: limit || 10,
      category,
    });

    return res.status(200).json({
      success: true,
      data: {
        query,
        results,
      },
    });
  } catch (error) {
    console.error('Error in searchKnowledge:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}
