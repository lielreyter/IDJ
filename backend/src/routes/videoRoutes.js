const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/videos
// @desc    Get all videos (paginated feed)
// @access  Public (optional auth for personalized data)
router.get('/', optionalAuth, getVideos);

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Public (optional auth for personalized data)
router.get('/:id', optionalAuth, getVideo);

// @route   POST /api/videos
// @desc    Create new video
// @access  Private
router.post('/', protect, createVideo);

// @route   PUT /api/videos/:id
// @desc    Update video
// @access  Private (owner only)
router.put('/:id', protect, updateVideo);

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private (owner only)
router.delete('/:id', protect, deleteVideo);

// @route   PUT /api/videos/:id/like
// @desc    Like/Unlike video
// @access  Private
router.put('/:id/like', protect, toggleLike);

// @route   POST /api/videos/:id/comments
// @desc    Add comment to video
// @access  Private
router.post('/:id/comments', protect, addComment);

// @route   GET /api/videos/:id/comments
// @desc    Get comments for video
// @access  Public
router.get('/:id/comments', getComments);

// @route   DELETE /api/videos/:id/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;

