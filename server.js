const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nomeFantasia TEXT,
            responsavel TEXT,
            telefone TEXT,
            email TEXT,
            qtdMesas INTEGER,
            qtdGarcons INTEGER,
            telasCozinha INTEGER,
            telasBar INTEGER,
            telasCaixa INTEGER,
            setupTotal REAL,
            mensalidade REAL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS visitas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER,
            data_visita TEXT,
            observacoes TEXT,
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        )`);
    }
});

// Routes
app.post('/api/orcamento', (req, res) => {
    const { 
        nomeFantasia, responsavel, telefone, email, 
        qtdMesas, qtdGarcons, telasCozinha, telasBar, telasCaixa, 
        setupTotal, mensalidade 
    } = req.body;

    const sql = `INSERT INTO leads (
        nomeFantasia, responsavel, telefone, email, 
        qtdMesas, qtdGarcons, telasCozinha, telasBar, telasCaixa, 
        setupTotal, mensalidade
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
        nomeFantasia, responsavel, telefone, email, 
        qtdMesas, qtdGarcons, telasCozinha, telasBar, telasCaixa, 
        setupTotal, mensalidade
    ], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, lead_id: this.lastID });
    });
});

app.post('/api/visita', (req, res) => {
    const { lead_id, data_visita, observacoes } = req.body;
    
    const sql = `INSERT INTO visitas (lead_id, data_visita, observacoes) VALUES (?, ?, ?)`;
    db.run(sql, [lead_id, data_visita, observacoes], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, visita_id: this.lastID });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
