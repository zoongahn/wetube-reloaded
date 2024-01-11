import express from "express"
import {
	edit,
	remove,
	see,
	logout,
	startGithubLogin,
	finishGithubLogin,
	startKakaoLogin,
	finishKakaoLogin,
	startGoogleLogin,
	finishGoogleLogin,
} from "../controllers/userController"

const userRouter = express.Router()

userRouter.get("/logout", logout)
userRouter.get("/edit", edit)
userRouter.get("/remove", remove)
userRouter.get("/github/start", startGithubLogin)
userRouter.get("/github/finish", finishGithubLogin)
userRouter.get("/kakao/start", startKakaoLogin)
userRouter.get("/kakao/finish", finishKakaoLogin)
userRouter.get("/google/start", startGoogleLogin)
userRouter.get("/google/finish", finishGoogleLogin)
userRouter.get("/:id", see)

export default userRouter
