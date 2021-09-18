var charsets = [];
charsets['num'] = "0123456789";
charsets['alpha'] = "abcdefghijklmnopqrstuvwxyz";
charsets['alpha_num'] = "abcdefghijklmnopqrstuvwxyz0123456789";

exports.random = function(len,type){
    var text = "";
    var charset = "";
    if(!type)
    	charset = charsets['num'];
    else
    	charset = charsets[type.toLowerCase()];
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}