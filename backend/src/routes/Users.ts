// Routes to /api/users end points
import {Request, Response, Router} from "express"
import bcrypt from "bcrypt"
import { compile } from "morgan"
import jwt, {JwtPayload} from "jsonwebtoken"
import {body, validationResult} from 'express-validator'
import {User} from "../models/Users"
import { Board } from "../models/Boards"

const usersRouter: Router = Router()

// Route to register a new user.
// Checks that email is valid format, username is 3 to 25 characters long and that password is at least 8 characters long and
// contains at least 1 lowercase, 1 uppercase, 1 number and 1 special character.
usersRouter.post("/register", 
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('username').trim().isLength({min: 3, max:25}).withMessage('Username must be between 3 and 25 characters').escape(),
  body('password').isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage('Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character'),
  async (req: Request, res: Response) => {
    console.log("test");

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.status(400).json({errors: errors.array()});
          return
      }

      const {email, password, username, isAdmin} = req.body;

      try {
          // Check if the email is already taken
          const existingUser = await User.findOne({email});
          if (existingUser) {
            console.log("Email already in use");
              res.status(403).json({ message: 'Email already in use.' });
              return 
          }

          const salt: string = bcrypt.genSaltSync(10);
          const hash: string = bcrypt.hashSync(password, salt);

          const newUser = new User({ email, password: hash, username, isAdmin });
          await newUser.save();

        /* Create default board for the user */
        const newBoard = new Board({
          name: `${username}'s Board`, // Give it a default name
          userId: newUser._id,        // Assign the user's ID
          columns: [],                // Empty columns initially
          sharedWith: []              // No shared users initially
      });
      await newBoard.save();

          res.status(200).json(newUser);
          return
      } catch (error) {
        console.log("Internal server error");
          res.status(500).json({message: 'Internal server error.'});
          return
      }
})

// Login end point. If user is found and password matches then return token that is valid for 2 minutes.
usersRouter.post("/login", 
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  async (req: Request, res: Response) => {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.status(400).json({errors: errors.array()});
          return
      }

      const {email, password} = req.body;

      // Find user from MongoDB with email.
      const loginUser = await User.findOne({email});
      if (!loginUser) {
          res.status(404).json({ message: 'Login failed.' });
          return 
      }

      // Compare if password hash matches to the hash stored for the user.
      if (!bcrypt.compareSync(password, loginUser.password)) {
          res.status(401).json({ message: 'Login failed.' });
          return
      }

      // Payload contains MongDB ObjectId of the user, username, isAdmin information.
      const jwtPayload: JwtPayload = {
          userId: loginUser._id,
          username: loginUser.username,
          isAdmin: loginUser.isAdmin
      }

      // Token is set to expire in one day.
      const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "1d"})

      // Send token in cookie.
      res.cookie("authToken", token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict"})   

      res.status(200).json({success: true})  
      return
})

// Logout user. Clears the cookie that contains authentication token.
usersRouter.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("authToken", {
      httpOnly: true, // Keep it secure
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
    return;
  });

export default usersRouter;