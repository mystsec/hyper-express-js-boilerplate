import 'dotenv/config';

var settings = {
	"dev": {
		"hyper": true,        // Is webserver hyper-express?
		"hosts": [
			"localhost:3000",
			"127.0.0.1:3000"
		],
		"protocols": [
			"http",
			"https"
		],
		"session": {
			"exp": 259200000, // Session expiration in ms (3 days)
			"len": 32         // length of session & token ids
		},
		"cookie": {
			"secure": false,
			"sameSite": "lax",
		}
	},
	"prod": {
		"hyper": true,        // Is webserver hyper-express?
		"hosts": [
			"example.com"
		],
		"protocols": [
			"https"
		],
		"session": {
			"exp": 259200000, // Session expiration in ms (3 days)
			"len": 32         // length of session & token ids
		},
		"cookie": {
			"secure": true,
			"sameSite": "lax",
		}
	}
};

settings[process.env.config]["db"] = {
	"user": process.env.db_username,
	"pw": process.env.db_password,
	"host": process.env.db_host,
	"port": process.env.db_port,
	"db": process.env.db_database
};

export let config = settings[process.env.config];