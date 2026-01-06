const Video = require('../models/Video');
const User = require('../models/User');

// @desc    Get all videos (paginated feed)
// @route   GET /api/videos
// @access  Public (optional auth)
exports.getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username')
      .lean();

    // Add like and comment counts
    const userId = req.user ? req.user._id.toString() : null;
    const videosWithCounts = videos.map(video => ({
      ...video,
      likeCount: video.likes ? video.likes.length : 0,
      commentCount: video.comments ? video.comments.length : 0,
      isLiked: userId && video.likes ? video.likes.some(id => id.toString() === userId) : false,
    }));

    const total = await Video.countDocuments();

    res.json({
      success: true,
      videos: videosWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('userId', 'username')
      .lean();

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // Increment views
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const userId = req.user ? req.user._id.toString() : null;
    const videoWithCounts = {
      ...video,
      likeCount: video.likes ? video.likes.length : 0,
      commentCount: video.comments ? video.comments.length : 0,
      isLiked: userId && video.likes ? video.likes.some(id => id.toString() === userId) : false,
      views: (video.views || 0) + 1,
    };

    res.json({
      success: true,
      video: videoWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create new video
// @route   POST /api/videos
// @access  Private
exports.createVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Video URL is required',
      });
    }

    // Get user info
    const user = await User.findById(req.user._id);

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      userId: req.user._id,
      username: user.username,
    });

    res.status(201).json({
      success: true,
      video,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (owner only)
exports.updateVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // Check ownership
    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this video',
      });
    }

    // Update fields
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;

    await video.save();

    res.json({
      success: true,
      video,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (owner only)
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // Check ownership
    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this video',
      });
    }

    await video.deleteOne();

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Like/Unlike video
// @route   PUT /api/videos/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    const userId = req.user._id;
    const isLiked = video.likes.includes(userId);

    if (isLiked) {
      // Unlike
      video.likes = video.likes.filter(
        id => id.toString() !== userId.toString()
      );
    } else {
      // Like
      video.likes.push(userId);
    }

    await video.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likeCount: video.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Add comment to video
// @route   POST /api/videos/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required',
      });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    const comment = {
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    video.comments.push(comment);
    await video.save();

    const newComment = video.comments[video.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get comments for video
// @route   GET /api/videos/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('comments');

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    res.json({
      success: true,
      comments: video.comments || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/videos/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    const comment = video.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment',
      });
    }

    comment.deleteOne();
    await video.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

