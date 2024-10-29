const axios = require('axios');
const { getAPIKEY } = require('./parameterManager');


// api controller for pexel
exports.getPopularVideos = async (req, res, next) => {
    try {
        const pexelkeyObject = await getAPIKEY();
        const pexelkey = pexelkeyObject.PEXEL_API_KEY;
        const response = await axios.get('https://api.pexels.com/videos/popular', {
            headers: {
                Authorization: pexelkey
            }
        });
        res.json(response.data);
    } catch (error) {
        next(error);
    }
};
