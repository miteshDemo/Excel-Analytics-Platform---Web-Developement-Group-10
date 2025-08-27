import Analysis from '../models/Analysis.js';


export const saveAnalysis = async (req, res) => {
  try {
    const { userId, fileName, result } = req.body;
    if (!userId || !fileName || !result) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newAnalysis = new Analysis({ userId, fileName, result, date: new Date() });
    await newAnalysis.save();
    res.status(201).json({ message: 'Analysis saved successfully', analysis: newAnalysis });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


export const getAnalysisHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    const history = await Analysis.find({ userId }).sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Analysis.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'History not found' });
    res.json({ message: 'History deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
