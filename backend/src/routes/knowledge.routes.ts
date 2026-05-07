import { Router } from 'express';
import {
  getKnowledgeDocuments,
  getKnowledgeDocument,
  createKnowledgeDocument,
  updateKnowledgeDocument,
  deleteKnowledgeDocument,
  searchKnowledge,
} from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

/**
 * All knowledge base routes require admin authentication
 */
router.use(authenticate, requireAdmin);

/**
 * GET /api/v1/admin/knowledge
 * Get all knowledge base documents with pagination
 */
router.get('/', getKnowledgeDocuments);

/**
 * GET /api/v1/admin/knowledge/:id
 * Get a specific document by ID
 */
router.get('/:id', getKnowledgeDocument);

/**
 * POST /api/v1/admin/knowledge
 * Create a new knowledge base document
 */
router.post('/', createKnowledgeDocument);

/**
 * PUT /api/v1/admin/knowledge/:id
 * Update an existing document
 */
router.put('/:id', updateKnowledgeDocument);

/**
 * DELETE /api/v1/admin/knowledge/:id
 * Delete a document
 */
router.delete('/:id', deleteKnowledgeDocument);

/**
 * POST /api/v1/admin/knowledge/search
 * Search knowledge base documents
 */
router.post('/search', searchKnowledge);

export default router;
