# Protein Explorer & AI Assistant

A web-based application for exploring protein structures, analyzing sequences, and getting AI-powered insights about proteins. This tool combines 3D protein visualization with the power of Google's Gemini AI to provide an interactive learning and research experience.

## Features

- **3D Protein Structure Viewer**
  - Load and visualize protein structures from the Protein Data Bank (PDB)
  - Multiple visualization styles (cartoon, surface, spheres, sticks, trace)
  - Customizable coloring schemes (by chain, residue type, rainbow, secondary structure)
  - Interactive 3D controls for rotation, zoom, and pan

- **Sequence Analysis**
  - Analyze protein sequences in FASTA format
  - Calculate sequence length and molecular weight
  - Display amino acid composition
  - Find similar structures in the PDB database

- **AI Assistant Integration**
  - Ask questions about proteins, structures, and biological concepts
  - Get context-aware responses based on loaded structures
  - Powered by Google's Gemini AI

- **Confidence Challenge Game Integration**
  - Direct link to the Confidence Challenge Game
  - Learn about protein structure prediction confidence
  - Interactive PAE (Predicted Aligned Error) visualization
  - Educational challenges and scoring system

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Google Gemini API key
- Modern web browser with WebGL support
- Python (for Confidence Challenge Game backend)

## Installation

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd Protein-Explorer-and-AI-Assistant
   ```

2. **Set Up the Backend**
   ```bash
   cd protein-backend
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `protein-backend` directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   CONFIDENCE_GAME_URL=http://localhost:5000  # URL for the Confidence Challenge Game
   ```

4. **Set Up Confidence Challenge Game**
   ```bash
   cd ../confidence-quest-explore
   npm install
   cd backend
   pip install -r requirements.txt
   ```

## Running the Application

1. **Start the Protein Explorer Backend**
   ```bash
   cd protein-backend
   node server.js
   ```
   The server will start on `http://localhost:8000`

2. **Start the Confidence Challenge Game**
   ```bash
   cd confidence-quest-explore/backend
   python app.py
   ```
   The game will be available at `http://localhost:5000`

3. **Open the Frontend**
   - Use a local development server (recommended):
     - VS Code Live Server extension
     - Python's `http.server`
     - Any other local development server
   - Open `index.html` in your web browser

## Usage Guide

### Loading Protein Structures

1. **By PDB ID**
   - Enter a 4-character PDB ID (e.g., 1AKE, 6LU7)
   - Click "Load PDB"
   - Use the representation and coloring options to customize the view

2. **By Sequence**
   - Switch to the "Analyze Sequence" tab
   - Paste your protein sequence in FASTA format
   - Click "Analyze Sequence"
   - View suggested similar structures from the PDB

### Learning About Protein Confidence

1. Click the "Learn About Protein Confidence" button in the header
2. The application will proxy your request to the Confidence Challenge Game
3. The game will help you understand:
   - PAE (Predicted Aligned Error) concepts
   - Protein structure prediction confidence
   - How to interpret confidence scores
   - Interactive challenges to test your knowledge

Note: Both the Protein Explorer backend (port 8000) and the Confidence Challenge Game (port 5000) must be running for this feature to work.

### Example PDB Structures

The application includes a help feature with 25 representative PDB structures, including:
- 1MBN (Myoglobin) - First protein structure solved by X-ray crystallography
- 1AKE (Adenylate Kinase) - Important enzyme in cellular energy metabolism
- 6VSB (SARS-CoV-2 Spike) - COVID-19 virus surface protein
- And many more...

### Using the AI Assistant

1. Type your question in the "Ask Gemini AI" section
2. Questions can be about:
   - Specific proteins (e.g., "What is the function of 1AKE?")
   - General concepts (e.g., "What is an active site?")
   - Structure analysis (e.g., "Explain the secondary structure of this protein")
3. The AI will provide context-aware responses based on the loaded structure

## Technical Details

### Backend Architecture
- Node.js with Express.js
- CORS-enabled for secure cross-origin requests
- Proxy endpoints for:
  - PDB structure retrieval
  - Gemini AI API integration

### Frontend Technologies
- HTML5 with modern CSS (Tailwind CSS)
- JavaScript for interactivity
- Bio-PV for 3D protein visualization
- Responsive design for various screen sizes

## Troubleshooting

1. **PDB Loading Issues**
   - Verify the PDB ID exists in the database
   - Check your internet connection
   - Ensure the backend server is running

2. **AI Assistant Not Responding**
   - Verify your Gemini API key is correctly set in `.env`
   - Check the backend server logs for errors
   - Ensure you're not exceeding API rate limits

3. **Visualization Problems**
   - Ensure your browser supports WebGL
   - Try a different visualization style
   - Clear your browser cache

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your chosen license]

## Acknowledgments

- Protein Data Bank (RCSB PDB)
- Google Gemini AI
- Bio-PV visualization library
- All contributors and users of this project
