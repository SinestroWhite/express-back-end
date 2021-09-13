// Message format utility

function success(message) {
    return {
        success: {
            message: message,
        },
    }
}

function error(message) {
    return {
        error: {
            message: message,
        },
    }
}

export default {
    success,
    error
};
