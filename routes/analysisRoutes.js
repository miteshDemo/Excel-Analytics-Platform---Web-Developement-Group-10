import express from 'express';
import { saveAnalysis, getAnalysisHistory, deleteAnalysis } from '../controller/analysisController.js';

const router = express.Router();

router.post('/save', saveAnalysis);
router.get('/history/:userId', getAnalysisHistory);
router.delete('/:id', deleteAnalysis);

export default router;
