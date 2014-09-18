var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {

	//Read 'name and email from the request.body'
	var obj = request.body;
	var name = obj['name'];
	var email = obj['email'];
	var newSessionId = login.login(name, email);
	//Set new session id to the 'session_id' cookie in the response
	response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
	response.end(login.hello(newSessionId));
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
 	
	var cookies = request.cookies;
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			login.logout(sid);
			response.end('Logged out from the server\n');
		}else{
			response.end('User not logged in\n');
		}
	}
		
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	var cookies = request.cookies;
	//Refresh session id; similar to the post() function
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			var newSessionId = login.login( login.sessionMap[sid].name, login.sessionMap[sid].email);
			//Set new session id to the 'session_id' cookie in the response
			response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
			response.end("Re-freshed session id \n");
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	}else {
		response.end("Could not refresh session id \n");
	}
	
	
};

app.listen(8000);

console.log("Node.JS server running at 8000...");
