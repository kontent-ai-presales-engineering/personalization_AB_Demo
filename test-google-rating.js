const GOOGLE_API_KEY = 'AIzaSyDUG4tNu0ot-yD_XxSInz02MMBMkKCEuqM';
const PLACE_ID = 'ChIJ96WqKniB3YgRVVsUtlDsTL0'; // One of your campgrounds

async function testGoogleRating() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Campground:', data.result.name);
  console.log('Rating:', data.result.rating);
  console.log('Review Count:', data.result.user_ratings_total);
}

testGoogleRating();