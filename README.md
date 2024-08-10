**Project Information:**

=> This repository contains two projects:

a. **Patient App** - Manages patient data with CRUD operations.

b. **Main Application** - Handles cart, checkout, and order placement.

**Execution Steps:**

**1. Patient App**
	
 	a. Open a terminal or command prompt and start the JSON server by executing:
		json-server --watch db.json --port 3001

	b. In a new terminal or command prompt, navigate to the Patient App project directory and run:
		ng serve --port 5000
**2. Main Application**

	a. Open a terminal or command prompt and start the JSON server by executing:
		json-server --watch db.json
		(The default port for this server is 3000.)
  
	b. In a new terminal or command prompt, navigate to the Main Application project directory and run:
		ng serve
		(This will start the application on the default port 4200.)

Henceforth, Access the Main Application
Once both projects are running, open your browser and navigate to:

http://localhost:4200

Thank you!
