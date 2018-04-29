var isRealString = (str) => {
	//console.log(typeof str, str.trim().length);
	return (typeof str === 'string') && (str.trim().length > 0);
};

module.exports = {isRealString};