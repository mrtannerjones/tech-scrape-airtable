const Xray = require('x-ray')
const x = Xray().delay(2000);
const asyncMap = require("async/map")
const waterfall = require('async/waterfall')
const Airtable = require('airtable');
const YOUR_API_KEY = YOUR_API_KEY
const base = new Airtable({apiKey: YOUR_API_KEY}).base('xxx');
var sleep = require('sleep');

function getMentorUrls (callback) {
	x("https://www.techstars.com/mentors/?ts_program=boulder-program#program-filter", {
		mentorUrls: ["ul.headshots-grid li a@href"]
	})((err, obj) =>{
		callback(err, obj.mentorUrls)
	})
}

function getMentorInfo (url, callback) {
	sleep.sleep(1)
	x(url, {
		mentorName: "div.mentor-meta h1",
		mentorCompany: "div.mentor-meta span.mentor-comp",
		mentorTitle: "div.mentor-meta span.mentor-title",
		mentorImage: "div.mentor-avatar img@src",
		mentorNotes: ["div.col-8-wrapper p"]
	})
	((err, res) => {
		if(err){callback(err)}	
		res.mentorUrl = url
		callback(err, res)
	})	
}

function getAllMentorData(mentorUrls, callback){	
	asyncMap(mentorUrls, getMentorInfo, callback)

} 

function addMentorToAirtable(mentor, callback){
	const {mentorNotes, mentorImage, mentorName, mentorCompany, mentorTitle, mentorUrl} = mentor
	base('TechStars Network').create({
		"Name": mentorName || '', 
		"Notes": mentorNotes[0] || '',
  		"TechStars Url": mentorUrl ||'',
  		"Company": mentorCompany || '',
  		"Role": mentorTitle || '',
  		"Profile Pic": [{
  			"url": mentorImage || "https://www.techstars.com/wp-content/themes/estrellas/assets/img/techstars-horizontal-logo_2x.png"
  		}]
	}, callback)
		
}

function addAllToAirtable(mentorDataArray, callback){
	asyncMap(mentorDataArray, addMentorToAirtable, callback)
}

function main(){
	waterfall([
		getMentorUrls,
		getAllMentorData,
		addAllToAirtable
	], (err, res) =>{
		err ? console.log(err) : console.log(res)
	})
}

main()

