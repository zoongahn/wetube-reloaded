import User from "../models/User.js"
import bcrypt from "bcrypt"

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"})
export const postJoin = async (req, res) => {
	const {name, username, email, password, password2, location} = req.body
	const pageTitle = "Join"
	if (password != password2) {
		return res.status(400).render("join", {
			pageTitle,
			errorMessage: "Password confirmation does not match.",
		})
	}
	const exists = await User.exists({$or: [{username}, {email}]})
	if (exists) {
		return res.status(400).render("join", {
			pageTitle,
			errorMessage: "This username/email is already taken.",
		})
	}
	try {
		await User.create({name, username, email, password, location})
	} catch (error) {
		return render("join", {})
	}
	return res.redirect("/login")
}

export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"})
export const postLogin = async (req, res) => {
	const {username, password} = req.body
	const PageTitle = "Login"
	// check if the NON-SOCIAL account exists
	const user = await User.findOne({username, socialOnly: false})
	if (!user) {
		return res.status(400).render("login", {
			PageTitle,
			errorMessage: "An account with this username does not exists.",
		})
	}
	// check if password correct
	const ok = await bcrypt.compare(password, user.password)
	if (!ok) {
		return res.status(400).render("login", {
			PageTitle,
			errorMessage: "Wrong password.",
		})
	}
	req.session.loggedIn = true
	req.session.user = user
	return res.redirect("/")
}

export const startGithubLogin = (req, res) => {
	const baseUrl = "https://github.com/login/oauth/authorize"
	const config = {
		client_id: process.env.GH_CLIENT,
		allow_signup: false,
		scope: "read:user user:email",
	}
	const params = new URLSearchParams(config).toString()
	const finalUrl = `${baseUrl}?${params}`
	return res.redirect(finalUrl)
}
export const finishGithubLogin = async (req, res) => {
	const baseUrl = "https://github.com/login/oauth/access_token"
	const config = {
		client_id: process.env.GH_CLIENT,
		client_secret: process.env.GH_SECRET,
		code: req.query.code,
	}

	const params = new URLSearchParams(config).toString()
	const finalUrl = `${baseUrl}?${params}`

	const tokenRequest = await (
		await fetch(finalUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		})
	).json()

	if ("access_token" in tokenRequest) {
		const {access_token} = tokenRequest
		const apiUrl = "https://api.github.com"
		const userData = await (
			await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			})
		).json()
		console.log(userData)
		const emailData = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			})
		).json()
		console.log(emailData)
		const emailObj = emailData.find((email) => email.primary == true && email.verified == true)
		// if user has NO email in account
		if (!emailObj) {
			return res.redirect("/login")
		}
		let user = await User.findOne({email: emailObj.email})
		// if the user is not found, define it to user's github info.
		if (!user) {
			user = await User.create({
				name: userData.name,
				username: userData.login,
				email: emailObj.email,
				password: "",
				location: userData.location,
				socialOnly: true,
				avatarUrl: userData.avatar_url,
			})
		}
		// Anyway, Log user In.
		req.session.loggedIn = true
		req.session.user = user
		return res.redirect("/")
	} else {
		return res.redirect("/login")
	}
}
export const startKakaoLogin = (req, res) => {
	const baseUrl = "https://kauth.kakao.com/oauth/authorize"
	const config = {
		client_id: process.env.KAKAO_CLIENT,
		redirect_uri: "http://localhost:4000/users/kakao/finish",
		response_type: "code",
	}
	const params = new URLSearchParams(config).toString()
	const finalUrl = `${baseUrl}?${params}`
	return res.redirect(finalUrl)
}
export const finishKakaoLogin = async (req, res) => {
	const baseUrl = "https://kauth.kakao.com/oauth/token"
	const config = {
		grant_type: "authorization_code",
		client_id: process.env.KAKAO_CLIENT,
		redirect_uri: "http://localhost:4000/users/kakao/finish",
		code: req.query.code,
	}
	const params = new URLSearchParams(config).toString()
	const finalUrl = `${baseUrl}?${params}`

	const tokenRequest = await (
		await fetch(finalUrl, {
			method: "POST",
			headers: {
				"Content-type": "application/x-www-form-urlencoded;charset=utf-8",
			},
		})
	).json()

	if ("access_token" in tokenRequest) {
		const {access_token} = tokenRequest
		const apiUrl = "https://kapi.kakao.com/v2/user/me"
		const userData = await (
			await fetch(apiUrl, {
				headers: {
					Authorization: `Bearer ${access_token}`,
					"Content-type": "application/x-www-form-urlencoded;charset=utf-8,",
				},
			})
		).json()
		console.log(userData)
		if (userData.kakao_account.is_email_valid == false || userData.kakao_account.is_email_verified == false) {
			return res.redirect("/login")
		}

		let user = await User.findOne({email: userData.kakao_account.email})
		if (!user) {
			user = await User.create({
				name: userData.kakao_account.name,
				username: userData.properties.nickname,
				email: userData.kakao_account.email,
				password: "",
				location: userData.location,
				socialOnly: true,
				avatarUrl: userData.properties.profile_image,
			})
		}

		req.session.loggedIn = true
		req.session.user = user
		return res.redirect("/")
	} else {
		return res.redirect("/login")
	}
}
export const startGoogleLogin = (req, res) => {
	const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth"
	const config = {
		client_id: process.env.GOOGLE_CLIENT,
		redirect_uri: "http://localhost:4000/users/google/finish",
		response_type: "code",
		scope: [
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		].join(" "),
		state: "",
	}
	const params = new URLSearchParams(config)
	const finalUrl = `${baseUrl}?${params}`
	return res.redirect(finalUrl)
}
export const finishGoogleLogin = async (req, res) => {
	const baseUrl = "https://oauth2.googleapis.com/token"
	const config = {
		client_id: process.env.GOOGLE_CLIENT,
		client_secret: process.env.GOOGLE_SECRET,
		code: req.query.code,
		grant_type: "authorization_code",
		redirect_uri: "http://localhost:4000/users/google/finish",
	}
	const params = new URLSearchParams(config)
	const finalUrl = `${baseUrl}?${params}`

	const tokenRequest = await (
		await fetch(finalUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
	).json()

	if ("access_token" in tokenRequest) {
		const {access_token} = tokenRequest
		const apiUrl = "https://www.googleapis.com/oauth2/v2/userinfo"
		const userData = await (
			await fetch(apiUrl, {
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			})
		).json()
		console.log(userData)

		if (userData.verified_email == false) {
			return res.redirect("/login")
		}

		let user = await User.findOne({email: userData.email})
		if (!user) {
			user = await User.create({
				name: userData.name,
				username: userData.email,
				email: userData.email,
				password: "",
				location: userData.locale,
				socialOnly: true,
				avatarUrl: userData.picture,
			})
		}

		req.session.loggedIn = true
		req.session.user = user
		return res.redirect("/")
	} else {
		return res.redirect("/login")
	}
}

export const edit = (req, res) => res.send("Edit User")
export const remove = (req, res) => res.send("Remove User")
export const logout = (req, res) => {
	req.session.destroy()
	return res.redirect("/")
}
export const see = (req, res) => res.send("See")
