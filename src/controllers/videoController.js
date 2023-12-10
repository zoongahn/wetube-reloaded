export const trending = (req, res) => {
    const videos = [
        {
            title: "Hello",
        },
        {
            title: "Video #2",
        },
        {
            title: "Whatsup",
        },
    ]
    return res.render("home", { pageTitle: "Home", videos })
}
export const see = (req, res) => res.render("watch", { pageTitle: "Watch Videos" })
export const edit = (req, res) => res.render("edit", { pageTitle: "Edit Video" })
export const search = (req, res) => res.send("Search")
export const deleteVideo = (req, res) => res.send("Delete Video")
export const upload = (req, res) => res.send("Upload")
