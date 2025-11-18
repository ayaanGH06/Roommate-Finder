const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { recipient, content, listingId } = req.body;
    const message = await Message.create({
      sender: req.user.id,
      recipient,
      content,
      listingId
    });
    await message.populate('sender recipient', 'name');
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    await User.populate(conversations, { path: '_id lastMessage.sender lastMessage.recipient', select: 'name' });
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender recipient', 'name');
    
    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, recipient: userId, read: false },
      { read: true }
    );
    
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};