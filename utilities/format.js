module.exports = {
    error(message) {
        return {
            error: {
                messages: [ message ],
            },
        }
    },
    success(message) {
        return {
            success: {
                messages: [ message ],
            },
        }
    }

}
