import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the client dist folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET route to retrieve search history
app.get('searchHistory.json', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'searchHistory.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading search history');
        }
        res.json(JSON.parse(data));
        return res; // Add a return statement here
    });
});

// POST route to save a city and return weather data
app.post('/api/weather', (req, res) => {
    const cityName: string = req.body.city; // Assuming the city name is sent in the request body

    if (!cityName) {
        return res.status(400).send('City name is required');
    }

    // Create a new city object with a unique ID
    const newCity = {
        id: uuidv4(),
        name: cityName
    };

    // Read the existing search history
    fs.readFile(path.join(__dirname, 'data', 'searchHistory.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading search history');
        }

        const searchHistory = JSON.parse(data);
        searchHistory.push(newCity);

        // Write the updated search history back to the file
        fs.writeFile(path.join(__dirname, 'data', 'searchHistory.json'), JSON.stringify(searchHistory, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving search history');
            }

            // Here you would typically call the OpenWeather API to get weather data
            // For demonstration, we will return a mock response
            const mockWeatherData = {
                city: cityName,
                temperature: '20°C',
                humidity: '50%',
                windSpeed: '10 km/h'
            };

            res.json(mockWeatherData);
        });
    });
});

// Implement middleware to connect the routes
import routes from './routes/index.js';
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));