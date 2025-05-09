import express from 'express';
import { auth } from '../config/firebase-admin';
import { User } from '../models/user';

const router = express.Router();

router.post('/google-auth', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      const { email, name, picture, uid } = decodedToken;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name: name || email.split('@')[0],
          googleId: uid,
          photoURL: picture || '',
          role: 'user'
        });
      } else {
        user.name = name || user.name;
        user.photoURL = picture || user.photoURL;
        user.googleId = uid;
        await user.save();
      }

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: user.photoURL
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

export default router;