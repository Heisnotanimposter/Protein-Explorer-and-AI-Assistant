// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8000; // Use port 8000 for consistency with frontend

// Add configuration for Confidence Challenge Game
const CONFIDENCE_GAME_URL = process.env.CONFIDENCE_GAME_URL || 'http://localhost:5000';

// Add new constant for RCSB API
const RCSB_API_URL = 'https://search.rcsb.org/rcsbsearch/v2/query';

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5500', // Common for VS Code Live Server
    'http://127.0.0.1:5500', // Another common Live Server address
    'http://localhost:8000', // If you serve your frontend from this same backend
    'http://localhost:5000', // Confidence Challenge Game
    'http://127.0.0.1:5000', // Alternative Confidence Challenge Game address
    'null' // Important for requests originating from local file:// paths in some browsers
    // Add your production frontend URL here when deploying:
    // 'https://www.your-production-frontend.com'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

// --- Middleware for JSON body parsing ---
app.use(express.json({ limit: '5mb' })); // Adjust limit as needed for larger payloads

// --- PDB Proxy Endpoint ---
app.get('/proxy-pdb/:pdbId.pdb', async (req, res) => {
    const pdbId = req.params.pdbId.toUpperCase();
    const pdbUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;

    try {
        const response = await axios.get(pdbUrl, { responseType: 'text' });
        // Set Content-Type header to ensure browser interprets it as PDB data
        res.setHeader('Content-Type', 'text/plain'); 
        res.status(200).send(response.data);
    } catch (error) {
        console.error(`Error fetching PDB ${pdbId}:`, error.message);
        if (error.response) {
            // Forward the actual status code from RCSB if available
            res.status(error.response.status).json({
                error: `Failed to fetch PDB ${pdbId}`,
                details: error.response.statusText || 'PDB file not found or service unavailable.'
            });
        } else {
            res.status(500).json({
                error: `An unexpected error occurred while fetching PDB ${pdbId}`,
                details: error.message
            });
        }
    }
});

// --- Sequence-based PDB Search Endpoint ---
app.post('/search-pdb-by-sequence', async (req, res) => {
    const { sequence } = req.body;
    
    if (!sequence) {
        return res.status(400).json({ error: 'Sequence is required.' });
    }

    // Clean the sequence (remove FASTA header and non-amino acid characters)
    let cleanSequence = sequence;
    if (sequence.startsWith('>')) {
        cleanSequence = sequence.substring(sequence.indexOf('\n') + 1);
    }
    cleanSequence = cleanSequence.replace(/[^A-Z]/g, '').toUpperCase();

    if (cleanSequence.length === 0) {
        return res.status(400).json({ error: 'Invalid sequence provided.' });
    }

    try {
        // Construct the RCSB search query
        const searchQuery = {
            query: {
                type: "sequence",
                sequence: cleanSequence,
                target: "pdb_protein_sequence",
                identity_cutoff: 0.5 // 50% sequence identity threshold
            },
            request_options: {
                results_content_type: ["experimental"],
                paginate: {
                    start: 0,
                    rows: 5 // Limit to top 5 matches
                }
            }
        };

        const response = await axios.post(RCSB_API_URL, searchQuery, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.result_set) {
            const results = response.data.result_set.map(item => ({
                pdbId: item.identifier,
                score: item.score,
                title: item.title || 'No title available'
            }));
            res.status(200).json({ results });
        } else {
            res.status(404).json({ error: 'No matching structures found.' });
        }
    } catch (error) {
        console.error('Error searching PDB by sequence:', error);
        res.status(500).json({ 
            error: 'Failed to search PDB database.',
            details: error.message
        });
    }
});

// --- Enhanced Gemini AI Proxy Endpoint ---
app.post('/ask-gemini', async (req, res) => {
    const { question, context, sequence } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }
    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    let fullPrompt = `You are an AI assistant specializing in protein science. Answer the following question concisely and informatively.`;

    if (context) {
        fullPrompt += `\nContext (if available): PDB ID: ${context}`;
    }
    
    if (sequence) {
        fullPrompt += `\nSequence (if available):\n${sequence}`;
    }

    fullPrompt += `\nQuestion: ${question}\n\nAnswer:`;

    const payload = {
        contents: [{ parts: [{ text: fullPrompt }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };

    try {
        const response = await axios.post(GEMINI_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const geminiResponse = response.data;
        if (geminiResponse.candidates && geminiResponse.candidates[0] && geminiResponse.candidates[0].content && geminiResponse.candidates[0].content.parts[0]) {
            res.status(200).json({ text: geminiResponse.candidates[0].content.parts[0].text });
        } else {
            console.warn("Unexpected Gemini response structure:", geminiResponse);
            res.status(500).json({ error: 'Sorry, I could not generate a coherent response from Gemini.', details: geminiResponse });
        }
    } catch (error) {
        console.error("Error communicating with Gemini API:", error.message);
        if (error.response) {
            console.error("Gemini API error response data:", error.response.data);
            res.status(error.response.status).json({
                error: 'Error from Gemini API.',
                details: error.response.data.error ? error.response.data.error.message : error.response.statusText
            });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred while contacting Gemini.', details: error.message });
        }
    }
});

// --- Proxy endpoint for Confidence Challenge Game ---
app.get('/confidence-game', async (req, res) => {
    try {
        const response = await axios.get(`${CONFIDENCE_GAME_URL}/`);
        res.send(response.data);
    } catch (error) {
        console.error('Error proxying to Confidence Challenge Game:', error);
        res.status(500).json({
            error: 'Failed to connect to Confidence Challenge Game',
            details: error.message
        });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Protein Explorer Backend running on http://localhost:${PORT}`);
    console.log('Ensure your frontend is configured to fetch from this address.');
});