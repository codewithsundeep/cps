if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then(reg => {
        console.log("Service worker registered");
    }).catch(err => {
        console.log("service worker registration failed", err);
    })
}
// 7319135986 amrit driver