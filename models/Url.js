const mongose = require('mongoose');
const Schema = mongose.Schema;

const UrlSchema = new Schema({
    original_url: {type: String, required: true},
    short_url: {type: String, required: true}
});

const Url = mongose.model('Url', UrlSchema)

module.exports.Url = Url