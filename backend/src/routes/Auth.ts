// Routes to /api/baords end points
import {Request, Response, Router} from "express"
import jwt from "jsonwebtoken"

const authRouter: Router = Router()

// End point to check if the user has valid authentication token aka logged in.
authRouter.get("/", (req: Request, res: Response) => {
    const token = req.cookies.authToken;
  
    if (!token) {
        res.json({ isLoggedIn: false });
        return;
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET!)
      
      // Return only necessary details, no full token
      res.json({ isLoggedIn: true });
      return;
  
    } catch (error) {
      res.json({ isLoggedIn: false });
      return;
    }
  });
  

export default authRouter;