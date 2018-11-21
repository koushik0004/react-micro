# react-micro
A microfrontend framework for React

## Getting Started
- Clone the repo 
- In the terminal cd into the folder and  `run npm install`
- Run `npm start` This will start off a http-server running on port 9000 and the main app running on port 3000. ( you'll get an error saying port 9000 in use, ignore that for now, will fix it later.)
- In the browser navigate to http://localhost:3000/cities


## Creating a new Micro App
- Under `src/client/micro-apps` create a folder with the name of your micro-app.  Make sure the folder contains a package.json and the js file with the right naming convetion.
- If your mic-app makes use of other NPM modules add them to the `src/vendor/vendors.js` file. and also add them to the `webpack/_externals.js` file.


## Creating a new Page

- Navigate to the `src/templates` folder and create an HTML file with the desired route name eg: wishlist.html 
- Add the new componnet to the template as `div data-micro-appId="<<x>>" data-micro-app="<<app-name>>" data-json="{}"></div>` Make sure the value of x is unique on the page and the app-name matches the name mentioned in the package.json file. Use the data-json attribute to pass any props to the micro-app.
- Restart the server and navigate to `http://localhost:3000/wishlist`

