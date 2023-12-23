import mongoose from "mongoose"

// export const formatHashtags = (hashtags) =>
// 	hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word.trim()}`))

const videoSchema = new mongoose.Schema({
	title: {type: String, required: true, trim: true, maxLength: 80},
	description: {type: String, required: true, trim: true, maxLength: 140},
	createdAt: {type: Date, required: true, default: Date.now},
	hashtags: [{type: String, trim: true}],
	meta: {
		views: {type: Number, default: 0, required: true},
		rating: {type: Number, default: 0, required: true},
	},
})

videoSchema.static("formatHashtags", function (hashtags) {
	return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word.trim()}`))
})

const movieModel = mongoose.model("Video", videoSchema)

export default movieModel
