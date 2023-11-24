export const trending = (req, res) => res.send("Trending Videos")
export const see = (req, res) => {
    console.log(req.params)
    return res.send(`Watch Video #${req.params.id}`)
}
export const edit = (req, res) => {
    console.log(req.params)
    return res.send("Edit Videos")
}
export const search = (req, res) => res.send("Search")
export const deleteVideo = (req, res) => {
    console.log(req.params)
    return res.send("Delete Video")
}
export const upload = (req, res) => res.send("Upload")
