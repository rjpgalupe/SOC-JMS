const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Journal = require('./models/journal');
const mongoose = require('mongoose');
const multer = require('multer');
const Notification = require('./models/notification');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const transporter = require('./models/email');
const Rubric = require('./models/rubric');

require('dotenv').config();
require('./db')

app.use(fileUpload());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin",  
               "http://localhost:4200"); 
    res.header("Access-Control-Allow-Headers",  
               "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next(); 
});

// Retrieve all users or users by role
app.get('/users', async (req, res) => {
  try {
    const role = req.query.role;
    let users;
    if (role) {
      users = await User.find({ role }); // Filter users by role if role is provided in the query params
    } else {
      users = await User.find(); // Retrieve all users if no role is provided
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
app.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Delete the user by ID
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to delete a journal by its ID
app.delete('/journals/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;

    // Check if journalId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(journalId)) {
      return res.status(400).json({ error: 'Invalid journalId' });
    }

    // Find the journal by ID and delete it
    await Journal.findByIdAndDelete(journalId);

    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add route to create a rubric
app.post('/rubrics', async (req, res) => {
  try {
    const rubric = await Rubric.create(req.body);
    res.status(201).json(rubric);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add route to get all rubrics
app.get('/rubrics', async (req, res) => {
  try {
    const rubrics = await Rubric.find();
    res.json(rubrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add route to get a single rubric by its ID
app.get('/rubrics/:rubricId', async (req, res) => {
  try {
    const { rubricId } = req.params;
    const rubric = await Rubric.findById(rubricId);
    if (!rubric) {
      return res.status(404).json({ error: 'Rubric not found' });
    }
    res.json(rubric);
  } catch (error) {
    console.error('Error fetching rubric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Add a route to change a user's password
app.post('/users/:userId/change-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find the user by ID in the database
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided current password matches the user's password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Send a success response
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Add a route to get a user by their userId
app.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID in the database
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If the user is found, send their details as the response
    res.json(user);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});



// Modify the register route to include email validation
app.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, role } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique verification token using Crypto
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 10);

    const user = new User({ email, firstName, lastName, password: hashedPassword, role, verificationToken, verificationTokenExpires: tokenExpiration });
    await user.save();

    // Send verification email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Hello ${firstName},</p>
         <p>Please click the following link to verify your email address:</p>
         <p><a href="http://localhost:3000/verify/${verificationToken}?email=${email}" target="_blank">Verify Email</a></p>
         <p>If the button above doesn't work, you can also paste this link into your browser:</p>
         <p>http://localhost:3000/verify/${verificationToken}?email=${email}</p>
         <p>The link is valid for 10 minutes</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ error: 'Error sending verification email' });
      }
      console.log('Verification email sent:', info.response);
      res.json({ message: 'User registered successfully. Please check your email for verification.' });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Route to Verify Token
app.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    // Check if the token has expired or user not found
    if (!user || user.verificationTokenExpires < new Date()) {
      return res.redirect(`http://localhost:4200/verify-email-result?success=false&email=${user.email}`);
    }

    // Update user status to verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Redirect with success=true if verification succeeds
    res.redirect(`http://localhost:4200/verify-email-result?success=true&email=${user.email}`);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
    
  }
});

// Add a route to resend verification email
app.post('/resend-verification-email', async (req, res) => {
  try {
    const { email } = req.body;

    // Fetch user by email and resend verification email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send verification email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Email Verification',
      html: `<p>Hello ${user.firstName},</p>
         <p>Please click the following link to verify your email address:</p>
         <p><a href="http://localhost:3000/verify/${verificationToken}?email=${email}" target="_blank">Verify Email</a></p>
         <p>If the button above doesn't work, you can also paste this link into your browser:</p>
         <p>http://localhost:3000/verify/${verificationToken}?email=${email}</p>
         <p>The link is valid for 10 minutes</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error resending verification email:', error);
        return res.status(500).json({ error: 'Error resending verification email' });
      }
      console.log('Resent verification email sent:', info.response);
      res.json({ message: 'Verification email resent successfully.' });
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Resend verification email failed' });
  }
});

app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 600000; 
    await user.save();

    // Send reset password email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Reset Password',
      html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p><a href="http://localhost:4200/reset-password/${resetToken}" target="_blank">Reset Password</a></p>
             <p>Please click on the following link, or paste this into your browser to complete the process:</p>
             <p>http://localhost:4200/reset-password/${resetToken}</p>
             <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending reset password email:', error);
        return res.status(500).json({ error: 'Error sending reset password email' });
      }
      console.log('Reset password email sent:', info.response);
      res.json({ message: 'Reset password instructions sent to your email' });
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Forgot password failed' });
  }
});

// Add the following endpoint to handle password reset
app.post('/reset-password/:resetToken', async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({ resetPasswordToken: resetToken });
    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired reset token' });
    }

    // Check if the reset token has expired
    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});



// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the user's email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ message: 'Email not verified. Please check your email for verification.' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ 
        message: 'Login successful', 
        role: user.role, 
        status: true,
        userId: user._id
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials', status: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message,status:false });
  }
});


// Retrieve all journals
app.get('/journals', async (req, res) => {
  try {
    const journals = await Journal.find();
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a new journal with file upload
app.post('/journals', async (req, res) => {
  try {
    const { journalTitle, authors, abstract, keywords, userId } = req.body; // Add userId to the request body
    
    // Check if file exists in request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const journalFile = req.files.journalFile; // Access the uploaded file

    // Move the uploaded file to a specific directory
    const filePath = `uploads/${journalFile.name}`;
    journalFile.mv(filePath, async function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Create a new journal entry in the database
      const journal = new Journal({ journalTitle, authors, abstract, keywords, filePath, submittedBy: userId }); // Store the userId with the journal
      await journal.save();

      res.json({ message: 'Journal submitted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to fetch journals submitted by a specific user
app.get('/user/:userId/journals', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find journals submitted by the specified user
    const journals = await Journal.find({ submittedBy: userId });

    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to update journal status
app.put('/journals/:journalId/update-status', async (req, res) => {
  try {
    const { journalId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(journalId)) {
      return res.status(400).json({ error: 'Invalid journalId' });
    }

    const journal = await Journal.findByIdAndUpdate(journalId, { status }, { new: true });

    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json({ message: 'Journal status updated successfully', journal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add a route to retrieve a single journal by its ID
app.get('/journals/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }
    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route for assigning reviewers to journals
app.post('/journals/:journalId/assign-reviewers', async (req, res) => {
  try {
    const { journalId } = req.params;
    const { reviewerIds, rubricId } = req.body; // Retrieve the array of selected reviewer IDs and rubricId from the request body

    // Check if journalId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(journalId)) {
      return res.status(400).json({ error: 'Invalid journalId' });
    }

    // Find the journal by ID
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    // Find the selected reviewers by their IDs
    const reviewers = await User.find({ _id: { $in: reviewerIds } });
    if (reviewers.length !== reviewerIds.length) {
      // Check if all reviewers were found
      return res.status(404).json({ error: 'One or more reviewers not found' });
    }

    // Update the reviewers array with the IDs of the selected reviewers
    journal.reviewers = reviewerIds;
    journal.rubricId = rubricId; // Assign the rubricId to the journal
    await journal.save();

    // Update the status of the reviewers to 'Assigned'
    await User.updateMany({ _id: { $in: reviewerIds } }, { status: 'Assigned' });

    // Send notifications to the assigned reviewers with journalId
    const notifications = reviewerIds.map(reviewerId => new Notification({
      recipient: reviewerId,
      message: `You have been assigned to review the journal "${journal.journalTitle}"`,
      journalId: journal._id // Include journalId in the notification
    }));
    await Notification.insertMany(notifications);

    res.json({ message: 'Reviewers assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to fetch notifications for a specific user
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Find notifications for the user
    const notifications = await Notification.find({ recipient: userId });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Add a route to mark a notification as read
app.put('/notifications/:notificationId/mark-as-read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Update the status of the notification to 'read'
    const notification = await Notification.findByIdAndUpdate(notificationId, { status: 'read' }, { new: true });

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modify the route to accept an array of reviewer IDs
app.post('/user/reviewers', async (req, res) => {
  try {
    const { reviewerIds } = req.body;

    // Find all reviewers with the provided IDs
    const reviewers = await User.find({ _id: { $in: reviewerIds } });

    res.json(reviewers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to fetch assigned journals for each reviewer
app.get('/user/reviewers/:userId/assigned-journals', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the assigned journals for the user
    const assignedJournals = await Journal.find({ reviewers: userId });

    res.json(assignedJournals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to submit feedback and update journal status
app.post('/journals/:journalId/submit-feedback', async (req, res) => {
  try {
    const { journalId } = req.params;
    const { feedback, choice, userId } = req.body; // Include userId in the request body

    // Ensure req.userId contains the authenticated user's ID or retrieve it from req.body if needed

    // Find the journal by ID
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    // Check if the reviewer has already submitted feedback
    if (journal.reviewComments.some(comment => String(comment.reviewer) === String(userId))) {
      return res.status(400).json({ error: 'Feedback already submitted by this reviewer' });
    }

    // Add the review comment to the journal
    journal.reviewComments.push({ reviewer: userId, comment: feedback }); // Use userId instead of reviewerId

    // Store the choice made by the reviewer
    const reviewerIndex = journal.reviewers.findIndex(reviewer => String(reviewer) === String(userId));
    if (reviewerIndex !== -1) {
      journal.reviewerChoices.push({ reviewer: userId, choice }); // Use userId instead of reviewerId
    } else {
      return res.status(400).json({ error: 'You are not assigned as a reviewer for this journal' });
    }

    // Check if all reviewers have submitted their feedback
    const totalReviewers = journal.reviewers.length;
    const feedbackCount = journal.reviewComments.length;
    if (feedbackCount === totalReviewers) {
      // Update the journal status to 'Reviewed' if all reviewers have submitted feedback
      journal.status = 'Reviewed';
    }

    await journal.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to submit consolidated feedback for a journal
app.post('/journals/:journalId/submit-consolidated-feedback', async (req, res) => {
  try {
    const { journalId } = req.params;
    const { consolidatedFeedback, adminChoice } = req.body; 

    // Find the journal by ID
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }


    journal.consolidatedFeedback = consolidatedFeedback;
    journal.status = adminChoice; 
    await journal.save();

    res.json({ message: 'Consolidated feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to fetch consolidated feedback for a specific journal
app.get('/journals/:journalId/consolidated-feedback', async (req, res) => {
  try {
    const { journalId } = req.params;

    // Find the journal by ID
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    // Return the consolidated feedback for the journal
    res.json({
      journalTitle: journal.journalTitle,
      consolidatedFeedback: journal.consolidatedFeedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add a route to fetch consolidate feedback for a journal
app.get('/journals/:journalId/consolidate-feedback', async (req, res) => {
  try {
    const { journalId } = req.params;

    // Find the journal by ID
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    // Retrieve all the feedback provided by reviewers for the journal
    const feedback = await Promise.all(journal.reviewComments.map(async comment => {
      try {
        const reviewer = await User.findById(comment.reviewer);
        return {
          reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Unknown',
          feedback: comment.comment,
          choice: journal.reviewerChoices.find(choice => String(choice.reviewer) === String(comment.reviewer)).choice
        };
      } catch (error) {
        console.error('Error fetching reviewer:', error);
        return {
          reviewerName: 'Unknown',
          feedback: comment.comment,
          choice: journal.reviewerChoices.find(choice => String(choice.reviewer) === String(comment.reviewer)).choice
        };
      }
    }));

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add a route to check if the email is already registered
app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.json({ message: 'Email available' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
    console.log('Server listening on port 3000')
})